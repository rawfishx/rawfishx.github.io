export default function ChemicalLabWebsite() { const tools = [ "Beaker", "Erlenmeyer Flask", "Test Tube", "Pipette", "Burette", "Microscope", "Mortar & Pestle", "Thermometer", "pH Meter", "Glass Stirrer", "Graduated Cylinder", "Dropper", "Centrifuge", "Petri Dish", "Funnel", "Safety Goggles", ];

const chemicals = [ "Hydrochloric Acid (HCl)", "Sulfuric Acid (H2SO4)", "Sodium Hydroxide (NaOH)", "Copper Sulfate", "Ethanol", "Distilled Water", "Potassium Permanganate", "Sodium Chloride", "Ammonia Solution", "Acetic Acid", ];

const heaters = [ "Bunsen Burner", "Electric Heater", "Heating Mantle", "Hot Plate", "Alcohol Lamp", ];

const experiments = [ { title: "Acid-Base Reaction", desc: "Mix HCl with NaOH to observe neutralization reactions.", }, { title: "Crystal Growth", desc: "Create crystal structures using copper sulfate solution.", }, { title: "Heat Reaction Test", desc: "Observe chemical changes under different temperatures.", }, ];

return ( <div className="min-h-screen bg-slate-950 text-white font-sans"> {/* HERO */} <section className="relative overflow-hidden border-b border-slate-800"> <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-blue-500/20" />

<div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h1 className="text-5xl lg:text-7xl font-black leading-tight">
          CHEMICAL
          <span className="block text-cyan-400">LAB</span>
        </h1>

        <p className="mt-6 text-lg text-slate-300 max-w-xl leading-relaxed">
          Advanced virtual chemistry laboratory website with complete
          equipment, chemicals, heating systems, and experiment simulation
          interface.
        </p>

        <div className="flex flex-wrap gap-4 mt-8">
          <button className="bg-cyan-500 hover:bg-cyan-400 transition px-6 py-3 rounded-2xl font-bold text-black shadow-xl">
            Start Experiment
          </button>

          <button className="border border-slate-700 hover:border-cyan-400 transition px-6 py-3 rounded-2xl font-bold">
            Explore Laboratory
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="text-cyan-400 text-4xl">🧪</div>
          <h3 className="mt-4 text-2xl font-bold">Chemical Reactions</h3>
          <p className="mt-2 text-slate-400">
            Simulate real laboratory reactions safely.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="text-orange-400 text-4xl">🔥</div>
          <h3 className="mt-4 text-2xl font-bold">Heating Systems</h3>
          <p className="mt-2 text-slate-400">
            Complete laboratory heating equipment.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="text-green-400 text-4xl">⚗️</div>
          <h3 className="mt-4 text-2xl font-bold">Experiment Tools</h3>
          <p className="mt-2 text-slate-400">
            Full chemistry tools for advanced testing.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="text-pink-400 text-4xl">🧫</div>
          <h3 className="mt-4 text-2xl font-bold">Research Area</h3>
          <p className="mt-2 text-slate-400">
            Professional laboratory environment simulation.
          </p>
        </div>
      </div>
    </div>
  </section>

  {/* TOOLS */}
  <section className="max-w-7xl mx-auto px-6 py-20">
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h2 className="text-4xl font-black">Laboratory Equipment</h2>
        <p className="text-slate-400 mt-2">
          Complete chemistry laboratory tools and instruments.
        </p>
      </div>

      <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl text-cyan-300 font-semibold">
        {tools.length} Equipment Available
      </div>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
      {tools.map((tool, index) => (
        <div
          key={index}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-cyan-400 transition"
        >
          <div className="text-3xl">🔬</div>
          <h3 className="mt-4 text-xl font-bold">{tool}</h3>
          <p className="text-slate-400 mt-2 text-sm">
            Professional laboratory equipment for chemistry experiments.
          </p>
        </div>
      ))}
    </div>
  </section>

  {/* CHEMICALS */}
  <section className="bg-slate-900 border-y border-slate-800">
    <div className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-4xl font-black">Chemical Materials</h2>
      <p className="text-slate-400 mt-3 max-w-2xl">
        Collection of common laboratory chemicals for simulation and
        educational purposes.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5 mt-10">
        {chemicals.map((chemical, index) => (
          <div
            key={index}
            className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-green-400 transition"
          >
            <div className="text-3xl">🧪</div>
            <h3 className="mt-4 font-bold">{chemical}</h3>
            <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* HEATERS */}
  <section className="max-w-7xl mx-auto px-6 py-20">
    <h2 className="text-4xl font-black">Heating Equipment</h2>
    <p className="text-slate-400 mt-3">
      Laboratory heating systems for controlled reactions.
    </p>

    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5 mt-10">
      {heaters.map((heater, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-3xl p-6"
        >
          <div className="text-4xl">🔥</div>
          <h3 className="mt-4 font-bold text-lg">{heater}</h3>
          <button className="mt-5 w-full bg-orange-500 hover:bg-orange-400 transition text-black font-bold py-2 rounded-xl">
            Activate
          </button>
        </div>
      ))}
    </div>
  </section>

  {/* EXPERIMENTS */}
  <section className="bg-slate-900 border-y border-slate-800">
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-4xl font-black">Experiment Simulation</h2>
          <p className="text-slate-400 mt-2">
            Interactive chemistry experiment modules.
          </p>
        </div>

        <button className="bg-cyan-500 hover:bg-cyan-400 transition text-black font-bold px-6 py-3 rounded-2xl shadow-xl">
          Create New Experiment
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-10">
        {experiments.map((exp, index) => (
          <div
            key={index}
            className="bg-slate-950 border border-slate-800 rounded-3xl p-6 hover:border-cyan-400 transition"
          >
            <div className="text-5xl">⚗️</div>
            <h3 className="mt-5 text-2xl font-bold">{exp.title}</h3>
            <p className="text-slate-400 mt-3 leading-relaxed">
              {exp.desc}
            </p>

            <button className="mt-6 w-full border border-cyan-400 hover:bg-cyan-400 hover:text-black transition py-3 rounded-2xl font-bold">
              Run Simulation
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* CONTROL PANEL */}
  <section className="max-w-7xl mx-auto px-6 py-20">
    <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-4xl font-black">Lab Control Panel</h2>
          <p className="text-slate-400 mt-2">
            Monitor and control all laboratory systems.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="bg-green-500 hover:bg-green-400 transition text-black font-bold px-5 py-3 rounded-2xl">
            Power ON
          </button>

          <button className="bg-red-500 hover:bg-red-400 transition text-black font-bold px-5 py-3 rounded-2xl">
            Emergency STOP
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-10">
        <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800">
          <h3 className="text-xl font-bold">Temperature</h3>
          <div className="mt-5 text-6xl font-black text-orange-400">
            120°C
          </div>
          <div className="mt-5 h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-orange-400" />
          </div>
        </div>

        <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800">
          <h3 className="text-xl font-bold">Chemical Stability</h3>
          <div className="mt-5 text-6xl font-black text-green-400">
            87%
          </div>
          <div className="mt-5 h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-4/5 bg-green-400" />
          </div>
        </div>

        <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800">
          <h3 className="text-xl font-bold">Pressure</h3>
          <div className="mt-5 text-6xl font-black text-cyan-400">
            2.1
          </div>
          <p className="text-slate-400 mt-2">Atmosphere</p>
          <div className="mt-5 h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-cyan-400" />
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* FOOTER */}
  <footer className="border-t border-slate-800 py-10 text-center text-slate-500">
    <p>
      Chemical Lab Simulation Website • Built with React + Tailwind CSS
    </p>
  </footer>
</div>

); }