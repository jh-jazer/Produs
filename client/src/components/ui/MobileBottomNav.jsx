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
        { id: 'physical', name: 'Physical', path: '/dashboard/physical', icon: 'monitor_heart' },
        { id: 'spiritual', name: 'Spiritual', path: '/dashboard/spiritual', icon: 'auto_awesome' },
        { id: 'home', name: 'Home', path: '/dashboard', icon: 'home', isSpecial: true },
    ];

    const rpgPillars = [
        { id: 'tower', name: 'Tower', path: '/dashboard', icon: 'castle' },
        { id: 'items', name: 'Items', path: '/dashboard', icon: 'inventory_2' },
        { id: 'skills', name: 'Skills', path: '/dashboard', icon: 'model_training' },
        { id: 'roam', name: 'Roam', path: '/dashboard', icon: 'explore' },
        { id: 'home', name: 'Home', path: '/dashboard', icon: 'home', isSpecial: true },
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
            <nav className="w-full h-18 bg-white/80 dark:bg-black/90 backdrop-blur-2xl rounded-t-[2.5rem] border-t border-black/[0.05] dark:border-white/[0.05] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex items-center justify-around px-4 pointer-events-auto relative">
                
                {pillars.map((pillar) => {
                    const active = isActive(pillar);
                    
                    if (pillar.isSpecial) {
                        return (
                            <button
                                key={pillar.id}
                                onClick={() => handleNav(pillar)}
                                className="relative -top-3 flex flex-col items-center justify-center transition-all duration-300 z-20"
                            >
                                <div className={`size-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                                    active 
                                    ? 'bg-primary shadow-[0_8px_20px_color-mix(in_srgb,var(--primary)_40%,transparent)]' 
                                    : 'bg-slate-900 border border-white/10 shadow-lg'
                                }`}>
                                    <span className="material-symbols-outlined text-white text-[32px]">
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
                                active ? 'text-primary' : 'text-slate-400 dark:text-slate-500'
                            }`}
                        >
                            <div className="relative flex items-center justify-center">
                                <span className={`material-symbols-outlined transition-all duration-300 text-[22px] ${
                                    active ? 'scale-110 drop-shadow-[0_0_8px_var(--primary-glow)]' : ''
                                }`}>
                                    {pillar.icon}
                                </span>
                            </div>

                            <span className={`text-[7px] font-black uppercase tracking-[0.15em] mt-1 transition-all duration-300 ${
                                active ? 'opacity-100' : 'opacity-60'
                            }`}>
                                {pillar.name}
                            </span>

                            {active && (
                                <motion.div 
                                    layoutId="nav-dot"
                                    className="absolute -bottom-2 size-1 bg-primary rounded-full"
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
