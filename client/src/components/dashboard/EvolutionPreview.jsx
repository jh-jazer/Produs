import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, Sparkles, Target, Zap } from 'lucide-react';
import { ARCHETYPE_PROTOCOLS } from '../../constants/assessment';

const EvolutionPreview = ({ user }) => {
    if (!user || user.level === 0) return null;

    const stats = user.rpg?.stats || { str: 0, dex: 0, end: 0, int: 0, wis: 0, cha: 0 };
    const currentArchetype = user.rpg?.archetype?.name || 'None';

    // Calculation logic for "Next Evolution"
    // We analyze the 4 axes and find the smallest delta to flip a dominant stat
    const getEvolutionPath = () => {
        const paths = [
            { axis: 'Force vs Wisdom', stat1: 'str', stat2: 'wis', diff: Math.abs(stats.str - stats.wis) },
            { axis: 'Speed vs Knowledge', stat1: 'dex', stat2: 'int', diff: Math.abs(stats.dex - stats.int) },
            { axis: 'Vigor vs Presence', stat1: 'end', stat2: 'cha', diff: Math.abs(stats.end - stats.cha) },
            { axis: 'Stability vs Adaptivity', stat1: 'end', stat2: 'dex', diff: Math.abs(stats.end - stats.dex) }
        ];

        // Sort by smallest difference (closest to flipping)
        const closest = paths.sort((a, b) => a.diff - b.diff)[0];
        
        // Determine what stat to grow
        const targetStat = stats[closest.stat1] > stats[closest.stat2] ? closest.stat2 : closest.stat1;
        const requiredGrow = Math.max(closest.diff, 5); // Minimum 5 XP to show progress

        // Simulate new archetype
        const simulatedStats = { ...stats, [targetStat]: stats[targetStat] + requiredGrow + 1 };
        
        // Helper to get archetype (copied logic for speed within component)
        const axis1 = simulatedStats.str >= simulatedStats.wis ? 'STR' : 'WIS';
        const axis2 = simulatedStats.dex >= simulatedStats.int ? 'DEX' : 'INT';
        const axis3 = simulatedStats.end >= simulatedStats.cha ? 'END' : 'CHA';
        const axis4 = simulatedStats.end >= simulatedStats.dex ? 'STABLE' : 'ADAPTIVE';
        const map = {
            'STR-DEX-END-STABLE': 'Iron Fist', 'STR-DEX-END-ADAPTIVE': 'Blade Dancer',
            'STR-DEX-CHA-STABLE': 'Warlord', 'STR-DEX-CHA-ADAPTIVE': 'Vanguard',
            'STR-INT-END-STABLE': 'Sentinel', 'STR-INT-END-ADAPTIVE': 'Forge Master',
            'STR-INT-CHA-STABLE': 'Commander', 'STR-INT-CHA-ADAPTIVE': 'Champion',
            'WIS-DEX-END-STABLE': 'Shadow Monk', 'WIS-DEX-END-ADAPTIVE': 'Ghost',
            'WIS-DEX-CHA-STABLE': 'Diplomat', 'WIS-DEX-CHA-ADAPTIVE': 'Bard',
            'WIS-INT-END-STABLE': 'Oracle', 'WIS-INT-END-ADAPTIVE': 'Druid',
            'WIS-INT-CHA-STABLE': 'Alchemist', 'WIS-INT-CHA-ADAPTIVE': 'Architect',
        };
        const nextName = map[`${axis1}-${axis2}-${axis3}-${axis4}`] || currentArchetype;

        return {
            nextName,
            targetStat,
            distance: requiredGrow,
            axis: closest.axis
        };
    };

    const path = getEvolutionPath();
    const nextProtocol = ARCHETYPE_PROTOCOLS[path.nextName] || ARCHETYPE_PROTOCOLS['None'];

    return (
        <div className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05]">
                <Sparkles size={160} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                {/* Current */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                    <div className="size-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-xl">
                        <span className="text-2xl font-black font-exo italic">{currentArchetype?.[0]}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentArchetype}</span>
                </div>

                {/* Progress Bridge */}
                <div className="flex-1 w-full space-y-6">
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] font-mono flex items-center gap-2">
                            <Target size={12} /> EVOLUTION_PATH_DETECTED
                        </span>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic font-exo">
                            The {path.nextName} Call
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '65%' }} // Abstract progress
                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                            />
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Current Pattern</span>
                            <span className="text-cyan-500">
                                Need +{path.distance} {path.targetStat.toUpperCase()} XP to shift axes
                            </span>
                        </div>
                    </div>

                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-wider">
                        " {nextProtocol.flavor.slice(0, 80)}... "
                    </p>
                </div>

                {/* Next Teaser */}
                <div className="flex flex-col items-center gap-3 shrink-0 opacity-40">
                    <div className="size-20 rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-300 dark:text-white/20">
                        <Plus size={32} />
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Locked</span>
                </div>
            </div>
        </div>
    );
};

export default EvolutionPreview;
