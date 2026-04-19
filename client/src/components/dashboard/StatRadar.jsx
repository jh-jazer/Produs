import React from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Shield } from 'lucide-react';
import DashboardPanel from '../ui/DashboardPanel';

const StatRadar = ({ user }) => {
    const stats = user?.rpg?.stats || { str: 0, agi: 0, vit: 0, int: 0, wis: 0, luk: 0 };
    const dailyXP = user?.rpg?.dailyXP?.byStat || {};

    const data = [
        { subject: 'STR', value: stats.str },
        { subject: 'AGI', value: stats.agi },
        { subject: 'VIT', value: stats.vit },
        { subject: 'INT', value: stats.int },
        { subject: 'WIS', value: stats.wis },
        { subject: 'LUK', value: stats.luk },
    ];

    return (
        <DashboardPanel
            title="Stat Matrix"
            subtitle="Current Stats"
            className="w-full"
            bodyClassName="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
            {/* Radar Visual */}
            <div className="h-[300px] w-full relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.07]">
                    <Shield size={200} className="text-slate-900 dark:text-white" />
                </div>
                
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="currentColor" className="text-slate-200 dark:text-white/10" strokeDasharray="4 4" />
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 900, fontFamily: 'monospace', className: 'text-slate-400 dark:text-slate-500' }}
                        />
                        <Radar
                            name="Stats"
                            dataKey="value"
                            stroke="#06b6d4"
                            fill="#06b6d4"
                            fillOpacity={0.1}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Stat absolute Metrics */}
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-y-10 gap-x-12">
                    {data.map(({ subject, value }) => {
                        const statKey = subject.toLowerCase();
                        const earnedToday = dailyXP[statKey] || 0;

                        return (
                            <div key={subject} className="relative group">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                                            {subject}
                                        </span>
                                        {earnedToday > 0 && (
                                            <motion.span 
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="text-[8px] font-black text-emerald-500 font-mono"
                                            >
                                                [+{earnedToday}]
                                            </motion.span>
                                        )}
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-slate-900 dark:text-white font-exo italic tracking-tighter">
                                            {value}
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                                            TOTAL
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Subtle decorative line */}
                                <div className="absolute -bottom-2 left-0 w-8 h-[px] bg-slate-200 dark:bg-white/10 group-hover:w-full transition-all duration-500" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardPanel>
    );
};

export default StatRadar;
