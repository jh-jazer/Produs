import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileTabNav = ({ tabs, activeTab, setActiveTab }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Show if scrolling up OR at the very top
            if (currentScrollY < lastScrollY || currentScrollY < 10) {
                setIsVisible(true);
            } 
            // Hide if scrolling down and passed a threshold
            else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] lg:hidden"
                >
                    <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl shadow-black/10">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className={`relative flex items-center justify-center size-12 rounded-xl transition-all duration-300 ${
                                        activeTab === tab.id
                                            ? 'text-white'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="active-tab-bg"
                                            className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/30"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <div className="relative z-10">
                                        {typeof Icon === 'string' ? (
                                            <span className="material-symbols-outlined text-2xl">{Icon}</span>
                                        ) : (
                                            <Icon size={22} strokeWidth={2.5} />
                                        )}
                                    </div>
                                    
                                    {/* Tooltip-like label appearing on active */}
                                    <AnimatePresence>
                                        {activeTab === tab.id && (
                                            <motion.span
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl pointer-events-none whitespace-nowrap"
                                            >
                                                {tab.label}
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MobileTabNav;
