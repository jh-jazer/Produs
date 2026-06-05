import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

/**
 * ThemeToggle — a clean, animated, icon + text light/dark toggle for the Produs layout.
 */
const ThemeToggle = ({ className = '' }) => {
    const { isDark, setThemeMode } = useTheme();

    const toggle = () => setThemeMode(isDark ? 'light' : 'dark');

    return (
        <button
            id="theme-toggle"
            onClick={toggle}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`
                relative flex items-center gap-3 group
                text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white
                transition-all duration-300 active:scale-95
                ${className}
            `}
        >
            {/* Circular Icon Wrapper */}
            <div className="size-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 group-hover:bg-black/10 group-hover:border-black/10 dark:hover:bg-white/10 dark:hover:border-white/10 transition-all shrink-0">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                        key={isDark ? 'dark' : 'light'}
                        initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="material-symbols-outlined text-[20px]"
                    >
                        {isDark ? 'dark_mode' : 'light_mode'}
                    </motion.span>
                </AnimatePresence>
            </div>

            {/* Label Text */}
            <div className="flex items-center overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                        key={isDark ? 'dark-label' : 'light-label'}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.15 }}
                        className="text-[9px] font-black uppercase tracking-[0.3em] whitespace-nowrap text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white transition-colors"
                    >
                        {isDark ? 'Dark' : 'Light'}
                    </motion.span>
                </AnimatePresence>
            </div>
        </button>
    );
};

export default ThemeToggle;


