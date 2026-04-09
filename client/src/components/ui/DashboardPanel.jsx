import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * DashboardPanel - A high-fidelity reusable layout container for the Produs HUD.
 * 
 * @param {string} title - Tactical label for the panel (e.g. TACTICAL_OBJECTIVES_)
 * @param {string} subtitle - Descriptive sub-label (e.g. Active_Mission_Parameters)
 * @param {string} actionLabel - Text for the top-right action link
 * @param {string} actionPath - Route to navigate to on action click
 * @param {React.ReactNode} children - Main panel content
 * @param {boolean} showZap - Whether to show the decorative background Zap animation
 * @param {string} className - Additional classes for the container
 * @param {string} bodyClassName - Additional classes for the content area
 * @param {boolean} noPadding - Disable default p-8 padding
 */
const DashboardPanel = ({ 
    title, 
    subtitle, 
    actionLabel, 
    actionPath, 
    children, 
    showZap = false,
    className = "",
    bodyClassName = "",
    noPadding = false,
    icon: Icon,
    headerExtra
}) => {
    const navigate = useNavigate();

    return (
        <div className={`relative z-0 bg-slate-50/80 dark:bg-[#080808]/80 backdrop-blur-2xl border border-primary/40 dark:border-white/5 rounded-[2.5rem] overflow-hidden group shadow-none ${noPadding ? '' : 'px-3 py-8 md:p-8'} ${className}`}>
            
            {/* Tactical Backdrop Decoration */}
            {showZap && (
                <div className="absolute top-0 right-0 p-4 md:p-8 opacity-[0.02] dark:opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-[2000ms]">
                    <Zap size={200} />
                </div>
            )}

            {/* Header Section */}
            {(title || subtitle || actionLabel) && (
                <div className="flex items-center justify-between px-1 mb-4 md:mb-6 relative z-10">
                    <div className="flex flex-col">
                        {title && (
                            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-mono flex items-center gap-2 mb-1">
                                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-none">{subtitle}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {headerExtra && headerExtra}
                        {actionLabel && actionPath && (
                            <button 
                                onClick={() => navigate(actionPath)}
                                className="text-[9px] font-black text-primary uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2 group/action"
                            >
                                {actionLabel} <ChevronRight size={10} className="group-hover/action:translate-x-1 transition-transform" />
                            </button>
                        )}
                        {Icon && !actionLabel && !headerExtra && (
                            <div className="opacity-10 group-hover:opacity-20 transition-opacity">
                                <Icon size={24} className="text-white" />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Content Body */}
            <div className={`relative z-10 ${bodyClassName}`}>
                {children}
            </div>
        </div>
    );
};

export default DashboardPanel;
