import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import useMobile from '../hooks/useMobile';
import { useHabits } from '../hooks/useHabits';
import { QRCodeSVG } from 'qrcode.react';

const ChippedBorder = ({ opacity = 0.8 }) => (
  <div 
    className="absolute inset-[-2px] rounded-sm pointer-events-none z-0"
    style={{
      border: '4px solid white',
      opacity,
      clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
    }}
  />
);

export default function HomeExperimental() {
  const { user } = useAuthStore();
  const { habits, toggleCheck, initHabits, addHabit, isLoading: habitsLoading } = useHabits();
  const isMobile = useMobile();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const handleSyncHabits = async () => {
    setIsSyncing(true);
    await initHabits();
    setIsSyncing(false);
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    await addHabit({ 
      name: newHabitName.trim(),
      category: 'INT',
      icon: 'star',
      color: 'white'
    });
    setNewHabitName('');
    setAddModalOpen(false);
  };

  // Simple hash function for codename anonymity
  const generateCodenameHash = (str) => {
    if (!str) return 'UNKNOWN';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).toUpperCase().slice(0, 8);
  };

  const codenameHash = generateCodenameHash(user?.username || user?.name || 'OPERATIVE');

  // Auto-flip back after 15 seconds
  useEffect(() => {
    if (isFlipped) {
      const timer = setTimeout(() => {
        setIsFlipped(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [isFlipped]);

  return (
    <div className="w-full min-h-screen bg-transparent text-white p-8 pt-0 md:p-12 font-sans overflow-y-auto">
      {/* Experimental 5-Column Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full mb-32">
        
        {/* Screen Anchor Point */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-white z-[60] shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
        
        {/* Column 1-3: Swinging ID Assembly (60% width) */}
        <div className="md:col-span-3 relative h-[500px] md:h-16 flex flex-col items-center">
          <div className="absolute inset-0 flex flex-col items-center">
            {/* Single Robust Thread (Lanyard) - Static */}
            <svg 
              className="absolute top-[-1000px] left-1/2 -translate-x-1/2 w-16 h-[1100px] pointer-events-none z-30"
              viewBox="0 0 64 1100"
            >
              <path 
                d="M 33,0 L 33,1100" 
                stroke="white" 
                strokeWidth="12" 
                strokeOpacity="0.8" 
                fill="none" 
              />
            </svg>
            
            {/* 3D Flippable Card Container - Animated */}
            <motion.div 
              animate={{ 
                rotate: isMobile ? 0 : [-2, 2, -2] 
              }}
              transition={{ 
                repeat: Infinity,
                duration: 6,
                ease: "easeInOut"
              }}
              style={{ transformOrigin: "top center" }}
              className="absolute top-20 md:top-5 left-1/2 -translate-x-1/2 perspective-[1000px] cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div 
                initial={{ y: -20, opacity: 0, rotate: -2 }}
                animate={{ 
                  y: 0, 
                  opacity: 1, 
                  rotateY: isFlipped ? 180 : 0
                }}
                transition={{ 
                  rotateY: {
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                  },
                  y: { type: "spring", stiffness: 100, damping: 15, delay: 0.2 },
                  opacity: { duration: 0.5, delay: 0.2 }
                }}
                style={{ transformStyle: "preserve-3d", originY: 0 }}
                className="relative w-[286px] min-h-[446px]"
              >
              {/* FRONT FACE */}
              <div 
                className="absolute inset-0 bg-[#121212] text-white p-8 rounded-sm shadow-[0_30px_80px_rgba(0,0,0,1)] flex flex-col justify-between items-center text-center overflow-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <ChippedBorder opacity={1} />
                {/* Card Clip Hole */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 size-8 bg-[#000000] rounded-full border-[7px] border-[#121212] z-20 flex items-center justify-center">
                   <div className="absolute inset-[-1px] rounded-full border-[0.5px] border-white/30" style={{ clipPath: 'polygon(0% 0%, 25% 5%, 50% 0%, 75% 5%, 100% 0%, 95% 25%, 100% 50%, 95% 75%, 100% 100%, 75% 95%, 50% 100%, 25% 95%, 0% 100%, 5% 75%, 0% 50%, 5% 25%)' }} />
                </div>
                
                <div className="flex flex-col gap-6 w-full items-center mt-4">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">OP_HASH_{codenameHash}</span>
                    <span className="text-sm font-black tracking-tighter uppercase">#{user?._id?.slice(-12) || 'UNKNOWN-ID'}</span>
                  </div>

                  <div className="h-[1px] bg-white/10 w-full" />

                  <div className="flex flex-col items-center gap-6">
                    <div className="size-32 bg-black rounded-sm overflow-hidden border border-white/10 shrink-0 relative">
                      <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/10 text-6xl">person</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-1/2 w-full top-0 animate-scanline" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">AUTHORIZED</span>
                      <span className="text-xs font-bold uppercase tracking-tight">{user?.rpg?.archetype?.name || 'UNAWAKENED'}</span>
                    </div>
                  </div>

                  <div className="mt-2 w-full flex flex-col gap-3 items-center">
                    <div className="h-[1px] bg-white/5 w-full" />
                    <div className="flex items-center justify-between w-full px-2">
                      <div className="flex items-center gap-2">
                        <div className="size-1.5 bg-white rounded-full animate-pulse opacity-50" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">ACTIVE_LINK</span>
                      </div>
                      <span className="text-[8px] font-mono opacity-20 text-white">SEC_LEVEL_04</span>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 right-0 p-2 opacity-[0.02] pointer-events-none">
                  <span className="text-[40px] font-black">PRODUS</span>
                </div>
              </div>

              {/* BACK FACE */}
              <div 
                className="absolute inset-0 bg-[#0f0f0f] text-white p-8 rounded-sm shadow-[0_30px_80px_rgba(0,0,0,1)] flex flex-col justify-between items-center text-center overflow-hidden"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <ChippedBorder opacity={1} />
                {/* Card Clip Hole (Reverse) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 size-8 bg-[#000000] rounded-full border-[7px] border-[#0f0f0f] z-20 flex items-center justify-center">
                   <div className="absolute inset-[-1px] rounded-full border-[0.5px] border-white/20" style={{ clipPath: 'polygon(0% 0%, 25% 5%, 50% 0%, 75% 5%, 100% 0%, 95% 25%, 100% 50%, 95% 75%, 100% 100%, 75% 95%, 50% 100%, 25% 95%, 0% 100%, 5% 75%, 0% 50%, 5% 25%)' }} />
                </div>

                <div className="flex flex-col gap-8 w-full items-center mt-10">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">System Metadata</span>
                    <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Global_Unique_Identifier</span>
                  </div>

                  {/* QR Code */}
                  <div className="p-4 bg-white/[0.03] border border-white/10 rounded-sm relative">
                    <div className="absolute inset-0 border border-white/5 pointer-events-none scale-110 opacity-20" />
                    <QRCodeSVG 
                      value={user?._id || 'PRODUS_OPERATIVE'}
                      size={140}
                      bgColor={"transparent"}
                      fgColor={"rgba(255, 255, 255, 0.8)"}
                      level={"L"}
                      includeMargin={false}
                    />
                  </div>

                  <div className="flex flex-col items-center gap-2 w-full">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10">Full Access Key</span>
                    <div className="w-full bg-white/[0.02] border border-white/5 p-3 rounded-sm font-mono text-[9px] break-all leading-relaxed opacity-60">
                      {user?._id || 'SESSION_DATA_NOT_FOUND'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 mb-4">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => <div key={i} className="size-1 bg-white/10 rounded-full" />)}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/10">Confidential</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

        {/* Column 4-5: Habit Tracker Panel */}
        <div className="hidden md:flex md:col-span-2 flex-col bg-white/[0.02] rounded-sm p-8 min-h-[30rem] hover:bg-white/[0.04] transition-all group relative overflow-hidden">
          <ChippedBorder opacity={0.7} />
          
          <div className="mb-10 flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-[0.6em] text-white/60">CHECKLIST</span>
            <button 
              onClick={() => setAddModalOpen(!addModalOpen)}
              className={`size-8 flex items-center justify-center border-2 transition-all active:scale-95 ${
                addModalOpen 
                  ? 'bg-white border-white text-black' 
                  : 'border-white/20 hover:border-white text-white/40 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{addModalOpen ? 'close' : 'add'}</span>
            </button>
          </div>

          {addModalOpen && (
            <motion.form 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleCreateHabit}
              className="mb-8 p-4 bg-white/[0.05] border border-white/20 rounded-sm relative group/input"
            >
              <div className="flex flex-col gap-3">
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Create_New_Node</span>
                <input 
                  autoFocus
                  type="text"
                  placeholder="HABIT_NAME_REQUIRED"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="bg-transparent border-none text-xs font-black uppercase tracking-wider focus:ring-0 p-0 placeholder:text-white/10"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[7px] font-mono opacity-20">AUTH_LEVEL_PRIMARY</span>
                  <button 
                    type="submit"
                    className="text-[9px] font-black uppercase tracking-widest bg-white text-black px-3 py-1 hover:bg-white/80 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.form>
          )}

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
            {habitsLoading ? (
              <div className="flex flex-col gap-4 opacity-20 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-12 bg-white/10 rounded-sm w-full" />)}
              </div>
            ) : habits.length > 0 ? (
              habits.map((habit) => {
                const isCompleted = habit.checks?.some(c => c.date === today && c.completed);
                return (
                  <motion.div 
                    key={habit._id}
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-4 p-4 border rounded-sm transition-all group/item ${
                      isCompleted 
                        ? 'bg-white/[0.05] border-white/20' 
                        : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                    }`}
                    onClick={() => toggleCheck(habit._id, today)}
                  >
                    {/* Tactical Checkbox */}
                    <div className={`size-5 border-2 rounded-sm shrink-0 flex items-center justify-center transition-all ${
                      isCompleted 
                        ? 'bg-white border-white' 
                        : 'border-white/20 group-hover/item:border-white/40'
                    }`}>
                      {isCompleted && (
                        <span className="material-symbols-outlined text-black text-sm font-bold">check</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-black uppercase tracking-wider truncate ${
                          isCompleted ? 'opacity-100' : 'opacity-40 group-hover/item:opacity-70'
                        }`}>
                          {habit.name}
                        </span>
                        {habit.systemId && (
                          <span className="text-[7px] font-black bg-white/10 px-1 py-0.5 rounded-sm text-white/40 tracking-widest">CORE</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono opacity-20 uppercase tracking-tighter">Streak</span>
                        <span className="text-[8px] font-mono opacity-40">{habit.streak || 0}d</span>
                      </div>
                    </div>

                    {isCompleted && (
                      <div className="flex items-center gap-1 opacity-20">
                        <span className="text-[8px] font-black uppercase tracking-widest">OK</span>
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-40 text-center gap-6 py-8">
                <span className="material-symbols-outlined text-4xl opacity-20">rule</span>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">No_Active_Habits</span>
                  <span className="text-[8px] font-mono opacity-40 uppercase">System_Modules_Offline</span>
                </div>
                <button 
                  onClick={handleSyncHabits}
                  disabled={isSyncing}
                  className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
                >
                  {isSyncing ? (
                    <>
                      <div className="size-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">sync</span>
                      <span>Sync_Core_Modules</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center">
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/10">Produs_OS_v0.2</span>
            <div className="flex gap-1">
               {habits.slice(0, 8).map((_, i) => (
                 <div key={i} className="size-1 bg-white/10 rounded-full" />
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Experimental Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-[1400px]">
        
        {/* Vitality Nexus Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="md:col-span-8 group relative bg-white/[0.03] rounded-sm p-8 overflow-hidden hover:bg-white/[0.05] transition-all duration-500"
        >
          <ChippedBorder opacity={0.7} />
          <div className="relative z-10">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-8 text-white/40">Vitality // SYNCHRONIZATION</h3>
            <div className="flex flex-col md:flex-row gap-12 items-end justify-between">
              <div className="flex flex-col gap-4">
                <span className="text-6xl font-black tracking-tighter">98.4%</span>
                <p className="text-white/40 text-xs font-light tracking-wide max-w-[200px]">
                  Optimal cognitive state detected. Your neural loops are currently operating at peak efficiency.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 text-right">
                <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Efficiency Index</span>
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '98%' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-white" 
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        </motion.div>

        {/* Strategic Node Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="md:col-span-4 bg-white/5 rounded-sm p-8 flex flex-col justify-between hover:border-white/30 transition-all cursor-pointer group relative"
        >
          <ChippedBorder opacity={0.7} />
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-6 text-white/40">Strategy // CURRENT</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-center gap-3">
                <div className="size-1.5 bg-white rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Finalize HUD Architecture</span>
              </li>
              <li className="flex items-center gap-3 opacity-40">
                <div className="size-1.5 bg-white rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Neural Loop Integration</span>
              </li>
              <li className="flex items-center gap-3 opacity-40">
                <div className="size-1.5 bg-white rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Capital Stream Sync</span>
              </li>
            </ul>
          </div>
          <div className="mt-12 flex justify-between items-center group-hover:translate-x-1 transition-transform">
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Open Strategic Node</span>
            <span className="material-symbols-outlined text-sm">east</span>
          </div>
        </motion.div>

        {/* Capital Flow Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { label: 'Capital', value: '$12,450.00', trend: '+12.5%' },
            { label: 'Energy', value: '450kJ', trend: 'Stable' },
            { label: 'Focus', value: '4.8h', trend: 'Record' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.02] rounded-sm p-6 flex flex-col gap-2 hover:bg-white/[0.04] transition-all relative">
              <ChippedBorder opacity={0.5} />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">{stat.label}</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-black tracking-tight">{stat.value}</span>
                <span className="text-[9px] font-mono text-white/50 tracking-widest mb-1">{stat.trend}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Decorative vertical lines */}
      <div className="hidden md:block fixed left-4 top-0 bottom-0 w-[1px] bg-white/[0.03] pointer-events-none" />
      <div className="hidden md:block fixed left-8 top-0 bottom-0 w-[1px] bg-white/[0.03] pointer-events-none" />
    </div>
  );
}
