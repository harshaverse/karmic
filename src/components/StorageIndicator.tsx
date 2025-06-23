import React from 'react';
import { HardDrive, Trash2 } from 'lucide-react';

interface StorageIndicatorProps {
  used: number;
  limit: number;
  onClear: () => void;
}

export const StorageIndicator: React.FC<StorageIndicatorProps> = ({ used, limit, onClear }) => {
  const percentage = (used / limit) * 100;
  const isNearLimit = percentage > 80;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <HardDrive className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-800">Storage Usage</h3>
        </div>
        
        {used > 0 && (
          <button 
            onClick={onClear}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            {used.toFixed(1)} MB used of {limit} MB
          </span>
          <span className={`font-medium ${isNearLimit ? 'text-red-600' : 'text-gray-800'}`}>
            {percentage.toFixed(1)}%
          </span>
        </div>
        
        <div className="progress-bar">
          <div 
            className={`h-full transition-all duration-300 ease-out ${
              isNearLimit 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : 'bg-gradient-to-r from-saffron-500 to-vermillion-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        {isNearLimit && (
          <p className="text-xs text-red-600 mt-2">
            ⚠️ Storage nearly full. Consider clearing old files.
          </p>
        )}
      </div>
    </div>
  );
};