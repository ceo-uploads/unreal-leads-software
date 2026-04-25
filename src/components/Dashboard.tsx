import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Zap, ShieldCheck, History } from "lucide-react";

export function Dashboard() {
  const [matrixContent, setMatrixContent] = useState<string[]>([]);

  useEffect(() => {
    const word = "UNREALLEADS";
    const content = Array.from({ length: 300 }, (_, i) => word[i % word.length]);
    setMatrixContent(content);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      {/* Matrix Background */}
      <div className="absolute inset-0 grid grid-cols-[repeat(auto-fill,minmax(28px,1fr))] auto-rows-[30px] opacity-10 pointer-events-none">
        {matrixContent.map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0.1 }}
            animate={{ 
              opacity: [0.1, 0.5, 0.1],
              color: ["#4f46e5", "#ffffff", "#4f46e5"]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              delay: Math.random() * 5 
            }}
            className="text-center font-display text-xs"
          >
            {char}
          </motion.span>
        ))}
      </div>

      <div className="relative z-10 p-8 h-full overflow-y-auto">
        <header className="mb-10">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold text-white tracking-tight mb-2"
          >
            Lead <span className="text-indigo-400">Intelligence</span>
          </motion.h1>
          <p className="text-slate-500 text-sm">Real-time analytical dashboard for global leads infrastructure.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm group hover:border-indigo-500/50 transition-all duration-300"
          >
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Total USA Leads</span>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-white tracking-tighter">42,842,019</h3>
              <span className="text-emerald-400 text-[10px] font-bold bg-emerald-400/10 px-2 py-1 rounded-lg">+12.4%</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm group hover:border-indigo-500/50 transition-all duration-300"
          >
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Bengali Leads</span>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-white tracking-tighter">Working</h3>
              <span className="text-indigo-400 text-[10px] font-bold bg-indigo-400/10 px-2 py-1 rounded-lg">Synced</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm group hover:border-indigo-500/50 transition-all duration-300"
          >
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Database Merges</span>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-white tracking-tighter">30/30</h3>
              <span className="text-slate-400 text-[10px] font-bold bg-slate-800 px-2 py-1 rounded-lg">Optimized</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm group hover:border-indigo-500/50 transition-all duration-300"
          >
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Data Health</span>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-white tracking-tighter">99.8%</h3>
              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                 <div className="h-full w-[99%] bg-gradient-to-r from-emerald-500 to-indigo-500"></div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white mb-4">Real-time Pipeline Status</h2>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-slate-300">Connection Core: Online</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-medium text-slate-300">SQLite Worker: Active</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <History className="w-5 h-5" />
                <span className="text-sm">Last Sync: 2m ago</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
