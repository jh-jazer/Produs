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
  
  const today = new Date().toISOString().split('T')[0];
  const isLevel0 = user?.level === 0;

  return (
    <div className="relative w-full min-h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* Cinematic Overview Background: Neural Glow & Grid */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden bg-transparent">
        <div className="absolute inset-0 bg-grid opacity-30 dark:opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.2),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,102,255,0.12),transparent_50%)]" />
      </div>

      <AnimatePresence mode="wait">
        {isLevel0 ? (
          <motion.div
            key="awakening"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex items-center justify-center px-6"
          >
            <AwakeningOverlay onAwaken={() => setIsAwakeningModalOpen(true)} />
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-5xl mx-auto pt-8 pb-32 space-y-12"
          >
            {/* Tactical Search Bar */}
            <div className="max-w-2xl mx-auto group">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="w-full h-14 bg-white/50 dark:bg-white/[0.03] hover:bg-white/80 dark:hover:bg-white/[0.05] backdrop-blur-xl border border-black/[0.08] dark:border-white/10 rounded-[22px] px-6 flex items-center gap-4 transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-black/40 dark:text-white/40 text-2xl group-hover:text-cyan-500 transition-colors duration-500">search</span>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-black/30 dark:text-white/30 text-[11px] font-bold uppercase tracking-[0.2em] font-mono">SEARCH_TACTICAL_DATA (⌘K)</span>
                </div>
              </button>
            </div>

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
                <AwakeningAssessment onComplete={() => setIsAwakeningModalOpen(false)} />
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Overview;
