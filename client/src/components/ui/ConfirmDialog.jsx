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
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
                        className="relative z-10 w-full max-w-sm bg-white dark:bg-[#192233] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                    >
                        {/* Top accent bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-400" />

                        <div className="p-6">
                            {/* Icon */}
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 mx-auto mb-4">
                                <span className="material-symbols-outlined text-2xl text-red-500">delete_forever</span>
                            </div>

                            {/* Text */}
                            <h3 className="text-base font-black text-slate-900 dark:text-white text-center tracking-tight mb-1">
                                {title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6 leading-relaxed">
                                {message}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm shadow-red-500/30"
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
