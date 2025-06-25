from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import trimesh
import numpy as np
import tempfile
import os
import shutil
from pathlib import Path
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
            logger.error(f"Unsupported extension: {extension}")
            return False
            
        # Try to load with trimesh to validate
        try:
            mesh = trimesh.load(file_path)
            if isinstance(mesh, trimesh.Scene):
                if len(mesh.geometry) == 0:
                    logger.error("Scene contains no geometry")
                    return False
            elif not isinstance(mesh, trimesh.Trimesh):
                logger.error("File does not contain valid mesh data")
                return False
            logger.info("File validation successful")
            return True
        except Exception as e:
            logger.error(f"Failed to load mesh during validation: {e}")
            return False
            
    except Exception as e:
        logger.error(f"File validation error: {e}")
        return False

def remove_inner_mesh_simple(input_path: str, output_path: str) -> bool:
    """
    Simple but effective inner mesh removal using Trimesh.
    Focus on creating a clean outer shell.
    """
    try:
        logger.info(f"Starting mesh processing: {input_path}")
        
        # Load the mesh
        mesh = trimesh.load(input_path)
        
        # Handle different mesh types
        if isinstance(mesh, trimesh.Scene):
            logger.info("Processing scene with multiple geometries")
            if len(mesh.geometry) == 0:
                raise ValueError("No geometry found in scene")
            
            # Get all meshes from the scene
            meshes = []
            for name, geom in mesh.geometry.items():
                if isinstance(geom, trimesh.Trimesh):
                    meshes.append(geom)
                    logger.info(f"Found mesh: {name} with {len(geom.vertices)} vertices")
            
            if not meshes:
                raise ValueError("No valid meshes found in scene")
            
            # Combine all meshes
            if len(meshes) == 1:
                mesh = meshes[0]
            else:
                mesh = trimesh.util.concatenate(meshes)
                logger.info("Combined multiple meshes")
        
        elif not isinstance(mesh, trimesh.Trimesh):
            raise ValueError("Could not load valid mesh geometry")
        
        logger.info(f"Original mesh: {len(mesh.vertices)} vertices, {len(mesh.faces)} faces")
        
        # Step 1: Basic cleanup
        logger.info("Cleaning mesh...")
        mesh.remove_duplicate_faces()
        mesh.remove_unreferenced_vertices()
        mesh.remove_degenerate_faces()
        
        # Step 2: Create outer shell using voxelization
        outer_shell = None
        
        try:
            logger.info("Creating outer shell using voxelization...")
            
            # Calculate voxel size based on mesh bounds
            bounds = mesh.bounds
            size = bounds[1] - bounds[0]
            max_dimension = max(size)
            voxel_size = max_dimension / 64  # Reasonable resolution
            
            logger.info(f"Using voxel size: {voxel_size}")
            
            # Create voxel grid
            voxel_grid = mesh.voxelized(pitch=voxel_size)
            
            # Extract surface using marching cubes
            outer_shell = voxel_grid.marching_cubes
            
            if len(outer_shell.vertices) > 0:
                logger.info(f"Voxelization successful: {len(outer_shell.vertices)} vertices")
            else:
                raise ValueError("Voxelization produced empty result")
                
        except Exception as e:
            logger.warning(f"Voxelization failed: {e}, trying convex hull...")
            
            # Fallback to convex hull
            try:
                outer_shell = mesh.convex_hull
                logger.info("Using convex hull as fallback")
            except Exception as e2:
                logger.warning(f"Convex hull failed: {e2}, using original mesh")
                outer_shell = mesh
        
        # Step 3: Post-processing
        if outer_shell is None or len(outer_shell.vertices) == 0:
            logger.warning("All methods failed, using original mesh")
            outer_shell = mesh
        
        logger.info(f"Processing outer shell: {len(outer_shell.vertices)} vertices, {len(outer_shell.faces)} faces")
        
        # Clean the result
        outer_shell.remove_duplicate_faces()
        outer_shell.remove_unreferenced_vertices()
        outer_shell.remove_degenerate_faces()
        
        # Make watertight if possible
        if not outer_shell.is_watertight:
            logger.info("Attempting to make mesh watertight...")
            try:
                outer_shell.fill_holes()
            except:
                logger.warning("Could not fill holes")
        
        # Simplify if too complex
        if len(outer_shell.faces) > 50000:
            logger.info("Simplifying complex mesh...")
            try:
                target_faces = min(20000, len(outer_shell.faces) // 2)
                outer_shell = outer_shell.simplify_quadric_decimation(face_count=target_faces)
                logger.info(f"Simplified to {len(outer_shell.faces)} faces")
            except Exception as e:
                logger.warning(f"Simplification failed: {e}")
        
        # Fix normals
        try:
            outer_shell.fix_normals()
        except:
            logger.warning("Could not fix normals")
        
        # Step 4: Export as GLB
        logger.info(f"Exporting final mesh: {len(outer_shell.vertices)} vertices, {len(outer_shell.faces)} faces")
        
        # Export with proper settings
        outer_shell.export(output_path, file_type='glb')
        
        # Verify output
        if not os.path.exists(output_path):
            raise ValueError("Failed to create output file")
        
        file_size = os.path.getsize(output_path)
        logger.info(f"Successfully exported to: {output_path} ({file_size} bytes)")
        
        return True
        
    except Exception as e:
        logger.error(f"Error in mesh processing: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

@app.post("/api/upload_model")
async def upload_model(file: UploadFile = File(...)):
    """Upload a 3D model file for processing."""
    
    logger.info(f"Received upload request for: {file.filename}")
    
    # Validate file size (50MB limit)
    content = await file.read()
    file_size = len(content)
    
    if file_size > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 50MB.")
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_extension = Path(file.filename or "model").suffix.lower()
    temp_filename = f"{file_id}{file_extension}"
    temp_path = UPLOAD_DIR / temp_filename
    
    try:
        # Save uploaded file
        async with aiofiles.open(temp_path, 'wb') as f:
            await f.write(content)
        
        logger.info(f"File saved to: {temp_path} ({file_size} bytes)")
        
        # Validate file type
        if not validate_3d_file(str(temp_path)):
            if temp_path.exists():
                os.remove(temp_path)
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload .obj, .stl, or .ply files.")
        
        # Store file information
        file_storage[file.filename] = {
            'id': file_id,
            'original_name': file.filename,
            'temp_path': str(temp_path),
            'size': file_size,
            'status': 'uploaded'
        }
        
        logger.info(f"File {file.filename} uploaded and validated successfully")
        
        return {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "file_id": file_id,
            "size": file_size
        }
        
    except HTTPException:
        raise
    except Exception as e:
        # Clean up on error
        if temp_path.exists():
            os.remove(temp_path)
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/api/optimize_mesh")
async def optimize_mesh(request: dict):
    """Remove inner mesh and optimize to create outer shell only."""
    
    filename = request.get('filename')
    logger.info(f"Starting optimization for: {filename}")
    
    if not filename or filename not in file_storage:
        logger.error(f"File not found in storage: {filename}")
        raise HTTPException(status_code=404, detail="File not found")
    
    file_info = file_storage[filename]
    input_path = file_info['temp_path']
    
    if not os.path.exists(input_path):
        logger.error(f"Input file does not exist: {input_path}")
        raise HTTPException(status_code=404, detail="Input file not found")
    
    # Generate output path
    output_filename = f"{file_info['id']}_outer_shell.glb"
    output_path = PROCESSED_DIR / output_filename
    
    try:
        logger.info(f"Processing: {input_path} -> {output_path}")
        
        # Remove inner mesh and create outer shell
        success = remove_inner_mesh_simple(input_path, str(output_path))
        
        if not success:
            raise HTTPException(status_code=500, detail="Mesh optimization failed")
        
        # Update file storage
        file_storage[filename]['output_path'] = str(output_path)
        file_storage[filename]['output_filename'] = output_filename
        file_storage[filename]['status'] = 'optimized'
        
        logger.info(f"Optimization completed successfully for {filename}")
        
        return {
            "message": "Mesh optimized successfully - outer shell created",
            "filename": filename,
            "output_file": output_filename,
            "status": "optimized"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Optimization failed for {filename}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

@app.post("/api/download_glb")
async def download_glb(request: dict):
    """Download the optimized GLB file."""
    
    filename = request.get('filename')
    logger.info(f"Download request for: {filename}")
    
    if not filename or filename not in file_storage:
        logger.error(f"File not found for download: {filename}")
        raise HTTPException(status_code=404, detail="File not found")
    
    file_info = file_storage[filename]
    
    if file_info['status'] != 'optimized' or 'output_path' not in file_info:
        logger.error(f"File not optimized yet: {filename}")
        raise HTTPException(status_code=400, detail="File not yet optimized")
    
    output_path = file_info['output_path']
    
    if not os.path.exists(output_path):
        logger.error(f"Output file missing: {output_path}")
        raise HTTPException(status_code=404, detail="Optimized file not found")
    
    # Generate download filename
    original_name = Path(file_info['original_name']).stem
    download_filename = f"{original_name}_outer_shell.glb"
    
    logger.info(f"Serving download: {download_filename} from {output_path}")
    
    return FileResponse(
        path=output_path,
        filename=download_filename,
        media_type='model/gltf-binary'
    )

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Karmic 3D Mesh Optimizer API is running"}

@app.get("/api/status")
async def get_status():
    """Get current status of all files."""
    return {
        "files": len(file_storage),
        "storage": dict(file_storage)
    }

@app.delete("/api/cleanup")
async def cleanup_files():
    """Clean up temporary files."""
    try:
        logger.info("Starting cleanup...")
        
        # Clear file storage
        file_storage.clear()
        
        # Remove uploaded files
        for file_path in UPLOAD_DIR.glob("*"):
            if file_path.is_file():
                os.remove(file_path)
                logger.info(f"Removed upload: {file_path}")
        
        # Remove processed files
        for file_path in PROCESSED_DIR.glob("*"):
            if file_path.is_file():
                os.remove(file_path)
                logger.info(f"Removed processed: {file_path}")
        
        logger.info("Cleanup completed successfully")
        
        return {"message": "Cleanup completed successfully"}
        
    except Exception as e:
        logger.error(f"Cleanup failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)