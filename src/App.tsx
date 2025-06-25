import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { UploadSection } from './components/UploadSection';
import { ModelViewer } from './components/ModelViewer';
import { ProgressBar } from './components/ProgressBar';
import { StorageIndicator } from './components/StorageIndicator';
import { Features } from './components/Features';
import { Footer } from './components/Footer';

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: string;
}

export interface ModelData {
  originalFile: File | null;
  optimizedUrl: string | null;
  downloadUrl: string | null;
  fileId: string | null;
}

function App() {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    stage: ''
  });
  
  const [modelData, setModelData] = useState<ModelData>({
    originalFile: null,
    optimizedUrl: null,
    downloadUrl: null,
    fileId: null
  });
  
  const [storageUsed, setStorageUsed] = useState(0); // in MB
  const storageLimit = 100; // 100 MB limit

  const handleFileUpload = async (file: File) => {
    if (storageUsed + (file.size / (1024 * 1024)) > storageLimit) {
      alert('Storage limit exceeded! Please clear some space.');
      return;
    }

    // Reset previous state
    setModelData({ originalFile: file, optimizedUrl: null, downloadUrl: null, fileId: null });
    setProcessingState({ isProcessing: true, progress: 10, stage: 'Uploading file...' });

    try {
      // Step 1: Upload file
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload_model', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        let errorMessage = 'Upload failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const uploadResult = await uploadResponse.json();
      setProcessingState({ isProcessing: true, progress: 30, stage: 'File uploaded successfully...' });

      // Step 2: Optimize mesh - automatically start optimization
      setProcessingState({ isProcessing: true, progress: 40, stage: 'Optimizing mesh to outer shell...' });

      const optimizeResponse = await fetch('/api/optimize_mesh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name }),
      });

      if (!optimizeResponse.ok) {
        const errorText = await optimizeResponse.text();
        let errorMessage = 'Optimization failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const optimizeResult = await optimizeResponse.json();
      setProcessingState({ isProcessing: true, progress: 80, stage: 'Generating download link...' });

      // Step 3: Prepare download
      const downloadResponse = await fetch('/api/download_glb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name }),
      });

      if (!downloadResponse.ok) {
        const errorText = await downloadResponse.text();
        let errorMessage = 'Download preparation failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const blob = await downloadResponse.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const optimizedUrl = downloadUrl; // Use the same URL for viewing

      setModelData(prev => ({ 
        ...prev, 
        optimizedUrl,
        downloadUrl,
        fileId: uploadResult.file_id 
      }));
      setStorageUsed(prev => prev + (file.size / (1024 * 1024)));
      setProcessingState({ isProcessing: false, progress: 100, stage: 'Optimization complete!' });

    } catch (error) {
      console.error('Processing error:', error);
      setProcessingState({ isProcessing: false, progress: 0, stage: 'Error occurred' });
      alert(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearStorage = async () => {
    try {
      // Clean up server-side files
      await fetch('/api/cleanup', { method: 'DELETE' });
      
      // Clean up client-side state
      if (modelData.downloadUrl) {
        URL.revokeObjectURL(modelData.downloadUrl);
      }
      if (modelData.optimizedUrl && modelData.optimizedUrl !== modelData.downloadUrl) {
        URL.revokeObjectURL(modelData.optimizedUrl);
      }
      
      setModelData({ originalFile: null, optimizedUrl: null, downloadUrl: null, fileId: null });
      setStorageUsed(0);
      setProcessingState({ isProcessing: false, progress: 0, stage: '' });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      
      <main className="container mx-auto px-4 py-12 space-y-12">
        <StorageIndicator used={storageUsed} limit={storageLimit} onClear={clearStorage} />
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <UploadSection 
              onFileUpload={handleFileUpload}
              isProcessing={processingState.isProcessing}
            />
            
            {processingState.isProcessing && (
              <ProgressBar 
                progress={processingState.progress}
                stage={processingState.stage}
              />
            )}
          </div>
          
          <ModelViewer 
            originalFile={modelData.originalFile}
            optimizedUrl={modelData.optimizedUrl}
            downloadUrl={modelData.downloadUrl}
          />
        </div>
        
        <Features />
      </main>
      
      <Footer />
    </div>
  );
}

export default App;