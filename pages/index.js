import { useState, useEffect } from 'react';
import ScriptEditor from '../components/ScriptEditor';
import ModuleBlock from '../components/ModuleBlock';
import ScriptList from '../components/ScriptList';

export default function Home() {
  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState(null);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    // Load scripts from localStorage
    const savedScripts = localStorage.getItem('pythonScripts');
    if (savedScripts) {
      setScripts(JSON.parse(savedScripts));
    }
    
    // Load modules
    const savedModules = localStorage.getItem('pythonModules');
    if (savedModules) {
      setModules(JSON.parse(savedModules));
    }
  }, []);

  const saveScript = (script) => {
    const updatedScripts = selectedScript 
      ? scripts.map(s => s.id === selectedScript.id ? script : s)
      : [...scripts, script];
    
    setScripts(updatedScripts);
    localStorage.setItem('pythonScripts', JSON.stringify(updatedScripts));
    setSelectedScript(script);
  };

  const deleteScript = (id) => {
    const updatedScripts = scripts.filter(s => s.id !== id);
    setScripts(updatedScripts);
    localStorage.setItem('pythonScripts', JSON.stringify(updatedScripts));
    if (selectedScript?.id === id) {
      setSelectedScript(null);
    }
  };

  const addModule = (moduleName) => {
    const newModule = {
      id: Date.now(),
      name: moduleName,
      code: ''
    };
    const updatedModules = [...modules, newModule];
    setModules(updatedModules);
    localStorage.setItem('pythonModules', JSON.stringify(updatedModules));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Python Script Editor
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Buat, simpan, dan kelola script Python dengan Script Block dan Module Block
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Script List */}
          <div className="lg:col-span-1">
            <ScriptList 
              scripts={scripts}
              selectedScript={selectedScript}
              onSelectScript={setSelectedScript}
              onDeleteScript={deleteScript}
            />
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ScriptEditor 
                script={selectedScript}
                modules={modules}
                onSave={saveScript}
              />
              <ModuleBlock 
                modules={modules}
                onAddModule={addModule}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
      }
