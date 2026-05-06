import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

/**
 * EnergyDisplay - Tactical UI component for character energy.
 * @param {number} current - Current energy amount
 * @param {number} max - Maximum energy capacity
 * @param {string} className - Optional container styling
 * @param {string} variant - 'vault' (standard with borders) or 'minimal'
 */
const EnergyDisplay = ({ current = 0, max = 10, className = "", variant = "vault" }) => {
    const isVault = variant === "vault";

    // Progress percentage for background fills or markers if needed later
    const progress = Math.min((current / max) * 100, 100);

    return (
        <div className={`relative flex items-center gap-3 transition-all duration-300 ${
            isVault
                ? 'px-3.5 py-2 overflow-hidden'
                : 'px-0 py-0 bg-transparent border-none'
        } group ${className}`}>

            {isVault && (
                <>
                    {/* Vault Glow Layer */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/5 dark:from-white/5 dark:to-white/5 opacity-50" />

                    {/* Vault Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/20 to-transparent" />

                    {/* Corner Brackets */}
                    <div className="absolute top-1 left-1 size-1.5 border-t border-l border-black/20 dark:border-white/20" />
                    <div className="absolute top-1 right-1 size-1.5 border-t border-r border-black/20 dark:border-white/20" />
                    <div className="absolute bottom-1 left-1 size-1.5 border-b border-l border-black/20 dark:border-white/20" />
                    <div className="absolute bottom-1 right-1 size-1.5 border-b border-r border-black/20 dark:border-white/20" />

                    {/* Scanline Effect */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] z-20 bg-[length:100%_4px] opacity-10" />
                </>
            )}

            {/* Icon Section */}
            <div className={`relative z-10 size-7 flex items-center justify-center rounded-lg transition-all ${
                isVault
                    ? 'bg-black border border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]'
                    : 'bg-transparent border-none'
            }`}>
                <motion.div>
                    <Zap 
                        size={16} 
                        className={`${current > 0 ? 'text-black dark:text-white fill-black/10 dark:fill-white/20' : 'text-slate-500'}`} 
                    />
                </motion.div>
            </div>

            {/* Value Section */}
            <div className="flex flex-col relative z-10">

                <div className="flex items-baseline gap-1">
                    <span className={`font-sans font-black uppercase tracking-[0.4em] leading-none ${
                        current < (max * 0.2) ? 'text-rose-500' : 'text-black dark:text-white'
                    } text-[10px]`}>
                        {current}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 opacity-40">/</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 opacity-40">
                        {max}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default EnergyDisplay;
