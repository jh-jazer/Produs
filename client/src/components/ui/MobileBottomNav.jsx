import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardContext } from '../../context/DashboardContext';

const MobileBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { protocolMode, activeRpgTab, setActiveRpgTab } = useContext(DashboardContext);

    const realityPillars = [
        { id: 'financial', name: 'Financial', path: '/dashboard/financial', icon: 'payments' },
        { id: 'intellectual', name: 'Intellectual', path: '/dashboard/intellectual', icon: 'psychology' },
        { id: 'home', name: 'Home', path: '/dashboard', icon: 'home', isSpecial: true },
        { id: 'physical', name: 'Physical', path: '/dashboard/physical', icon: 'monitor_heart' },
        { id: 'spiritual', name: 'Spiritual', path: '/dashboard/spiritual', icon: 'auto_awesome' },
    ];

    const rpgPillars = [
        { id: 'tower', name: 'Tower', path: '/dashboard', icon: 'castle' },
        { id: 'items', name: 'Items', path: '/dashboard', icon: 'inventory_2' },
        { id: 'home', name: 'Home', path: '/dashboard', icon: 'home', isSpecial: true },
        { id: 'skills', name: 'Skills', path: '/dashboard', icon: 'model_training' },
        { id: 'roam', name: 'Roam', path: '/dashboard', icon: 'explore' },
    ];

    const pillars = protocolMode === 'rpg' ? rpgPillars : realityPillars;

    const isActive = (pillar) => {
        if (pillar.id === 'home') {
            return location.pathname === '/dashboard' && (protocolMode !== 'rpg' || activeRpgTab === 'home');
        }
        if (protocolMode === 'rpg') {
            return activeRpgTab === pillar.id;
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
            navigate(pillar.path, { replace: true });
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
                    className="absolute inset-0 border-t-2 border-black/10 dark:border-white/20 rounded-t-[2.5rem] pointer-events-none"
                    style={{ 
                        clipPath: 'polygon(0% 0%, 15% 0%, 17% 100%, 19% 0%, 45% 0%, 47% 100%, 49% 0%, 78% 0%, 80% 100%, 82% 0%, 100% 0%, 100% 100%, 0% 100%)' 
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
                                    : 'bg-white dark:bg-black border-2 border-black/10 dark:border-white/20 shadow-lg'
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
                                active ? 'text-black dark:text-white' : 'text-black/40 dark:text-white/40'
                            }`}
                        >
                            <div className="relative flex items-center justify-center">
                                <span className={`material-symbols-outlined transition-all duration-300 text-[22px] ${
                                    active ? 'scale-110' : ''
                                }`}>
                                    {pillar.icon}
                                </span>
                            </div>

                            {active && (
                                <motion.div 
                                    layoutId="nav-dot"
                                    className="absolute -bottom-2 size-1 bg-black dark:bg-white rounded-full"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default MobileBottomNav;
