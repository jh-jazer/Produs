import React, { useContext, useState, useMemo } from 'react';
import { DashboardContext } from "../context/DashboardContext";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Dashboard Zones
import IdentityHeader from '../components/dashboard/IdentityHeader';
import TodayActivity from '../components/dashboard/TodayActivity';
import StreakStatus from '../components/dashboard/StreakStatus';
import StatRadar from '../components/dashboard/StatRadar';
import EvolutionPreview from '../components/dashboard/EvolutionPreview';
import PartnerPanel from '../components/dashboard/PartnerPanel';
import XpFeed from '../components/dashboard/XpFeed';
import AwakeningOverlay from '../components/dashboard/AwakeningOverlay';
import useSWR, { useSWRConfig } from 'swr';
import api from '../services/api';
import { useHabits } from '../hooks/useHabits';

// Reality Mode Widgets
import { 
  TodayObjectivesList
} from '../components/dashboard/DashboardRealityWidgets';

import { Users, Link as LinkIcon, ShieldAlert, Zap } from 'lucide-react';

function Home() {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const { setIsSearchModalOpen, viewMode, setViewMode, protocolMode, setProtocolMode } = useContext(DashboardContext);
  const user = useAuthStore((state) => state.user);
  const syncUser = useAuthStore((state) => state.syncUser);
  const setNeuralSyncDismissed = useAuthStore((state) => state.setNeuralSyncDismissed);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAwaking, setIsAwaking] = useState(false);

  // Data Fetching for Reality Widgets
  const { habits, isLoading: isLoadingHabits, toggleCheck: toggleHabitCheck } = useHabits();

  // Handle cinematic initialization clearing
  React.useEffect(() => {
    if (user && user.username) {
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const today = new Date().toISOString().split('T')[0];
  const isUnawakened = !user?.rpg?.path;
  const isLevel0Active = isUnawakened && protocolMode === 'rpg';

  const handleInitiateAwakening = async () => {
    // Immediate SPA Navigation - No waiting for backend
    setNeuralSyncDismissed(false);
    navigate('/dashboard/neural-sync');
  };


  return (
    <div className={`relative w-full ${isLevel0Active ? 'h-[calc(100svh-130px)] md:h-[calc(100vh-64px)]' : 'min-h-[calc(100vh-64px)]'} flex flex-col overflow-hidden`}>

      <AnimatePresence mode="wait">
        {isLevel0Active && !isInitializing ? (
          <motion.div
            key="awakening"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 h-full flex items-center justify-center px-4 overflow-hidden"
          >
            <AwakeningOverlay 
              onAwaken={handleInitiateAwakening} 
              onBackToReality={() => setProtocolMode('reality')}
              isLoading={isAwaking}
              hasStarted={user?.rpg?.completedAnswers?.length > 0}
            />
          </motion.div>
        ) : isInitializing ? (
          <motion.div
            key="initializing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-5xl mx-auto pt-8 md:pt-8 pb-32 px-4 md:px-0 space-y-12"
          >
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-black/[0.03] dark:border-white/[0.03] pb-12">
               <div className="size-32 md:size-48 rounded-[3rem] bg-black/5 dark:bg-white/5 animate-pulse shrink-0" />
               <div className="flex-1 space-y-6 w-full">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                     <div className="space-y-4 flex-1">
                        <div className="h-4 w-32 bg-black/5 dark:bg-white/5 rounded-full animate-pulse" />
                        <div className="h-12 w-64 bg-black/10 dark:bg-white/10 rounded-2xl animate-pulse" />
                     </div>
                     <div className="flex gap-2">
                        <div className="size-12 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
                        <div className="size-12 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
                     </div>
                  </div>
                  <div className="h-24 w-full bg-black/5 dark:bg-white/5 rounded-[2rem] animate-pulse" />
               </div>
            </div>

            {/* Content Skeleton */}
            <div className="space-y-8">
               <div className="h-64 w-full bg-black/5 dark:border-white/5 rounded-[3rem] animate-pulse" />
               <div className="h-96 w-full bg-black/5 dark:border-white/5 rounded-[3rem] animate-pulse" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-5xl mx-auto pt-8 md:pt-8 pb-32 px-0 md:px-0 space-y-6 md:space-y-12"
          >
            {/* Header & Identity Section */}
            <IdentityHeader user={user} habits={habits} />


            
            <AnimatePresence mode="wait">
              {viewMode === 'personal' ? (
                <motion.div
                  key="personal-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6 md:space-y-12"
                >


                  {/* Mode Switching Logic */}
                  <AnimatePresence mode="wait">
                    {protocolMode === 'rpg' ? (
                      <motion.div
                        key="rpg-mode"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="flex flex-col space-y-4 md:space-y-8 w-full"
                      >
                        {/* RPG Side Column */}
                        <div className="w-full space-y-4 md:space-y-8">
                             <StatRadar stats={user.rpg?.stats} />
                             <EvolutionPreview user={user} />
                        </div>
                        
                        {/* RPG Main Column */}
                        <div className="w-full space-y-4 md:space-y-8">
                             <TodayActivity user={user} habits={habits} />
                             <StreakStatus habits={habits} />
                             <XpFeed />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="reality-mode"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6 md:space-y-12"
                      >


                        {/* ZONE 1: Psychological Baseline */}
                        <div className="flex flex-col space-y-4 md:space-y-8 w-full">
                           <div className="w-full">
                              <TodayObjectivesList 
                               habits={habits} 
                               isLoadingHabits={isLoadingHabits} 
                               toggleHabitCheck={toggleHabitCheck} 
                             />
                          </div>
                        </div>

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
                    <div className="w-full max-w-5xl mx-auto">
                      <div className="glass-panel p-12 md:p-20 rounded-[3rem] relative overflow-hidden border border-cyan-500/30 dark:border-white/10 shadow-hud group">
                        {/* Tactical Backdrop */}
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                           <ShieldAlert size={300} />
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center space-y-10">
                          <div className="size-24 rounded-[2rem] bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black shadow-hud">
                            <LinkIcon size={40} />
                          </div>

                          <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic font-exo">
                              Partner Required
                            </h2>
                            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 max-w-md mx-auto uppercase tracking-widest leading-loose">
                              Dual-operator link required to access collective synchronization.
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


                      <PartnerPanel user={user} />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Home;
