import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Plus } from 'lucide-react';
import { ARCHETYPE_PROTOCOLS } from '../../constants/assessment';
import { LEVEL_TABLE } from '../../utils/rpgHelpers';
import DashboardPanel from '../ui/DashboardPanel';

const EvolutionPreview = ({ user }) => {
    if (!user || user.guardianLevel === 0) return null;

    const currentLevel = user.guardianLevel || 1;
    const currentArchetype = user.rpg?.archetype?.name || 'Unknown';
    
    // Find next tier threshold
    const getTierEvolution = () => {
        const tiers = [
            { level: 8, name: 'Tier 2: Adept' },
            { level: 11, name: 'Tier 3: Master' },
            { level: 14, name: 'Tier 4: Grandmaster' },
            { level: 17, name: 'Tier 5: Legend' },
            { level: 21, name: 'Tier 6: Ascended' }
        ];

        const nextTier = tiers.find(t => t.level > currentLevel) || tiers[tiers.length - 1];
        const prevTierLevel = [...tiers].reverse().find(t => t.level <= currentLevel)?.level || 1;
        
        const totalGap = nextTier.level - prevTierLevel;
        const currentGap = currentLevel - prevTierLevel;
        const progress = Math.min((currentGap / totalGap) * 100, 100);

        return {
            nextName: nextTier.name,
            levelsRemaining: nextTier.level - currentLevel,
            progress,
            isMax: currentLevel >= 20
        };
    };

    const path = getTierEvolution();
    const currentTier = LEVEL_TABLE.find(l => l.level === currentLevel)?.title || 'Tier 1: Novice';
    const nextProtocol = ARCHETYPE_PROTOCOLS[currentArchetype] || ARCHETYPE_PROTOCOLS['None'];

    return (
        <DashboardPanel
            showZap={false}
            icon={Sparkles}
        >
            <div className="flex flex-col md:flex-row items-center gap-12">
                {/* Current Identity (LOCKED) */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                    <div className="relative">
                        <div className="size-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-xl">
                            <span className="text-2xl font-black font-exo italic">{currentArchetype?.[0]}</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 size-6 bg-accent rounded-lg flex items-center justify-center border-2 border-white dark:border-[#0a0a0a] shadow-lg">
                            <span className="material-symbols-outlined text-[14px] text-white font-black">lock</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">{currentArchetype}</span>
                        <span className="text-[7px] font-black text-accent uppercase tracking-[0.2em] mt-1 font-mono">[ CURRENT ]</span>
                    </div>
                </div>

                {/* Ascension Progress */}
                <div className="flex-1 w-full space-y-6">
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em] font-mono flex items-center gap-2">
                            <TrendingUp size={12} /> STATUS: EVOLVING
                        </span>
                        <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-tight italic font-exo">
                            {path.isMax ? 'Peak Potential Reached' : `Path to ${path.nextName}`}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${path.progress}%` }}
                                className="h-full bg-gradient-to-r from-accent to-purple-500 shadow-[0_0_10px_var(--accent-glow)]"
                            />
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                            <span className="text-black">{currentTier}</span>
                            <span className="text-accent">
                                {path.isMax ? 'MAX_LEVEL' : `${path.levelsRemaining} Levels to next milestone`}
                            </span>
                        </div>
                    </div>

                    <p className="text-[10px] font-medium text-black dark:text-black leading-relaxed uppercase tracking-wider italic">
                        " {nextProtocol?.flavor?.slice(0, 100)}... "
                    </p>
                </div>

                {/* Legacy Indicator */}
                <div className="flex flex-col items-center gap-3 shrink-0 opacity-20">
                    <div className="size-20 rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-black dark:text-white/20">
                        <Plus size={32} />
                    </div>
                    <span className="text-[10px] font-black text-black uppercase tracking-widest">NEXT FORM</span>
                </div>
            </div>
        </DashboardPanel>
    );
};

export default EvolutionPreview;
