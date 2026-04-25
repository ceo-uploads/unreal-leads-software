import React from "react";
import { motion } from "motion/react";
import { useAuth } from "../hooks/useAuth";
import { User, Calendar, Shield, CreditCard, Mail } from "lucide-react";

export function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  const formatDate = (ts: number | string) => {
    try {
      const d = new Date(Number(ts));
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return "Invalid Date";
    }
  };

  const fields = [
    { label: "Display Name", value: user.displayName, icon: User },
    { label: "Username", value: user.username, icon: Shield },
    { label: "User ID", value: user.userId, icon: CreditCard },
    { label: "Status", value: user.status, icon: Shield, highlight: true },
    { label: "Enrolled", value: formatDate(user.enrolledAt), icon: Calendar },
    { label: "Deadline", value: formatDate(user.deadline), icon: Calendar },
  ];

  return (
    <div className="h-full flex items-center justify-center p-8 bg-slate-950 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <header className="mb-10 flex items-center gap-6 border-b border-slate-800 pb-8">
            <div className="w-20 h-20 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <User className="w-10 h-10 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">{user.displayName}</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Verified Consumer</p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {fields.map((field, i) => (
              <motion.div 
                key={field.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-2"
              >
                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block ml-1">{field.label}</label>
                <div className={cn(
                  "p-4 rounded-2xl border border-slate-800 font-mono text-sm shadow-inner transition-all",
                  field.highlight ? "bg-indigo-600/5 text-indigo-300 border-indigo-500/20" : "bg-slate-950 text-slate-300"
                )}>
                  {field.value}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Account Health Status</h4>
              <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/20">Secured</span>
            </div>
            
            <div className="space-y-6">
              <div>
                 <div className="flex justify-between text-[11px] mb-2 font-medium">
                   <span className="text-slate-400">Database Integrity Pipeline</span>
                   <span className="text-emerald-400">100%</span>
                 </div>
                 <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                   <div className="h-full w-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                 </div>
              </div>
              <div>
                 <div className="flex justify-between text-[11px] mb-2 font-medium">
                   <span className="text-slate-400">Real-time License Validity</span>
                   <span className="text-indigo-400">Live</span>
                 </div>
                 <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                   <div className="h-full w-[88%] bg-indigo-400 animate-pulse"></div>
                 </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-600" />
              <p className="text-[10px] text-slate-500 leading-tight">Data modification restricted by <br /> <span className="text-slate-400 font-bold uppercase tracking-tighter">Security Protocol v2.4</span></p>
            </div>
            <button disabled className="px-4 py-2 bg-slate-800 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-not-allowed">
              LOCKED
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      </motion.div>
    </div>
  );
}

import { cn } from "../lib/utils";
