import React from 'react';
import { motion } from 'framer-motion';
import DashboardModal from './DashboardModal';

/**
 * THE PRODUS TIMES - RELEASE NOTES DISPATCH SHEET
 * 
 * FUTURE MAINTENANCE & EDITING GUIDELINES:
 * 1. SIMPLIFIED TERMINOLOGY: Always use everyday, easy-to-understand wording in dispatch texts.
 *    - Avoid technical/sci-fi terms like "Guardian Protocol" or "System Boot Failsafes" in general summaries.
 *    - Use clear phrases like "Fast Loading for Returning Users", "Quick Page Transition", and "Expandable Cards".
 * 2. BLACK & WHITE EMOJIS: To maintain the vintage typewriter-newspaper print theme, all emojis must
 *    remain strictly black and white. Use the CSS classes: `filter grayscale opacity-90 contrast-[300%] brightness-[0.2] dark:brightness-100`.
 * 3. TYPOGRAPHY READABILITY: Keep fonts high-contrast, line heights spacious (`leading-relaxed` or `space-y-2.5`),
 *    and structure lists with bullets so users can effortlessly scan the news.
 */
const ProdusTimesModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <DashboardModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="max-w-lg"
        >
            <div className="flex flex-col gap-6 text-left relative text-black dark:text-white select-text">
                {/* Newspaper Header */}
                <div className="border-b-4 border-black dark:border-white pb-3 flex flex-col items-center text-center font-serif">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black/50 dark:text-white/40 mb-1 font-sans">PRODUS SYSTEM DISPATCH</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight leading-none">THE PRODUS TIMES</h2>
                    <div className="w-full flex justify-between items-center text-[8px] font-black uppercase tracking-widest border-t border-black/20 dark:border-white/20 mt-3 pt-1.5 font-sans">
                        <span>VOL. 1 // NO. 03</span>
                        <span>JUNE 4, 2026</span>
                        <span>EDITION 1.0.4</span>
                    </div>
                </div>

                {/* Newspaper Body */}
                <div className="overflow-y-auto max-h-[55vh] pr-2 custom-scrollbar flex flex-col gap-6 pt-2 font-sans text-xs leading-relaxed text-black/80 dark:text-white/80">
                    {/* Newspaper Headline */}
                    <div className="flex flex-col gap-2 font-serif border-b border-black/10 dark:border-white/10 pb-4">
                        <h3 className="text-lg md:text-xl font-bold uppercase tracking-tight leading-tight text-black dark:text-white">
                            SYSTEM UPGRADE: IMMERSIVE FULL-SCREEN TIMER, ORGANIC THEME & THICKER LEDGER NUMBERS
                        </h3>
                        <p className="text-[10px] italic text-black/60 dark:text-white/60 font-sans leading-relaxed">
                            We have launched a dedicated full-screen Focus Timer route, integrated a warm organic earth-toned palette, updated the immersive Old Money RPG elements, and thickened key financial metrics.
                        </p>
                    </div>

                    {/* --- EDITION 1.0.4 CONTENT --- */}
                    <div className="flex flex-col gap-3">
                        <h4 className="font-bold text-[10px] uppercase tracking-widest text-black dark:text-white flex items-center">
                            <span className="inline-block mr-2 select-none filter grayscale opacity-90 contrast-[300%] brightness-[0.2] dark:brightness-100">⏱️</span>
                            DISTRACTION-FREE FULL-SCREEN FOCUS TIMER
                        </h4>
                        <ul className="list-disc pl-5 space-y-2.5">
                            <li>
                                <strong>Dedicated Route</strong>: Moved the Focus Timer to a clean, standalone <code>/focustimer</code> page view, isolating it completely from standard sidebars, navigation panels, and HUD layouts.
                            </li>
                            <li>
                                <strong>Lifecycle Audio Management</strong>: Programmed automatic setup swells and complete Singing Bowl alarm shutdowns upon mounting and unmounting.
                            </li>
                            <li>
                                <strong>Seamless Navigational Resets</strong>: Navigates back to the main dashboard smoothly when exiting, aborting, or claiming session rewards.
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h4 className="font-bold text-[10px] uppercase tracking-widest text-black dark:text-white flex items-center">
                            <span className="inline-block mr-2 select-none filter grayscale opacity-90 contrast-[300%] brightness-[0.2] dark:brightness-100">🎨</span>
                            WARM ORGANIC EARTH PALETTE & OLD MONEY RPG THEME
                        </h4>
                        <ul className="list-disc pl-5 space-y-2.5">
                            <li>
                                <strong>Organic Color Tokens</strong>: Repainted light/dark modes using Floral White, Bone, Olive Drab, and Smoky Black variables to ensure a sleek and soft typewriter aesthetic.
                            </li>
                            <li>
                                <strong>Old Money RPG Adaptation</strong>: Styled the immersive character modals, items, roaming grids, and node guides with charcoal backgrounds, stone borders, and rich burgundy accents.
                            </li>
                            <li>
                                <strong>Responsive Mobile Text Visibility</strong>: Forced solid text variables on mobile viewport headers to avoid faint/low-contrast rendering.
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h4 className="font-bold text-[10px] uppercase tracking-widest text-black dark:text-white flex items-center">
                            <span className="inline-block mr-2 select-none filter grayscale opacity-90 contrast-[300%] brightness-[0.2] dark:brightness-100">📈</span>
                            LEGIBLE FINANCIAL SUMMARY METRICS
                        </h4>
                        <ul className="list-disc pl-5 space-y-2.5">
                            <li>
                                <strong>Bolder Overview Values</strong>: Upgraded the main balance, income, expenses, debt, receivable, and savings numbers to use the robust Exo 2 display font.
                            </li>
                            <li>
                                <strong>High-Contrast Labels</strong>: Replaced low-opacity headers with solid dark/light text variables so that key financial stats are instantly legible.
                            </li>
                        </ul>
                    </div>

                    {/* --- VINTAGE SEPARATOR --- */}
                    <div className="border-t-2 border-dashed border-black/20 dark:border-white/20 my-2 pt-6 flex flex-col gap-4">
                        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest font-sans text-black/50 dark:text-white/40">
                            <span>VOL. 1 // NO. 02</span>
                            <span>JUNE 3, 2026</span>
                            <span>EDITION 1.0.2</span>
                        </div>
                        <div className="flex flex-col gap-2 font-serif">
                            <h3 className="text-sm font-bold uppercase tracking-tight leading-tight text-black dark:text-white">
                                SYSTEM UPGRADE: AUDIO FOCUS SOUNDS, SIDEBAR BELL & BORDERLESS LAYOUTS
                            </h3>
                        </div>

                        <div className="flex flex-col gap-3">
                            <h4 className="font-bold text-[10px] uppercase tracking-widest text-black/70 dark:text-white/70 flex items-center">
                                <span className="inline-block mr-2 select-none filter grayscale opacity-90 contrast-[300%] brightness-[0.2] dark:brightness-100">🎵</span>
                                SYNTHESIZED FOCUS AUDIO ENGINE
                            </h4>
                            <ul className="list-disc pl-5 space-y-2.5 text-black/70 dark:text-white/70">
                                <li>
                                    <strong>Interactive Focus Backgrounds</strong>: Choose between synthesized <strong>Rain</strong> (modeled with changing winds/LFO swells) and <strong>White Noise</strong> directly from a picker in the timer to help you focus.
                                </li>
                                <li>
                                    <strong>Zen Singing Bowl Alarm</strong>: Focus completions now trigger a looping Zen Singing Bowl chime alarm. Aborting the timer halts any active background noise.
                                </li>
                                <li>
                                    <strong>Satisfying Game Auditory Feedback</strong>: satisfying game-like chimes play when checking off habits, completing planner tasks, sidebar navigation clicks, and accepting partner connections.
                                </li>
                                <li>
                                    <strong>Global Sound Effects Toggle</strong>: Added a global "Sound Effects" option under Settings to easily disable all synthesizer sounds.
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col gap-3">
                            <h4 className="font-bold text-[10px] uppercase tracking-widest text-black/70 dark:text-white/70 flex items-center">
                                <span className="inline-block mr-2 select-none filter grayscale opacity-90 contrast-[300%] brightness-[0.2] dark:brightness-100">🔔</span>
                                POLISHED NOTIFICATIONS & PHP CURRENCY DEFAULT
                            </h4>
                            <ul className="list-disc pl-5 space-y-2.5 text-black/70 dark:text-white/70">
                                <li>
                                    <strong>Sidebar Notification Bell</strong>: Added a clickable notification bell next to the PRODUS wordmark on the sidebar, equipped with a pulsing red unread dot indicator.
                                </li>
                                <li>
                                    <strong>Streamlined Operations</strong>: Removed the redundant delete operation from notifications, offering a simpler and cleaner alert workflow.
                                </li>
                                <li>
                                    <strong>₱ Default Currency</strong>: Set Philippine Peso (PHP / ₱) as the default system-wide currency fallback across onboarding, ledger settings, and summaries.
                                </li>
                                <li>
                                    <strong>Always-On Foresee Projection</strong>: The Financial Hub ledger now defaults to Foresee Projection enabled, instantly showing future balance curves.
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col gap-3">
                            <h4 className="font-bold text-[10px] uppercase tracking-widest text-black/70 dark:text-white/70 flex items-center">
                                <span className="inline-block mr-2 select-none filter grayscale opacity-90 contrast-[300%] brightness-[0.2] dark:brightness-100">📐</span>
                                DESKTOP LAYOUT & ALIGNMENTS
                            </h4>
                            <ul className="list-disc pl-5 space-y-2.5 text-black/70 dark:text-white/70">
                                <li>
                                    <strong>Borderless & Light Mode Transparent Containers</strong>: Removed the outer borders and background card fills from desktop views in light mode to make page structures look cleaner. In dark mode, container blocks remain visible.
                                </li>
                                <li>
                                    <strong>Stylized Page Title Layout</strong>: Moved headers and subtitles above and outside container borders for a modern editorial feel.
                                </li>
                                <li>
                                    <strong>Width & Spacing Consistencies</strong>: Unified Habits Tracker, Daily Planner, and Write Hub layout widths to perfectly match the Goals and Calendar pages, adding bottom padding to avoid clipping.
                                </li>
                                <li>
                                    <strong>Stacked Write Hub Cards</strong>: Stacked selector cards vertically on the main Write Hub screen, improving readability in desktop and mobile views.
                                </li>
                            </ul>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <h4 className="font-bold text-[10px] uppercase tracking-widest text-black/70 dark:text-white/70 flex items-center">
                                <span className="inline-block mr-2 select-none filter grayscale opacity-90 contrast-[300%] brightness-[0.2] dark:brightness-100">🚀</span>
                                SPEED & PERFORMANCE OVERHAUL
                            </h4>
                            <ul className="list-disc pl-5 space-y-2.5 text-black/70 dark:text-white/70">
                                <li>
                                    <strong>Adaptive Boot Loader</strong>: Bypassed the artificial waiting bar. The app now loads directly once the system is ready, opening in under 500ms.
                                </li>
                                <li>
                                    <strong>Fast Loading for Returning Users</strong>: Recognized returning visitors to skip animation delays, speeding up loads 3x (~2s total duration) and skipping tips to save your time.
                                </li>
                                <li>
                                    <strong>Quick Page Transition</strong>: Swapped the heavy black screen delay with a sleek, instant 300ms swipe transition for routine screen switching.
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col gap-3">
                            <h4 className="font-bold text-[10px] uppercase tracking-widest text-black/70 dark:text-white/70 flex items-center">
                                <span className="inline-block mr-2 select-none filter grayscale opacity-90 contrast-[300%] brightness-[0.2] dark:brightness-100">💼</span>
                                INTERACTIVE FINANCIAL HUB
                            </h4>
                            <ul className="list-disc pl-5 space-y-2.5 text-black/70 dark:text-white/70">
                                <li>
                                    <strong>Expandable Transaction Cards</strong>: Clicking on a transaction in the summary ledger now expands the card to show detailed stats.
                                </li>
                                <li>
                                    <strong>Recurring Payments Timeline</strong>: Expanded view reveals an interactive checklist of all monthly installments. You can check off individual months to instantly mark debts, bills, and receivables as paid or received.
                                </li>
                                <li>
                                    <strong>Enlarged Add Transaction Button</strong>: Restyled the main ledger add button to be larger, with a prominent background and a clean plus icon for easier tapping.
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col gap-3">
                            <h4 className="font-bold text-[10px] uppercase tracking-widest text-black/70 dark:text-white/70 flex items-center">
                                <span className="inline-block mr-2 select-none filter grayscale opacity-90 contrast-[300%] brightness-[0.2] dark:brightness-100">🗓️</span>
                                DAILY SCHEDULE PROTECTION
                            </h4>
                            <ul className="list-disc pl-5 space-y-2.5 text-black/70 dark:text-white/70">
                                <li>
                                    <strong>Locked Template Saves</strong>: The daily planner now locks and grays out the "Save as Template" button if your day has no planned activities. Hovering displays a clear tooltip.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Newspaper Footer */}
                <div className="border-t border-black dark:border-white pt-3 flex justify-between items-center text-[8px] font-black uppercase tracking-widest font-sans">
                    <span>END OF RELEASES</span>
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-all rounded-sm font-sans"
                    >
                        CLOSE PAPER
                    </button>
                </div>
            </div>
        </DashboardModal>
    );
};

export default ProdusTimesModal;
