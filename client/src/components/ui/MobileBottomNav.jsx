import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardContext } from '../../context/DashboardContext';

const MobileBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { protocolMode, activeRpgTab, setActiveRpgTab, setIsToolsStoreModalOpen, mobileTabs } = useContext(DashboardContext);

    const realityPillars = [
        { id: 'home', name: 'Home', path: '/dashboard', icon: 'home', isSpecial: true },
        { id: 'habits', name: 'Habits', path: '/dashboard/intellectual', icon: 'task_alt' },
        { id: 'planner', name: 'Planner', path: '/dashboard/intellectual', icon: 'calendar_today' },
        { id: 'goals', name: 'Goal Setter', path: '/dashboard/intellectual', icon: 'flag' },
        { id: 'calendar', name: 'Calendar', path: '/dashboard/intellectual', icon: 'event' },
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

        if (tabIdMap[pillar.id]) {
            const currentTab = mobileTabs?.activeTab || location.state?.activeTab;
            return location.pathname.startsWith(pillar.path) && currentTab === tabIdMap[pillar.id];
        }

        return location.pathname.startsWith(pillar.path);
    };

    const handleNav = (pillar) => {
        if (protocolMode === 'rpg' && pillar.id !== 'home') {
            if (location.pathname !== '/dashboard') {
                navigate('/dashboard', { replace: true });
            }
            setActiveRpgTab(pillar.id);
        } else {
            if (pillar.id === 'more') {
                setIsToolsStoreModalOpen(true);
                return;
            }

            // Direct Tab Switching for Productivity Tools
            const tabIdMap = {
                habits: 'tracker',
                planner: 'planner',
                calendar: 'calendar',
                goals: 'goals'
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
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[150] pointer-events-none">
            <nav className="w-full h-18 bg-white dark:bg-black shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex items-center justify-around px-4 pointer-events-auto relative rounded-t-[2.5rem]">
                {/* Tactical Chipped Border - Fine Line */}
                <div 
                    className="absolute inset-0 border-t-2 border-black dark:border-white/20 rounded-t-[2.5rem] pointer-events-none"
                    style={{ 
                        clipPath: 'polygon(0% 0%, 5% 0%, 7% 100%, 12% 100%, 14% 0%, 30% 0%, 32% 100%, 36% 100%, 38% 0%, 45% 0%, 47% 100%, 51% 100%, 53% 0%, 65% 0%, 67% 100%, 71% 100%, 73% 0%, 85% 0%, 87% 100%, 92% 100%, 94% 0%, 100% 0%, 100% 100%, 0% 100%)' 
                    }} 
                />
                
                {pillars.map((pillar) => {
                    const active = isActive(pillar);
                    
                    if (pillar.isSpecial) {
                        return (
                            <button
                                key={pillar.id}
                                onClick={() => handleNav(pillar)}
                                className="relative -top-5 flex flex-col items-center justify-center transition-all duration-300 z-20"
                            >
                                <div className={`size-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                                    active 
                                    ? 'bg-black dark:bg-white shadow-xl' 
                                    : 'bg-white dark:bg-black border-2 border-black dark:border-white/20 shadow-lg'
                                }`}>
                                    <span className={`material-symbols-outlined text-[40px] ${
                                        active ? 'text-white dark:text-black' : 'text-black dark:text-white'
                                    }`}>
                                        {pillar.icon}
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
    );
};

export default MobileBottomNav;
