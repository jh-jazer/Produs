import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Shield, Sparkles, TrendingUp, Brain, Crosshair,
  Heart, Coins, Zap, Dumbbell, Clock, Activity, Target, Network, BookOpen,
  Search, Filter, Info, ArrowRight, Lock, Eye
} from 'lucide-react';
import Logo from '../components/brand/Logo';
import Footer from '../components/landing/Footer';
import { ARCHETYPE_MATRIX, ARCHETYPE_PROTOCOLS } from '../constants/assessment';

const PATH_METADATA = {
  Strategist: { icon: Brain, color: "text-blue-400", glow: "shadow-blue-500/20" },
  Visionary: { icon: Sparkles, color: "text-purple-400", glow: "shadow-purple-500/20" },
  Warden: { icon: Shield, color: "text-red-400", glow: "shadow-red-500/20" },
  Scout: { icon: Zap, color: "text-emerald-400", glow: "shadow-emerald-500/20" }
};

const AXES = [
  { label: "Strength", desc: "Physical output and raw force" },
  { label: "Agility", desc: "Response speed and movement" },
  { label: "Vitality", desc: "Resource management and health" },
  { label: "Intelligence", desc: "Logical capacity and processing" },
  { label: "Wisdom", desc: "Pattern recognition and intuition" },
  { label: "Luck", desc: "Opportunistic success rate" }
];

const StatRadar = ({ stats, color }) => {
  const points = [
    { label: 'STR', val: stats.str },
    { label: 'AGI', val: stats.agi },
    { label: 'VIT', val: stats.vit },
    { label: 'INT', val: stats.int },
    { label: 'WIS', val: stats.wis },
    { label: 'LUK', val: stats.luk },
  ];

  const centerX = 50;
  const centerY = 50;
  const radius = 40;

  const getPoint = (idx, val) => {
    const angle = (idx * 60 - 90) * (Math.PI / 180);
    const r = (val / 100) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle)
    };
  };

  const path = points.map((p, i) => {
    const pt = getPoint(i, p.val);
    return `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
  }).join(' ') + ' Z';

  const gridLevels = [0.5, 1];

  return (
    <div className="relative size-full flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="size-full overflow-visible drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]">
        {/* Grid */}
        {gridLevels.map((lvl, i) => (
          <path
            key={i}
            d={points.map((_, idx) => {
              const pt = getPoint(idx, 100 * lvl);
              return `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
            }).join(' ') + ' Z'}
            className="fill-none stroke-white/5"
            strokeWidth="0.5"
          />
        ))}
        {/* Axes */}
        {points.map((_, idx) => {
          const pt = getPoint(idx, 100);
          return (
            <line
              key={idx}
              x1={centerX} y1={centerY}
              x2={pt.x} y2={pt.y}
              className="stroke-white/5"
              strokeWidth="0.5"
            />
          );
        })}
        {/* Data Path */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          d={path}
          className={`${color.replace('text-', 'fill-').replace('text-', 'stroke-')} fill-current opacity-20 stroke-current`}
          strokeWidth="1.5"
        />
        {/* Points */}
        {points.map((p, i) => {
          const pt = getPoint(i, p.val);
          return (
            <circle
              key={i}
              cx={pt.x} cy={pt.y} r="1.5"
              className={`${color.replace('text-', 'fill-')} fill-current`}
            />
          );
        })}
      </svg>
    </div>
  );
};

import WorkspaceSidebar from '../components/ui/WorkspaceSidebar';
import LandingHeader from '../components/landing/LandingHeader';
import { useNavigate } from 'react-router-dom';

export default function Classes() {
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedTier1, setSelectedTier1] = useState(null);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [filter, setFilter] = useState('');

  const landingTabs = [
    { id: "hub", label: "HUB", icon: "home", path: "/" },
    { id: "about", label: "ABOUT", icon: "info", path: "/manual" },
    { id: "classes", label: "CLASSES", icon: "school", path: "/classes" },
    { id: "patches", label: "PATCHES", icon: "history", path: "/updates" }
  ];

  const [activeLandingTab] = useState("classes");

  const handleLandingTabClick = (id) => {
    const tab = landingTabs.find(t => t.id === id);
    if (tab && tab.path) {
      navigate(tab.path);
    }
  };

  // Generate viewable items based on drill-down state
  const viewItems = useMemo(() => {
    if (!selectedPath) {
      return Object.keys(ARCHETYPE_MATRIX).map(path => ({
        id: path,
        name: path,
        type: 'PATH',
        ...PATH_METADATA[path],
        lore: ARCHETYPE_PROTOCOLS[path].flavor,
        stats: ARCHETYPE_PROTOCOLS[path].multipliers
      }));
    }

    if (!selectedTier1) {
      const pathData = ARCHETYPE_MATRIX[selectedPath];
      return pathData.archetypes.map(name => ({
        id: name,
        name: name,
        type: 'TIER1',
        parent: selectedPath,
        ...PATH_METADATA[selectedPath],
        lore: `Mastery of the ${name} discipline within the ${selectedPath} path.`,
        stats: ARCHETYPE_PROTOCOLS[selectedPath].multipliers
      }));
    }

    // Show Outcomes
    const outcomes = [];
    const tierData = ARCHETYPE_MATRIX[selectedPath][selectedTier1];
    Object.entries(tierData).forEach(([style, alignmentData]) => {
      ['good', 'evil'].forEach(align => {
        outcomes.push({
          id: `${selectedTier1}-${style}-${align}`,
          name: alignmentData[align],
          label: alignmentData.label,
          type: 'OUTCOME',
          style,
          alignment: align,
          ...PATH_METADATA[selectedPath],
          lore: `A ${style} approach to the ${selectedTier1} discipline, aligned towards ${align} outcomes.`,
          stats: ARCHETYPE_PROTOCOLS[selectedPath].multipliers
        });
      });
    });
    return outcomes;
  }, [selectedPath, selectedTier1]);

  const filteredItems = useMemo(() => {
    if (!filter) return viewItems;
    return viewItems.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase()) ||
      (item.label && item.label.toLowerCase().includes(filter.toLowerCase()))
    );
  }, [viewItems, filter]);

  return (
    <div className="dark min-h-screen bg-dark-mode-image text-white font-sans selection:bg-primary/30 overflow-x-hidden">
      <LandingHeader activeTab={activeLandingTab} />
      {/* Hero Sidebar */}
      <div className="hidden md:block fixed left-6 md:left-12 top-[50%] -translate-y-1/2 z-[100] pointer-events-auto">
          <WorkspaceSidebar 
            tabs={landingTabs}
            activeTab={activeLandingTab}
            setActiveTab={handleLandingTabClick}
            namespace="Classes"
          />
      </div>
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-32"
        >
          {/* Hero Section */}
          <section className="space-y-8 relative">
            <div className="absolute -left-[50%] top-0 size-[50vw] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.8em] text-primary/60 font-mono">System Protocol // 96_MOD</span>
              <h1 className="text-4xl md:text-6xl font-thin uppercase tracking-[0.3em] leading-tight">
                Evolution <br/><span className="text-white/30">Explorer</span>
              </h1>
            </div>
            <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-2xl font-light">
              Explore the 96 unique outcomes of the Apocalypse Archetype System. Your path is defined by Path Selection, Tier 1 Specialty, Style, and Alignment.
            </p>

            {/* Axis Reference */}
            <div className="grid grid-cols-2 gap-4 mt-20 pt-16 border-t border-white/5">
              {AXES.map((axis, i) => (
                <div key={i} className="text-left group relative p-4 hover:bg-white/5 transition-all rounded-lg border border-transparent hover:border-white/5">
                  <div className="absolute top-0 left-0 size-2 border-t border-l border-primary/40" />
                  <span className="text-[9px] font-mono text-primary/60 block mb-1">AXIS_0{i+1}</span>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/80">{axis.label}</h4>
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.1em] mt-1">{axis.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Path Navigation breadcrumbs */}
          <section className="space-y-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-white/10 pb-12">
              <div className="text-left">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-xl md:text-3xl font-thin uppercase tracking-[0.4em]">
                    {selectedPath ? selectedPath : 'Core_Paths'}
                  </h2>
                  {selectedTier1 && (
                    <>
                      <ChevronLeft size={20} className="text-white/20 rotate-180" />
                      <h2 className="text-xl md:text-3xl font-thin uppercase tracking-[0.4em]">
                        {selectedTier1}
                      </h2>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {(selectedPath || selectedTier1) && (
                    <button
                      onClick={() => {
                        if (selectedTier1) setSelectedTier1(null);
                        else setSelectedPath(null);
                      }}
                      className="text-[10px] uppercase tracking-[0.2em] text-primary hover:text-white transition-colors flex items-center gap-2"
                    >
                      <ChevronLeft size={12} /> Back
                    </button>
                  )}
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                    {selectedTier1 ? 'Final Evolution Terminal' : selectedPath ? 'Sub-Discipline Selection' : 'Root Identity Clusters'}
                  </p>
                </div>
              </div>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                <input
                  type="text"
                  placeholder="SEARCH ARCHETYPE..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-[10px] tracking-[0.2em] uppercase focus:border-primary outline-none transition-all placeholder:text-white/10"
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, idx) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    onClick={() => {
                      if (item.type === 'PATH') setSelectedPath(item.name);
                      else if (item.type === 'TIER1') setSelectedTier1(item.name);
                      else setSelectedOutcome(item);
                    }}
                    className="group relative h-96 cursor-pointer"
                  >
                    <div className={`absolute inset-0 bg-[#050505] border border-white/5 rounded-xl transition-all group-hover:border-primary/40 group-hover:bg-[#080808] overflow-hidden ${item.glow}`}>
                      {/* Stat Radar Background */}
                      <div className="absolute inset-x-8 top-12 aspect-square opacity-[0.03] group-hover:opacity-[0.15] transition-opacity grayscale group-hover:grayscale-0">
                        <StatRadar stats={item.stats} color={item.color} />
                      </div>

                      <div className="p-8 flex flex-col h-full relative z-10">
                        <div className="flex items-start justify-between mb-auto">
                          <div>
                            <span className="text-[9px] font-mono text-primary/60 block mb-1">
                              {item.type} // {item.style ? item.style : ''}
                            </span>
                            <h3 className="text-xl font-thin uppercase tracking-[0.2em] group-hover:text-primary transition-colors leading-tight">
                              {item.name}
                            </h3>
                            {item.label && (
                              <span className="text-[8px] font-mono tracking-widest text-white/40 uppercase mt-1 block">
                                {item.label}
                              </span>
                            )}
                          </div>
                          <item.icon className={`size-5 text-white/20 group-hover:${item.color} transition-colors`} />
                        </div>

                        <div className="space-y-6">
                          <div>
                            <span className="text-[8px] uppercase tracking-[0.3em] text-white/40 block mb-2">Protocol Insight</span>
                            <p className="text-[10px] uppercase tracking-[0.1em] font-light text-white/60 line-clamp-3 leading-relaxed">
                              {item.lore}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="flex items-center gap-2 group/btn">
                              <span className="text-[9px] uppercase tracking-[0.3em] text-primary group-hover:translate-x-1 transition-transform">
                                {item.type === 'OUTCOME' ? 'Terminal Intel' : 'Drill Deep'}
                              </span>
                              <ArrowRight size={12} className="text-primary" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AR Corners */}
                      <div className="absolute top-0 left-0 size-4 border-t border-l border-white/5 group-hover:border-primary/40 transition-colors" />
                      <div className="absolute bottom-0 right-0 size-4 border-b border-r border-white/5 group-hover:border-primary/40 transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Level Progression Table */}
          <section className="space-y-12 border-t border-white/5 pt-24">
            <div className="flex flex-col md:flex-row items-end justify-between gap-6">
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[0.6em] text-primary/60 font-mono">Evolution Logic</span>
                <h2 className="text-2xl md:text-5xl font-thin uppercase tracking-[0.3em]">The <span className="text-white/20">Progression</span></h2>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 max-w-sm text-right leading-relaxed font-outfit">
                Archetype Tiers are unlocked automatically as the aggregate system power increases. T5 represents the limits of human consistency.
              </p>
            </div>

            <div className="p-8 md:p-12 border border-white/5 bg-[#020202] rounded-2xl overflow-x-auto relative group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.3em] text-white/30 border-b border-white/5">
                    <th className="pb-8 font-normal">Level Range</th>
                    <th className="pb-8 font-normal">Evolution State</th>
                    <th className="pb-8 font-normal uppercase">Default Title</th>
                    <th className="pb-8 font-normal text-right">System XP Requirement</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] font-mono text-white/60">
                  <tr className="border-b border-white/5 group/row hover:bg-white/[0.02] transition-colors">
                    <td className="py-8 text-white/80 font-bold">L_01 — L_08</td>
                    <td className="py-8">PATH_AWAKENING</td>
                    <td className="py-8">CORE_ROOT_IDENTITY</td>
                    <td className="py-8 text-right font-bold text-white/40">100 — 6,500</td>
                  </tr>
                  <tr className="border-b border-white/5 group/row hover:bg-white/[0.02] transition-colors">
                    <td className="py-8 text-primary font-bold">L_11 — L_19</td>
                    <td className="py-8 text-primary/80 tracking-widest">STYLE_IMPRINTING [T1]</td>
                    <td className="py-8 text-primary/60">DISCIPLINE_SPECIALIZATION</td>
                    <td className="py-8 text-right font-bold text-primary">23,500+</td>
                  </tr>
                  <tr className="border-b border-white/5 group/row hover:bg-white/[0.02] transition-colors">
                    <td className="py-8 text-white/80 font-bold">L_24 — L_33</td>
                    <td className="py-8 tracking-widest">ALIGNMENT_UNIFICATION [T2]</td>
                    <td className="py-8 text-white/20">MORAL_AXIS_RESOLUTION</td>
                    <td className="py-8 text-right text-white/40">113,500+</td>
                  </tr>
                  <tr className="border-b border-white/5 group/row hover:bg-white/[0.02] transition-colors">
                    <td className="py-8 text-white/80 font-bold">L_36+</td>
                    <td className="py-8 tracking-widest">SPECIALIST_TRIALS [T3]</td>
                    <td className="py-8 text-white/20">RANK_SSS_ASCENSION</td>
                    <td className="py-8 text-right text-white/40">1,111,500+</td>
                  </tr>
                  <tr className="group/row hover:bg-white/[0.02] transition-colors">
                    <td className="py-8 text-white font-black text-xs">L_56+</td>
                    <td className="py-8 text-white font-black tracking-[0.5em]">TERRITORY_LORDSHIP [TITLES]</td>
                    <td className="py-8 text-white font-black">THE_UNCONQUERED</td>
                    <td className="py-8 text-right text-white font-black border-l border-white/5 animate-pulse">TERMINAL_ASCENSION</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </motion.div>
      </main>

      <Footer />

      {/* Detail Overlay / Modal */}
      <AnimatePresence>
        {selectedOutcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12 overflow-y-auto"
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectedOutcome(null)} />
            
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="w-full max-w-6xl max-h-[90vh] bg-[#080808] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-10 flex flex-col"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 h-full overflow-hidden">
                {/* Left: Stats & Radar */}
                <div className="p-8 md:p-12 bg-black/40 border-r border-white/5 relative overflow-y-auto custom-scrollbar">
                  <div className="absolute -top-12 -left-12 size-64 bg-primary/5 blur-[100px] rounded-full" />
                  
                  <div className="relative z-10 space-y-12">
                     <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-xl bg-white/5 border border-white/10 ${selectedOutcome.color}`}>
                          <selectedOutcome.icon className="size-8" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-primary/60 tracking-widest block mb-1">
                            {selectedOutcome.type} PROTOCOL: {selectedOutcome.style || 'CORE'}
                          </span>
                          <h2 className="text-4xl font-thin uppercase tracking-[0.4em]">{selectedOutcome.name}</h2>
                          {selectedOutcome.label && (
                            <span className="text-sm font-mono text-white/40 tracking-[0.2em]">{selectedOutcome.label}</span>
                          )}
                        </div>
                     </div>

                     <div className="aspect-square w-full max-w-sm mx-auto">
                        <StatRadar stats={selectedOutcome.stats} color={selectedOutcome.color} />
                     </div>

                     <div className="grid grid-cols-3 gap-6">
                        {Object.entries(selectedOutcome.stats).map(([label, val]) => (
                          <div key={label} className="space-y-2 border-l border-white/10 pl-4">
                            <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono">{label}</span>
                            <div className="flex items-end gap-1">
                              <span className="text-xl font-thin">{val}x</span>
                            </div>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>

                {/* Right: Info, Perks, Evolution */}
                <div className="p-8 md:p-12 space-y-12 overflow-y-auto custom-scrollbar">
                  <section className="space-y-4">
                    <span className="text-[10px] uppercase tracking-[0.5em] text-primary/60 font-mono">_TACTICAL_LORE</span>
                    <p className="text-lg md:text-xl font-light text-white/90 leading-relaxed font-outfit">
                      {selectedOutcome.lore}
                    </p>
                  </section>

                  <section className="space-y-6">
                    <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-mono flex items-center gap-3">
                      Identity Protocol Perk <div className="h-[1px] flex-grow bg-white/5" />
                    </span>
                    <div className="grid gap-4">
                      <div className="p-5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/[0.08] transition-all">
                        <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold text-primary mb-1">
                          {selectedPath ? ARCHETYPE_PROTOCOLS[selectedPath].perk : 'Pending Awakening'}
                        </h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.1em]">
                          {selectedPath ? ARCHETYPE_PROTOCOLS[selectedPath].flavor : 'Unlock your path to see available system perks.'}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-mono flex items-center gap-3">
                      Evolutionary Milestone <div className="h-[1px] flex-grow bg-white/5" />
                    </span>
                    <div className="grid gap-3">
                      <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em]">
                        <span className="font-mono text-white/20">Lv 00</span>
                        <span className="text-white/40">Baseline Unawakened</span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em]">
                        <span className="font-mono text-white/20">Lv 01</span>
                        <span className="text-white/40">Path Awakening: {selectedPath || '???'}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em]">
                        <span className="font-mono text-primary">Lv 11</span>
                        <span className="text-white">Style Imprint: {selectedOutcome.style || '???'}</span>
                        <div className="size-1 rounded-full bg-primary animate-ping" />
                      </div>
                      <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em]">
                        <span className="font-mono text-white/20">Lv 24</span>
                        <span className="text-white/40">Alignment Realization</span>
                      </div>
                    </div>
                  </section>

                  <button
                    onClick={() => setSelectedOutcome(null)}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] uppercase tracking-[0.4em] text-white/60 hover:text-white transition-all mt-12"
                  >
                    Close Protocol
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
