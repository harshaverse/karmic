# Install Open3D if not already installed
!pip install open3d

import open3d as o3d
import numpy as np
import shutil
from google.colab import files
from IPython.display import FileLink

# Step 1: Upload a 3D model file (OBJ)
uploaded = files.upload()
input_filename = list(uploaded.keys())[0]

# Step 2: Load the triangle mesh
mesh = o3d.io.read_triangle_mesh(input_filename)
mesh.compute_vertex_normals()

# Step 3: Convert the mesh to a voxel grid
voxel_size = 1.0  # You can adjust this for more/less detail
voxel_grid = o3d.geometry.VoxelGrid.create_from_triangle_mesh(mesh, voxel_size=voxel_size)

# Step 4: Convert voxel grid to dense point cloud
voxel_points = [voxel.grid_index for voxel in voxel_grid.get_voxels()]
voxel_points = np.array(voxel_points, dtype=np.float32)
voxel_points *= voxel_size
pcd = o3d.geometry.PointCloud()
pcd.points = o3d.utility.Vector3dVector(voxel_points)

# Step 5: Estimate normals for point cloud
pcd.estimate_normals(search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=2.0, max_nn=30))

# Step 6: Surface reconstruction using Ball Pivoting (more accurate shell)
radii = [voxel_size * 1.5]
mesh_shell = o3d.geometry.TriangleMesh.create_from_point_cloud_ball_pivoting(
    pcd, o3d.utility.DoubleVector(radii)
)

# Step 7: Save the new outer shell mesh
output_path = "outer_shell.obj"
o3d.io.write_triangle_mesh(output_path, mesh_shell)

# Step 8: Provide download link
files.download(output_path)
print(f"✅ Outer shell mesh saved: {output_path}")
