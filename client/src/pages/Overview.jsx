import React, { useContext, useState, useMemo } from 'react';
import { DashboardContext } from "../components/Layout";
import useAuthStore from "../store/useAuthStore";
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
import AwakeningAssessment from '../components/rpg_components/AwakeningAssessment';

function Overview() {
  const { setIsSearchModalOpen } = useContext(DashboardContext);
  const user = useAuthStore((state) => state.user);
  const [isAwakeningModalOpen, setIsAwakeningModalOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasAwakened, setHasAwakened] = useState(false);
  
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
            className="w-full max-w-5xl mx-auto pt-8 pb-32 space-y-12"
          >

            {/* ZONE 1: Identity Header (Above the fold) */}
            <IdentityHeader user={user} />

            {/* ZONE 3: Today's Activity (Action driver) */}
            <TodayActivity user={user} />

            {/* ZONE 4: Streak Status (Emotional urgency) */}
            <StreakStatus user={user} />

            {/* ZONE 2: Stat Radar (The big visual anchor) */}
            <StatRadar user={user} />

            {/* ZONE 5: Evolution Preview (The pull forward) */}
            <EvolutionPreview user={user} />

            {/* ZONE 6: Link Partner Panel (Social layer) */}
            <PartnerPanel user={user} />

            {/* ZONE 7: Recent XP Feed (Recent log) */}
            <div className="max-w-2xl mx-auto w-full">
                <XpFeed user={user} />
            </div>
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
