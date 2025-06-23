import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Center } from '@react-three/drei';
import { Download, Eye, Loader } from 'lucide-react';

interface ModelViewerProps {
  originalFile: File | null;
  optimizedUrl: string | null;
  downloadUrl: string | null;
}

const ModelPlaceholder: React.FC = () => {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#f19338" wireframe />
    </mesh>
  );
};

export const ModelViewer: React.FC<ModelViewerProps> = ({ 
  originalFile, 
  optimizedUrl, 
  downloadUrl 
}) => {
  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${originalFile?.name.split('.')[0] || 'model'}_optimized.glb`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Eye className="w-6 h-6 mr-3 text-saffron-600" />
          3D Preview
        </h2>
        
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
      
      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200">
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="studio" />
          
          <Suspense fallback={
            <Center>
              <ModelPlaceholder />
            </Center>
          }>
            <Center>
              <ModelPlaceholder />
            </Center>
          </Suspense>
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={!originalFile}
            autoRotateSpeed={2}
          />
        </Canvas>
        
        {!originalFile && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-saffron-500 to-vermillion-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className="text-gray-600">Upload a model to preview</p>
            </div>
          </div>
        )}
      </div>
      
      {originalFile && (
        <div className="mt-4 p-4 bg-saffron-50 rounded-lg">
          <h3 className="font-medium text-saffron-800 mb-2">Model Information</h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-600">File:</span> {originalFile.name}</p>
            <p><span className="text-gray-600">Size:</span> {(originalFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            <p><span className="text-gray-600">Type:</span> {originalFile.type || 'Unknown'}</p>
          </div>
        </div>
      )}
    </div>
  );
};