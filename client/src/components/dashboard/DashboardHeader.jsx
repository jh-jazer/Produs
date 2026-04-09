import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Users, User, Lock, Zap, Cpu } from 'lucide-react';
import { DashboardContext } from '../../context/DashboardContext';

const DashboardHeader = ({ viewMode, setViewMode, user }) => {
    const { setIsSearchModalOpen, setIsNotificationModalOpen, unreadCount, setIsOperationModalOpen, protocolMode } = useContext(DashboardContext);

    const isPartnerLocked = !user?.partner;
    return (
        <div className="w-full flex items-center justify-between gap-2 md:gap-6 md:mb-8">
            {/* 1. Explore Bar (Tactical Search) */}
            <div className="flex-1 md:max-w-md order-1">
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setIsSearchModalOpen(true)}
                    className="w-full h-12 glass-panel rounded-2xl px-3 md:px-5 flex items-center gap-2 md:gap-4 group transition-all hover:border-cyan-500/30"
                >
                    <Search size={18} className="text-slate-400 group-hover:text-cyan-500 transition-colors" />
                    <span className="hidden md:block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono group-hover:text-slate-300 transition-colors">
                        EXPLORE_DATABASE_
                    </span>
                    <div className="ml-auto hidden md:flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                        <div className="size-1 rounded-full bg-cyan-500" />
                        <div className="size-1 rounded-full bg-cyan-500/40" />
                    </div>
                </motion.button>
            </div>

            {/* 2. Controls Group (Toggle + Notifications) */}
            <div className="flex items-center gap-2 md:gap-3 order-2">
                {/* Centralized Operation Trigger */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOperationModalOpen(true)}
                    className="h-12 glass-panel rounded-2xl px-5 flex items-center gap-4 group transition-all hover:border-cyan-500/30 overflow-hidden relative"
                >
                    <div className="relative flex items-center justify-center">
                        <Cpu size={18} className={`text-slate-400 group-hover:text-cyan-500 transition-colors ${protocolMode === 'rpg' ? 'animate-pulse text-cyan-500' : ''}`} />
                        {viewMode === 'partner' && (
                            <span className="absolute -top-1 -right-1 size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        )}
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono group-hover:text-slate-300 transition-colors">
                            DASHBOARD_MODES_
                        </span>
                        <div className="flex gap-2 mt-0.5">
                            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                Mode: {protocolMode === 'rpg' ? 'RPG' : 'PRODUCTIVITY'}
                            </span>
                            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                View: {viewMode === 'personal' ? 'PERSONAL' : 'PARTNER'}
                            </span>
                        </div>
                    </div>

                    {/* Subtle grid backdrop */}
                    <div className="absolute inset-0 bg-grid-light opacity-0 group-hover:opacity-5 pointer-events-none transition-opacity" />
                </motion.button>

                {/* 3. Notification Hub */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsNotificationModalOpen(true)}
                    className="size-10 md:size-12 glass-panel rounded-2xl flex items-center justify-center relative group overflow-hidden shrink-0"
                >
                    <Bell size={18} className="text-slate-400 group-hover:text-cyan-500 transition-colors" />
                    
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 md:top-3 md:right-3 size-2 bg-rose-500 rounded-full ring-4 ring-rose-500/20 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                    )}

                    {/* Tactical grid overlay on hover */}
                    <div className="absolute inset-0 bg-grid-light opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity" />
                </motion.button>
            </div>
        </div>
    );
};

export default DashboardHeader;
