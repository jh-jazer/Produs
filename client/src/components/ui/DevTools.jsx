import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

const DevTools = () => {
    const { user, syncUser } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(null);
    const [view, setView] = useState('main'); // main, exp, stats, points
    const [selectedStat, setSelectedStat] = useState(null);

    const [isTucked, setIsTucked] = useState(false);

    if (!user || (user.email !== 'ernestodesabillejr@gmail.com' && !user.isAdmin) || !user.settings?.showDevTools) return null;

    const handleAction = async (action, stat = null, amount = null) => {
        setLoading(stat ? `${action}-${stat}` : action);
        try {
            const { data } = await api.post('/auth/dev/rpg-test', { action, stat, amount });
            syncUser(data);
            
            if (action === 'resetOnboarding') {
                window.location.reload(); 
            }
        } catch (error) {
            console.error(`Dev action ${action} failed:`, error);
        } finally {
            setLoading(null);
            setView('main');
            setSelectedStat(null);
        }
    };

    const stats = [
        { id: 'STR', icon: 'fitness_center', color: 'text-red-500' },
        { id: 'DEX', icon: 'bolt', color: 'text-yellow-500' },
        { id: 'END', icon: 'local_fire_department', color: 'text-orange-500' },
        { id: 'INT', icon: 'psychology', color: 'text-blue-500' },
        { id: 'WIS', icon: 'auto_awesome', color: 'text-purple-500' },
        { id: 'CHA', icon: 'auto_fix_high', color: 'text-pink-500' },
        { id: 'ALL', icon: 'all_inclusive', color: 'text-slate-400' },
    ];

    const expMagnitudes = [10, 100, 1000];
    const pointMagnitudes = [1, 3, 5, 10, 50];

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[9998]" 
                    onClick={() => setIsOpen(false)}
                />
            )}
            <motion.div 
                animate={{ 
                    x: isTucked ? 48 : 0,
                    opacity: isTucked ? 0.4 : 1
                }}
                whileHover={{ opacity: 1, x: isTucked ? 40 : 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3"
            >
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[32px] shadow-2xl p-4 flex flex-col gap-3 min-w-[260px]"
                    >
                        <div className="px-3 py-1 mb-1 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {view === 'main' ? 'RPG Console' : view === 'exp' ? 'Select EXP Amount' : view === 'stats' ? 'Select Stat' : `Boost ${selectedStat}`}
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setIsTucked(true)}
                                    className="p-1 hover:text-cyan-500 transition-colors"
                                    title="Dock to edge"
                                >
                                    <span className="material-symbols-outlined text-xs">last_page</span>
                                </button>
                                <div className="size-2 rounded-full bg-emerald-500 self-center" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {view === 'main' && (
                                <>
                                    <button onClick={() => setView('exp')} className="group flex items-center gap-4 transition-all pr-4 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                                        <div className="size-10 rounded-full bg-black dark:bg-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                                            <span className="material-symbols-outlined text-xl text-white dark:text-black">keyboard_double_arrow_up</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">+ Add EXP</span>
                                    </button>
                                    <button onClick={() => setView('stats')} className="group flex items-center gap-4 transition-all pr-4 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                                        <div className="size-10 rounded-full bg-black dark:bg-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                                            <span className="material-symbols-outlined text-xl text-white dark:text-black">military_tech</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">+ Boost Points</span>
                                    </button>
                                    <button onClick={() => handleAction('removeDailyLimit')} className="group flex items-center gap-4 transition-all pr-4 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                                        <div className="size-10 rounded-full bg-black dark:bg-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                                            <span className="material-symbols-outlined text-xl text-white dark:text-black">lock_open</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Clear Cap</span>
                                    </button>
                                    <button onClick={() => handleAction('resetOnboarding')} className="group flex items-center gap-4 transition-all pr-4 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                                        <div className="size-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                                            <span className="material-symbols-outlined text-xl text-white">school</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Reset Onboarding</span>
                                    </button>
                                    <button onClick={() => handleAction('resetPath')} className="group flex items-center gap-4 transition-all pr-4 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                                        <div className="size-10 rounded-full bg-rose-600 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                                            <span className="material-symbols-outlined text-xl text-white">restart_alt</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Reset Path</span>
                                    </button>
                                </>
                            )}

                            {view === 'exp' && (
                                <div className="grid grid-cols-3 gap-2 py-2">
                                    {expMagnitudes.map(amt => (
                                        <button 
                                            key={amt}
                                            onClick={() => handleAction('giveXP', null, amt)}
                                            className="h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-xs font-black hover:scale-105 transition-transform"
                                        >
                                            +{amt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {view === 'stats' && (
                                <div className="grid grid-cols-4 gap-2">
                                    {stats.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => {
                                                setSelectedStat(s.id);
                                                setView('points');
                                            }}
                                            className="flex flex-col items-center gap-1 group"
                                        >
                                            <div className="size-10 rounded-full bg-black dark:bg-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                                                <span className={`material-symbols-outlined text-xl text-white dark:text-black ${s.color}`}>{s.icon}</span>
                                            </div>
                                            <span className="text-[8px] font-black text-slate-400">{s.id}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {view === 'points' && (
                                <div className="grid grid-cols-5 gap-1.5 py-2">
                                    {pointMagnitudes.map(amt => (
                                        <button 
                                            key={amt}
                                            onClick={() => handleAction('giveStats', selectedStat === 'ALL' ? null : selectedStat, amt)}
                                            className="h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[10px] font-black hover:scale-105 transition-transform"
                                        >
                                            +{amt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {view !== 'main' && (
                                <button 
                                    onClick={() => {
                                        if (view === 'points') setView('stats');
                                        else setView('main');
                                    }}
                                    className="w-full mt-2 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    Back
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <button
                onClick={() => {
                    if (isTucked) {
                        setIsTucked(false);
                    } else {
                        setIsOpen(!isOpen);
                    }
                }}
                className={`size-14 rounded-full flex items-center justify-center shadow-xl transition-all ${
                    isOpen ? 'bg-black dark:bg-white text-white dark:text-black rotate-90' : 'bg-black dark:bg-white text-white dark:text-black scale-110'
                } ${isTucked ? 'rounded-r-none pr-3' : ''}`}
            >
                <span className="material-symbols-outlined font-black text-2xl">
                    {isTucked ? 'chevron_left' : (isOpen ? 'close' : 'terminal')}
                </span>
            </button>
            </motion.div>
        </>
    );
};

export default DevTools;
