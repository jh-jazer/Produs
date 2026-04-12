import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const MobileBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const pillars = [
        { id: 'finance', name: 'Financial', path: '/dashboard/financial', icon: 'payments' },
        { id: 'intellectual', name: 'Intellectual', path: '/dashboard/intellectual', icon: 'psychology' },
        { id: 'home', name: 'Home', path: '/dashboard', icon: 'home', isCenter: true },
        { id: 'physical', name: 'Physical', path: '/dashboard/physical', icon: 'monitor_heart' },
        { id: 'spiritual', name: 'Spiritual', path: '/dashboard/spiritual', icon: 'auto_awesome' },
    ];

    const isActive = (path) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[150] pointer-events-none">
            <nav className="w-full h-18 bg-white/80 dark:bg-black/90 backdrop-blur-2xl rounded-t-[2.5rem] border-t border-black/[0.05] dark:border-white/[0.05] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex items-center justify-around px-4 pointer-events-auto relative">
                
                {pillars.map((pillar) => {
                    const active = isActive(pillar.path);
                    
                    if (pillar.isCenter) {
                        return (
                            <button
                                key={pillar.id}
                                onClick={() => navigate(pillar.path, { replace: true })}
                                className="relative -top-5 flex flex-col items-center justify-center transition-all duration-300 z-20"
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
                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] mt-2 transition-all ${
                                    active ? 'text-primary opacity-100' : 'text-slate-400 dark:text-slate-500 opacity-60'
                                }`}>
                                    {pillar.name}
                                </span>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={pillar.id}
                            onClick={() => navigate(pillar.path, { replace: true })}
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
