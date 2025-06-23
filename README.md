# Karmic - 3D Mesh Optimizer

Transform your 3D models with the power of sacred geometry and modern algorithms. Karmic optimizes complex 3D meshes into clean outer shells while preserving surface details.

## Features

- **Lightning Fast Processing**: Optimize complex 3D models in seconds
- **Universal Format Support**: Works with OBJ, STL, PLY files and exports to GLB
- **Outer Shell Extraction**: Intelligently removes internal geometry
- **Sacred Precision**: Maintains model essence while achieving optimal performance
- **Secure & Private**: Models are processed securely and never stored permanently
- **Storage Management**: 100MB user storage limit with progress tracking

## Tech Stack

### Frontend
- React 18 with TypeScript
- Three.js with React Three Fiber
- Tailwind CSS with Hindu mythology-inspired theme
- Vite for development and building

### Backend
- FastAPI with Python 3.11
- Trimesh for 3D mesh processing
- Async file handling with aiofiles
- CORS enabled for frontend integration

## Quick Start

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd karmic
```

2. Start the application:
```bash
docker-compose up --build
```

3. Open your browser to `http://localhost:5173`

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the FastAPI server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open `http://localhost:5173` in your browser

## API Endpoints

- `POST /api/upload_model` - Upload a 3D model file
- `POST /api/optimize_mesh` - Optimize uploaded mesh to outer shell
- `POST /api/download_glb` - Download the optimized GLB file
- `GET /api/health` - Health check endpoint
- `DELETE /api/cleanup` - Clean up temporary files

## Supported File Formats

### Input Formats
- `.obj` - Wavefront OBJ
- `.stl` - Stereolithography
- `.ply` - Polygon File Format

### Output Format
- `.glb` - Binary glTF (optimized for web)

## File Size Limits

- Maximum file size: 50MB per upload
- Total storage limit: 100MB per user session
- Files are automatically cleaned up after processing

## How It Works

1. **Upload**: Drag and drop or select your 3D model file
2. **Validation**: File type and size validation
3. **Processing**: Mesh optimization using Trimesh algorithms:
   - Voxelization for outer shell extraction
   - Mesh simplification and optimization
   - Watertight mesh generation
4. **Export**: Download optimized GLB file

## Development

### Project Structure
```
karmic/
├── src/                    # Frontend React components
│   ├── components/         # Reusable UI components
│   └── App.tsx            # Main application component
├── backend/               # FastAPI backend
│   ├── main.py           # Main API application
│   └── requirements.txt  # Python dependencies
├── public/               # Static assets
└── docker-compose.yml    # Docker configuration
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Hindu mythology and sacred geometry
- Built with modern web technologies
- Powered by the Trimesh library for 3D processing