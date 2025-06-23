import React from 'react';
import { Zap, Shield, Cpu, Globe, Layers, Sparkles } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast Processing',
      description: 'Optimize complex 3D models in seconds using advanced algorithms',
      color: 'saffron'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your models are processed securely and never stored permanently',
      color: 'vermillion'
    },
    {
      icon: Cpu,
      title: 'Advanced Algorithms',
      description: 'Powered by Trimesh and cutting-edge mesh optimization techniques',
      color: 'lotus'
    },
    {
      icon: Globe,
      title: 'Universal Format Support',
      description: 'Works with OBJ, STL, PLY files and exports to optimized GLB',
      color: 'saffron'
    },
    {
      icon: Layers,
      title: 'Outer Shell Extraction',
      description: 'Intelligently removes internal geometry while preserving surface details',
      color: 'vermillion'
    },
    {
      icon: Sparkles,
      title: 'Sacred Precision',
      description: 'Maintains the essence of your model while achieving optimal performance',
      color: 'lotus'
    }
  ];

  return (
    <section id="features" className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-saffron-600 to-vermillion-600 bg-clip-text text-transparent">
            Powerful Features
          </span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Experience the perfect blend of ancient wisdom and modern technology
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="card hover:shadow-xl transition-all duration-300 group">
              <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 text-${feature.color}-600`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};