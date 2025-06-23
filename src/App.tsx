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
    downloadUrl: null
  });
  
  const [storageUsed, setStorageUsed] = useState(0); // in MB
  const storageLimit = 100; // 100 MB limit

  const handleFileUpload = async (file: File) => {
    if (storageUsed + (file.size / (1024 * 1024)) > storageLimit) {
      alert('Storage limit exceeded! Please clear some space.');
      return;
    }

    setModelData({ originalFile: file, optimizedUrl: null, downloadUrl: null });
    setProcessingState({ isProcessing: true, progress: 0, stage: 'Uploading...' });

    try {
      // Simulate upload progress
      for (let i = 0; i <= 20; i++) {
        setProcessingState(prev => ({ ...prev, progress: i }));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload_model', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      setProcessingState({ isProcessing: true, progress: 30, stage: 'Optimizing mesh...' });

      // Simulate processing progress
      for (let i = 30; i <= 80; i++) {
        setProcessingState(prev => ({ ...prev, progress: i }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const optimizeResponse = await fetch('/api/optimize_mesh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name }),
      });

      if (!optimizeResponse.ok) throw new Error('Optimization failed');

      setProcessingState({ isProcessing: true, progress: 90, stage: 'Generating download...' });

      const downloadResponse = await fetch('/api/download_glb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name }),
      });

      if (!downloadResponse.ok) throw new Error('Download generation failed');

      const blob = await downloadResponse.blob();
      const downloadUrl = URL.createObjectURL(blob);

      setModelData(prev => ({ ...prev, downloadUrl }));
      setStorageUsed(prev => prev + (file.size / (1024 * 1024)));
      setProcessingState({ isProcessing: false, progress: 100, stage: 'Complete!' });

    } catch (error) {
      console.error('Processing error:', error);
      setProcessingState({ isProcessing: false, progress: 0, stage: 'Error occurred' });
      alert('An error occurred during processing. Please try again.');
    }
  };

  const clearStorage = () => {
    setModelData({ originalFile: null, optimizedUrl: null, downloadUrl: null });
    setStorageUsed(0);
    setProcessingState({ isProcessing: false, progress: 0, stage: '' });
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