import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Search, Handshake, User, Lock, Zap, Cpu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { DashboardContext } from '../../context/DashboardContext';

const DashboardHeader = ({ user }) => {
    const { 
        setIsSearchModalOpen, 
        setIsNotificationModalOpen, 
        unreadCount, 
        setIsOperationModalOpen, 
        protocolMode, 
        setProtocolMode,
        viewMode,
        setViewMode
    } = useContext(DashboardContext);
    const location = useLocation();
    const isOverview = location.pathname === '/dashboard';

    const toggleProtocol = () => {
        setProtocolMode(protocolMode === 'rpg' ? 'reality' : 'rpg');
    };

    const toggleView = () => {
        setViewMode(viewMode === 'personal' ? 'partner' : 'personal');
    };

    return (
        <div className="w-full flex items-center justify-between gap-2 md:gap-6 md:mb-8">
            {/* 1. Explore Bar (Tactical Search) - Dashboard Only */}
            <div className="flex-1 md:max-w-md order-1">
                {isOverview && (
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
                )}
            </div>

            {/* 2. Controls Group (Direct Toggles) */}
            <div className="flex items-center gap-2 md:gap-3 order-2">
                <div className="flex items-center gap-1 p-1 glass-panel rounded-2xl">
                    {/* RPG Toggle - Dashboard Only */}
                    {isOverview && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleProtocol}
                            className={`px-3 md:px-5 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 ${
                                protocolMode === 'rpg' 
                                    ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                                    : 'bg-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                        >
                            <Cpu size={14} className={protocolMode === 'rpg' ? 'animate-pulse' : ''} />
                            <span className="text-[10px] font-black uppercase tracking-widest font-mono">RPG_</span>
                        </motion.button>
                    )}

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleView}
                        className={`px-3 md:px-5 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 ${
                            viewMode === 'partner' 
                                ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                                : 'bg-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                    >
                        {viewMode === 'partner' ? <Handshake size={14} /> : <User size={14} />}
                        <span className="text-[10px] font-black uppercase tracking-widest font-mono">LINK_</span>
                    </motion.button>
                </div>

            </div>
        </div>
    );
};

export default DashboardHeader;
