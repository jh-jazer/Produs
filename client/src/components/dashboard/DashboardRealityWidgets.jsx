/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Trophy, ShoppingBag, CheckCircle2, Star, TrendingUp, Zap } from 'lucide-react';
import DashboardPanel from '../ui/DashboardPanel';

/**
 * 1. MoodTracker (Feelings)
 * Replaces TodayActivity in Reality Mode
 */
export const MoodTracker = ({ user, updateMood }) => {
    const moodEmojis = {
        great: { emoji: "🤩", label: "Great", color: "text-cyan-500", bg: "bg-cyan-500/10" },
        good: { emoji: "🙂", label: "Good", color: "text-blue-500", bg: "bg-blue-500/10" },
        neutral: { emoji: "😐", label: "Neutral", color: "text-slate-400", bg: "bg-slate-500/10" },
        bad: { emoji: "😔", label: "Bad", color: "text-orange-500", bg: "bg-orange-500/10" },
        awful: { emoji: "😭", label: "Awful", color: "text-rose-500", bg: "bg-rose-500/10" },
    };

    const currentMood = user?.settings?.mood || "neutral";

    return (
        <DashboardPanel 
            title="Mood Tracker" 
            icon={Heart}
            indicatorColor="rose"
        >
            <div className="flex flex-col items-center justify-center py-6 gap-8">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    {Object.entries(moodEmojis).map(([key, data]) => (
                        <motion.button
                            key={key}
                            whileHover={{ scale: 1.1, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateMood?.(key)}
                            className={`group relative flex flex-col items-center gap-3 p-4 rounded-3xl transition-all duration-300 border
                                ${currentMood === key 
                                    ? `${data.bg} border-${key === 'neutral' ? 'slate' : key}-500/50 shadow-lg ring-2 ring-${key === 'neutral' ? 'slate' : key}-500/20` 
                                    : 'bg-white dark:bg-white/[0.02] border-cyan-500/10 dark:border-white/5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 dark:hover:bg-white/5'}`}
                        >
                            <span className="text-4xl">{data.emoji}</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${currentMood === key ? data.color : 'text-slate-400'}`}>
                                {data.label}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </DashboardPanel>
    );
};

/**
 * 2. CoreStreaksList (System Habits)
 * Replaces StatRadar in Reality Mode
 */
export const CoreStreaksList = ({ habits = [] }) => {
    const coreIds = ['journal', 'finance', 'planner', 'workout'];
    const coreHabits = coreIds.map(id => habits.find(h => h.systemId === id)).filter(Boolean);

    return (
        <DashboardPanel 
            title="Core Habits" 
            icon={Activity}
            indicatorColor="cyan"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                {coreHabits.length > 0 ? coreHabits.map((habit) => (
                    <div key={habit._id} className="group/streak relative p-6 rounded-[2rem] bg-slate-50 dark:bg-black/20 border border-cyan-500/20 dark:border-white/5 hover:border-cyan-500/40 transition-all duration-300">
                        <div className="flex items-center gap-5">
                            <div className="size-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 shrink-0 group-hover/streak:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">{habit.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">{habit.name}</h4>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-cyan-500 italic font-exo">{habit.streak}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Day Streak</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-4 right-6 size-2 rounded-full bg-cyan-500 animate-pulse" />
                    </div>
                )) : (
                    <div className="col-span-2 py-12 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[2rem]">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No core habits established yet.</p>
                    </div>
                )}
            </div>
        </DashboardPanel>
    );
};

/**
 * 3. RealityAchievements (Practical Milestones)
 * Replaces StreakStatus in Reality Mode
 */
export const RealityAchievements = ({ habits = [], wishlist = [] }) => {
    const milestones = [
        { id: 'consistency', icon: <CheckCircle2 size={18} />, label: 'Consistency', desc: 'Maintain 7d habit consistency', value: `${Math.min(100, Math.max(...habits.map(h => h.streak || 0), 0) * 14)}%`, color: 'blue' },
        { id: 'finance', icon: <Star size={18} />, label: 'Wishlist Goal', desc: 'Complete 1st wishlist item', value: wishlist.some(i => i.purchased) ? 'ACHIEVED' : 'UNLOCKED', color: 'amber' },
        { id: 'focus', icon: <Zap size={18} />, label: 'Deep Work', desc: 'Log 5 focus sessions', value: '04/05', color: 'cyan' },
        { id: 'growth', icon: <TrendingUp size={18} />, label: 'Dedication', desc: 'Reach 30d total activity', value: '12 days', color: 'purple' },
    ];

    return (
        <DashboardPanel 
            title="Recent Milestones" 
            icon={Trophy}
            indicatorColor="cyan"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                {milestones.map((ms) => (
                    <div key={ms.id} className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-black/20 border border-cyan-500/10 dark:border-white/5 shadow-sm">
                        <div className={`size-12 rounded-2xl bg-${ms.color}-500/10 border border-${ms.color}-500/20 flex items-center justify-center text-${ms.color}-500 shrink-0`}>
                            {ms.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white truncate">{ms.label}</h4>
                                <span className={`text-[8px] font-black uppercase font-mono text-${ms.color}-500`}>{ms.value}</span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{ms.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardPanel>
    );
};

/**
 * 4. WishlistPreview (Finance)
 * Replaces EvolutionPreview in Reality Mode
 */
export const WishlistPreview = ({ wishlist = [] }) => {
    return (
        <DashboardPanel 
            title="Wishlist Preview" 
            icon={ShoppingBag}
            indicatorColor="amber"
        >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                {wishlist.length > 0 ? wishlist.slice(0, 4).map((item) => (
                    <div key={item._id} className="group relative flex flex-col rounded-3xl bg-slate-50 dark:bg-black/20 border border-cyan-500/10 dark:border-white/5 overflow-hidden transition-all duration-300 hover:border-amber-500/30 shadow-sm">
                        <div className="aspect-video w-full bg-slate-100 dark:bg-[#000000] overflow-hidden">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="size-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                                    <ShoppingBag size={32} />
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white truncate mb-1">{item.title}</h4>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-amber-500 font-exo italic">// {item.budgetPrice > 0 ? `$${item.budgetPrice}` : 'PENDING'}</span>
                                <div className={`size-2 rounded-full ${item.priority === 'high' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`} />
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-4 py-12 text-center opacity-40 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl">
                        <ShoppingBag size={24} className="mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Your wishlist is empty</p>
                    </div>
                )}
            </div>
        </DashboardPanel>
    );
};
