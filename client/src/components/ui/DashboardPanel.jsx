import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChippedBorder from './ChippedBorder';

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
        <div className={`relative z-0 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all rounded-sm overflow-hidden group shadow-none ${noPadding ? '' : 'p-8'} ${className}`}>
            <ChippedBorder opacity={0.6} />
            
            {/* Tactical Backdrop Decoration */}
            {showZap && (
                <div className="absolute top-0 right-0 p-4 md:p-8 opacity-[0.02] dark:opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-[2000ms]">
                    <Zap size={200} />
                </div>
            )}

            {/* Header Section */}
            {(title || subtitle || actionLabel) && (
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex flex-col gap-1">
                        {title && (
                            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground/40">{title}</span>
                        )}
                        {subtitle && (
                            <span className="text-[8px] font-mono uppercase tracking-widest opacity-20">{subtitle}</span>
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
