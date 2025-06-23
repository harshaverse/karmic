import React from 'react';
import { Heart, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-saffron-900 to-vermillion-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Karmic</h3>
                <p className="text-saffron-200">3D Mesh Optimizer</p>
              </div>
            </div>
            <p className="text-saffron-100 leading-relaxed mb-4">
              Transform your 3D models with the power of sacred geometry and modern algorithms. 
              Optimize, simplify, and perfect your meshes with divine precision.
            </p>
            <div className="flex items-center space-x-2 text-saffron-200">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span>and ancient wisdom</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-saffron-200">
              <li>Mesh Optimization</li>
              <li>Format Conversion</li>
              <li>Outer Shell Extraction</li>
              <li>Batch Processing</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-saffron-200">
              <li>Documentation</li>
              <li>API Reference</li>
              <li>Community</li>
              <li>Contact</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-saffron-800 mt-8 pt-8 text-center text-saffron-200">
          <p>&copy; 2024 Karmic. All rights reserved. | Powered by sacred algorithms</p>
        </div>
      </div>
    </footer>
  );
};