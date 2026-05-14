import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardContext } from '../../context/DashboardContext';

const MobileBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { protocolMode, activeRpgTab, setActiveRpgTab, setIsToolsStoreModalOpen, mobileTabs } = useContext(DashboardContext);
    const [clickRipples, setClickRipples] = useState([]);
    const [showActionDot, setShowActionDot] = useState(false);
    const [showWriteMenu, setShowWriteMenu] = useState(false);

    const realityPillars = [
        { id: 'home', name: 'Home', path: '/dashboard', icon: 'home', isSpecial: true },
        { id: 'habits', name: 'Habits', path: '/dashboard/habits', icon: 'task_alt' },
        { id: 'planner', name: 'Planner', path: '/dashboard/planner', icon: 'calendar_today' },
        { id: 'calendar', name: 'Calendar', path: '/dashboard/calendar', icon: 'event' },
        { id: 'spiritual', name: 'Write', path: '/dashboard/spiritual', icon: 'edit' },
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

        if (pillar.id === 'spiritual') {
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
            setShowWriteMenu(false);
            return;
        }

        if (protocolMode === 'rpg' && pillar.id !== 'home') {
            if (location.pathname !== '/dashboard') {
                navigate('/dashboard', { replace: true });
            }
            setActiveRpgTab(pillar.id);
            setShowActionDot(false);
            setShowWriteMenu(false);
        } else {
            if (pillar.id === 'more') {
                setIsToolsStoreModalOpen(true);
                setShowActionDot(false);
                setShowWriteMenu(false);
                return;
            }

            if (pillar.id === 'spiritual') {
                if (isActive(pillar)) {
                    if (showWriteMenu) {
                        setShowWriteMenu(false);
                        return;
                    } else {
                        setShowWriteMenu(true);
                        setShowActionDot(false);
                        return;
                    }
                } else {
                    setShowWriteMenu(false);
                    setShowActionDot(false);
                }
            } else {
                setShowActionDot(false);
                setShowWriteMenu(false);
            }

            // Direct Tab Switching for Productivity Tools
            const tabIdMap = {
                habits: 'tracker',
                planner: 'planner',
                calendar: 'calendar',
                goals: 'goals',
                spiritual: 'journal'
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
                {(showActionDot || showWriteMenu) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setShowActionDot(false);
                            setShowWriteMenu(false);
                        }}
                        className="md:hidden fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-md z-[140] pointer-events-auto transition-all"
                    />
                )}
            </AnimatePresence>

            <div className="md:hidden fixed bottom-0 left-0 right-0 z-[150] pointer-events-none">
                <nav className="w-full h-24 bg-white dark:bg-black shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex items-center justify-around px-4 pb-4 pointer-events-auto relative rounded-t-[2.5rem]">
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
                                    {showActionDot && active && [
                                        {
                                            id: 'journal',
                                            label: 'Add Journal',
                                            icon: 'auto_stories',
                                            path: '/dashboard/spiritual',
                                            state: { activeTab: 'journal', openWriteJournal: true },
                                            x: -15,
                                            y: -215,
                                            delay: 0.12
                                        },
                                        {
                                            id: 'transaction',
                                            label: 'Add Transaction',
                                            icon: 'payments',
                                            path: '/dashboard/financial',
                                            state: { activeTab: 'summary', openAddTransaction: true },
                                            x: -15,
                                            y: -145,
                                            delay: 0.06
                                        },
                                        {
                                            id: 'note',
                                            label: 'Add Note',
                                            icon: 'edit_note',
                                            path: '/dashboard/planner',
                                            state: { activeTab: 'planner' },
                                            x: -15,
                                            y: -75,
                                            delay: 0
                                        }
                                    ].map((bubble) => (
                                        <motion.div
                                            key={bubble.id}
                                            initial={{ opacity: 0, x: 0, y: 0, scale: 0.2 }}
                                            animate={{ opacity: 1, x: bubble.x, y: bubble.y, scale: 1 }}
                                            exit={{ opacity: 0, x: 0, y: 0, scale: 0.2 }}
                                            transition={{ type: "spring", stiffness: 420, damping: 18, delay: bubble.delay }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowActionDot(false);
                                                navigate(bubble.path, { state: bubble.state });
                                            }}
                                            className="absolute m-auto size-16 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center z-40 border-2 border-white/20 dark:border-black/20 cursor-pointer pointer-events-auto active:scale-90 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-[26px]">
                                                {bubble.icon}
                                            </span>
                                            <span 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowActionDot(false);
                                                    navigate(bubble.path, { state: bubble.state });
                                                }}
                                                className="absolute left-[44px] whitespace-nowrap text-[12px] font-extrabold uppercase tracking-widest text-black dark:text-white pointer-events-auto cursor-pointer transition-all drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                                            >
                                                {bubble.label}
                                            </span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

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
                                    (active || (pillar.id === 'spiritual' && showWriteMenu)) ? 'scale-110' : ''
                                }`}>
                                    {pillar.id === 'spiritual' && showWriteMenu ? 'close' : pillar.icon}
                                </span>
                            </div>

                            {/* Menu Bubbles for Write icon */}
                            {pillar.id === 'spiritual' && (
                                <AnimatePresence>
                                    {showWriteMenu && [
                                        {
                                            id: 'journal',
                                            label: 'Journal',
                                            icon: 'auto_stories',
                                            path: '/dashboard/spiritual',
                                            state: { activeTab: 'journal' }
                                        },
                                        {
                                            id: 'notes',
                                            label: 'Notes',
                                            icon: 'edit_note',
                                            path: '/dashboard/spiritual',
                                            state: { activeTab: 'notes' }
                                        },
                                        {
                                            id: 'lists',
                                            label: 'Lists',
                                            icon: 'checklist',
                                            path: '/dashboard/spiritual',
                                            state: { activeTab: 'lists' }
                                        }
                                    ]
                                    .filter(b => b.id !== (location.pathname.startsWith('/dashboard/spiritual') ? (mobileTabs?.activeTab || location.state?.activeTab || 'journal') : null))
                                    .reverse()
                                    .map((bubble, idx) => (
                                        <motion.div
                                            key={bubble.id}
                                            initial={{ opacity: 0, x: 0, y: 0, scale: 0.2 }}
                                            animate={{ opacity: 1, x: 0, y: -80 - (idx * 60), scale: 1 }}
                                            exit={{ opacity: 0, x: 0, y: 0, scale: 0.2 }}
                                            transition={{ type: "spring", stiffness: 420, damping: 18, delay: idx * 0.06 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowWriteMenu(false);
                                                if (mobileTabs) {
                                                    mobileTabs.setActiveTab(bubble.state.activeTab);
                                                }
                                                navigate(bubble.path, { state: bubble.state, replace: true });
                                            }}
                                            className="absolute m-auto size-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center z-40 border border-white/20 dark:border-black/20 cursor-pointer pointer-events-auto active:scale-90 transition-all shadow-lg shadow-black/20 dark:shadow-white/10"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                {bubble.icon}
                                            </span>
                                            <span 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowWriteMenu(false);
                                                    if (mobileTabs) {
                                                        mobileTabs.setActiveTab(bubble.state.activeTab);
                                                    }
                                                    navigate(bubble.path, { state: bubble.state, replace: true });
                                                }}
                                                className="absolute right-[60px] whitespace-nowrap text-[11px] font-extrabold uppercase tracking-widest text-black dark:text-white pointer-events-auto cursor-pointer transition-all drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                                            >
                                                {bubble.label}
                                            </span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}

                        </button>
                    );
                })}
            </nav>
        </div>
        </>
    );
};

export default MobileBottomNav;
