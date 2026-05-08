import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { Users, TrendingUp } from 'lucide-react';

// Level milestones to mark on the chart
const MILESTONES = [10, 20, 30, 40, 50, 60, 65];

const getTierColor = (level) => {
    if (level <= 10) return '#64748b';   // Tier 1 — slate
    if (level <= 20) return '#22c55e';   // Tier 2 — green
    if (level <= 30) return '#3b82f6';   // Tier 3 — blue
    if (level <= 40) return '#a855f7';   // Tier 4 — purple
    if (level <= 50) return '#f59e0b';   // Tier 5 — amber
    if (level <= 60) return '#ef4444';   // Tier 6 — red
    return '#0066FF';                    // Tier 7 — primary
};

const AdminLevelChart = ({ data = [] }) => {
    const [hoveredLevel, setHoveredLevel] = useState(null);
    const total = data.reduce((acc, d) => acc + d.count, 0);
    const maxCount = Math.max(...data.map(d => d.count), 1);
    const peakLevel = data.reduce((a, b) => (a.count > b.count ? a : b), { level: '-', count: 0 });

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload?.length) {
            const { level, count } = payload[0].payload;
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            return (
                <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 p-3 rounded-xl shadow-xl text-xs">
                    <p className="font-black uppercase tracking-widest text-primary mb-1">Level {level}</p>
                    <p className="text-xl font-black dark:text-white">{count} <span className="text-[10px] text-slate-500 font-bold normal-case tracking-normal">users</span></p>
                    <p className="text-slate-400 font-bold mt-1">{pct}% of population</p>
                </div>
            );
        }
        return null;
    };

    const CustomXTick = ({ x, y, payload }) => {
        const val = payload.value;
        if (val % 5 !== 0) return null;
        return (
            <text x={x} y={y + 10} textAnchor="middle" fill="#64748b" fontSize={9} fontWeight={800}>
                {val}
            </text>
        );
    };

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Summary pills */}
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/[0.03] border border-foreground/5 rounded-none">
                    <Users size={12} className="text-foreground/40" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{total} Total Players</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/[0.03] border border-foreground/5 rounded-none">
                    <TrendingUp size={12} className="text-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Peak: Lv {peakLevel.level} ({peakLevel.count} users)</span>
                </div>
            </div>

            {/* Bar chart */}
            <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 4, right: 4, left: -28, bottom: 4 }}
                        barCategoryGap="2%"
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        {MILESTONES.map(m => (
                            <ReferenceLine
                                key={m}
                                x={m}
                                stroke="rgba(255,255,255,0.1)"
                                strokeDasharray="4 4"
                                label={{ value: `Lv${m}`, position: 'top', fontSize: 8, fill: '#666', fontWeight: 800 }}
                            />
                        ))}
                        <XAxis
                            dataKey="level"
                            axisLine={false}
                            tickLine={false}
                            tick={<CustomXTick />}
                            interval={0}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#666', fontSize: 9, fontWeight: 800 }}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                        <Bar
                            dataKey="count"
                            radius={[0, 0, 0, 0]}
                            onMouseEnter={(_, idx) => setHoveredLevel(idx)}
                            onMouseLeave={() => setHoveredLevel(null)}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getTierColor(entry.level)}
                                    opacity={hoveredLevel === null || hoveredLevel === index ? 0.8 : 0.2}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Tier legend */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {[
                    { label: 'T1', range: '1–10', color: '#666' },
                    { label: 'T2', range: '11–20', color: '#888' },
                    { label: 'T3', range: '21–30', color: '#aaa' },
                    { label: 'T4', range: '31–40', color: '#ccc' },
                    { label: 'T5', range: '41–50', color: '#eee' },
                    { label: 'T6', range: '51–60', color: '#fff' },
                    { label: 'T7', range: '61–65', color: '#0066FF' },
                ].map((tier) => (
                    <div key={tier.label} className="flex flex-col items-center gap-1 p-2 rounded-none bg-foreground/[0.03] border border-foreground/5">
                        <div className="w-full h-1 rounded-none" style={{ backgroundColor: tier.color }} />
                        <span className="text-[9px] font-black text-foreground/40">{tier.label}</span>
                        <span className="text-[8px] font-bold text-foreground/20">{tier.range}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminLevelChart;
