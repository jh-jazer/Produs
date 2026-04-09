import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * DashboardModal - A high-fidelity, cinematic reusable modal for the Produs HUD.
 * Uses React Portals to transcend local stacking contexts and overlay the entire viewport.
 * 
 * @param {boolean} isOpen - Controls visibility
 * @param {function} onClose - Callback to close the modal
 * @param {string} title - Tactical label for the header (e.g. SYSTEM_UPGRADE_)
 * @param {string} subtitle - Descriptive sub-label
 * @param {React.ReactNode} children - Main modal content
 * @param {string} maxWidth - Tailwind max-width class (default '4xl')
 * @param {React.ReactNode} headerExtra - Optional extra content for the header
 */
const DashboardModal = ({ 
    isOpen, 
    onClose, 
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
                <div className="fixed inset-0 z-[1000] flex items-start justify-center p-4 md:p-12 pt-32 overscroll-none">
                    {/* Backdrop with extreme blur and dimming */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 backdrop-blur-xl bg-black/60 cursor-pointer"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <motion.div 
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className={`relative w-full ${maxWidth} bg-slate-50 dark:bg-[#0a0a0a] rounded-[3rem] border border-cyan-500/30 overflow-hidden flex flex-col max-h-[85vh] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] z-[1001]`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header Section */}
                        <div className="p-8 md:p-10 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/5 dark:bg-white/5 relative z-20">
                            <div className="space-y-1">
                                {(title || subtitle) && (
                                    <>
                                        {title && (
                                            <div className="flex items-center gap-2">
                                                <div className="size-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                                <h2 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] font-mono leading-none">{title}</h2>
                                            </div>
                                        )}
                                        {subtitle && (
                                            <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic font-exo leading-none">{subtitle}</p>
                                        )}
                                    </>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {headerExtra && headerExtra}
                                <button 
                                    onClick={onClose}
                                    className="size-12 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-rose-500/20 text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center border border-black/10 dark:border-white/10 group shadow-sm"
                                    title="Close Nexus"
                                >
                                    <X size={20} className="group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar relative z-10 bg-grid-light dark:bg-grid bg-[length:30px_30px]">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default DashboardModal;
