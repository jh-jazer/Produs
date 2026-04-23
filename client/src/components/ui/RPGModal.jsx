import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';

/**
 * RPGModal - An immersive, tactical terminal modal designed for the RPG dashboard.
 * Features: Pure black aesthetic, scanlines, glowing cyan accents, and monospaced diagnostics.
 */
const RPGModal = ({ 
    isOpen, 
    onClose, 
    onBack,
    title, 
    subtitle, 
    children, 
    maxWidth = 'max-w-2xl'
}) => {
    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-8 overscroll-none overflow-hidden">
                    {/* Backdrop: Extreme blur + Pure Black dim */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 backdrop-blur-2xl bg-black/90 cursor-pointer"
                        onClick={onClose}
                    />

                    {/* Scanline Overlay Effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-[2001]" />

                    {/* Modal Wrapper */}
                    <div className="relative w-full flex justify-center z-[2002]">
                        
                        {/* Close Button: Tactical Hex Style */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            onClick={onClose}
                            className="absolute -top-4 -right-4 size-10 rounded-full bg-black border border-cyan-500/40 text-cyan-500 flex items-center justify-center hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all z-[2010]"
                        >
                            <X size={18} />
                        </motion.button>

                        {/* Modal Container: Tactical Terminal */}
                        <motion.div 
                            initial={{ scale: 0.95, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 30, opacity: 0 }}
                            className={`relative w-full ${maxWidth} bg-[#000000] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col max-h-[85vh] shadow-[0_0_50px_rgba(0,0,0,1)]`}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Decorative Corner Brackets */}
                            <div className="absolute top-4 left-4 size-8 border-t border-l border-cyan-500/20" />
                            <div className="absolute top-4 right-4 size-8 border-t border-r border-cyan-500/20" />
                            <div className="absolute bottom-4 left-4 size-8 border-b border-l border-cyan-500/20" />
                            <div className="absolute bottom-4 right-4 size-8 border-b border-r border-cyan-500/20" />

                            {/* Header: Diagnostic Readout */}
                            <div className="p-8 pb-4 border-b border-white/5 flex flex-col gap-4 relative z-20">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1 bg-cyan-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em] font-mono">
                                                {title || 'SYSTEM_LOG_'}
                                            </span>
                                        </div>
                                        {subtitle && (
                                            <h2 className="text-2xl font-thin text-white uppercase tracking-[0.3em] mt-2">
                                                {subtitle}
                                            </h2>
                                        )}
                                    </div>
                                    
                                    {onBack && (
                                        <button 
                                            onClick={onBack}
                                            className="size-10 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-cyan-400 hover:border-cyan-500/30 transition-all flex items-center justify-center group"
                                        >
                                            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                                <div className="h-px w-full bg-gradient-to-r from-cyan-500/20 via-transparent to-transparent" />
                            </div>

                            {/* Content Body: Terminal Window */}
                            <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar relative z-10">
                                <div className="relative">
                                    {children}
                                </div>
                            </div>

                            {/* Footer: Status Light */}
                            <div className="p-4 px-8 border-t border-white/5 flex items-center justify-between bg-black/40">
                                <div className="flex items-center gap-2 opacity-30">
                                    <div className="size-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_cyan]" />
                                    <span className="text-[8px] font-mono tracking-widest uppercase">Encryption: AES-256_ACTIVE</span>
                                </div>
                                <span className="text-[8px] font-mono text-white/10 uppercase tracking-widest">Sector_01_Identity_Sync</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default RPGModal;
