import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

/**
 * ThemeToggle — a compact, animated light/dark toggle for the Produs sidebar.
 *
 * Clicking it flips between 'light' and 'dark' directly.
 * (System preference is handled separately in SettingsModal.)
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
                transition-colors duration-300
                ${className}
            `}
        >
            {/* Tactical Rectangular Track */}
            <div
                className={`
                    relative w-10 h-[14px] shrink-0
                    border border-black/20 dark:border-white/20
                    bg-black/5 dark:bg-white/5
                    overflow-hidden
                `}
            >
                {/* Micro details on track */}
                <div className="absolute inset-0 flex justify-between px-[2px] items-center pointer-events-none z-0 opacity-40">
                    <div className="w-[1px] h-[6px] bg-black dark:bg-white" />
                    <div className="w-[1px] h-[6px] bg-black dark:bg-white" />
                </div>

                {/* Sharp Block Thumb */}
                <motion.div
                    layout
                    animate={{ x: isDark ? 26 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    className={`
                        absolute top-0 bottom-0 w-[12px]
                        bg-black dark:bg-white z-10
                        shadow-[0_0_10px_rgba(0,0,0,0.5)] dark:shadow-[0_0_10px_rgba(255,255,255,0.3)]
                    `}
                />
            </div>

            {/* Icon + Label */}
            <div className="flex items-center gap-1.5 w-[4rem] overflow-hidden">


                <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                        key={isDark ? 'dark-label' : 'light-label'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
