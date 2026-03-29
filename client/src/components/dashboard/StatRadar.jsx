import React from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Shield, Target, Zap, Flame, Brain, Heart, Award } from 'lucide-react';
import { XP_CAPS } from '../../utils/rpgHelpers';

const StatRadar = ({ user }) => {
    const stats = user?.rpg?.stats || { str: 0, dex: 0, end: 0, int: 0, wis: 0, cha: 0 };
    const dailyXP = user?.rpg?.dailyXP?.byStat || {};

    const data = [
        { subject: 'STR', value: stats.str, fullMark: 100 },
        { subject: 'DEX', value: stats.dex, fullMark: 100 },
        { subject: 'END', value: stats.end, fullMark: 100 },
        { subject: 'INT', value: stats.int, fullMark: 100 },
        { subject: 'WIS', value: stats.wis, fullMark: 100 },
        { subject: 'CHA', value: stats.cha, fullMark: 100 },
    ];

    const statColors = {
        STR: 'rose-500',
        DEX: 'orange-400',
        END: 'emerald-500',
        INT: 'cyan-400',
        WIS: 'purple-500',
        CHA: 'pink-500'
    };

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8">
            
            {/* Radar Visual */}
            <div className="h-[300px] w-full relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <Shield size={200} className="text-slate-900 dark:text-white" />
                </div>
                
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900, fontFamily: 'monospace' }}
                        />
                        <Radar
                            name="Stats"
                            dataKey="value"
                            stroke="#06b6d4"
                            fill="#06b6d4"
                            fillOpacity={0.15}
                        />
                    </RadarChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="size-16 rounded-full bg-cyan-500/5 blur-2xl" />
                </div>
            </div>

            {/* Stat Progress Bars */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 font-mono">NEURAL_PROFILE_LOGS</h3>
                    <div className="grid grid-cols-2 gap-6">
                        {data.map(({ subject, value }) => {
                            const statKey = subject.toLowerCase();
                            const color = statColors[subject];
                            const earnedToday = dailyXP[statKey] || 0;
                            const cap = XP_CAPS[statKey];
                            const capProgress = (earnedToday / cap) * 100;

                            return (
                                <div key={subject} className="space-y-1.5">
                                    <div className="flex justify-between items-center group cursor-help">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest font-exo italic group-hover:text-cyan-500 transition-colors`}>
                                                {subject}
                                            </span>
                                            <div className="size-1 rounded-full bg-slate-200 dark:bg-white/10" />
                                            <span className="text-[10px] font-black text-slate-400 font-mono">{value}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`text-[7px] font-black font-mono transition-colors ${earnedToday >= cap ? 'text-emerald-500' : 'text-slate-500'}`}>
                                                {earnedToday}/{cap}_XP
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${capProgress}%` }}
                                            className={`h-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.4)]`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
                        <Zap size={14} className="text-cyan-500" />
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-tight">
                            Live synchronization active. Neural stats update every 10ms.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatRadar;
