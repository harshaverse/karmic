import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface UploadSectionProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onFileUpload, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['.obj', '.stl', '.ply'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      setError('Please upload a valid 3D model file (.obj, .stl, .ply)');
      return false;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit per file
      setError('File size must be less than 50MB');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (isProcessing) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileUpload(file);
      }
    }
  }, [onFileUpload, isProcessing]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) return;
    
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileUpload(file);
      }
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Upload className="w-6 h-6 mr-3 text-saffron-600" />
        Upload Your 3D Model
      </h2>
      
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${dragActive 
            ? 'border-saffron-500 bg-saffron-50' 
            : 'border-saffron-200 hover:border-saffron-400 hover:bg-saffron-50/50'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".obj,.stl,.ply"
          onChange={handleFileInput}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-saffron-500 to-vermillion-500 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-800 mb-2">
              {dragActive ? 'Drop your file here' : 'Drag & drop your 3D model'}
            </p>
            <p className="text-gray-600 mb-4">
              or <span className="text-saffron-600 font-medium">browse files</span>
            </p>
            <p className="text-sm text-gray-500">
              Supports .OBJ, .STL, .PLY files up to 50MB
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-saffron-50 rounded-lg">
          <p className="text-sm font-medium text-saffron-800">.OBJ</p>
          <p className="text-xs text-saffron-600">Wavefront</p>
        </div>
        <div className="p-3 bg-vermillion-50 rounded-lg">
          <p className="text-sm font-medium text-vermillion-800">.STL</p>
          <p className="text-xs text-vermillion-600">Stereolithography</p>
        </div>
        <div className="p-3 bg-lotus-50 rounded-lg">
          <p className="text-sm font-medium text-lotus-800">.PLY</p>
          <p className="text-xs text-lotus-600">Polygon File</p>
        </div>
      </div>
    </div>
  );
};