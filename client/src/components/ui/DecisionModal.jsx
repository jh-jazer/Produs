import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DecisionModal – A premium, wide-format decision modal for the Produs system.
 * 
 * Props:
 *   isOpen       – boolean
 *   title        – string  (e.g. "Recalibrate System")
 *   message      – string  (e.g. "Do you wish to proceed with the update?")
 *   confirmLabel – string  (default "PROCEED")
 *   cancelLabel  – string  (default "ABORT")
 *   onConfirm    – () => void
 *   onCancel     – () => void
 */
const DecisionModal = ({
    isOpen,
    title = 'Confirm Decision',
    message = 'Are you sure you want to proceed with this action?',
    confirmLabel = 'PROCEED',
    cancelLabel = 'ABORT',
    onConfirm,
    onCancel,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                        onClick={onCancel}
                    />

                    {/* Dialog Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                        className="relative z-10 w-full max-w-lg bg-white dark:bg-[#080808] rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.8)] border border-black/[0.05] dark:border-white/[0.05] overflow-hidden"
                    >
                        {/* Thin accent line at the top */}
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                        <div className="p-6 md:p-8 flex flex-col items-center text-center">
                            {/* Message - Cinematic Loader Style */}
                            <p className="text-[10px] md:text-[11px] font-bold leading-[2] tracking-[0.5em] text-black dark:text-white uppercase max-w-xl mb-8">
                                "{message}"
                            </p>

                            {/* Decision Actions */}
                            <div className="flex flex-row gap-4 w-full max-w-md">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-4 rounded-2xl bg-transparent border border-black/[0.05] dark:border-white/[0.05] text-black/40 dark:text-white/30 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] hover:text-black dark:hover:text-white transition-all active:scale-[0.98]"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 py-4 rounded-2xl bg-transparent border border-primary/30 text-primary font-black uppercase tracking-[0.3em] text-[10px] hover:bg-primary/5 transition-all active:scale-[0.98]"
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>

                        {/* Aesthetic Footer Detail */}
                        <div className="h-1 w-full bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between px-10">
                            <div className="h-full w-20 bg-primary/20" />
                            <div className="h-full w-20 bg-primary/20" />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DecisionModal;
