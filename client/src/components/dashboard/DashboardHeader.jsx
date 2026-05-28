import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Search, Handshake, User, Lock, Zap, Cpu, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardContext } from '../../context/DashboardContext';
import Logo from '../brand/Logo';

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
    const navigate = useNavigate();
    const isOverview = location.pathname === '/dashboard';

    const toggleProtocol = () => {
        setProtocolMode(protocolMode === 'rpg' ? 'reality' : 'rpg');
    };

    const toggleView = () => {
        setViewMode(viewMode === 'personal' ? 'partner' : 'personal');
    };

    return (
        <div className="w-full space-y-8 mb-4 md:mb-10">


            <div className="w-full flex items-center justify-between gap-2 md:gap-6">
                {/* 1. Explore Bar (Tactical Search) - Dashboard Only */}
                <div className="flex-1 order-1" />

                {/* 2. Controls Group (Direct Toggles) */}
                <div className="flex items-center gap-2 md:gap-3 order-2">
                    <div className="flex items-center gap-1 p-1 glass-panel rounded-2xl">
                        <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleProtocol}
                                className={`relative px-3 md:px-5 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 ${
                                    !isOverview ? 'opacity-0 pointer-events-none hidden md:flex' : ''
                                } ${
                                    protocolMode === 'rpg' 
                                        ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                                        : 'bg-transparent text-black hover:text-black hover:bg-white/5'
                                }`}
                            >
                                <Cpu size={14} className={protocolMode === 'rpg' ? 'animate-pulse' : ''} />
                                <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest font-mono">RPG_</span>
                                {protocolMode !== 'rpg' && (
                                    <span className="absolute top-1 right-1 flex size-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                                        <span className="relative inline-flex rounded-full size-2 bg-red-500" />
                                    </span>
                                )}
                            </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleView}
                            className={`px-3 md:px-5 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 ${
                                !isOverview ? 'opacity-0 pointer-events-none hidden md:flex' : ''
                            } ${
                                viewMode === 'partner' 
                                    ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                                    : 'bg-transparent text-black hover:text-black hover:bg-white/5'
                            }`}
                        >
                            {viewMode === 'partner' ? <Handshake size={14} /> : <User size={14} />}
                            <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest font-mono">LINK_</span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
