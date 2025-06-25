import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Center, useGLTF } from '@react-three/drei';
import { Download, Eye, Loader, RotateCcw } from 'lucide-react';
import * as THREE from 'three';

interface ModelViewerProps {
  originalFile: File | null;
  optimizedUrl: string | null;
  downloadUrl: string | null;
}

const ModelPlaceholder: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <dodecahedronGeometry args={[1.5, 0]} />
      <meshStandardMaterial 
        color="#f19338" 
        wireframe 
        transparent 
        opacity={0.6}
      />
    </mesh>
  );
};

const OptimizedModel: React.FC<{ url: string }> = ({ url }) => {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  useEffect(() => {
    if (scene) {
      // Ensure proper materials and lighting
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (!child.material || Array.isArray(child.material)) {
            child.material = new THREE.MeshStandardMaterial({
              color: '#f19338',
              metalness: 0.1,
              roughness: 0.4,
            });
          } else if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.color.setHex(0xf19338);
            child.material.metalness = 0.1;
            child.material.roughness = 0.4;
          }
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene]);

  return (
    <primitive 
      ref={modelRef} 
      object={scene.clone()} 
      scale={[1, 1, 1]} 
      position={[0, 0, 0]}
    />
  );
};

const ModelLoader: React.FC<{ url: string }> = ({ url }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [url]);

  if (error) {
    return (
      <Center>
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#ef4444" wireframe />
        </mesh>
      </Center>
    );
  }

  return (
    <Suspense fallback={
      <Center>
        <ModelPlaceholder />
      </Center>
    }>
      <Center>
        <OptimizedModel url={url} />
      </Center>
    </Suspense>
  );
};

export const ModelViewer: React.FC<ModelViewerProps> = ({ 
  originalFile, 
  optimizedUrl, 
  downloadUrl 
}) => {
  const [showWireframe, setShowWireframe] = useState(false);
  const [viewerKey, setViewerKey] = useState(0);

  // Force re-render when optimized URL changes
  useEffect(() => {
    if (optimizedUrl) {
      setViewerKey(prev => prev + 1);
    }
  }, [optimizedUrl]);

  const handleDownload = () => {
    if (downloadUrl && originalFile) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${originalFile.name.split('.')[0]}_optimized.glb`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Eye className="w-6 h-6 mr-3 text-saffron-600" />
          3D Preview
        </h2>
        
        <div className="flex items-center space-x-3">
          {downloadUrl && (
            <button 
              onClick={handleDownload}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download GLB</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200 relative">
        <Canvas 
          key={viewerKey}
          camera={{ position: [5, 5, 5], fov: 50 }}
          shadows
          gl={{ preserveDrawingBuffer: true }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
          <Environment preset="studio" />
          
          {optimizedUrl ? (
            <ModelLoader url={optimizedUrl} />
          ) : (
            <Center>
              <ModelPlaceholder />
            </Center>
          )}
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={!optimizedUrl}
            autoRotateSpeed={1}
            minDistance={2}
            maxDistance={10}
          />
        </Canvas>
        
        {!originalFile && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-saffron-500 to-vermillion-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className="text-gray-600">Upload a 3D model to preview</p>
              <p className="text-sm text-gray-500 mt-1">Supports .obj, .stl, .ply files</p>
            </div>
          </div>
        )}
      </div>
      
      {originalFile && (
        <div className="mt-4 p-4 bg-saffron-50 rounded-lg">
          <h3 className="font-medium text-saffron-800 mb-3">Model Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Original File:</p>
              <p className="font-medium text-gray-800">{originalFile.name}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">File Size:</p>
              <p className="font-medium text-gray-800">{formatFileSize(originalFile.size)}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Format:</p>
              <p className="font-medium text-gray-800">{originalFile.name.split('.').pop()?.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Status:</p>
              <p className={`font-medium ${downloadUrl ? 'text-green-600' : 'text-saffron-600'}`}>
                {downloadUrl ? 'Optimized ✓' : 'Processing...'}
              </p>
            </div>
          </div>
          
          {downloadUrl && (
            <div className="mt-3 pt-3 border-t border-saffron-200">
              <p className="text-sm text-saffron-700">
                ✨ Outer shell extracted and optimized for web use
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};