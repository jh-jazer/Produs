import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChippedBorder from './ChippedBorder';

/**
 * ConfirmDialog – a reusable tactical delete-confirmation modal.
 * Updated to match the "Decision Modal" / Operative HUD design.
 */
const ConfirmDialog = ({
    isOpen,
    title = 'SYSTEM DECISION',
    message = 'Are you sure you want to proceed with this action?',
    confirmLabel = 'DELETE',
    cancelLabel = 'ABORT',
    onConfirm,
    onCancel,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onCancel}
                    />
 
                    {/* Dialog Container - Operative Panel Design */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 w-full max-w-md bg-[#0a0a0a] p-8 md:p-10 rounded-sm group overflow-hidden border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]"
                    >
                        <ChippedBorder opacity={0.2} />
                        
                        <div className="relative z-10">
                            {/* Header */}
                            <div className="mb-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">{title}</span>
                            </div>

                            {/* Message */}
                            <div className="mb-12">
                                <p className="text-[12px] md:text-[14px] font-black leading-relaxed tracking-[0.15em] text-white italic uppercase">
                                    {message}
                                </p>
                            </div>

                            {/* Decision Actions */}
                            <div className="flex flex-row gap-4 w-full">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white/40 font-black uppercase tracking-[0.4em] text-[9px] hover:bg-white/10 hover:text-white transition-all active:scale-[0.98] rounded-sm"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 py-4 bg-white text-black font-black uppercase tracking-[0.4em] text-[9px] hover:bg-white/90 transition-all active:scale-[0.98] rounded-sm relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-2 h-2 bg-black rotate-45 translate-x-1 -translate-y-1" />
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>

                        {/* Decorative Background Icon */}
                        <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none">
                            <span className="material-symbols-outlined text-8xl">warning</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmDialog;
