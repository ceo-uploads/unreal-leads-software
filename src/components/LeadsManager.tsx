import React, { useState, useEffect, useCallback, useMemo } from "react";
import initSqlJs, { Database } from "sql.js";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Send, 
  ExternalLink,
  ArrowUpDown,
  AlertCircle,
  Mail,
  Phone,
  Globe,
  MoreHorizontal,
  CheckCircle2,
  Heart,
  Bookmark,
  ChevronLast,
  ChevronFirst,
  Filter
} from "lucide-react";
import { cn } from "../lib/utils";

const REGIONS = {
  "USA": {
    basePath: "databases/USA",
    leads: {
      "Owner / Founder / CEO": "Owner_Founder_&_CEO_USA_targeted_b2b_leads.db",
      "Consumer Base": "Consumer_usa.db",
      "Coaches & Consultants": "coaches_&_consultents.db",
      "Doctors & Health": "Doctors_USA.db",
      "IT & Tech Companies": "it_company.db",
      "Real Estate Market": "real_state.db",
      "Bulk USA Data 1": "1 - USA - 100000 data.db",
    }
  },
  "UK": {
    basePath: "databases/UK",
    leads: {
      "Business Directors": "UK_Directors.db",
      "Startup Founders": "UK_Startups.db"
    }
  },
  "Canada": {
    basePath: "databases/Canada",
    leads: {
      "Enterprise Hub": "Canada_Enterprise.db"
    }
  }
} as const;

export function LeadsManager() {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<keyof typeof REGIONS>("USA");
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [categorySearch, setCategorySearch] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Table state
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [tableName, setTableName] = useState("");
  const [sortCol, setSortCol] = useState("");
  const [sortDir, setSortDir] = useState<"ASC" | "DESC">("ASC");

  // Interaction state
  const [likedLeads, setLikedLeads] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("likedLeads");
    return saved ? JSON.parse(saved) : {};
  });
  const [markedLeads, setMarkedLeads] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("markedLeads");
    return saved ? JSON.parse(saved) : {};
  });
  const [viewLikedOnly, setViewLikedOnly] = useState(false);
  const [viewMarkedOnly, setViewMarkedOnly] = useState(false);
  
  const itemsPerPage = 100;

  useEffect(() => {
    localStorage.setItem("likedLeads", JSON.stringify(likedLeads));
  }, [likedLeads]);

  useEffect(() => {
    localStorage.setItem("markedLeads", JSON.stringify(markedLeads));
  }, [markedLeads]);

  const getRowId = (row: any) => {
    // Generate a semi-unique ID from row values if no id column exists
    return row.id || row.Email || row.phone || row.Phone || row.company || row.Company || JSON.stringify(row);
  };

  const toggleLike = (row: any) => {
    const id = getRowId(row);
    setLikedLeads(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMark = (row: any) => {
    const id = getRowId(row);
    setMarkedLeads(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const categories = Object.keys(REGIONS[selectedRegion].leads);
    if (categories.length > 0) setCurrentCategory(categories[0]);
  }, [selectedRegion]);

  useEffect(() => {
    if (currentCategory) loadDatabase(selectedRegion, currentCategory);
  }, [currentCategory, selectedRegion]);

  const loadDatabase = async (region: keyof typeof REGIONS, category: string) => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    setSearchQuery("");
    
    try {
      const SQL = await initSqlJs({
        locateFile: (file) => `https://unpkg.com/sql.js@1.14.1/dist/${file}`,
      });

      const regionConfig = REGIONS[region];
      const fileName = (regionConfig.leads as any)[category];
      const dbPath = `${regionConfig.basePath}/${fileName}`;
      
      let response;
      try {
        response = await fetch(dbPath);
      } catch (fetchErr) {
        throw new Error(`Connection established, but vault resource [${fileName}] was blocked or is missing. Please ensure the file is physically located at: public/${dbPath}`);
      }
      
      if (!response.ok) {
        throw new Error(`Data fragment [${fileName}] is missing in ${region} vault status: ${response.status}. Please place the .db file at public/${dbPath}`);
      }

      const buffer = await response.arrayBuffer();
      const newDb = new SQL.Database(new Uint8Array(buffer));
      setDb(newDb);
      
      const tableRes = newDb.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      if (tableRes.length > 0) {
        const name = tableRes[0].values[0][0] as string;
        setTableName(name);
        
        const headerRes = newDb.exec(`PRAGMA table_info("${name}")`);
        const cols = headerRes[0].values.map((v) => v[1] as string);
        setHeaders(cols);
        fetchPageData(newDb, name, 1, "", "", "ASC", cols);
      }
    } catch (err: any) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPageData = useCallback((activeDb: Database, table: string, page: number, query: string, sCol: string, sDir: string, cols: string[]) => {
    try {
      let whereClause = "";
      if (query) {
        const escaped = query.replace(/'/g, "''");
        const conditions = cols.map(h => `"${h}" LIKE '%${escaped}%'`);
        whereClause = `WHERE ${conditions.join(" OR ")}`;
      }

      const orderClause = sCol ? `ORDER BY "${sCol}" ${sDir}` : "";
      const offset = (page - 1) * itemsPerPage;

      const countRes = activeDb.exec(`SELECT COUNT(*) FROM "${table}" ${whereClause}`);
      const total = countRes[0].values[0][0] as number;
      setTotalCount(total);

      const dataRes = activeDb.exec(`SELECT * FROM "${table}" ${whereClause} ${orderClause} LIMIT ${itemsPerPage} OFFSET ${offset}`);

      if (dataRes.length > 0) {
        const rows = dataRes[0].values.map((row) => {
          const obj: any = {};
          cols.forEach((col, i) => (obj[col] = row[i]));
          return obj;
        });
        setData(rows);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
    if (db && tableName) {
      fetchPageData(db, tableName, 1, q, sortCol, sortDir, headers);
    }
  };

  const handleSort = (col: string) => {
    const newDir = sortCol === col && sortDir === "ASC" ? "DESC" : "ASC";
    setSortCol(col);
    setSortDir(newDir);
    if (db && tableName) {
      fetchPageData(db, tableName, currentPage, searchQuery, col, newDir, headers);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (db && tableName) {
      fetchPageData(db, tableName, page, searchQuery, sortCol, sortDir, headers);
    }
  };

  const filteredCategories = useMemo(() => {
    return Object.keys(REGIONS[selectedRegion].leads).filter(c => 
      c.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categorySearch, selectedRegion]);

  const emailCountOnPage = useMemo(() => {
    return data.filter(row => {
      return Object.values(row).some(v => {
        const s = String(v).toLowerCase();
        return s.includes('@') && s.includes('.') && !s.includes(' ');
      });
    }).length;
  }, [data]);

  const displayData = useMemo(() => {
    let filtered = data;
    if (viewLikedOnly) {
      filtered = filtered.filter(row => likedLeads[getRowId(row)]);
    }
    if (viewMarkedOnly) {
      filtered = filtered.filter(row => markedLeads[getRowId(row)]);
    }
    return filtered;
  }, [data, viewLikedOnly, viewMarkedOnly, likedLeads, markedLeads]);

  const renderCellContent = (value: any, header: string) => {
    if (value === null || value === undefined || value === "null" || String(value).trim() === "") {
        return <span className="text-slate-700 italic">n/a</span>;
    }
    const str = String(value).trim();
    
    // Check for Email
    if (str.includes('@') && str.includes('.') && !str.includes(' ')) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-indigo-400 font-medium truncate max-w-[200px]" title={str}>{str}</span>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => window.location.href = `mailto:${str}`} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-400 transition-all" title="Launch Email"><Mail className="w-3.5 h-3.5"/></button>
            <button onClick={() => { navigator.clipboard.writeText(str); alert("Email copied"); }} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all" title="Copy Email"><Copy className="w-3.5 h-3.5"/></button>
          </div>
        </div>
      );
    }

    // Check for URL
    if (str.toLowerCase().startsWith('http') || str.toLowerCase().startsWith('www.')) {
      const url = str.toLowerCase().startsWith('www.') ? `https://${str}` : str;
      return (
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="text-emerald-400 font-medium truncate max-w-[200px]" title={str}>{str}</span>
          <div className="flex items-center gap-1 shrink-0">
            <a href={url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-emerald-400 transition-all" title="Visit Link"><ExternalLink className="w-3.5 h-3.5"/></a>
            <button onClick={() => { navigator.clipboard.writeText(str); alert("Link copied"); }} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all" title="Copy URL"><Copy className="w-3.5 h-3.5"/></button>
          </div>
        </div>
      );
    }

    // Check for Phone (Basic detection)
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,12}$/;
    const pureNum = str.replace(/[-\s\.\(\)\+]/g, '');
    if (pureNum.length >= 7 && pureNum.length <= 15 && !isNaN(Number(pureNum))) {
      return (
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="text-amber-400 font-medium truncate" title={str}>{str}</span>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => window.location.href = `tel:${str}`} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-amber-400 transition-all" title="Call Number"><Phone className="w-3.5 h-3.5"/></button>
            <button onClick={() => { navigator.clipboard.writeText(str); alert("Phone copied"); }} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all" title="Copy Number"><Copy className="w-3.5 h-3.5"/></button>
          </div>
        </div>
      );
    }

    return <span className="text-slate-300 truncate max-w-[400px] block overflow-hidden" title={str}>{str}</span>;
  };

  return (
    <div className="flex h-full bg-slate-950 overflow-hidden">
      {/* Intelligent Browser Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 320 }}
        className="border-r border-slate-800 bg-slate-900/30 backdrop-blur-xl flex flex-col shrink-0 relative transition-all duration-300"
      >
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white z-30 shadow-lg"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <div className={cn("p-6 border-b border-slate-800", sidebarCollapsed && "px-4")}>
          {!sidebarCollapsed && <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4 block">Regional Vaults</label>}
          <div className={cn("grid gap-2", sidebarCollapsed ? "grid-cols-1" : "grid-cols-2")}>
            {(Object.keys(REGIONS) as Array<keyof typeof REGIONS>).map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={cn(
                  "py-2.5 rounded-xl text-xs font-bold transition-all border",
                  selectedRegion === region 
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20" 
                    : "bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300 hover:bg-slate-700/50"
                )}
                title={sidebarCollapsed ? region : ""}
              >
                {sidebarCollapsed ? region.charAt(0) : region}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="relative">
            <span className={cn("absolute inset-y-0 flex items-center text-slate-500", sidebarCollapsed ? "left-0 w-full justify-center" : "left-4")}>
              <Search className="w-4 h-4" />
            </span>
            {!sidebarCollapsed && (
              <input 
                type="text"
                placeholder="Search specialized node..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1 custom-scrollbar">
          {filteredCategories.map(cat => (
            <motion.button
              layout
              key={cat}
              onClick={() => setCurrentCategory(cat)}
              className={cn(
                "w-full text-left px-4 py-3.5 rounded-2xl text-sm font-medium transition-all group relative overflow-hidden",
                currentCategory === cat 
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                  : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
              )}
              title={sidebarCollapsed ? cat : ""}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className={cn(
                    "w-2 h-2 rounded-full transition-all shrink-0 group-hover:scale-125", 
                    currentCategory === cat ? "bg-indigo-400 shadow-[0_0_10px_#818cf8]" : "bg-slate-700"
                )} />
                {!sidebarCollapsed && <span className="truncate">{cat}</span>}
              </div>
              {currentCategory === cat && !sidebarCollapsed && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute inset-0 bg-indigo-500/5 z-0"
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.aside>

      {/* Main Analysis Architecture */}
      <section className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/30 backdrop-blur-xl shrink-0 z-20">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-none mb-1">{currentCategory || "Global Sync"}</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">{selectedRegion} Command Node Active</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700">
                <button 
                   onClick={() => setViewLikedOnly(!viewLikedOnly)}
                   className={cn(
                     "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                     viewLikedOnly ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
                   )}
                >
                  <Heart className={cn("w-3 h-3", viewLikedOnly && "fill-current")} />
                  Liked {viewLikedOnly ? "Active" : "Inactive"}
                </button>
                <button 
                   onClick={() => setViewMarkedOnly(!viewMarkedOnly)}
                   className={cn(
                     "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                     viewMarkedOnly ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 text-emerald-400" : "text-slate-500 hover:text-slate-300"
                   )}
                >
                  <Bookmark className={cn("w-3 h-3", viewMarkedOnly && "fill-current")} />
                  Marked {viewMarkedOnly ? "Active" : "Inactive"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search Anything..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-slate-800 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-x-auto bg-slate-950 relative custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0 table-auto min-w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-900/95 backdrop-blur-md">
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 sticky left-0 bg-slate-900/95 z-20 shadow-[2px_0_10px_rgba(0,0,0,0.3)] w-20">
                  #
                </th>
                {headers.map(h => (
                  <th 
                    key={h}
                    onClick={() => handleSort(h)}
                    className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 group cursor-pointer hover:text-indigo-400 transition-colors whitespace-nowrap min-w-[200px]"
                  >
                    <div className="flex items-center gap-2">
                      {h}
                      <ArrowUpDown className={cn(
                        "w-3 h-3 transition-opacity", 
                        sortCol === h ? "opacity-100 text-indigo-400" : "opacity-0 group-hover:opacity-100"
                      )} />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 text-right sticky right-0 bg-slate-900/95 z-20 shadow-[-2px_0_10px_rgba(0,0,0,0.3)] w-48">
                  INTERACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/10">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 12 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                      <td colSpan={headers.length + 2} className="px-6 py-6 bg-slate-900/5 outline outline-1 outline-slate-800/50" />
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={headers.length + 2} className="p-20 text-center text-rose-500 bg-rose-500/5">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-bold text-lg tracking-tight mb-2">VAULT ARCHITECTURE CORRUPTION</p>
                      <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">{error}</p>
                    </td>
                  </tr>
                ) : displayData.length === 0 ? (
                    <tr>
                      <td colSpan={headers.length + 2} className="p-20 text-center text-slate-500">
                        <p className="text-lg font-medium">Zero intelligence signals detected.</p>
                        <p className="text-xs mt-2 uppercase tracking-widest opacity-50">{viewLikedOnly || viewMarkedOnly ? "Filter parameters returning null state" : "Query parameters returning null state"}</p>
                        {(viewLikedOnly || viewMarkedOnly) && (
                          <button 
                            onClick={() => { setViewLikedOnly(false); setViewMarkedOnly(false); }}
                            className="mt-4 text-indigo-400 hover:underline text-xs font-bold uppercase tracking-widest"
                          >
                            Reset filters
                          </button>
                        )}
                      </td>
                    </tr>
                ) : (
                  displayData.map((row, idx) => {
                    const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                    const rowId = getRowId(row);
                    const isLiked = likedLeads[rowId];
                    const isMarked = markedLeads[rowId];

                    return (
                      <motion.tr 
                        key={`${currentCategory}-${globalIdx}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (idx % 20) * 0.01 }}
                        className={cn(
                          "hover:bg-indigo-500/5 transition-colors group",
                          isLiked && "bg-indigo-500/[0.02]",
                          isMarked && "bg-emerald-500/[0.02]"
                        )}
                      >
                        <td className="px-6 py-4 text-xs font-mono text-slate-600 sticky left-0 bg-slate-950 group-hover:bg-slate-900/50 transition-colors z-10 border-r border-slate-800/30">
                          {globalIdx}
                        </td>
                        {headers.map(h => (
                          <td key={h} className="px-6 py-4 border-b border-slate-800/20 max-w-[400px]">
                            <div className="overflow-hidden">
                              {renderCellContent(row[h], h)}
                            </div>
                          </td>
                        ))}
                        <td className="px-6 py-4 text-right sticky right-0 bg-slate-950 group-hover:bg-slate-900/50 transition-colors z-10 border-l border-slate-800/30">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => toggleLike(row)}
                              className={cn(
                                "flex items-center justify-center p-2 rounded-xl transition-all shadow-sm active:scale-95",
                                isLiked 
                                  ? "bg-indigo-500 text-white shadow-indigo-500/20 glow-indigo" 
                                  : "bg-slate-800 text-slate-500 hover:text-indigo-400"
                              )}
                              title={isLiked ? "Unlike" : "Like"}
                            >
                              <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                            </button>
                            <button 
                              onClick={() => toggleMark(row)}
                              className={cn(
                                "flex items-center justify-center px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95",
                                isMarked
                                  ? "bg-emerald-600 text-white shadow-emerald-500/20 glow-emerald"
                                  : "bg-slate-800 text-slate-500 hover:text-emerald-400"
                              )}
                            >
                              {isMarked ? <CheckCircle2 className="w-3 h-3 mr-1.5" /> : null}
                              {isMarked ? "Marked" : "Mark"}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <footer className="px-8 py-5 h-24 bg-slate-900/30 backdrop-blur-xl flex items-center justify-between border-t border-slate-800 shrink-0 z-20">
          <div className="space-y-1">
             <p className="text-xs text-slate-400 font-bold tracking-wide">
               COMMAND RANGE: <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}</span> — <span className="text-white">{Math.min(currentPage * itemsPerPage, totalCount)}</span>
             </p>
             <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
               TOTAL NODES ENCRYPTED: <span className="text-indigo-400">{(totalCount / 1000).toFixed(1)}K</span>
             </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage <= 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-all border border-slate-700 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-6 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-500/10">
              PAGE {currentPage}
            </div>
            <button 
              disabled={currentPage * itemsPerPage >= totalCount || loading}
              onClick={() => handlePageChange(currentPage + 1)}
              className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-all border border-slate-700 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </footer>
      </section>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
        .glow-indigo {
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
        }
        .glow-emerald {
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
        }
      `}</style>
    </div>
  );
}
