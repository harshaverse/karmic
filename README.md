# 🕉️ Karmic — 3D Mesh Optimizer

<div align="center">

![React](https://img.shields.io/badge/React_18-TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Three.js](https://img.shields.io/badge/3D-Three.js-black?style=for-the-badge&logo=threedotjs&logoColor=white)
![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)

<br/>

```
        ╔══════════════════════════════════════╗
        ║   ✦  UPLOAD  →  OPTIMIZE  →  EXPORT  ║
        ║  .OBJ  .STL  .PLY       ↓    .GLB   ║
        ║              [sacred geometry]        ║
        ╚══════════════════════════════════════╝
```

> **Transform your 3D models with the power of sacred geometry and modern algorithms.**  
> Karmic optimizes complex 3D meshes into clean outer shells while preserving surface details.

</div>

---

## ✨ Features

| ⚡ Feature | 💡 Description |
|-----------|---------------|
| ⚡ **Lightning Fast Processing** | Optimize complex 3D models in seconds |
| 🔀 **Universal Format Support** | Works with OBJ, STL, PLY — exports to GLB |
| 🐚 **Outer Shell Extraction** | Intelligently removes internal geometry |
| 🔱 **Sacred Precision** | Maintains model essence while achieving optimal performance |
| 🔒 **Secure & Private** | Models processed securely, never stored permanently |
| 💾 **Storage Management** | 100 MB user storage limit with progress tracking |

---

## 🛠️ Tech Stack

### 🎨 Frontend

| 🔧 Technology | 💡 Purpose |
|--------------|-----------|
| **React 18 + TypeScript** | Component-based UI with type safety |
| **Three.js + React Three Fiber** | 3D model rendering in the browser |
| **Tailwind CSS** | Hindu mythology-inspired theme & styling |
| **Vite** | Fast development builds |

### ⚙️ Backend

| 🔧 Technology | 💡 Purpose |
|--------------|-----------|
| **FastAPI + Python 3.11** | High-performance async REST API |
| **Trimesh** | 3D mesh processing & optimization |
| **aiofiles** | Async file handling |
| **CORS** | Frontend-backend integration |

---

## 🔌 API Endpoints

| 🟢 Method | 📍 Endpoint | 📋 Description |
|----------|------------|---------------|
| `POST` | `/api/upload_model` | Upload a 3D model file |
| `POST` | `/api/optimize_mesh` | Optimize uploaded mesh to outer shell |
| `POST` | `/api/download_glb` | Download the optimized GLB file |
| `GET`  | `/api/health` | Health check endpoint |
| `DELETE` | `/api/cleanup` | Clean up temporary files |

---

## 📁 Supported File Formats

<table>
<tr>
<th>📥 Input Formats</th>
<th>📤 Output Format</th>
</tr>
<tr>
<td>

| 🏷️ Extension | 📋 Format |
|-------------|---------|
| `.obj` | Wavefront OBJ |
| `.stl` | Stereolithography |
| `.ply` | Polygon File Format |

</td>
<td>

| 🏷️ Extension | 📋 Format |
|-------------|---------|
| `.glb` | Binary glTF *(optimized for web)* |

</td>
</tr>
</table>

---

## 💾 File Size Limits

| 📏 Limit | 📋 Value |
|---------|---------|
| **Max file size per upload** | 50 MB |
| **Total storage per session** | 100 MB |
| **Auto-cleanup** | ✅ After processing |

---

## 🔄 How It Works

```
  ┌──────────┐     ┌─────────────┐     ┌─────────────────────────┐     ┌──────────┐
  │          │     │             │     │                         │     │          │
  │  UPLOAD  │────►│  VALIDATE   │────►│       PROCESSING        │────►│  EXPORT  │
  │          │     │             │     │                         │     │          │
  │ OBJ/STL  │     │ Type + Size │     │ • Voxelization          │     │   .GLB   │
  │   /PLY   │     │   Check     │     │ • Shell Extraction      │     │  Ready   │
  │          │     │             │     │ • Mesh Simplification   │     │          │
  └──────────┘     └─────────────┘     │ • Watertight Generation │     └──────────┘
                                       └─────────────────────────┘
```

**Step by step:**

1. 📂 **Upload** — Drag and drop or select your 3D model file
2. ✅ **Validation** — File type and size validation
3. ⚙️ **Processing** — Mesh optimization using Trimesh algorithms:
   - Voxelization for outer shell extraction
   - Mesh simplification and optimization
   - Watertight mesh generation
4. 📦 **Export** — Download optimized GLB file

---

## 🗂️ Project Structure

```
karmic/
│
├── 📁 src/                    ← Frontend React components
│   ├── 📁 components/         ← Reusable UI components
│   └── 📄 App.tsx             ← Main application component
│
├── 📁 backend/                ← FastAPI backend
│   ├── 📄 main.py             ← Main API application
│   └── 📄 requirements.txt   ← Python dependencies
│
├── 📁 public/                 ← Static assets
└── 📄 docker-compose.yml      ← Docker configuration
```

---

## 🤝 Contributing

```
  Fork ──► Branch ──► Code ──► Test ──► Pull Request
```

1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. 💻 Make your changes
4. 🧪 Test thoroughly
5. 📬 Submit a pull request

---

## 📜 License

This project is licensed under the **MIT License** — see the `LICENSE` file for details.

---

## 🙏 Acknowledgments

- 🕉️ Inspired by **Hindu mythology and sacred geometry**
- 💻 Built with **modern web technologies**
- 🔺 Powered by the **Trimesh library** for 3D processing

---

<div align="center">

🔱 **From chaotic mesh to sacred shell — Karmic finds the essence.**

<sub>Built with ❤️ | Karmic — Where Sacred Geometry Meets Modern 3D Optimization</sub>

</div>
