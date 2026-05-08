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

const ChippedBorder = ({ opacity = 0.8 }) => (
  <div 
    className="absolute inset-[-2px] rounded-sm pointer-events-none z-0"
    style={{
      border: '4px solid currentColor',
      opacity,
      clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
    }}
  />
);

const HUDPanel = ({ title, subtitle, children, headerExtra, className = "" }) => (
  <div className={`relative bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all p-8 rounded-sm group overflow-hidden ${className}`}>
    <ChippedBorder opacity={0.6} />
    <div className="relative z-10">
      <div className="mb-8 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground/40">{title}</span>
          {subtitle && <span className="text-[8px] font-mono uppercase tracking-widest opacity-20">{subtitle}</span>}
        </div>
        {headerExtra && <div className="flex gap-2">{headerExtra}</div>}
      </div>
      {children}
    </div>
  </div>
);

const AdminStats = ({ stats, archetypeStats, levelDistribution = [], activeTab }) => {
    // Only render the charts if the tab is overview to prevent 0x0 size errors from Recharts
    const isVisible = activeTab === 'overview';
    
    // Memoize stats to ensure stable rendering
    const renderedStats = useMemo(() => stats, [stats]);

    if (!isVisible) return null;

    return (
        <div className="space-y-8 mb-12">
            {/* KPI Metrics Panel */}
            <HUDPanel title="SYSTEM_METRICS_" subtitle="Key Performance Indicators">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {renderedStats.map((stat, index) => {
                        // Resolve the icon component: fallback to Users if not found or string
                        const IconComponent = typeof stat.icon === 'string' 
                            ? (ICON_MAP[stat.icon] || Users) 
                            : (stat.icon || Users);
                        
                        return (
                            <motion.div 
                                key={index} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-foreground/[0.03] border border-foreground/5 p-6 rounded-none relative group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-foreground/40 group-hover:text-foreground transition-colors">
                                        <IconComponent size={16} />
                                    </div>
                                    <span className="text-foreground text-[8px] font-black uppercase tracking-widest opacity-20">LVL_SYNC</span>
                                </div>
                                <p className="text-foreground/40 text-[9px] uppercase font-black tracking-widest leading-none mb-2">{stat.label}</p>
                                <p className="text-2xl font-black tracking-tighter">{stat.value}</p>
                                <div className="absolute bottom-0 right-0 w-2 h-2 bg-foreground/10 rotate-45 translate-x-1 translate-y-1" />
                            </motion.div>
                        );
                    })}
                </div>
            </HUDPanel>

            {/* Population Distribution - Level */}
            <HUDPanel title="" subtitle="">
                <AdminLevelChart data={levelDistribution} />
            </HUDPanel>

            {/* population Distribution - Class */}
            <HUDPanel title="" subtitle="">
                <ArchetypeChart data={archetypeStats} />
            </HUDPanel>
        </div>
    );
};

export default AdminStats;
