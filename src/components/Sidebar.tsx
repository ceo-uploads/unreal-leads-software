import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutGrid, 
  Globe, 
  Hourglass, 
  User, 
  LogOut,
  ChevronsLeft
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ViewType } from "../lib/types";
import { cn } from "../lib/utils";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { id: "dashboard", icon: LayoutGrid, label: "Dashboard" },
    { id: "usa-leads", icon: Globe, label: "Leads Browser" },
    { id: "bengali-leads", icon: Hourglass, label: "DB Management" },
    { id: "profile", icon: User, label: "User Profile" },
  ];

  return (
    <motion.nav 
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className="h-full bg-slate-900/50 border-r border-slate-800 flex flex-col p-4 z-50 backdrop-blur-xl"
    >
      <div className="p-4 flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          <LayoutGrid className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap"
          >
            Unreal Leads <span className="text-indigo-400">v2.0</span>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as ViewType)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border border-transparent",
              currentView === item.id 
                ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20 shadow-sm" 
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium text-sm"
              >
                {item.label}
              </motion.span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        {!collapsed && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Active System</span>
            </div>
            <p className="text-[10px] text-emerald-500/70 leading-relaxed font-medium">License validated through Firebase Auth.</p>
          </div>
        )}

        <button 
          onClick={() => { if(confirm("Terminate Session?")) logout(); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-bold text-xs uppercase tracking-widest">Logout</span>}
        </button>
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ChevronsLeft className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>
    </motion.nav>
  );
}

// Added missing Road animation as a style tag in index.css or here
// @keyframes road { 0% { background-position: 0px; } 100% { background-position: -60px; } }
