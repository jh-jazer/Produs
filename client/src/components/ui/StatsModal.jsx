import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useHabits } from '../../hooks/useHabits';
import ConsistencyGrid from '../intellectual/habits/ConsistencyGrid';
import YearlyMoodBoard from '../journal_components/YearlyMoodBoard';
import { useJournal } from '../../hooks/useJournal';

const ARCHETYPES = [
  { name: 'Blade Dancer', icon: '⚔️', stats: ['dex'], tiers: ['Street Brawler', 'Blade Dancer', 'Phantom Edge', 'Death\'s Silhouette', 'The Undying Blade'] },
  { name: 'Alchemist', icon: '🧪', stats: ['int', 'per'], dominant: 'int', tiers: ['Tinkerer', 'Alchemist', 'Formula Breaker', 'Grand Synthesist', 'The Architect of Truth'] },
  { name: 'Architect', icon: '🏗️', stats: ['per', 'int'], dominant: 'per', tiers: ['Draftsman', 'Architect', 'System Lord', 'World Builder', 'The Eternal Planner'] },
  { name: 'Bard', icon: '📖', stats: ['cha', 'wis'], dominant: 'cha', tiers: ['Storyteller', 'Bard', 'Silver Tongue', 'Voice of Legends', 'The Word That Moves Worlds'] },
  { name: 'Enchanter', icon: '🎵', stats: ['cha', 'wis'], dominant: 'wis', tiers: ['Charmer', 'Enchanter', 'Soul Weaver', 'The Resonant', 'Frequency of the Divine'] },
  { name: 'Druid', icon: '🌿', stats: ['wis', 'per'], tiers: ['Wanderer', 'Druid', 'Pattern Seer', 'Voice of the Wild', 'The Living Codex'] },
  { name: 'Commander', icon: '🛡️', stats: ['cha', 'str'], tiers: ['Squad Leader', 'Commander', 'Warlord', 'Iron Sovereign', 'The Undefeated King'] },
  { name: 'Shadow Monk', icon: '🪞', stats: ['wis', 'int'], requirements: { cha: { max: 30 } }, tiers: ['Introvert', 'Shadow Monk', 'The Unseen', 'Void Walker', 'He Who Needs No Witness'] },
  { name: 'Oracle', icon: '🔮', stats: ['wis', 'per'], requirements: { str: { max: 30 } }, tiers: ['Dreamer', 'Oracle', 'The Farsighted', 'Keeper of Inevitable Truths', 'The One Who Already Knew'] }
];

const getArchetypeDisplay = (user) => {
  if (!user?.rpg?.archetype) return { name: 'Potential', tierName: '...', icon: '✨', isUnawakened: true };
  
  const { name, tier, stage } = user.rpg.archetype;
  
  // Show archetype if onboarding is complete, regardless of level
  if ((user?.guardianLevel || 0) < 5 && !user.onboardingCompleted) {
    return {
      name: 'Potential',
      icon: '✨',
      tierName: stage || 'Shut-in',
      tier: user.guardianLevel,
      isUnawakened: true
    };
  }

  return {
    name: name || 'Seeker',
    icon: '⚔️',
    tierName: stage,
    tier: tier || 1,
    isUnawakened: false
  };
};

export default function StatsModal({ isOpen, onClose, user }) {
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const stats = user?.rpg?.stats || {};
  const display = getArchetypeDisplay(user);

  const { habits, isLoading: habitsLoading } = useHabits();
  const { entries = [], isLoading: journalLoading } = useJournal();

  // Compute checks dictionary for ConsistencyGrid
  const checks = React.useMemo(() => {
    const dict = {};
    if (!habits) return dict;
    habits.forEach(habit => {
      dict[habit._id] = { completed: {}, user: habit.userId };
      if (habit.checks && Array.isArray(habit.checks)) {
        habit.checks.forEach(check => {
          dict[habit._id].completed[check.date] = check.completed;
        });
      }
    });
    return dict;
  }, [habits]);

  if (!isOpen) return null;

  const currentLevelProgress = (user?.guardianExp || 0) - (user?.totalRequired || 0);
  const nextLevelThreshold = user?.nextLevelExp || 100;
  const progress = Math.min(100, Math.max(0, (currentLevelProgress / nextLevelThreshold) * 100));

  const dailyXP = user?.rpg?.dailyXP?.total || 0;
  const dXPProgress = (dailyXP / 315) * 100;

  return createPortal(
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 dark:bg-[#050505]/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[480px] max-h-[90vh] bg-white dark:bg-[#0a0a0a] rounded-[32px] shadow-2xl overflow-hidden border border-black/[0.08] dark:border-white/10 ar-corners flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-lg font-black text-black/40 dark:text-white/40 border border-black/[0.05] dark:border-white/10">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-black text-black dark:text-white tracking-tight leading-none">
                {user?.username || 'User'}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mt-2 leading-none">
                LEVEL {Math.max(1, user?.guardianLevel || 1)} • {display.isUnawakened ? display.tierName : `${display.name} — ${display.tierName}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="size-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors -mt-6">
            <span className="material-symbols-outlined text-black/40 dark:text-white/40">close</span>
          </button>
        </div>

        {/* Level & Progress */}
        <div className="px-1 -mt-4">
          <div className="flex items-end justify-between mb-2">
             <div className="flex flex-col">
               <span className="text-lg font-bold">LVL {Math.max(1, user?.guardianLevel || 1)} <span className="text-xs font-medium text-black/30 dark:text-white/30 ml-2">{currentLevelProgress} / {nextLevelThreshold} EXP</span></span>
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest text-black/20 dark:text-white/20">
               Next: LVL {Math.max(1, user?.guardianLevel || 1) + 1}
             </span>
          </div>
          <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-electric-blue rounded-full relative"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* Daily XP Cap Progress */}
        <div className="px-1 mt-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-black/40 dark:text-white/40">Daily EXP Prowess</span>
            <span className="text-[9px] font-bold text-black/30 dark:text-white/30">{dailyXP} / 315</span>
          </div>
          <div className="h-1 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${dXPProgress}%` }}
               className="h-full bg-black/20 dark:bg-white/20"
             />
          </div>
        </div>

        {/* Level 5 Unlock Callout */}
        {(user?.guardianLevel || 0) === 5 && !display.isUnawakened && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-electric-blue/10 border border-electric-blue/20 rounded-2xl"
            >
                <p className="text-[10px] font-medium text-electric-blue leading-relaxed">
                    "Your path has revealed itself. You are no longer a Seeker. You are a <span className="font-black uppercase tracking-widest">{display.name}</span> — and this is only the beginning."
                </p>
            </motion.div>
        )}

        {/* Circular Radar Stats */}
        <div className="flex justify-center pb-1 relative transition-all duration-1000 overflow-hidden">
                     <RadarChart stats={stats} isLoading={isLoadingStats} isUnawakened={display.isUnawakened} userLevel={user?.guardianLevel} />
        </div>

        {/* Consistency Grid Section */}
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40">Consistency Matrix</h3>
                <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 uppercase tracking-widest">Live_</span>
            </div>
            
            <div className="p-4 rounded-[24px] bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
                <ConsistencyGrid
                    checks={checks}
                    isPartnerView={false}
                    myUserId={user?._id}
                    partnerUserId={user?.partner?._id}
                />
            </div>
        </div>
        
        {/* Yearly Moodboard Section */}
        <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40">Yearly Sentiments</h3>
                <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-widest">Active_</span>
            </div>
            
            <div className="p-4 rounded-[24px] bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
                <YearlyMoodBoard entries={entries} hideTitle={true} />
            </div>
            
            <p className="text-[9px] font-medium text-black/30 dark:text-white/30 text-center uppercase tracking-widest mb-4">
                Historical biometric data synchronization complete.
            </p>
        </div>

        </div>
      </motion.div>
    </div>,
    document.body
  );
}

function RadarChart({ stats, isLoading, isUnawakened, userLevel }) {
  const [hoveredStat, setHoveredStat] = useState(null);

  const attributes = [
    { key: 'str', label: 'STR', full: 'Strength', desc: 'Physical power, training, health', icon: 'fitness_center', color: 'text-red-500' },
    { key: 'dex', label: 'DEX', full: 'Dexterity', desc: 'Speed, precision, execution', icon: 'bolt', color: 'text-yellow-500' },
    { key: 'end', label: 'END', full: 'Endurance', desc: 'Consistency, resilience, streaks', icon: 'local_fire_department', color: 'text-orange-500' },
    { key: 'int', label: 'INT', full: 'Intelligence', desc: 'Knowledge, reasoning, creativity', icon: 'psychology', color: 'text-blue-500' },
    { key: 'wis', label: 'WIS', full: 'Wisdom', desc: 'Judgement, reflection, resources', icon: 'auto_awesome', color: 'text-purple-500' },
    { key: 'cha', label: 'CHA', full: 'Charisma', desc: 'Presence, loyalty, relationships', icon: 'auto_fix_high', color: 'text-pink-500' },
  ];

  const size = 300;
  const center = size / 2;
  const radius = 90;
  const maxVal = Math.max(...attributes.map(a => stats?.[a.key] || 1), 20);

  const getPoint = (index, value, r = radius) => {
    const angle = (index * 2 * Math.PI) / attributes.length - Math.PI / 2;
    const distance = (Math.min(100, (value / maxVal) * 100) / 100) * r;
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance
    };
  };

  const points = attributes.map((attr, i) => {
    const p = getPoint(i, stats?.[attr.key] || 0);
    return `${p.x},${p.y}`;
  }).join(' ');

  const currentHovered = attributes.find(a => a.key === hoveredStat);

  return (
    <div className="relative pointer-events-none select-none flex items-center justify-center transition-all duration-700">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Outer Boundary Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          className="fill-none stroke-black/5 dark:stroke-white/5"
          strokeWidth="1"
        />

        {/* Center Indicator Area */}
        <AnimatePresence mode="wait">
             {!hoveredStat ? (
                <motion.g
                    key="level"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                >
                    <circle cx={center} cy={center} r="30" className="fill-white dark:fill-[#0a0a0a] stroke-black/5 dark:stroke-white/10" strokeWidth="1" />
                    <text x={center} y={center} dy="4" textAnchor="middle" className="text-lg font-black fill-black dark:fill-white">{userLevel || 1}</text>
                </motion.g>
             ) : (
                <motion.g
                    key="stat"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                >
                    <circle cx={center} cy={center} r="35" className="fill-white dark:fill-black shadow-xl" />
                    <text x={center} y={center} dy="-5" textAnchor="middle" className={`text-xs font-black uppercase tracking-widest ${currentHovered?.color.replace('text-', 'fill-')}`}>
                        {stats[hoveredStat]}
                    </text>
                    <text x={center} y={center} dy="12" textAnchor="middle" className="text-[14px] material-symbols-outlined fill-black/20 dark:fill-white/30">
                        {currentHovered?.icon}
                    </text>
                </motion.g>
             )}
        </AnimatePresence>

        {/* Data Polygon */}
        {!isLoading && points && (
          <motion.polygon
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: isUnawakened ? 0.2 : 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 80 }}
            points={points}
            className={`${isUnawakened ? 'fill-black/5 dark:fill-white/10 stroke-black/10 dark:stroke-white/20' : 'fill-electric-blue/20 stroke-electric-blue'}`}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        )}

        {/* Labels & Interaction Zones */}
        {attributes.map((attr, i) => {
          const p = getPoint(i, maxVal, radius + 28);
          const isActive = hoveredStat === attr.key;

          return (
            <g 
                key={i} 
                className="pointer-events-auto cursor-pointer"
                onMouseEnter={() => setHoveredStat(attr.key)}
                onMouseLeave={() => setHoveredStat(null)}
            >
              {/* Invisible larger hit area */}
              <circle cx={p.x} cy={p.y} r="30" fill="transparent" />
              
              <motion.text
                animate={{ 
                    scale: isActive ? 1.2 : 1,
                    opacity: hoveredStat && !isActive ? 0.3 : 1
                }}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isActive ? (attr.color) : 'fill-black/40 dark:fill-white/50'}`}
              >
                {attr.label}
              </motion.text>
            </g>
          );
        })}
      </svg>
      
      {/* Tooltip Description Overlay */}
      <AnimatePresence mode="wait">
        {hoveredStat && currentHovered ? (
            <motion.div
                key="detail"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-center w-full px-8 pointer-events-none"
            >
                <div className="flex flex-col items-center">
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] mb-1 ${currentHovered.color}`}>{currentHovered.full} • {stats?.[currentHovered.key] || 0} Points</span>
                    <p className="text-[9px] font-medium text-black/30 dark:text-white/30 uppercase tracking-[0.1em] leading-relaxed max-w-[200px]">
                        {currentHovered.desc}
                    </p>
                </div>
            </motion.div>
        ) : (
            <motion.div
                key="helper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-center w-full pointer-events-none"
            >
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black/20 dark:text-white/20 animate-pulse">
                    Hover a stat for details
                </span>
            </motion.div>
        )}
      </AnimatePresence>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-8 border-2 border-electric-blue/20 border-t-electric-blue rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
