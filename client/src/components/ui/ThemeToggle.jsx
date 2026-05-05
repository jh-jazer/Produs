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
                relative flex items-center gap-2.5 group
                text-foreground/40 hover:text-foreground
                transition-colors duration-300
                ${className}
            `}
        >
            {/* Track */}
            <div
                className={`
                    relative w-10 h-5 rounded-full transition-colors duration-300 shrink-0
                    ${isDark ? 'bg-foreground/20' : 'bg-foreground/10'}
                    border border-foreground/10
                `}
            >
                {/* Thumb */}
                <motion.div
                    layout
                    animate={{ x: isDark ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className={`
                        absolute top-[3px] size-3.5 rounded-full
                        flex items-center justify-center
                        shadow-sm
                        ${isDark ? 'bg-foreground' : 'bg-foreground'}
                    `}
                />
            </div>

            {/* Icon + Label */}
            <div className="flex items-center gap-1.5 w-[4rem] overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                    {isDark ? (
                        <motion.span
                            key="dark"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.2 }}
                            className="material-symbols-outlined text-[14px] shrink-0"
                        >
                            dark_mode
                        </motion.span>
                    ) : (
                        <motion.span
                            key="light"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.2 }}
                            className="material-symbols-outlined text-[14px] shrink-0"
                        >
                            light_mode
                        </motion.span>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                        key={isDark ? 'dark-label' : 'light-label'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-[9px] font-black uppercase tracking-[0.3em] whitespace-nowrap"
                    >
                        {isDark ? 'Dark' : 'Light'}
                    </motion.span>
                </AnimatePresence>
            </div>
        </button>
    );
};

export default ThemeToggle;
