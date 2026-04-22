import { useState } from 'react';
const ModuleBlock = ({ modules, onAddModule }) => {
  const [newModuleName, setNewModuleName] = useState('');

  const predefinedModules = [
    { name: 'numpy', code: 'import numpy as np\n# NumPy module' },
    { name: 'pandas', code: 'import pandas as pd\n# Pandas module' },
    { name: 'matplotlib', code: 'import matplotlib.pyplot as plt\n# Matplotlib module' },
    { name: 'requests', code: 'import requests\n# HTTP requests module' },
  ];

  const handleAddModule = () => {
    if (newModuleName.trim()) {
      onAddModule(newModuleName.trim());
      setNewModuleName('');
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">🧩 Module Block</h2>
      
      <div className="mb-8">
        <div classModuleName="flex gap-2 mb-4">
          <input
            type="text"
            value={newModuleName}
            onChange={(e) => setNewModuleName(e.target.value)}
            placeholder="Nama module baru..."
            className="flex-1 p-3 bg-white/50 rounded-xl border border-white/30 focus:outline-none focus:ring-4 focus:ring-green-500/50"
          />
          <button
            onClick={handleAddModule}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
          >
            ➕
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-lg text-gray-700 mb-3">Module Populer:</h3>
        <div className="grid grid-cols-2 gap-3">
          {predefinedModules.map((module) => (
            <button
              key={module.name}
              onClick={() => onAddModule(module.name)}
              className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm"
            >
              📦 {module.name}
            </button>
          ))}
        </div>
      </div>

      {modules.length > 0 && (
        <>
          <h3 className="font-bold text-lg text-gray-700 mt-8 mb-3">Module Saya:</h3>
          <div className="space-y-2">
            {modules.map((module) => (
              <div key={module.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="font-medium text-blue-800">📦 {module.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ModuleBlock;
