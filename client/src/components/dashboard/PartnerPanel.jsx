import React from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Zap, Flame, Link, User } from 'lucide-react';
import useSWR from 'swr';
import api from '../../services/api';

const PartnerPanel = ({ user }) => {
    const fetcher = url => api.get(url).then(res => res.data);
    const { data: partner, error } = useSWR(user?.partner ? '/auth/partner' : null, fetcher);

    if (!user?.partner) return (
        <div className="glass-panel w-full border-2 border-dashed p-12 flex flex-col items-center justify-center text-center space-y-4 group hover:border-cyan-500/50 transition-colors rounded-[2.5rem]">
            <div className="size-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-white/20 group-hover:scale-110 transition-transform">
                <Link size={32} />
            </div>
            <div className="max-w-xs">
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Single-System Operation</p>
                <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-widest">Link with a partner to unlock CHA XP bonuses and collective accountability.</p>
            </div>
            <button className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-black/20">
                FIND_PARTNER
            </button>
        </div>
    );

    if (!partner) return null;

    const pairingLabel = (userArchetype, partnerArchetype) => {
        const labels = {
            'Iron Fist-Iron Fist': 'The Unstoppables',
            'Alchemist-Commander': 'The Strategists',
            'Blade Dancer-Ghost': 'Shadow Squad',
            'default': 'Linked Operatives'
        };
        const key = `${userArchetype}-${partnerArchetype}`;
        return labels[key] || labels['default'];
    };

    return (
        <div className="glass-panel w-full p-6 lg:p-8 rounded-[2.5rem]">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                
                {/* Partner Profile */}
                <div className="flex flex-col items-center gap-4 shrink-0">
                    <div className="relative">
                        <div className="size-20 rounded-[2rem] overflow-hidden border-2 border-cyan-500/30">
                            {partner.avatar?.img ? (
                                <img src={partner.avatar.img} alt={partner.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400">
                                    <User size={32} />
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 size-8 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black border-2 border-white dark:border-[#121212]">
                            <span className="text-[10px] font-black italic font-exo">{partner.level}</span>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-6 w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                LINK_PARTNER: {partner.username || partner.name}
                            </span>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic font-exo">
                                {partner.rpg?.archetype?.name || 'AWAKENING'} <span className="text-slate-200 dark:text-white/10">T{partner.rpg?.archetype?.tier || 1}</span>
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[9px] font-black px-2 py-0.5 bg-cyan-500/10 text-cyan-500 rounded uppercase tracking-widest font-mono">
                                    {pairingLabel(user?.rpg?.archetype?.name, partner.rpg?.archetype?.name)}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="text-center bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-100 dark:border-white/5 min-w-[80px]">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">STREAK</p>
                                <p className="text-xl font-black text-orange-500 font-exo italic flex items-center justify-center gap-1">
                                    <Flame size={16} /> {partner.rpg?.streak || 0}
                                </p>
                            </div>
                            <div className="text-center bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-100 dark:border-white/5 min-w-[80px]">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">SHARED_CHA</p>
                                <p className="text-xl font-black text-pink-500 font-exo italic flex items-center justify-center gap-1">
                                    +{Math.max(0, (user?.rpg?.dailyXP?.byStat?.cha || 0))} 
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Monitor */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Tactical Synchronization</span>
                            <span className={partner.completedToday > 0 ? 'text-emerald-500' : 'text-slate-400'}>
                                {partner.completedToday} / {partner.habitsCount} OBJECTIVES COMPLETED
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(partner.completedToday / (partner.habitsCount || 1)) * 100}%` }}
                                className="h-full bg-emerald-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerPanel;
