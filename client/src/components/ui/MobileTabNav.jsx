import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileTabNav = ({ tabs, activeTab, setActiveTab, variant = 'floating' }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const isHeader = variant === 'header';

    useEffect(() => {
        if (isHeader) return; // Header tabs don't hide on scroll

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
    }, [lastScrollY, isHeader]);

    const content = (
        <div className={`flex items-center gap-1 bg-white dark:bg-black p-1 rounded-2xl border border-black/[0.1] dark:border-white/10 ${!isHeader ? 'shadow-[0_20px_50px_rgba(0,0,0,0.4)]' : ''}`}>
            {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            window.scrollTo(0, 0);
                            setTimeout(() => {
                                window.scrollTo(0, 0);
                                // Reset all nested scrollable panels (e.g. Schedule/Tracker histories)
                                document.querySelectorAll('.overflow-y-auto').forEach(el => {
                                    el.scrollTop = 0;
                                });
                            }, 10);
                        }}
                        className={`relative flex items-center justify-center rounded-xl transition-all duration-300 ${isHeader ? 'size-9' : 'size-12'} ${
                            activeTab === tab.id
                                ? 'text-white dark:text-black'
                                : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'
                        }`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="active-tab-bg"
                                className="absolute inset-0 bg-black dark:bg-white rounded-xl shadow-lg"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <div className="relative z-10">
                            {typeof Icon === 'string' ? (
                                <span className={`material-symbols-outlined ${isHeader ? 'text-lg' : 'text-2xl'}`}>{Icon}</span>
                            ) : (
                                <Icon size={isHeader ? 16 : 22} strokeWidth={2.5} />
                            )}
                        </div>
                        
                        {/* Tooltip-like label appearing on active */}
                        {!isHeader && (
                            <AnimatePresence>
                                {activeTab === tab.id && (
                                    <motion.span
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-[9px] font-semibold uppercase tracking-[0.3em] rounded-lg shadow-xl pointer-events-none whitespace-nowrap border border-black/10 dark:border-white/10"
                                    >
                                        {tab.label}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black dark:border-t-white" />
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        )}
                    </button>
                );
            })}
        </div>
    );

    if (isHeader) return content;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="fixed bottom-26 left-1/2 -translate-x-1/2 z-40 lg:hidden"
                >
                    {content}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MobileTabNav;
