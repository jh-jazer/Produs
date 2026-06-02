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
                        <span>VOL. 1 // NO. 01</span>
                        <span>JUNE 2, 2026</span>
                        <span>EDITION 1.0.1</span>
                    </div>
                </div>

                {/* Newspaper Headline */}
                <div className="flex flex-col gap-2 font-serif">
                    <h3 className="text-lg md:text-xl font-bold uppercase tracking-tight leading-tight">
                        MAJOR SYSTEM IMPROVEMENT: FASTER LOADS & NEW RECURRING TIMELINE RELEASED
                    </h3>
                    <p className="text-[10px] italic text-black/60 dark:text-white/60 font-sans leading-relaxed">
                        We have rolled out a series of loading speed optimizations and fully interactive transaction ledgers.
                    </p>
                </div>

                {/* Newspaper Body */}
                <div className="overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar flex flex-col gap-6 border-t border-black/10 dark:border-white/10 pt-4 font-sans text-xs leading-relaxed text-black/80 dark:text-white/80">
                    <div className="flex flex-col gap-3">
                        <h4 className="font-bold text-[10px] uppercase tracking-widest text-black dark:text-white flex items-center">
                            <span className="inline-block mr-2 select-none filter grayscale opacity-90 contrast-[300%] brightness-[0.2] dark:brightness-100">🚀</span>
                            SPEED & PERFORMANCE OVERHAUL
                        </h4>
                        <ul className="list-disc pl-5 space-y-2.5">
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
                        <h4 className="font-bold text-[10px] uppercase tracking-widest text-black dark:text-white flex items-center">
                            <span className="inline-block mr-2 select-none filter grayscale opacity-90 contrast-[300%] brightness-[0.2] dark:brightness-100">💼</span>
                            INTERACTIVE FINANCIAL HUB
                        </h4>
                        <ul className="list-disc pl-5 space-y-2.5">
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
                        <h4 className="font-bold text-[10px] uppercase tracking-widest text-black dark:text-white flex items-center">
                            <span className="inline-block mr-2 select-none filter grayscale opacity-90 contrast-[300%] brightness-[0.2] dark:brightness-100">🗓️</span>
                            DAILY SCHEDULE PROTECTION
                        </h4>
                        <ul className="list-disc pl-5 space-y-2.5">
                            <li>
                                <strong>Locked Template Saves</strong>: The daily planner now locks and grays out the "Save as Template" button if your day has no planned activities. Hovering displays a clear tooltip.
                            </li>
                        </ul>
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
