import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Shield, Sparkles, TrendingUp, Brain, Crosshair,
  Heart, Coins, Zap, Dumbbell, Clock, Activity, Target, Network, BookOpen,
  Search, Filter, Info, ArrowRight, Lock, Eye
} from 'lucide-react';
import Footer from '../components/landing/Footer';

const ARCHETYPES = [
  {
    id: 1, name: "Iron Fist", code: "SDES", role: "Path Clearer",
    stats: { str: 92, dex: 80, end: 95, int: 40, wis: 45, cha: 40 },
    lore: "Relentless, methodical, and impossible to stop. The Iron Fist is the purest expression of disciplined physical force.",
    habits: "Heavy training, rigid sleep schedules, nutrition consistency.",
    perks: [
      { name: "Ironclad", desc: "STR XP x1.5 permanently" },
      { name: "Unbroken", desc: "END XP x1.4 permanently" },
      { name: "The Wall", desc: "Streak protection once per month" }
    ],
    tiers: ["Brawler", "Iron Fist", "The Relentless", "Unstoppable Force", "The Wall That Walks"],
    icon: Dumbbell, color: "text-red-500"
  },
  {
    id: 2, name: "Blade Dancer", code: "SDEA", role: "Scout Assassin",
    stats: { str: 88, dex: 95, end: 72, int: 45, wis: 48, cha: 42 },
    lore: "Moves faster than thought. Flowing physical dominance. Precise, fluid, and gone before noticed.",
    habits: "Cardio, speed training, morning routines, athletic flexibility.",
    perks: [
      { name: "Flow State", desc: "DEX XP x1.5 permanently" },
      { name: "Momentum", desc: "STR + DEX same-day stack x1.2" },
      { name: "Reflex", desc: "7-day DEX streak gives bonus STR XP" }
    ],
    tiers: ["Street Brawler", "Blade Dancer", "Phantom Edge", "Death's Silhouette", "The Undying Blade"],
    icon: Zap, color: "text-blue-400"
  },
  {
    id: 3, name: "Warlord", code: "SDCS", role: "Raid Leader",
    stats: { str: 90, dex: 78, end: 65, int: 50, wis: 55, cha: 82 },
    lore: "Inspires through action. First through the door, leading the charge and bringing everyone home.",
    habits: "Team workouts, group challenges, physical goal accountability.",
    perks: [
      { name: "War Cry", desc: "Linked habits give x1.4 CHA XP" },
      { name: "By Force", desc: "STR XP x1.4 permanently" },
      { name: "Conquest", desc: "Physical records give bonus CHA XP" }
    ],
    tiers: ["Pack Leader", "Warlord", "Iron Banner", "The Conqueror", "King of the Battlefield"],
    icon: Crosshair, color: "text-orange-500"
  },
  {
    id: 4, name: "Vanguard", code: "SDCA", role: "Frontline Diplomat",
    stats: { str: 85, dex: 90, end: 55, int: 52, wis: 58, cha: 88 },
    lore: "Fast, strong, magnetic. Creates momentum and pulls everyone else into it.",
    habits: "Social fitness, partner challenges, high-energy group habits.",
    perks: [
      { name: "First Blood", desc: "First daily habit x1.5 XP" },
      { name: "Trailblazer", desc: "New habits give bonus DEX XP" },
      { name: "Pull", desc: "CHA XP x1.4 permanently" }
    ],
    tiers: ["The Eager", "Vanguard", "Spearhead", "The Unstoppable", "First of the New World"],
    icon: TrendingUp, color: "text-cyan-400"
  },
  {
    id: 5, name: "Sentinel", code: "SIES", role: "Last Line of Defense",
    stats: { str: 85, dex: 50, end: 95, int: 72, wis: 60, cha: 48 },
    lore: "Studied every threat, prepared for every scenario. Cannot be broken.",
    habits: "Sleep discipline, system reading, long habit chains.",
    perks: [
      { name: "Fortified", desc: "END XP x1.6 permanently (MAX)" },
      { name: "Iron Memory", desc: "Double streak protection per month" },
      { name: "Garrison", desc: "STR XP x1.35 permanently" }
    ],
    tiers: ["The Stubborn", "Sentinel", "Iron Bulwark", "The Immovable", "Eternal Fortress"],
    icon: Shield, color: "text-slate-400"
  },
  {
    id: 6, name: "Forge Master", code: "SIEA", role: "Builder Engineer",
    stats: { str: 82, dex: 70, end: 80, int: 78, wis: 58, cha: 45 },
    lore: "Combines physical capability with technical precision. Builds things that last.",
    habits: "Skill building, deep work, technical mastery routines.",
    perks: [
      { name: "Masterwork", desc: "STR + INT same-day stack x1.3" },
      { name: "Blueprint", desc: "Weekly review boosts all stats for 3 days" },
      { name: "The Grind", desc: "END XP x1.35 permanently" }
    ],
    tiers: ["The Maker", "Forge Master", "Ironwright", "The Architect of Steel", "Builder of Civilizations"],
    icon: Sparkles, color: "text-emerald-500"
  },
  {
    id: 7, name: "Commander", code: "SICS", role: "Faction Leader",
    stats: { str: 80, dex: 55, end: 75, int: 72, wis: 65, cha: 92 },
    lore: "Earns authority through balanced capability. Physiologically and intellectually imposing.",
    habits: "Linked habits, reading strategy, budget discipline.",
    perks: [
      { name: "Supreme Command", desc: "CHA XP x1.5 permanently" },
      { name: "No Weak Flank", desc: "Auto-boosts trailing stats" },
      { name: "Iron Will", desc: "STR XP x1.35 permanently" }
    ],
    tiers: ["Squad Leader", "Commander", "Warlord", "Iron Sovereign", "The Undefeated King"],
    icon: Network, color: "text-blue-600"
  },
  {
    id: 8, name: "Champion", code: "SICA", role: "Crisis Leader",
    stats: { str: 82, dex: 78, end: 55, int: 75, wis: 60, cha: 90 },
    lore: "Rises under pressure. QUICK, decisive thinker. Doesn't maintain systems, creates moments.",
    habits: "Partner sprints, social streaks, competitive learning.",
    perks: [
      { name: "Clutch", desc: "Habits after 9pm x1.4 XP" },
      { name: "Rising Star", desc: "CHA XP x1.45 permanently" },
      { name: "Burst", desc: "Mass daily completion bonus" }
    ],
    tiers: ["Contender", "Champion", "The Proven", "Legend in the Making", "The Undisputed"],
    icon: Target, color: "text-white"
  },
  {
    id: 9, name: "Shadow Monk", code: "WDES", role: "Ghost Operative",
    stats: { str: 55, dex: 82, end: 80, int: 72, wis: 95, cha: 18 },
    lore: "Conquered the self. Power is entirely internal, requiring no audience or validation.",
    habits: "Meditation, weekly self-reviews, solo consistency.",
    perks: [
      { name: "Inner Sanctum", desc: "WIS XP x1.6 permanently" },
      { name: "Silence", desc: "+5 END XP every day link is not used" },
      { name: "Unwitnessed", desc: "Long solo streaks give x1.5 END XP" }
    ],
    tiers: ["Introvert", "Shadow Monk", "The Unseen", "Void Walker", "He Who Needs No Witness"],
    icon: Eye, color: "text-purple-500"
  },
  {
    id: 10, name: "Ghost", code: "WDEA", role: "Infiltrator",
    stats: { str: 50, dex: 90, end: 70, int: 75, wis: 88, cha: 22 },
    lore: "Fluid and untraceable. Moves leaving no footprint. Wisdom guides their movement.",
    habits: "Flexible routines, journaling, solo habit streaks.",
    perks: [
      { name: "Phase", desc: "DEX XP x1.5 permanently" },
      { name: "No Footprint", desc: "Habit-type switching gives bonus DEX XP" },
      { name: "Vanish", desc: "Weekly task skip protection" }
    ],
    tiers: ["The Quiet One", "Ghost", "No Trace", "The Vanishing", "Never There"],
    icon: Sparkles, color: "text-indigo-400"
  },
  {
    id: 11, name: "Diplomat", code: "WDCS", role: "Alliance Builder",
    stats: { str: 38, dex: 80, end: 72, int: 68, wis: 90, cha: 85 },
    lore: "Reads every room. Patient, perceptive, and precise. Actions have surgical accuracy.",
    habits: "Gratitude practice, partner accountability, finance tracking.",
    perks: [
      { name: "Read the Room", desc: "WIS XP x1.5 permanently" },
      { name: "Timing", desc: "Consistent timing gives x1.2 XP" },
      { name: "Alliance", desc: "CHA XP x1.4 permanently" }
    ],
    tiers: ["The Listener", "Diplomat", "Silver Tongue", "The Peacemaker", "The One Who Stopped the War"],
    icon: Network, color: "text-emerald-400"
  },
  {
    id: 12, name: "Bard", code: "WDCA", role: "Voice of the Movement",
    stats: { str: 35, dex: 85, end: 48, int: 72, wis: 82, cha: 95 },
    lore: "Words are spells. Understands that narrative is the most powerful force in human systems.",
    habits: "Journaling, social streaks, creative writing.",
    perks: [
      { name: "Spellbind", desc: "CHA XP x1.55 permanently" },
      { name: "The Story", desc: "Journaling gives x1.4 INT XP" },
      { name: "Ripple", desc: "Grows through linked partner progress" }
    ],
    tiers: ["Storyteller", "Bard", "Silver Tongue", "Voice of Legends", "The Word That Moves Worlds"],
    icon: Sparkles, color: "text-pink-400"
  },
  {
    id: 13, name: "Oracle", code: "WIES", role: "Group Compass",
    stats: { str: 22, dex: 38, end: 82, int: 80, wis: 98, cha: 60 },
    lore: "Sees enough patterns to know outcomes before they begin. Rare and irreplaceable.",
    habits: "Mindfulness streaks, long-form reflection, deep tracking.",
    perks: [
      { name: "The Sight", desc: "WIS XP x1.65 permanently (GAME MAX)" },
      { name: "Inevitable", desc: "x2.2 END streak multiplier at 100 days" },
      { name: "Foreseen", desc: "Weekly review gives double WIS XP" }
    ],
    tiers: ["Dreamer", "Oracle", "The Farsighted", "Keeper of Inevitable Truths", "The One Who Already Knew"],
    icon: Brain, color: "text-indigo-500"
  },
  {
    id: 14, name: "Druid", code: "WIEA", role: "Tracker Naturalist",
    stats: { str: 65, dex: 72, end: 85, int: 75, wis: 90, cha: 52 },
    lore: "Sees nature and behavior as living systems. Everything in the environment is signal.",
    habits: "Sleep/Nutrition tracking, finance pattern tracking, streaks.",
    perks: [
      { name: "Root System", desc: "END XP x1.5 permanently" },
      { name: "Seasonal", desc: "Perfect monthly completion gives +100 END XP" },
      { name: "Symbiosis", desc: "Bridges body (STR) and mind (WIS) XP" }
    ],
    tiers: ["Wanderer", "Druid", "Pattern Seer", "Voice of the Wild", "The Living Codex"],
    icon: Heart, color: "text-green-600"
  },
  {
    id: 15, name: "Alchemist", code: "WICS", role: "Medic Strategist",
    stats: { str: 30, dex: 55, end: 75, int: 92, wis: 88, cha: 70 },
    lore: "Synthesizes chaos into clarity. Every problem is an unsolved equation.",
    habits: "Deep reading, course completions, finance systems.",
    perks: [
      { name: "Transmutation", desc: "INT XP x1.55 permanently" },
      { name: "Refinement", desc: "Courses permanently increase INT multiplier" },
      { name: "Synthesis", desc: "Journaling + Finance combo bonus INT XP" }
    ],
    tiers: ["Tinkerer", "Alchemist", "Formula Breaker", "Grand Synthesist", "Architect of Truth"],
    icon: Sparkles, color: "text-yellow-500"
  },
  {
    id: 16, name: "Architect", code: "WICA", role: "System Designer",
    stats: { str: 32, dex: 88, end: 50, int: 92, wis: 82, cha: 75 },
    lore: "Builds environments where problems cannot exist. Long-term planner.",
    habits: "Daily planner mastery, goal design, adaptive routines.",
    perks: [
      { name: "Blueprint Mind", desc: "INT XP x1.55 permanently" },
      { name: "The System", desc: "DEX XP x1.45 permanently" },
      { name: "Compound", desc: "Stacking planner multiplier up to 1.8x" }
    ],
    tiers: ["Draftsman", "Architect", "System Lord", "World Builder", "The Eternal Planner"],
    icon: TrendingUp, color: "text-emerald-500"
  }
];

const AXES = [
  { label: "Force vs Wisdom", desc: "STR vs WIS Dominance" },
  { label: "Speed vs Knowledge", desc: "DEX vs INT Dominance" },
  { label: "Endurance vs Charisma", desc: "END vs CHA Dominance" },
  { label: "Stable vs Adaptive", desc: "END vs DEX Balance" }
];

const StatRadar = ({ stats, color }) => {
  const points = [
    { label: 'STR', val: stats.str },
    { label: 'DEX', val: stats.dex },
    { label: 'END', val: stats.end },
    { label: 'INT', val: stats.int },
    { label: 'WIS', val: stats.wis },
    { label: 'CHA', val: stats.cha },
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

export default function Classes() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [filter, setFilter] = useState('');

  const filteredArchetypes = useMemo(() => {
    if (!filter) return ARCHETYPES;
    return ARCHETYPES.filter(a =>
      a.name.toLowerCase().includes(filter.toLowerCase()) ||
      a.role.toLowerCase().includes(filter.toLowerCase()) ||
      a.code.toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter]);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-primary/30 overflow-x-hidden">
      {/* HUD Scanner Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 md:px-12 py-8 flex items-center bg-black/50 backdrop-blur-xl border-b border-white/5">
        <Link to="/" className="group flex items-center gap-4">
          <div className="size-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary transition-all backdrop-blur-md">
            <ChevronLeft size={16} className="text-white/60 group-hover:text-primary group-hover:-translate-x-1 transition-all" />
          </div>
          <span className="hidden md:inline-block text-[10px] uppercase tracking-[0.6em] text-white/40 group-hover:text-white transition-colors">Return</span>
        </Link>
        <div className="mx-auto absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
          <div className="size-4 bg-primary rotate-45" />
          <h1 className="text-[11px] md:text-sm uppercase tracking-[0.8em] text-white font-outfit">The Archetypes</h1>
        </div>
        
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-48 pb-32 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-32"
        >
          {/* Hero Section */}
          <section className="text-center space-y-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[60vw] bg-primary/10 blur-[200px] rounded-full pointer-events-none" />
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.8em] text-primary/60 font-mono">System Protocol // 0x16</span>
              <h1 className="text-4xl md:text-8xl font-thin uppercase tracking-[0.3em] leading-[1.1]">
                Class <br/><span className="text-white/20">Repository</span>
              </h1>
            </div>
            <p className="text-white/40 text-sm md:text-lg leading-relaxed font-light mx-auto max-w-3xl font-outfit">
              A deterministic 4-axis mapping system that assigns your evolutionary path based on consistent behavior. Build your life. Earn your class.
            </p>

            {/* Axis Reference */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-20 pt-16 border-t border-white/5">
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

          {/* Search & Grid */}
          <section className="space-y-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-white/10 pb-12">
              <div className="text-left">
                <h2 className="text-xl md:text-3xl font-thin uppercase tracking-[0.4em]">Grid_Explorer</h2>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mt-2">Database view of all authenticated archetypes</p>
              </div>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                <input
                  type="text"
                  placeholder="SEARCH CLASS (NAME / CODE / ROLE)..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-[10px] tracking-[0.2em] uppercase focus:border-primary outline-none transition-all placeholder:text-white/10"
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredArchetypes.map((arch, idx) => (
                  <motion.div
                    layout
                    key={arch.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    onClick={() => setSelectedClass(arch)}
                    className="group relative h-96 cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-[#050505] border border-white/5 rounded-xl transition-all group-hover:border-primary/40 group-hover:bg-[#080808] overflow-hidden">
                      {/* Stat Radar Background */}
                      <div className="absolute inset-x-8 top-12 aspect-square opacity-[0.03] group-hover:opacity-[0.15] transition-opacity grayscale group-hover:grayscale-0">
                        <StatRadar stats={arch.stats} color={arch.color} />
                      </div>

                      <div className="p-8 flex flex-col h-full relative z-10">
                        <div className="flex items-start justify-between mb-auto">
                          <div>
                            <span className="text-[9px] font-mono text-primary/60 block mb-1">ID // 0{arch.id}</span>
                            <h3 className="text-xl font-thin uppercase tracking-[0.2em] group-hover:text-primary transition-colors">{arch.name}</h3>
                            <span className="text-[8px] font-mono tracking-widest text-white/20 uppercase mt-1 block">{arch.code}</span>
                          </div>
                          <arch.icon className={`size-5 text-white/20 group-hover:${arch.color} transition-colors`} />
                        </div>

                        <div className="space-y-6">
                          <div>
                            <span className="text-[8px] uppercase tracking-[0.3em] text-white/40 block mb-2">Primary Role</span>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/80">{arch.role}</p>
                          </div>
                          
                          <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="flex items-center gap-2 group/btn">
                              <span className="text-[9px] uppercase tracking-[0.3em] text-primary group-hover:translate-x-1 transition-transform">Access Intel</span>
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
                    <td className="py-8 text-white/80 font-bold">L_01 — L_04</td>
                    <td className="py-8">UNAWAKENED_STATE</td>
                    <td className="py-8">SHUT-IN // EMERGENCE</td>
                    <td className="py-8 text-right font-bold text-white/40">0 — 4,350</td>
                  </tr>
                  <tr className="border-b border-white/5 group/row hover:bg-white/[0.02] transition-colors">
                    <td className="py-8 text-primary font-bold">L_05 — L_09</td>
                    <td className="py-8 text-primary/80 tracking-widest">ARCHETYPE_AWAKENING [T1]</td>
                    <td className="py-8 text-primary/60">SQUAD_LEVEL_INITIATE</td>
                    <td className="py-8 text-right font-bold text-primary">5,000+</td>
                  </tr>
                  <tr className="border-b border-white/5 group/row hover:bg-white/[0.02] transition-colors">
                    <td className="py-8 text-white/80 font-bold">L_10 — L_14</td>
                    <td className="py-8 tracking-widest">ADVANCED_PRACTITIONER [T2-T3]</td>
                    <td className="py-8 text-white/20">ENFORCER // STRATEGIST</td>
                    <td className="py-8 text-right text-white/40">45,000+</td>
                  </tr>
                  <tr className="border-b border-white/5 group/row hover:bg-white/[0.02] transition-colors">
                    <td className="py-8 text-white/80 font-bold">L_15 — L_19</td>
                    <td className="py-8 tracking-widest">MASTER_ASSET [T4]</td>
                    <td className="py-8 text-white/20">SOVEREIGN // ORACLE</td>
                    <td className="py-8 text-right text-white/40">200,000+</td>
                  </tr>
                  <tr className="group/row hover:bg-white/[0.02] transition-colors">
                    <td className="py-8 text-white font-black text-xs">L_20+</td>
                    <td className="py-8 text-white font-black tracking-[0.5em]">MYTHIC_EQUILIBRIUM [T5]</td>
                    <td className="py-8 text-white font-black">THE_ASCENDED</td>
                    <td className="py-8 text-right text-white font-black border-l border-white/5 animate-pulse">TERMINAL_EVOLUTION</td>
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
        {selectedClass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12 overflow-y-auto"
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectedClass(null)} />
            
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="w-full max-w-6xl bg-[#080808] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left: Stats & Radar */}
                <div className="p-8 md:p-12 bg-black/40 border-r border-white/5 relative overflow-hidden">
                  <div className="absolute -top-12 -left-12 size-64 bg-primary/5 blur-[100px] rounded-full" />
                  
                  <div className="relative z-10 space-y-12">
                     <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-xl bg-white/5 border border-white/10 ${selectedClass.color}`}>
                          <selectedClass.icon className="size-8" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-primary/60 tracking-widest block mb-1">PROTO_CODE: {selectedClass.code}</span>
                          <h2 className="text-4xl font-thin uppercase tracking-[0.4em]">{selectedClass.name}</h2>
                        </div>
                     </div>

                     <div className="aspect-square w-full max-w-sm mx-auto">
                        <StatRadar stats={selectedClass.stats} color={selectedClass.color} />
                     </div>

                     <div className="grid grid-cols-3 gap-6">
                        {Object.entries(selectedClass.stats).map(([label, val]) => (
                          <div key={label} className="space-y-2 border-l border-white/10 pl-4">
                            <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono">{label}</span>
                            <div className="flex items-end gap-1">
                              <span className="text-xl font-thin">{val}</span>
                              <span className="text-[8px] text-white/20 mb-1">/ 100</span>
                            </div>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>

                {/* Right: Info, Perks, Evolution */}
                <div className="p-8 md:p-12 space-y-12 max-h-[85vh] overflow-y-auto custom-scrollbar">
                  <section className="space-y-4">
                    <span className="text-[10px] uppercase tracking-[0.5em] text-primary/60 font-mono">_CLASSIFIED_LORE</span>
                    <p className="text-lg md:text-xl font-light text-white/90 leading-relaxed font-outfit">
                      {selectedClass.lore}
                    </p>
                  </section>

                  <section className="space-y-6">
                    <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-mono flex items-center gap-3">
                      Unique Intelligence Perks <div className="h-[1px] flex-grow bg-white/5" />
                    </span>
                    <div className="grid gap-4">
                      {selectedClass.perks.map((perk, i) => (
                        <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/[0.08] transition-all">
                          <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold text-primary mb-1">{perk.name}</h4>
                          <p className="text-[10px] text-white/40 uppercase tracking-[0.1em]">{perk.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-6">
                    <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-mono flex items-center gap-3">
                      Evolutionary Timeline <div className="h-[1px] flex-grow bg-white/5" />
                    </span>
                    <div className="grid gap-3">
                      {selectedClass.tiers.map((tier, i) => (
                        <div key={i} className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em]">
                          <span className={`font-mono ${i === 1 ? 'text-primary' : 'text-white/20'}`}>T{i+1}</span>
                          <span className={`${i === 1 ? 'text-white' : 'text-white/40'}`}>{tier}</span>
                          {i === 1 && <div className="size-1 rounded-full bg-primary animate-ping" />}
                        </div>
                      ))}
                    </div>
                  </section>

                  <button
                    onClick={() => setSelectedClass(null)}
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
