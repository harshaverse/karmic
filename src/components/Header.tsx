import React from 'react';
import { Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-saffron-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-saffron-500 to-vermillion-500 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-saffron-600 to-vermillion-600 bg-clip-text text-transparent">
                Karmic
              </h1>
              <p className="text-sm text-gray-600">3D Mesh Optimizer</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-700 hover:text-saffron-600 transition-colors">
              Features
            </a>
            <a href="#about" className="text-gray-700 hover:text-saffron-600 transition-colors">
              About
            </a>
            <button className="btn-secondary">
              Get Started
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};