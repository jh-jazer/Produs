import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, Database, BarChart3 } from 'lucide-react';
import DashboardPanel from '../ui/DashboardPanel';
import ArchetypeChart from '../ArchetypeChart';
import AdminLevelChart from './AdminLevelChart';

// Map icon strings from API to Lucide components
const ICON_MAP = {
    'Users': Users,
    'ShieldCheck': ShieldCheck,
    'Database': Database,
    'BarChart3': BarChart3
};

const AdminStats = ({ stats, archetypeStats, levelDistribution = [], activeTab }) => {
    // Only render the charts if the tab is overview to prevent 0x0 size errors from Recharts
    const isVisible = activeTab === 'overview';
    
    // Memoize stats to ensure stable rendering
    const renderedStats = useMemo(() => stats, [stats]);

    if (!isVisible) return null;

    return (
        <div className="space-y-8 mb-12">
            {/* KPI Metrics Panel */}
            <DashboardPanel title="SYSTEM_METRICS_" subtitle="Key Performance Indicators">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {renderedStats.map((stat, index) => {
                        // Resolve the icon component: fallback to Users if not found or string
                        const IconComponent = typeof stat.icon === 'string' 
                            ? (ICON_MAP[stat.icon] || Users) 
                            : (stat.icon || Users);
                        
                        return (
                            <motion.div 
                                key={index} 
                                whileHover={{ y: -4 }} 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 p-5 rounded-2xl transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2.5 rounded-xl bg-white dark:bg-[#000000] ${stat.color} border border-slate-100 dark:border-white/5`}>
                                        <IconComponent size={20} />
                                    </div>
                                    <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">↑ 5%</span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest leading-none mb-2">{stat.label}</p>
                                <p className="text-2xl md:text-3xl font-black">{stat.value}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </DashboardPanel>

            {/* Population Distribution - Level */}
            <DashboardPanel title="LEVEL_DISTRIBUTION_" subtitle="Population by Level (1–65)">
                <AdminLevelChart data={levelDistribution} />
            </DashboardPanel>

            {/* population Distribution - Class */}
            <DashboardPanel title="ARCHETYPE_DISTRIBUTION_" subtitle="Class Population Breakdown">
                <ArchetypeChart data={archetypeStats} />
            </DashboardPanel>
        </div>
    );
};

export default AdminStats;
