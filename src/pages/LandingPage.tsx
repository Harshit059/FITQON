import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Activity, Dumbbell, Flame, Apple, Trophy, CheckSquare } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex-1 bg-transparent text-white relative overflow-hidden flex flex-col justify-center cyber-grid min-h-[calc(100vh-4rem)]">
      {/* Background ambient light flare */}
      <div className="absolute top-[-15%] left-[-15%] w-[75vw] h-[75vw] bg-[#FACC15]/4 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[60vw] h-[60vw] bg-zinc-900/40 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Decorative crosshairs/guides in page margins to simulate HUD */}
      <div className="absolute top-8 left-8 w-4 h-4 border-t border-l border-zinc-800 pointer-events-none hidden md:block"></div>
      <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-zinc-800 pointer-events-none hidden md:block"></div>
      <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-zinc-800 pointer-events-none hidden md:block"></div>
      <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-zinc-800 pointer-events-none hidden md:block"></div>

      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Premium Title & Cybernetic Calls-to-action */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-8 text-left animate-fade-in-up">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950/95 border border-[#FACC15]/20 rounded-lg text-[9px] font-mono tracking-widest text-[#FACC15] uppercase font-black shadow-lg shadow-[#FACC15]/5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FACC15] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FACC15]"></span>
            </span>
            <span>INTEL-CORE SYSTEM ACTIVE // DEPLOY v2.2</span>
          </motion.div>
 
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.85] uppercase">
              TRACK.<br />
              <span className="bg-gradient-to-r from-[#FACC15] via-[#fffbb3] to-[#e49b0f] text-transparent bg-clip-text filter drop-shadow-[0_0_20px_rgba(250,204,15,0.15)]">
                DIAGNOSE.
              </span> <br />
              DOMINATE.
            </h1>
            <div className="flex items-center gap-2 pt-1">
              <div className="h-1 w-20 bg-gradient-to-r from-[#FACC15] to-transparent rounded-full"></div>
              <span className="font-mono text-[8px] tracking-[0.25em] text-zinc-650 uppercase font-bold">STATE ENGINE ATTAINABLE</span>
            </div>
          </div>
 
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
            FITQON evaluates daily training frequency, nutritional budgets, and lifestyle routines to build deep cognitive diagnostic maps. Step into high performance with immediate biometric reporting powered by Gemini telemetry.
          </p>
 
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
            <Link
              to="/auth"
              className="bg-[#FACC15] text-black font-mono font-black uppercase tracking-widest text-xs px-8 py-4 rounded-lg shadow-xl shadow-[#FACC15]/10 hover:shadow-[#FACC15]/25 hover:bg-white hover:scale-[1.03] active:scale-95 transition-all glow-btn"
            >
              Start Daily Check-In
            </Link>
            <Link
              to="/admin-login"
              className="border border-zinc-800 bg-zinc-950/60 backdrop-blur-md text-zinc-300 font-mono text-xs px-8 py-4 rounded-lg hover:bg-zinc-900/50 hover:text-white hover:border-zinc-700/80 transition-all uppercase tracking-wider"
            >
              Admin Terminal
            </Link>
          </div>
 
          {/* Precision Bio Stats */}
          <div className="grid grid-cols-3 gap-6 sm:gap-12 border-t border-zinc-900/80 pt-8 w-full max-w-lg">
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black font-mono text-[#FACC15] leading-none tracking-tight digital-metric">100%</p>
              <p className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider font-extrabold leading-none pt-1">// INTEL BOUNDS</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black font-mono text-white leading-none tracking-tight">0s</p>
              <p className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider font-extrabold leading-none pt-1">// LATENCY RATE</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black font-mono text-[#FACC15] leading-none tracking-tight digital-metric">352 ms</p>
              <p className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider font-extrabold leading-none pt-1">// CYCLE FREQ</p>
            </div>
          </div>
        </div>
 
        {/* Right Column: Visual Futuristic HUD Mockup with interactive revolving dial and diagnostics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="lg:col-span-5 relative"
        >
          {/* Background glowing glow halo behind cockpit */}
          <div className="absolute inset-[-15px] rounded-full bg-gradient-to-tr from-[#FACC15]/5 via-transparent to-zinc-900/10 blur-[40px] pointer-events-none" />

          {/* Golden cyber bracket decoration around card */}
          <div className="absolute top-[-5px] left-[-5px] w-6 h-6 border-t-2 border-l-2 border-[#FACC15] rounded-tl pointer-events-none z-20" />
          <div className="absolute bottom-[-5px] right-[-5px] w-6 h-6 border-b-2 border-r-2 border-[#FACC15] rounded-br pointer-events-none z-20" />

          <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-tr from-zinc-850 via-[#FACC15]/20 to-zinc-900 p-[1px]">
            <div className="premium-card cyber-scanner-sweep rounded-2xl p-6 sm:p-8 flex flex-col space-y-6 relative overflow-hidden h-full">
              <div className="flex items-center justify-between border-b border-zinc-900/80 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-mono font-black uppercase tracking-wider">SECURE LINK</span>
                </div>
                <span className="text-[8px] font-mono text-zinc-550 tracking-widest uppercase font-black">HUD_V2.2 // SYNC_ONLINE</span>
              </div>
 
              {/* Spinning circular tech telemetry widget */}
              <div className="relative py-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Slow outer rotating dial */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
                    className="w-32 h-32 rounded-full border border-dashed border-zinc-800 opacity-60 flex items-center justify-center"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Faster inner opposite rotating dial */}
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                    className="w-28 h-28 rounded-full border-2 border-dotted border-[#FACC15]/20 flex items-center justify-center"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Holographic scanner rings */}
                  <div className="w-24 h-24 rounded-full bg-[#FACC15]/2 border border-[#FACC15]/10 animate-pulse flex items-center justify-center" />
                </div>

                <div className="relative z-10 w-28 h-28 rounded-full bg-zinc-950/90 border border-zinc-900 flex flex-col justify-center items-center text-center shadow-2xl">
                  <Activity className="w-5 h-5 text-[#FACC15] animate-bounce" />
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-black mt-2 leading-none">VITAL RATIO</span>
                  <span className="text-xl font-mono text-white font-black leading-none mt-1 tracking-tight">98.5%</span>
                </div>
              </div>

              {/* Futuristic diagnostic entries */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-4 bg-zinc-950/90 border border-zinc-900/80 p-3.5 rounded-xl hover:border-[#FACC15]/30 hover:bg-zinc-900/35 transition-all duration-300">
                  <div className="w-9 h-9 rounded-lg bg-[#FACC15]/10 flex items-center justify-center shrink-0 border border-[#FACC15]/25">
                    <Dumbbell className="w-4 h-4 text-[#FACC15]" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[8.5px] font-mono text-[#FACC15] uppercase tracking-wider font-extrabold">TRAINING STATUS</p>
                      <span className="text-[7.5px] font-mono text-zinc-400">SYNCED</span>
                    </div>
                    <p className="text-xs font-bold text-zinc-100 mt-0.5 truncate uppercase">Compound Squat Session - High Load</p>
                  </div>
                </div>
 
                <div className="flex items-center gap-4 bg-zinc-950/90 border border-zinc-900/80 p-3.5 rounded-xl hover:border-[#FACC15]/30 hover:bg-zinc-900/35 transition-all duration-300">
                  <div className="w-9 h-9 rounded-lg bg-[#FACC15]/10 flex items-center justify-center shrink-0 border border-[#FACC15]/25">
                    <Apple className="w-4 h-4 text-[#FACC15]" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[8.5px] font-mono text-[#FACC15] uppercase tracking-wider font-extrabold">NUTRITIONAL LOG</p>
                      <span className="text-[7.5px] font-mono text-emerald-400">ACTIVE</span>
                    </div>
                    <p className="text-xs font-bold text-zinc-100 mt-0.5 truncate uppercase">High Protein Fuel, hydration balance optimal</p>
                  </div>
                </div>
 
                <div className="flex items-center gap-4 bg-[#FACC15]/5 border border-[#FACC15]/20 p-3.5 rounded-xl transition-all duration-300">
                  <div className="w-9 h-9 rounded-lg bg-[#FACC15] flex items-center justify-center shrink-0 shadow-lg shadow-[#FACC15]/25">
                    <Trophy className="w-4 h-4 text-black font-black" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[8.5px] font-mono text-zinc-400 uppercase tracking-widest font-black">AI RESTRUCTURING CORE</p>
                      <span className="text-[7px] bg-[#FACC15] text-black px-1 rounded font-mono font-black animate-pulse">GENERATED</span>
                    </div>
                    <p className="text-xs font-black text-[#FACC15] mt-0.5 uppercase tracking-tight">EXCELLENT ATHLETIC DIAGNOSTIC</p>
                  </div>
                </div>
              </div>
 
              {/* Progress HUD Indicator with glowing micro-subline */}
              <div className="border border-zinc-900 bg-zinc-950/95 p-4 rounded-xl flex flex-col space-y-3.5 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#FACC15]/5 to-transparent pointer-events-none" />
                <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                  <span className="text-zinc-550 font-bold">Biometric Timeline</span>
                  <span className="text-[#FACC15] font-black">74% Target Reached</span>
                </div>
                
                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden p-[1px] border border-zinc-850">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '74%' }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-amber-500 to-[#FACC15] rounded-full" 
                  />
                </div>
                
                <p className="text-[11px] font-mono text-zinc-400 leading-relaxed italic border-l-2 border-[#FACC15] pl-2.5">
                  "Prioritize rest blocks post intensive squatted reps. Fluid metric targets hit."
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
