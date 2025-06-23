import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
  stage: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, stage }) => {
  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-4">
        <Loader2 className="w-5 h-5 text-saffron-600 animate-spin" />
        <h3 className="font-medium text-gray-800">Processing Your Model</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{stage}</span>
          <span className="text-sm font-medium text-saffron-600">{progress}%</span>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="grid grid-cols-4 gap-2 text-xs text-gray-500">
          <div className={`text-center ${progress >= 25 ? 'text-saffron-600 font-medium' : ''}`}>
            Upload
          </div>
          <div className={`text-center ${progress >= 50 ? 'text-saffron-600 font-medium' : ''}`}>
            Process
          </div>
          <div className={`text-center ${progress >= 75 ? 'text-saffron-600 font-medium' : ''}`}>
            Optimize
          </div>
          <div className={`text-center ${progress >= 100 ? 'text-saffron-600 font-medium' : ''}`}>
            Complete
          </div>
        </div>
      </div>
    </div>
  );
};