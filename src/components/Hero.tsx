import React from 'react';
import { Sparkles, Zap, Download } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-saffron-500/10 to-lotus-500/10"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-saffron-500 to-vermillion-500 rounded-full flex items-center justify-center shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-saffron-600 via-vermillion-600 to-lotus-600 bg-clip-text text-transparent">
              Transform Your 3D Models
            </span>
          </h1>
          
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Harness the power of ancient wisdom and modern technology. 
            Convert complex 3D meshes into optimized outer shells with divine precision.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="btn-primary flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Start Optimizing</span>
            </button>
            <button className="btn-secondary flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>View Examples</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="card">
              <div className="w-12 h-12 bg-saffron-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🕉️</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Sacred Geometry</h3>
              <p className="text-gray-600 text-sm">Preserve the essence while optimizing structure</p>
            </div>
            
            <div className="card">
              <div className="w-12 h-12 bg-vermillion-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">Process models in seconds, not minutes</p>
            </div>
            
            <div className="card">
              <div className="w-12 h-12 bg-lotus-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🪷</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Pure Results</h3>
              <p className="text-gray-600 text-sm">Clean outer shells ready for any application</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};