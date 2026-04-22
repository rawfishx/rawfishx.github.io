const ScriptList = ({ scripts, selectedScript, onSelectScript, onDeleteScript }) => {
  const createNewScript = () => {
    onSelectScript(null);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">📋 Script Saya</h2>
        <button
          onClick={createNewScript}
          className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
        >
          ➕ Script Baru
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {scripts.map((script) => (
          <div
            key={script.id}
            className={`p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-xl transform hover:-translate-y-1 group ${
              selectedScript?.id === script.id
                ? 'border-blue-500 bg-blue-50 shadow-2xl'
                : 'border-gray-200 hover:border-blue-300 bg-white/50'
            }`}
            onClick={() => onSelectScript(script)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-xl text-gray-800 truncate">
                {script.name}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteScript(script.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 font-bold text-xl transition-opacity duration-200"
              >
                🗑️
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {new Date(script.createdAt).toLocaleDateString('id-ID')}
            </p>
          </div>
        ))}
      </div>

      {scripts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-lg">Belum ada script. Buat yang pertama!</p>
        </div>
      )}
    </div>
  );
};

export default ScriptList;
