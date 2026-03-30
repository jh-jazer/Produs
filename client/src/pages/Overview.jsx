import React, { useContext, useState, useMemo } from 'react';
import { DashboardContext } from "../context/DashboardContext";
import useAuthStore from "../store/useAuthStore";
import { motion, AnimatePresence } from 'framer-motion';

// Dashboard Zones
import DashboardHeader from '../components/dashboard/DashboardHeader';
import IdentityHeader from '../components/dashboard/IdentityHeader';
import TodayActivity from '../components/dashboard/TodayActivity';
import StreakStatus from '../components/dashboard/StreakStatus';
import StatRadar from '../components/dashboard/StatRadar';
import EvolutionPreview from '../components/dashboard/EvolutionPreview';
import PartnerPanel from '../components/dashboard/PartnerPanel';
import XpFeed from '../components/dashboard/XpFeed';
import AwakeningOverlay from '../components/dashboard/AwakeningOverlay';
import AwakeningAssessment from '../components/rpg_components/AwakeningAssessment';
import useSWR from 'swr';
import api from '../services/api';

// Reality Mode Widgets
import { 
  MoodTracker, 
  CoreStreaksList, 
  RealityAchievements, 
  WishlistPreview 
} from '../components/dashboard/DashboardRealityWidgets';

import { Users, Link as LinkIcon, ShieldAlert, Zap } from 'lucide-react';

function Overview() {
  const { setIsSearchModalOpen, viewMode, setViewMode, protocolMode, setProtocolMode } = useContext(DashboardContext);
  const user = useAuthStore((state) => state.user);
  const updateSettings = useAuthStore((state) => state.updateSettings);
  const [isAwakeningModalOpen, setIsAwakeningModalOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasAwakened, setHasAwakened] = useState(false);
  
  // Data Fetching for Reality Widgets
  const { data: habits = [] } = useSWR('/habits', (url) => api.get(url).then(res => res.data));
  const { data: wishlist = [] } = useSWR('/finance/wishlist', (url) => api.get(url).then(res => res.data));

  const updateMood = async (newMood) => {
    try {
      await updateSettings({ mood: newMood });
    } catch (error) {
      console.error("Failed to update mood", error);
    }
  };
  
  const today = new Date().toISOString().split('T')[0];
  const isLevel0 = user?.level === 0 && !hasAwakened;

  const handleAwakened = () => {
    setIsAwakeningModalOpen(false);
    setHasAwakened(true); // client-side gate — ensures we never snap back
    setIsInitializing(true);
    setTimeout(() => {
      setIsInitializing(false);
    }, 4500);
  };

  const initLogs = [
    "ATTACHING_NEURAL_LINK...",
    "CALIBRATING_SYNERGY_MATRICES...",
    "HYDRATING_DASHBOARD_ZONES...",
    "LINKING_RPG_VECTORS...",
    "SYNCHRONIZING_STAT_RADAR...",
    "ESTABLISHING_PARTNER_ENCRYPTION..."
  ];

  return (
    <div className="relative w-full min-h-[calc(100vh-64px)] flex flex-col overflow-hidden">

      <AnimatePresence mode="wait">
        {isLevel0 && !isInitializing ? (
          <motion.div
            key="awakening"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex items-center justify-center px-6"
          >
            <AwakeningOverlay onAwaken={() => setIsAwakeningModalOpen(true)} />
          </motion.div>
        ) : isInitializing ? (
          <motion.div
            key="initializing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center space-y-8"
          >
            <div className="w-64 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black text-cyan-500 uppercase tracking-widest font-mono">
                <span>SYSTEM_INITIALIZING</span>
                <motion.span 
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  LIVE
                </motion.span>
              </div>
              <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: "100%" }}
                   transition={{ duration: 4, ease: "easeInOut" }}
                   className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                />
              </div>
              <div className="h-20 overflow-hidden relative">
                 <motion.div
                   animate={{ y: [0, -100] }}
                   transition={{ duration: 4, ease: "linear" }}
                   className="flex flex-col gap-1"
                 >
                    {[...initLogs, ...initLogs].map((log, i) => (
                      <span key={i} className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">{log}</span>
                    ))}
                 </motion.div>
                 <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-5xl mx-auto pt-8 md:pt-8 pb-32 space-y-12"
          >
            <AnimatePresence mode="wait">
              {viewMode === 'personal' ? (
                <motion.div
                  key="personal-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-12"
                >
                  {/* ZONE 1: Identity Header (Above the fold) */}
                  <IdentityHeader user={user} habits={habits} />

                  <AnimatePresence mode="wait">
                    {protocolMode === 'rpg' ? (
                      <motion.div
                        key="rpg-widgets"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                        className="space-y-12"
                      >
                        {/* ZONE 3: Today's Activity (Action driver) */}
                        <TodayActivity user={user} />
                        
                        {/* ZONE 2: Stat Radar (The big visual anchor) */}
                        <StatRadar user={user} />

                        {/* ZONE 4: Streak Status (Emotional urgency) */}
                        <StreakStatus user={user} />

                        {/* ZONE 5: Evolution Preview (The pull forward) */}
                        <EvolutionPreview user={user} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="reality-widgets"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                        className="space-y-12"
                      >
                        {/* ZONE 3: Mood Tracker (Feelings) */}
                        <MoodTracker user={user} updateMood={updateMood} />
                        
                        {/* ZONE 2: Core Streaks (System Habits) */}
                        <CoreStreaksList habits={habits} />

                        {/* ZONE 4: Reality Achievements (Practical Milestones) */}
                        <RealityAchievements habits={habits} wishlist={wishlist} />

                        {/* ZONE 5: Wishlist Preview (Finance) */}
                        <WishlistPreview wishlist={wishlist} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="partner-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-12"
                >
                  {!user?.partner ? (
                    /* Locked State: Collective Mode Restriction */
                    <div className="w-full max-w-3xl mx-auto">
                      <div className="glass-panel p-12 md:p-20 rounded-[3rem] relative overflow-hidden border-2 border-slate-200 dark:border-white/10 shadow-hud group">
                        {/* Tactical Backdrop */}
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                           <ShieldAlert size={300} />
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center space-y-10">
                          <div className="size-24 rounded-[2rem] bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black shadow-hud">
                            <LinkIcon size={40} />
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-center gap-3">
                               <div className="h-px w-8 bg-rose-500/40" />
                               <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] font-mono">ENCRYPTION_LOCKED</span>
                               <div className="h-px w-8 bg-rose-500/40" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic font-exo">
                              Neural_Link Required
                            </h2>
                            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 max-w-md mx-auto uppercase tracking-widest leading-loose">
                              Collective synchronization is physically restricted until a dual-operator link is established.
                            </p>
                          </div>

                          {/* Feature Preview (Locked) */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl px-4">
                             {[
                               { label: 'CO-OP_XP', desc: 'SHARED CHA BONUSES' },
                               { label: 'LIVE_SYNC', desc: 'REAL-TIME TRACKING' },
                               { label: 'ALLIANCE', desc: 'SHARED MILESTONES' }
                             ].map((f, i) => (
                               <div key={i} className="p-5 rounded-3xl bg-slate-100/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-left opacity-60">
                                  <div className="flex items-center gap-2 mb-2">
                                     <div className="size-2 rounded-full bg-slate-400" />
                                     <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{f.label}</span>
                                  </div>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">{f.desc}</p>
                               </div>
                             ))}
                          </div>

                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-slate-900 dark:bg-white text-white dark:text-black px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-hud flex items-center gap-4 group"
                          >
                            <span>ESTABLISH_LINK_</span>
                            <Zap size={14} className="group-hover:animate-pulse" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Active State: Collective Data Layer */
                    <div className="space-y-12">
                      <div className="glass-panel p-10 rounded-[2.5rem] flex flex-col items-center text-center space-y-4">
                        <div className="size-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                          <Users size={32} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic font-exo">Sync_Protocol_Active</h3>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Monitoring linked neural frequencies...</p>
                        </div>
                      </div>

                      <PartnerPanel user={user} />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Awakening Assessment Modal */}
      <AnimatePresence>
        {isAwakeningModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-2xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="w-full max-w-xl max-h-[85vh] overflow-y-auto custom-scrollbar"
             >
                <AwakeningAssessment isOpen={true} isInline={true} onClose={handleAwakened} />
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Overview;
