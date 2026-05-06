import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';
import ChippedBorder from './ChippedBorder';

/**
 * DashboardModal - A high-fidelity, cinematic reusable modal for the Produs HUD.
 * Uses React Portals to transcend local stacking contexts and overlay the entire viewport.
 * 
 * @param {boolean} isOpen - Controls visibility
 * @param {function} onClose - Callback to close the modal
 * @param {function} onBack - Optional callback for back navigation
 * @param {string} title - Tactical label for the header (e.g. SYSTEM_UPGRADE_)
 * @param {string} subtitle - Descriptive sub-label
 * @param {React.ReactNode} children - Main modal content
 * @param {string} maxWidth - Tailwind max-width class (default '4xl')
 * @param {React.ReactNode} headerExtra - Optional extra content for the header
 */
const DashboardModal = ({ 
    isOpen, 
    onClose, 
    onBack,
    title, 
    subtitle, 
    children, 
    maxWidth = 'max-w-4xl',
    headerExtra
}) => {
    // Portaling the modal ensures it sit at the root of the document, 
    // allowing its z-index and backdrop blur to cover the entire HUD.
    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 overscroll-none">
                    {/* Backdrop with extreme blur and dimming */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 backdrop-blur-xl bg-black/60 cursor-pointer"
                        onClick={onClose}
                    />

                    {/* Modal Wrapper & Floating Close */}
                    <div className="relative w-full flex justify-center">
                        {/* THE TACTICAL CLOSE BUTTON */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={onClose}
                            className="absolute -top-4 -right-4 size-10 md:size-12 bg-white dark:bg-[#121212] border-2 border-white/20 z-[1010] flex items-center justify-center text-black dark:text-white hover:bg-rose-500 hover:text-white transition-all group active:scale-95 shadow-2xl"
                            title="Close Nexus"
                            style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 20% 100%, 0% 80%)' }}
                        >
                            <X size={20} className="group-hover:rotate-90 transition-transform" />
                        </motion.button>

                        {/* Modal Container */}
                        <motion.div 
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className={`relative w-full ${maxWidth} bg-white dark:bg-[#080808] backdrop-blur-3xl rounded-none border-none overflow-hidden flex flex-col max-h-[85vh] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] z-[1001]`}
                            onClick={e => e.stopPropagation()}
                        >
                            <ChippedBorder opacity={0.6} thickness="4px" />
                            <div className="absolute inset-0 border border-white/10 pointer-events-none z-40" />
                        {/* Header Section */}
                        <div className="p-8 md:p-10 border-b border-black/5 dark:border-white/5 flex items-center justify-between relative z-20">
                            <div className="space-y-1">
                                {(title || subtitle) && (
                                    <>
                                        {title && (
                                            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground/40">{title}</span>
                                        )}
                                        {subtitle && (
                                            <span className="text-[8px] font-mono uppercase tracking-widest opacity-20">{subtitle}</span>
                                        )}
                                    </>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {headerExtra && headerExtra}
                                {onBack && (
                                    <button 
                                        onClick={onBack}
                                        className="size-12 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-primary/20 text-slate-500 dark:text-slate-400 hover:text-primary transition-all flex items-center justify-center border border-black/10 dark:border-white/10 group shadow-sm"
                                        title="Go Back"
                                    >
                                        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar relative z-10 bg-grid-light/50 dark:bg-grid/5 bg-[length:30px_30px]">
                            {children}
                        </div>
                    </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default DashboardModal;
