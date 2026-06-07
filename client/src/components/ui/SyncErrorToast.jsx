import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SyncErrorToast — Reusable error toast for optimistic update rollbacks.
 * Shows a "SYNC FAILED" toast when an optimistic mutation fails and auto-dismisses.
 *
 * @param {boolean} show - Whether to display the toast
 * @param {function} onDismiss - Callback to reset the show state
 * @param {number} duration - Auto-dismiss delay in ms (default: 3500)
 */
const SyncErrorToast = ({ show, onDismiss, duration = 3500 }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => onDismiss(), duration);
            return () => clearTimeout(timer);
        }
    }, [show, onDismiss, duration]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: "-50%", scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                    exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="fixed top-8 left-1/2 z-[9999] px-6 py-4 bg-red-950/95 dark:bg-red-50/95 text-white dark:text-red-900 border border-red-500/20 dark:border-red-300/30 rounded-2xl shadow-[0_20px_50px_rgba(220,38,38,0.3)] flex items-center gap-3.5 backdrop-blur-md w-max max-w-[90vw]"
                >
                    <span className="material-symbols-outlined text-lg text-red-400 dark:text-red-500">error</span>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">SYNC FAILED</span>
                        <span className="text-[9px] font-bold opacity-70 uppercase tracking-widest mt-2 leading-none">Failed to save changes. Please try again.</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SyncErrorToast;
