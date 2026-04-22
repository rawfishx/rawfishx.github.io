import { useState } from 'react';

const ScriptEditor = ({ script, modules, onSave }) => {
  const [code, setCode] = useState(script?.code || '');
  const [name, setName] = useState(script?.name || 'New Script');

  const handleSave = () => {
    const scriptData = {
      id: script?.id || Date.now(),
      name,
      code,
      createdAt: script?.createdAt || new Date().toISOString()
    };
    onSave(scriptData);
  };

  const insertModule = (moduleCode) => {
    setCode(code + '\n\n' + moduleCode);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
      <div className="mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama Script"
          className="w-full p-4 bg-white/50 rounded-xl text-2xl font-bold border border-white/30 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
        />
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => insertModule(module.code)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl text-sm font-medium hover:from-green-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              📦 {module.name}
            </button>
          ))}
        </div>
      </div>

      <div className="h-96 bg-black/90 rounded-xl p-4 border-2 border-white/20">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Tulis script Python Anda di sini..."
          className="w-full h-full resize-none bg-transparent text-green-400 font-mono text-lg p-4 outline-none"
          spellCheck="false"
        />
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSave}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
        >
          💾 Simpan Script
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-bold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          📋 Copy
        </button>
      </div>
    </div>
  );
};

export default ScriptEditor;
