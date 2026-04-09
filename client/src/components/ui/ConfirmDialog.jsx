import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ConfirmDialog – a reusable delete-confirmation modal.
 *
 * Props:
 *   isOpen      – boolean
 *   title       – string  (e.g. "Delete Habit")
 *   message     – string  (e.g. "Are you sure? This can't be undone.")
 *   confirmLabel– string  (default "Delete")
 *   onConfirm   – () => void
 *   onCancel    – () => void
 */
const ConfirmDialog = ({
    isOpen,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmLabel = 'Delete',
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
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onCancel}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 8 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative z-10 w-full max-w-sm bg-white dark:bg-[#121212] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-black/[0.08] dark:border-white/10 overflow-hidden ar-corners"
                    >
                        {/* Top accent bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-400" />

                        <div className="p-6">
                            {/* Icon */}
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 mx-auto mb-4">
                                <span className="material-symbols-outlined text-2xl text-red-500">delete_forever</span>
                            </div>

                            {/* Text */}
                            <h3 className="text-sm font-semibold text-black dark:text-white text-center tracking-[-0.02em] mb-1 uppercase">
                                {title}
                            </h3>
                            <p className="text-xs text-black/50 dark:text-white/50 text-center mb-6 leading-relaxed">
                                {message}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.2em] bg-black/[0.04] dark:bg-[#000000] text-black/60 dark:text-white/60 hover:bg-black/[0.08] dark:hover:bg-[#121212] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.2em] bg-signal-orange hover:bg-signal-orange/90 text-white transition-colors shadow-none"
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmDialog;
