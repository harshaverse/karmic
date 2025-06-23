from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import trimesh
import numpy as np
import tempfile
import os
import shutil
from pathlib import Path
import magic
import aiofiles
from typing import Dict
import uuid
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Karmic 3D Mesh Optimizer", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage configuration
UPLOAD_DIR = Path("uploads")
PROCESSED_DIR = Path("processed")
UPLOAD_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True)

# File storage for tracking uploads
file_storage: Dict[str, Dict] = {}

def validate_3d_file(file_path: str) -> bool:
    """Validate if the uploaded file is a supported 3D model format."""
    try:
        # Check file extension
        extension = Path(file_path).suffix.lower()
        supported_extensions = ['.obj', '.stl', '.ply']
        
        if extension not in supported_extensions:
            return False
            
        # Try to load with trimesh to validate
        try:
            mesh = trimesh.load(file_path)
            return True
        except Exception as e:
            logger.error(f"Failed to load mesh: {e}")
            return False
            
    except Exception as e:
        logger.error(f"File validation error: {e}")
        return False

def optimize_mesh_to_outer_shell(input_path: str, output_path: str) -> bool:
    """
    Convert a 3D mesh to its outer shell using Trimesh.
    This creates an optimized outer surface mesh.
    """
    try:
        logger.info(f"Loading mesh from: {input_path}")
        
        # Load the mesh
        mesh = trimesh.load(input_path)
        
        # Handle different mesh types
        if isinstance(mesh, trimesh.Scene):
            # If it's a scene, combine all geometries
            if len(mesh.geometry) == 0:
                raise ValueError("No geometry found in scene")
            
            # Get all meshes from the scene
            meshes = []
            for geom in mesh.geometry.values():
                if isinstance(geom, trimesh.Trimesh):
                    meshes.append(geom)
            
            if not meshes:
                raise ValueError("No valid meshes found in scene")
            
            # Combine all meshes
            if len(meshes) == 1:
                mesh = meshes[0]
            else:
                mesh = trimesh.util.concatenate(meshes)
        
        elif not isinstance(mesh, trimesh.Trimesh):
            raise ValueError("Could not load valid mesh geometry")
        
        logger.info(f"Original mesh: {len(mesh.vertices)} vertices, {len(mesh.faces)} faces")
        
        # Clean up the mesh
        mesh.remove_duplicate_faces()
        mesh.remove_unreferenced_vertices()
        mesh.remove_degenerate_faces()
        
        # Fill holes to create a watertight mesh
        if not mesh.is_watertight:
            logger.info("Mesh is not watertight, attempting to fix...")
            mesh.fill_holes()
        
        # Create outer shell using convex hull as a fallback method
        # This ensures we get a clean outer surface
        if len(mesh.faces) > 20000:
            logger.info("Large mesh detected, simplifying...")
            # Simplify first to reduce complexity
            mesh = mesh.simplify_quadric_decimation(face_count=10000)
        
        # Method 1: Try voxelization for outer shell
        try:
            # Calculate appropriate voxel size
            extents = mesh.extents
            voxel_size = max(extents) / 64  # Adaptive voxel size
            
            logger.info(f"Creating voxel grid with size: {voxel_size}")
            
            # Create voxel grid
            voxel_grid = mesh.voxelized(pitch=voxel_size)
            
            # Convert back to mesh
            outer_shell = voxel_grid.marching_cubes
            
            if outer_shell.vertices.shape[0] == 0:
                raise ValueError("Voxelization failed")
                
        except Exception as e:
            logger.warning(f"Voxelization failed: {e}, using convex hull")
            # Fallback to convex hull
            outer_shell = mesh.convex_hull
        
        # Ensure we have a valid result
        if outer_shell.vertices.shape[0] == 0:
            logger.warning("Outer shell extraction failed, using original mesh")
            outer_shell = mesh
        
        # Final simplification if needed
        if len(outer_shell.faces) > 15000:
            logger.info("Simplifying final mesh...")
            outer_shell = outer_shell.simplify_quadric_decimation(face_count=8000)
        
        # Ensure the mesh is watertight
        if not outer_shell.is_watertight:
            outer_shell.fill_holes()
        
        # Smooth the mesh slightly
        outer_shell = outer_shell.smoothed()
        
        logger.info(f"Final mesh: {len(outer_shell.vertices)} vertices, {len(outer_shell.faces)} faces")
        
        # Export as GLB (binary glTF)
        outer_shell.export(output_path, file_type='glb')
        
        # Verify the output file was created
        if not os.path.exists(output_path):
            raise ValueError("Failed to create output file")
        
        logger.info(f"Successfully exported to: {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"Error optimizing mesh: {str(e)}")
        return False

@app.post("/api/upload_model")
async def upload_model(file: UploadFile = File(...)):
    """Upload a 3D model file for processing."""
    
    logger.info(f"Uploading file: {file.filename}")
    
    # Validate file size (50MB limit)
    if file.size and file.size > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 50MB.")
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_extension = Path(file.filename or "model").suffix.lower()
    temp_filename = f"{file_id}{file_extension}"
    temp_path = UPLOAD_DIR / temp_filename
    
    try:
        # Save uploaded file
        async with aiofiles.open(temp_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        logger.info(f"File saved to: {temp_path}")
        
        # Validate file type
        if not validate_3d_file(str(temp_path)):
            os.remove(temp_path)
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload .obj, .stl, or .ply files.")
        
        # Store file information
        file_storage[file.filename] = {
            'id': file_id,
            'original_name': file.filename,
            'temp_path': str(temp_path),
            'size': file.size,
            'status': 'uploaded'
        }
        
        logger.info(f"File {file.filename} uploaded successfully")
        
        return {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "file_id": file_id,
            "size": file.size
        }
        
    except Exception as e:
        # Clean up on error
        if temp_path.exists():
            os.remove(temp_path)
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/api/optimize_mesh")
async def optimize_mesh(request: dict):
    """Optimize the uploaded mesh to create outer shell."""
    
    filename = request.get('filename')
    logger.info(f"Optimizing mesh for file: {filename}")
    
    if not filename or filename not in file_storage:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_info = file_storage[filename]
    input_path = file_info['temp_path']
    
    # Generate output path
    output_filename = f"{file_info['id']}_optimized.glb"
    output_path = PROCESSED_DIR / output_filename
    
    try:
        # Optimize the mesh
        success = optimize_mesh_to_outer_shell(input_path, str(output_path))
        
        if not success:
            raise HTTPException(status_code=500, detail="Mesh optimization failed")
        
        # Update file storage
        file_storage[filename]['output_path'] = str(output_path)
        file_storage[filename]['status'] = 'optimized'
        
        logger.info(f"Mesh optimization completed for {filename}")
        
        return {
            "message": "Mesh optimized successfully",
            "filename": filename,
            "output_file": output_filename
        }
        
    except Exception as e:
        logger.error(f"Optimization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

@app.post("/api/download_glb")
async def download_glb(request: dict):
    """Download the optimized GLB file."""
    
    filename = request.get('filename')
    logger.info(f"Preparing download for file: {filename}")
    
    if not filename or filename not in file_storage:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_info = file_storage[filename]
    
    if file_info['status'] != 'optimized' or 'output_path' not in file_info:
        raise HTTPException(status_code=400, detail="File not yet optimized")
    
    output_path = file_info['output_path']
    
    if not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Optimized file not found")
    
    # Generate download filename
    original_name = Path(file_info['original_name']).stem
    download_filename = f"{original_name}_optimized.glb"
    
    logger.info(f"Serving download: {download_filename}")
    
    return FileResponse(
        path=output_path,
        filename=download_filename,
        media_type='application/octet-stream'
    )

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Karmic 3D Mesh Optimizer API is running"}

@app.delete("/api/cleanup")
async def cleanup_files():
    """Clean up temporary files (for development/testing)."""
    try:
        logger.info("Starting cleanup...")
        
        # Clear file storage
        file_storage.clear()
        
        # Remove uploaded files
        for file_path in UPLOAD_DIR.glob("*"):
            if file_path.is_file():
                os.remove(file_path)
        
        # Remove processed files
        for file_path in PROCESSED_DIR.glob("*"):
            if file_path.is_file():
                os.remove(file_path)
        
        logger.info("Cleanup completed successfully")
        
        return {"message": "Cleanup completed successfully"}
        
    except Exception as e:
        logger.error(f"Cleanup failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)