import React, { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { LeadsManager } from "./components/LeadsManager";
import { Profile } from "./components/Profile";
import { Login } from "./components/Login";
import { ViewType } from "./lib/types";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const { user, loading, isActive } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-slate-800 border-t-indigo-500 rounded-full animate-spin shadow-lg shadow-indigo-500/10" />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-indigo-400">LNX</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="h-screen w-screen flex bg-slate-950 text-slate-200 overflow-hidden relative">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/10 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
             <div className="relative w-full">
                <span className="absolute inset-y-0 left-4 flex items-center text-slate-500">
                  <ExternalLink className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  readOnly
                  placeholder="Master system ready for commands..." 
                  className="w-full bg-slate-900 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm text-slate-400"
                />
             </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-bold text-white tracking-tight">{user.displayName}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Panel v2.0</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              {user.displayName.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
             {currentView === "dashboard" && (
               <motion.div key="db" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 <Dashboard />
               </motion.div>
             )}
             {currentView === "usa-leads" && (
               <motion.div key="usa" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 <LeadsManager />
               </motion.div>
             )}
             {currentView === "bengali-leads" && (
               <motion.div key="bd" className="h-full flex items-center justify-center p-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="w-full max-w-3xl bg-slate-900/50 border border-slate-800 rounded-[3rem] p-16 text-center shadow-2xl backdrop-blur-xl relative overflow-hidden">
                    <div className="w-24 h-24 border-t-2 border-indigo-400 rounded-full animate-spin mx-auto mb-10 shadow-[0_0_40px_rgba(99,102,241,0.2)]" />
                    <h1 className="text-4xl font-bold text-white tracking-tighter mb-6">Pipeline <span className="text-emerald-400">Syncing</span></h1>
                    <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">System is establishing a secure encrypted tunnel to Bengal primary nodes. Anticipate full synchronization in T-minus 24h.</p>
                    <div className="absolute top-0 right-0 p-8 opacity-20 transform rotate-12">
                      <ExternalLink className="w-32 h-32 text-indigo-500" />
                    </div>
                  </div>
               </motion.div>
             )}
             {currentView === "profile" && (
               <motion.div key="prof" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Profile />
               </motion.div>
             )}
          </AnimatePresence>
        </div>

        {/* INACTIVE OVERLAY */}
        <AnimatePresence>
          {!isActive && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] backdrop-blur-[30px] bg-slate-950/90 flex items-center justify-center p-6"
            >
              <div className="bg-slate-900 border border-rose-500/30 rounded-[3rem] p-16 max-w-xl text-center shadow-2xl relative overflow-hidden">
                <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-lg shadow-rose-500/10">
                  <AlertTriangle className="w-10 h-10 text-rose-500 animate-pulse" />
                </div>
                <h2 className="text-4xl font-bold text-white tracking-tighter mb-6">ACCESS <span className="text-rose-500">BLOCKED</span></h2>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
                  Administrative session terminated. Your license credentials require synchronization to access global lead repository nodes.
                </p>
                
                <a 
                  href="https://unreal-leads-default-rtdb.asia-southeast1.firebasedatabase.app/"
                  target="_blank"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white px-10 py-5 rounded-2xl font-bold text-sm tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-rose-500/20 active:scale-[0.98]"
                >
                  <ExternalLink className="w-4 h-4" /> AUTHORIZE PACKAGE
                </a>

                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-500/5 blur-[80px] rounded-full pointer-events-none" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
