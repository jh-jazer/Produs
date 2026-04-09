import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Activity, Trophy, ShoppingBag, CheckCircle2, Star, TrendingUp, Zap, Target, Flame, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardPanel from '../ui/DashboardPanel';
import { useGoals } from '../../hooks/useGoals';

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
* 2.5 TodayObjectivesList (Strategic Focus)
* Replaces CoreStreaksList in Reality Mode
*/
export const TodayObjectivesList = ({ habits = [], isLoadingHabits = false, toggleHabitCheck }) => {
    const navigate = useNavigate();
    const now = new Date();
    
    const CORE_REDIRECTS = {
        'planner': '/dashboard/planner',
        'finance': '/dashboard/finance',
        'journal': '/dashboard/journal',
        'workout': '/dashboard/health'
    };
    const [activeTab, setActiveTab] = useState('habits'); // 'habits' | 'objectives'
    
    // ISO Week Calculation consistent with GoalSetter
    const getISOWeek = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };
 
    const filters = useMemo(() => ({
        period: 'weekly',
        year: now.getFullYear(),
        week: getISOWeek(now)
    }), []);
 
    const { goals, toggleGoal, isLoading: isLoadingGoals } = useGoals(filters);

    const todayIso = now.toISOString().split('T')[0];

    return (
        <DashboardPanel 
            title={activeTab === 'objectives' ? "Today's Objectives" : "Daily Habits"} 
            subtitle={activeTab === 'objectives' ? "Strategic Focus" : "Behavioral Sync"}
            icon={activeTab === 'objectives' ? Target : Activity}
            indicatorColor={activeTab === 'objectives' ? "primary" : "emerald"}
        >
            <div className="flex flex-col gap-4 py-2">
                {/* Toggle Switch */}
                <div className="flex bg-slate-100 dark:bg-white/[0.03] p-1 rounded-2xl w-full">
                    {['habits', 'objectives'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all
                                ${activeTab === tab 
                                    ? 'bg-white dark:bg-[#121212] text-primary shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="space-y-3 min-h-[200px]">
                    {activeTab === 'objectives' ? (
                        isLoadingGoals ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-3 animate-pulse">
                                <div className="size-8 rounded-full bg-slate-100 dark:bg-white/5" />
                                <div className="h-2 w-24 bg-slate-100 dark:bg-white/5 rounded" />
                            </div>
                        ) : goals.length > 0 ? (
                            goals.map((goal) => (
                                <motion.div 
                                    key={goal._id} 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => toggleGoal(goal._id)}
                                    className={`group flex items-center gap-4 p-5 rounded-[2rem] border transition-all duration-300 cursor-pointer
                                        ${goal.completed 
                                            ? 'bg-slate-50/50 dark:bg-white/5 border-transparent opacity-50' 
                                            : 'bg-white dark:bg-white/[0.03] border-cyan-500/20 dark:border-white/10 hover:border-primary/50'}`}
                                >
                                    <div className={`size-10 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all
                                        ${goal.completed 
                                            ? 'bg-primary border-primary text-white' 
                                            : 'border-slate-200 dark:border-white/10 group-hover:border-primary/50'}`}
                                    >
                                        {goal.completed && <CheckCircle2 size={16} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-black uppercase tracking-tight truncate transition-all
                                            ${goal.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                                            {goal.title}
                                        </h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            {goal.completed ? 'Objective Secured' : 'Active Priority'}
                                        </p>
                                    </div>
                                    <Zap size={14} className={`${goal.completed ? 'text-slate-300' : 'text-primary opacity-0 group-hover:opacity-100'} transition-all`} />
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem] flex flex-col items-center gap-3">
                                <Target size={32} className="text-slate-200 dark:text-white/5" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">No missions defined for this period.</p>
                            </div>
                        )
                    ) : (
                        isLoadingHabits ? (
                             <div className="py-20 flex flex-col items-center justify-center gap-3 animate-pulse">
                                <div className="size-8 rounded-full bg-slate-100 dark:bg-white/5" />
                                <div className="h-2 w-24 bg-slate-100 dark:bg-white/5 rounded" />
                            </div>
                        ) : habits.length > 0 ? (
                            habits.map((habit) => {
                                const isCompleted = habit.checks?.some(c => c.date === todayIso && c.completed);
                                const isSystemHabit = !!habit.systemId;
                                
                                return (
                                    <motion.div 
                                        key={habit._id} 
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={() => {
                                            if (isSystemHabit) {
                                                const path = CORE_REDIRECTS[habit.systemId];
                                                if (path) navigate(path);
                                            } else {
                                                toggleHabitCheck(habit._id, todayIso);
                                            }
                                        }}
                                        className={`group flex items-center gap-4 p-5 rounded-[2rem] border transition-all duration-300 cursor-pointer
                                            ${isCompleted 
                                                ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-transparent opacity-60' 
                                                : isSystemHabit
                                                    ? 'bg-slate-50 dark:bg-white/[0.03] border-cyan-500/20 dark:border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/[0.02]'
                                                    : 'bg-white dark:bg-white/[0.03] border-emerald-500/10 dark:border-white/10 hover:border-emerald-500/50'}`}
                                    >
                                        <div className={`size-10 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all
                                            ${isCompleted 
                                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                                : isSystemHabit
                                                    ? 'border-cyan-500/30 dark:border-white/10 group-hover:border-cyan-500 shadow-[inset_0_0_10px_rgba(6,182,212,0.05)]'
                                                    : 'border-slate-200 dark:border-white/10 group-hover:border-emerald-500/50'}`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 size={16} />
                                            ) : isSystemHabit ? (
                                                <span className="material-symbols-outlined text-lg text-cyan-500">{habit.icon}</span>
                                            ) : null}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className={`text-sm font-black uppercase tracking-tight truncate transition-all flex items-center gap-1.5
                                                    ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                                                    {habit.name}
                                                    {isSystemHabit && !isCompleted && (
                                                        <ArrowUpRight size={10} className="text-cyan-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </h4>
                                                {!isCompleted && !isSystemHabit && habit.streak > 0 && (
                                                    <span className="text-[11px] font-black text-emerald-500 italic font-exo">
                                                        {habit.streak}d
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                {isCompleted 
                                                    ? 'Habit Stabilized' 
                                                    : isSystemHabit 
                                                        ? 'Portal Active • Auto-Sync' 
                                                        : 'Daily Requirement'}
                                            </p>
                                        </div>
                                        {isSystemHabit ? (
                                            <Zap size={14} className={`${isCompleted ? 'text-emerald-500' : 'text-cyan-500 opacity-20 group-hover:opacity-100 animate-pulse'} transition-all`} />
                                        ) : (
                                            <Flame size={14} className={`${isCompleted ? 'text-emerald-500' : 'text-slate-300 opacity-0 group-hover:opacity-100'} transition-all`} />
                                        )}
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem] flex flex-col items-center gap-3">
                                <Activity size={32} className="text-slate-200 dark:text-white/5" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">No active habits found.</p>
                            </div>
                        )
                    )}
                </div>
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
