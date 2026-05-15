import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardContext } from '../../context/DashboardContext';

const MobileBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { protocolMode, activeRpgTab, setActiveRpgTab, setIsToolsStoreModalOpen, setIsAddGoalModalOpen, setIsAddEventModalOpen, setIsAddTransactionModalOpen, mobileTabs } = useContext(DashboardContext);
    const [clickRipples, setClickRipples] = useState([]);
    const [showActionDot, setShowActionDot] = useState(false);

    const realityPillars = [
        { id: 'home', name: 'Home', path: '/dashboard', icon: 'home', isSpecial: true },
        { id: 'habits', name: 'Habits', path: '/dashboard/habits', icon: 'task_alt' },
        { id: 'planner', name: 'Planner', path: '/dashboard/planner', icon: 'calendar_today' },
        { id: 'calendar', name: 'Calendar', path: '/dashboard/calendar', icon: 'event' },
        { id: 'writing', name: 'Write', path: '/dashboard/writing', icon: 'edit' },
        { id: 'more', name: 'More', path: '/dashboard/profile', icon: 'more_horiz' },
    ];

    const rpgPillars = [
        { id: 'home', name: 'Home', path: '/dashboard', icon: 'home', isSpecial: true },
        { id: 'tower', name: 'Tower', path: '/dashboard', icon: 'castle' },
        { id: 'items', name: 'Items', path: '/dashboard', icon: 'inventory_2' },
        { id: 'skills', name: 'Skills', path: '/dashboard', icon: 'model_training' },
        { id: 'roam', name: 'Roam', path: '/dashboard', icon: 'explore' },
        { id: 'more', name: 'More', path: '/dashboard/profile', icon: 'more_horiz' },
    ];

    const pillars = protocolMode === 'rpg' ? rpgPillars : realityPillars;

    const ACTION_BUBBLES = [
        { id: 'goal', label: 'Goal', icon: 'sports_score', path: '/dashboard/planner', state: { activeTab: 'planner', openAddGoal: true } },
        { id: 'journal', label: 'Journal', icon: 'auto_stories', path: '/dashboard/writing', state: { activeTab: 'journal', openWriteJournal: true } },
        { id: 'event', label: 'Event', icon: 'event', path: '/dashboard/calendar', state: { activeTab: 'calendar', openAddEvent: true } },
        { id: 'note', label: 'Note', icon: 'edit_note', path: '/dashboard/writing', state: { activeTab: 'notes', openAddNote: true } },
        { id: 'transaction', label: 'Transaction', icon: 'payments', path: '/dashboard/financial', state: { activeTab: 'summary', openAddTransaction: true } },
        { id: 'list', label: 'List', icon: 'checklist', path: '/dashboard/writing', state: { activeTab: 'lists', openAddList: true } },
    ];

    const isActive = (pillar) => {
        if (pillar.id === 'home') {
            return location.pathname === '/dashboard' && (protocolMode !== 'rpg' || activeRpgTab === 'home');
        }
        if (protocolMode === 'rpg') {
            return activeRpgTab === pillar.id;
        }

        // Productivity Tool Specific Active State
        const tabIdMap = {
            habits: 'tracker',
            planner: 'planner',
            calendar: 'calendar',
            goals: 'goals'
        };

        if (pillar.id === 'writing') {
            return location.pathname.startsWith(pillar.path);
        }

        if (tabIdMap[pillar.id]) {
            const currentTab = mobileTabs?.activeTab || location.state?.activeTab;
            return location.pathname.startsWith(pillar.path) && currentTab === tabIdMap[pillar.id];
        }

        return location.pathname.startsWith(pillar.path);
    };

    const handleNav = (pillar) => {
        if (pillar.id === 'home' && isActive(pillar)) {
            const newRipple = Date.now();
            setClickRipples(prev => [...prev, newRipple]);
            setTimeout(() => {
                setClickRipples(prev => prev.filter(id => id !== newRipple));
            }, 600);

            setShowActionDot(prev => !prev);
            return;
        }

        if (protocolMode === 'rpg' && pillar.id !== 'home') {
            if (location.pathname !== '/dashboard') {
                navigate('/dashboard', { replace: true });
            }
            setActiveRpgTab(pillar.id);
            setShowActionDot(false);
        } else {
            if (pillar.id === 'more') {
                setIsToolsStoreModalOpen(true);
                setShowActionDot(false);
                return;
            }

            setShowActionDot(false);

            // Direct Tab Switching for Productivity Tools
            const tabIdMap = {
                habits: 'tracker',
                planner: 'planner',
                calendar: 'calendar',
                goals: 'goals',
                writing: 'hub'
            };

            const targetTab = tabIdMap[pillar.id];

            if (targetTab && mobileTabs) {
                mobileTabs.setActiveTab(targetTab);
                if (location.pathname !== pillar.path) {
                    navigate(pillar.path, { replace: true, state: { activeTab: targetTab } });
                }
                return;
            }

            navigate(pillar.path, { replace: true, state: { activeTab: targetTab } });
            
            if (protocolMode === 'rpg' && pillar.id === 'home') {
                setActiveRpgTab('home');
            }
        }
    };

    return (
        <>
            {/* Global Backdrop Overlay */}
            <AnimatePresence>
                {showActionDot && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowActionDot(false)}
                        className="md:hidden fixed inset-0 bg-white/40 dark:bg-black/60 backdrop-blur-xl z-[140] pointer-events-auto transition-all"
                    />
                )}
            </AnimatePresence>

            {/* Global Action Menu */}
            <AnimatePresence>
                {showActionDot && (
                    <div className="md:hidden fixed inset-0 z-[160] flex flex-col items-center justify-center pointer-events-none p-8">
                        <div className="grid grid-cols-2 gap-6 pointer-events-auto">
                            {ACTION_BUBBLES.map((bubble, index) => (
                                <motion.button
                                    key={bubble.id}
                                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: index * 0.05 }}
                                    onClick={() => {
                                        setShowActionDot(false);
                                        if (bubble.id === 'goal') {
                                            setIsAddGoalModalOpen(true);
                                        } else if (bubble.id === 'event') {
                                            setIsAddEventModalOpen(true);
                                        } else if (bubble.id === 'transaction') {
                                            setIsAddTransactionModalOpen(true);
                                        } else {
                                            navigate(bubble.path, { state: bubble.state });
                                        }
                                    }}
                                    className="flex flex-col items-center gap-3 group"
                                >
                                    <div className="size-20 rounded-3xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-2xl shadow-black/20 group-active:scale-90 transition-all border border-white/10 dark:border-black/5">
                                        <span className="material-symbols-outlined text-[32px]">
                                            {bubble.icon}
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black dark:text-white opacity-40 group-hover:opacity-100 transition-opacity">
                                        {bubble.label}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <div className="md:hidden fixed inset-0 z-[150] pointer-events-none overflow-visible flex flex-col justify-end">
                <nav className="w-full h-24 bg-white dark:bg-black shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex items-center justify-around px-4 pb-4 pointer-events-auto relative rounded-t-[2.5rem] overflow-visible">
                <div className="absolute inset-0 border-t-4 border-black dark:border-white/20 rounded-t-[2.5rem] pointer-events-none" />
                
                {pillars.map((pillar) => {
                    const active = isActive(pillar);
                    
                    if (pillar.isSpecial) {
                        return (
                            <button
                                key={pillar.id}
                                onClick={() => handleNav(pillar)}
                                className="relative -top-6 mx-4 flex flex-col items-center justify-center transition-all duration-300 z-20"
                            >
                                <AnimatePresence>
                                    {clickRipples.map(id => (
                                        <motion.div
                                            key={id}
                                            initial={{ opacity: 0.8, scale: 0.9 }}
                                            animate={{ opacity: 0, scale: 1.8 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                            className="absolute inset-0 m-auto w-24 h-24 rounded-full border-2 border-black dark:border-white pointer-events-none z-10"
                                        />
                                    ))}
                                </AnimatePresence>

                                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 relative z-20 ${
                                    active 
                                    ? 'bg-black dark:bg-white shadow-xl' 
                                    : 'bg-white dark:bg-black border-2 border-black dark:border-white/20 shadow-lg'
                                }`}>
                                    <span className={`material-symbols-outlined text-[46px] ${
                                        active ? 'text-white dark:text-black animate-fade-in-up' : 'text-black dark:text-white'
                                    }`}>
                                        {active ? (showActionDot ? 'close' : 'add') : pillar.icon}
                                    </span>
                                </div>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={pillar.id}
                            onClick={() => handleNav(pillar)}
                            className={`relative flex flex-col items-center justify-center transition-all duration-300 flex-1 ${
                                active ? 'text-black dark:text-white' : 'text-black dark:text-white/40'
                            }`}
                        >
                            <div className="relative flex items-center justify-center">
                                <span className={`material-symbols-outlined transition-all duration-300 text-[22px] ${
                                    active ? 'scale-110' : ''
                                }`}>
                                    {pillar.icon}
                                </span>
                            </div>

                        </button>
                    );
                })}
            </nav>
        </div>
        </>
    );
};

export default MobileBottomNav;
