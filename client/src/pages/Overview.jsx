import React, { useContext, useState } from 'react';
import { DashboardContext } from "../components/Layout";
import useAuthStore from "../store/useAuthStore";
import MainFeed from "../components/MainFeed";
import AwakeningAssessment from "../components/rpg_components/AwakeningAssessment";
import DailyQuiz from "../components/rpg_components/DailyQuiz";
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, Brain, Target, Shield, ChevronRight, CheckCircle2 } from 'lucide-react';

function Overview() {
  const { setIsSearchModalOpen } = useContext(DashboardContext);
  const user = useAuthStore((state) => state.user);
  const [isAwakeningModalOpen, setIsAwakeningModalOpen] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  const isDailyQuizCompleted = user?.rpg?.dailyQuiz?.lastCompleted === today;
  const isLevel0 = user?.level === 0;

  const firstName = user?.name ? user.name.split(" ")[0] : "User";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="w-full max-w-2xl pt-8 pb-24">
      

      {/* Tactical Search Bar */}
      <div className="mb-10 group">
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="w-full h-14 bg-white/50 dark:bg-white/[0.03] hover:bg-white/80 dark:hover:bg-white/[0.05] backdrop-blur-xl border border-black/[0.08] dark:border-white/10 rounded-[22px] px-6 flex items-center gap-4 transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-active:scale-[0.99]"
        >
          <span className="material-symbols-outlined text-black/40 dark:text-white/40 text-2xl group-hover:text-electric-blue transition-colors duration-500">search</span>
          <div className="flex-1 flex items-center justify-between">
            <span className="text-black/30 dark:text-white/30 text-[11px] font-bold uppercase tracking-[0.2em]">Search commands, users or files...</span>
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/[0.05] dark:bg-white/[0.05] border border-black/[0.03] dark:border-white/[0.03]">
              <span className="text-[10px] font-black text-black/20 dark:text-white/20">⌘</span>
              <span className="text-[10px] font-black text-black/20 dark:text-white/20">K</span>
            </div>
          </div>
        </button>
      </div>      {/* Assessment Section */}
      <MainFeed 
        isLevel0={isLevel0}
        isDailyQuizCompleted={isDailyQuizCompleted}
        setIsAwakeningModalOpen={setIsAwakeningModalOpen}
      />
    </div>
  );
}

export default Overview;
