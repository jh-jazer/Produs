import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Award, TrendingUp } from 'lucide-react';

const ArchetypeChart = ({ data = [] }) => {
    const [selectedArchetype, setSelectedArchetype] = useState(null);

    const handleBarClick = (entry) => {
        setSelectedArchetype(entry);
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md">
                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">{payload[0].payload.name}</p>
                    <p className="text-xl font-black dark:text-white">{payload[0].value} <span className="text-[10px] text-slate-500 uppercase tracking-normal">Users</span></p>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold italic">Click to view tier breakdown</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-black flex items-center gap-2">
                        <Award className="text-primary" size={20} />
                        Archetype Distribution
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Player Class Analytics</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 flex items-center gap-2">
                        <Users size={12} className="text-slate-400" />
                        <span className="text-[10px] font-black">{data.reduce((acc, curr) => acc + curr.total, 0)} Total</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        onClick={(state) => {
                            if (state && state.activePayload) {
                                handleBarClick(state.activePayload[0].payload);
                            }
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                            interval={0}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 102, 255, 0.05)' }} />
                        <Bar
                            dataKey="total"
                            radius={[6, 6, 0, 0]}
                            className="cursor-pointer"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={selectedArchetype?.name === entry.name ? '#0066FF' : '#0066FF80'}
                                    className="hover:fill-[#0066FF] transition-all duration-300"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Tier Breakdown Modal */}
            <AnimatePresence>
                {selectedArchetype && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedArchetype(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1 block">Tier Breakdown</span>
                                        <h2 className="text-3xl font-black">{selectedArchetype.name}</h2>
                                    </div>
                                    <button
                                        onClick={() => setSelectedArchetype(null)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {selectedArchetype.tiers.sort((a, b) => a.tier - b.tier).map((tier, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                                    T{tier.tier}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">Tier {tier.tier}</p>
                                                    {tier.tier > 1 && (
                                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Min. Level Requirement: {(tier.tier - 1) * 10}+</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black">{tier.count}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Users</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex justify-between items-center text-slate-500">
                                        <span className="text-xs font-bold uppercase tracking-widest">Total Population</span>
                                        <span className="text-lg font-black text-slate-900 dark:text-white">{selectedArchetype.total}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ArchetypeChart;
