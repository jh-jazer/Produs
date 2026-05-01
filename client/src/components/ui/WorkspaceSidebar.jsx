import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * WorkspaceSidebar - A reusable tactical navigation sidebar with interactive expansion.
 * 
 * @param {Array} tabs - Array of tab objects { id, label, icon }
 * @param {string} activeTab - Currently active tab ID
 * @param {function} setActiveTab - State setter for active tab
 * @param {string} namespace - Unique string for Framer Motion layoutIds (e.g. 'Intellectual')
 */
const WorkspaceSidebar = ({ tabs, activeTab, setActiveTab, namespace }) => {
    const [hoveredTab, setHoveredTab] = useState(null);

    return (
        <div className="sticky top-0 md:top-8 z-[100] -mx-8 md:mx-0 px-8 md:px-0 pt-6 pb-0 md:py-0 bg-black/40 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-b md:border-b-0 md:border-r border-white/5 mb-2 md:mb-0 md:w-16 shrink-0 h-fit">
            <div className="flex flex-nowrap md:flex-col items-center md:items-center gap-2 overflow-x-auto md:overflow-x-visible scrollbar-hide pb-2 md:pb-0">
                {tabs.map((tab) => (
                    <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        onMouseEnter={() => setHoveredTab(tab.id)}
                        onMouseLeave={() => setHoveredTab(null)}
                        animate={{ 
                            height: (hoveredTab === tab.id && window.innerWidth >= 768) ? 180 : 48 
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className={`group relative px-4 md:px-0 py-2 md:py-0 rounded-sm transition-all flex flex-row md:flex-col items-center justify-center gap-3 md:gap-6 overflow-hidden shrink-0 md:w-12 ${
                            activeTab === tab.id 
                            ? 'bg-white text-black' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5'
                        }`}
                    >
                        {/* Decorative Corner for Active Tab */}
                        {activeTab === tab.id && (
                            <div className="absolute top-0 right-0 w-2 h-2 bg-black rotate-45 translate-x-1 -translate-y-1" />
                        )}
                        
                        {/* Icon with Hover Rotation */}
                        <motion.span 
                            animate={{ rotate: hoveredTab === tab.id ? 90 : 0 }}
                            className="material-symbols-outlined text-[10px] shrink-0"
                        >
                            {tab.icon}
                        </motion.span>

                        {/* Vertically Expanding Label */}
                        <AnimatePresence>
                            {hoveredTab === tab.id && (
                                <motion.span
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] [writing-mode:vertical-lr] rotate-180 whitespace-nowrap"
                                >
                                    {tab.label}
                                </motion.span>
                            )}
                        </AnimatePresence>

                        {/* Active Indicator Line (Bottom for mobile, Right for desktop) */}
                        {activeTab === tab.id && (
                            <>
                                <motion.div 
                                    layoutId={`activeTabUnderline${namespace}Mobile`}
                                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-black/20 md:hidden"
                                />
                                <motion.div 
                                    layoutId={`activeTabUnderline${namespace}Desktop`}
                                    className="absolute top-0 bottom-0 right-0 w-[2px] bg-black/20 hidden md:block"
                                />
                            </>
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default WorkspaceSidebar;
