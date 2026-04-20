import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, Search, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import CoreDisplay from '../ui/CoreDisplay';
import DashboardPanel from '../ui/DashboardPanel';

const AdminCoreManager = ({ corePool, recentUsers, onGrantComplete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [grantAmount, setGrantAmount] = useState(1);
    const [isGranting, setIsGranting] = useState(false);
    const [grantStatus, setGrantStatus] = useState(null);

    const filteredUsers = recentUsers.filter(u => 
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleGrant = async (user) => {
        if (!user || grantAmount <= 0) return;
        
        setIsGranting(true);
        setGrantStatus(null);
        
        try {
            const { data } = await api.post('/admin/cores/grant', {
                userId: user._id,
                amount: grantAmount
            });
            
            setGrantStatus({ type: 'success', message: data.message });
            if (onGrantComplete) onGrantComplete();
            
            // Auto close after delay if successful
            setTimeout(() => {
                setExpandedId(null);
                setGrantAmount(1);
                setGrantStatus(null);
            }, 3000);
        } catch (error) {
            setGrantStatus({ 
                type: 'error', 
                message: error.response?.data?.message || error.message 
            });
        } finally {
            setIsGranting(false);
        }
    };

    const toggleExpand = (userId) => {
        if (expandedId === userId) {
            setExpandedId(null);
        } else {
            setExpandedId(userId);
            setGrantAmount(1);
            setGrantStatus(null);
        }
    };

    return (
        <DashboardPanel
            className="px-0 md:px-8"
        >
            <div className="space-y-12 px-4 md:px-0">
                {/* 1. Pool Status (Tactical Header) */}
                <div className="relative overflow-hidden group border-b border-black/5 dark:border-white/5 pb-10">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform hidden md:block">
                        <Zap size={80} className="text-amber-500" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/10">
                                    <Zap size={16} fill="currentColor" />
                                </div>
                                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase italic font-exo">Global_Reserves_</h3>
                            </div>
                            <p className="max-w-md text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider leading-relaxed opacity-60">
                                Total unauthorized units available for distribution. High-Level Clearance Required.
                            </p>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] text-center md:text-right w-full">Available_Liquidity_</span>
                            <div className="w-full md:w-auto px-6 py-8 md:px-10 md:py-5 bg-black dark:bg-white rounded-[2rem] md:rounded-2xl shadow-2xl shadow-amber-500/20 border border-amber-500/20 flex items-center justify-center">
                                <span className="text-6xl md:text-5xl font-black text-white dark:text-black tabular-nums tracking-tighter leading-none">
                                    {corePool?.toLocaleString() || '000'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Unified Registry List */}
                <div className="flex flex-col space-y-6">
                    <div className="flex flex-col gap-4 mb-2">
                        <div className="flex items-center gap-3">
                            <Users size={16} className="text-primary" />
                            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40">Active_User_Nodes_</h4>
                        </div>
                        <div className="relative group w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text"
                                placeholder="Filter by identity..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-2xl pl-11 pr-4 py-3.5 text-[10px] font-black uppercase tracking-wider outline-none transition-all w-full shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredUsers.map((u) => (
                                <motion.div
                                    key={u._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`group rounded-[2rem] border transition-all duration-300 ${expandedId === u._id ? 'bg-primary/5 border-primary/30 shadow-2xl shadow-primary/10' : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'}`}
                                >
                                    {/* Card Header (Toggleable) */}
                                    <button
                                        onClick={() => toggleExpand(u._id)}
                                        className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 gap-4 text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`size-12 md:size-14 rounded-2xl bg-white dark:bg-zinc-800 overflow-hidden border transition-all ${expandedId === u._id ? 'border-primary shadow-lg shadow-primary/20 scale-110' : 'border-black/5 dark:border-white/10'}`}>
                                                {u.avatar && <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} alt="" className="size-full" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-black text-[12px] md:text-sm text-slate-900 dark:text-white uppercase tracking-wider italic font-exo">{u.username || u.name}</p>
                                                    {u.role === 'admin' && <ShieldCheck size={12} className="text-amber-500" />}
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium truncate max-w-[150px] md:max-w-none">{u.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                            <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-60">Balance_</span>
                                                <div className="flex items-center gap-2">
                                                    <CoreDisplay amount={u.rpg?.cores || 0} variant="minimal" className="scale-90 md:scale-100" />
                                                </div>
                                            </div>
                                            <div className={`size-10 md:size-12 rounded-full flex items-center justify-center transition-all ${expandedId === u._id ? 'bg-primary text-white rotate-180' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </div>
                                    </button>

                                    {/* Expanded Content (Grant Interface) */}
                                    <AnimatePresence>
                                        {expandedId === u._id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-8 md:px-8 md:pb-10 space-y-8 border-t border-primary/10 mt-2 pt-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        {/* Quantity Input */}
                                                        <div className="space-y-6">
                                                            <div className="flex items-center justify-between px-2">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Grant_Quantity_</label>
                                                                <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-md">Limit: {corePool}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <input 
                                                                    type="number"
                                                                    value={grantAmount}
                                                                    onChange={(e) => setGrantAmount(Math.max(1, Math.min(corePool, parseInt(e.target.value) || 0)))}
                                                                    className="flex-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 focus:border-primary/50 rounded-3xl px-8 py-5 text-4xl font-black outline-none transition-all text-slate-900 dark:text-white tabular-nums ring-1 ring-transparent focus:ring-primary/20"
                                                                />
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {[1, 10, 50, corePool].map((preset) => (
                                                                        <button
                                                                            key={preset}
                                                                            onClick={() => setGrantAmount(preset)}
                                                                            className="px-3 py-2 bg-slate-100 dark:bg-white/5 hover:bg-primary/20 hover:text-primary rounded-xl text-[10px] font-black transition-all border border-transparent hover:border-primary/30"
                                                                        >
                                                                            {preset === corePool ? 'MAX' : `+${preset}`}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Execution Control */}
                                                        <div className="flex flex-col justify-end space-y-4">
                                                            <button
                                                                onClick={() => handleGrant(u)}
                                                                disabled={isGranting || grantAmount <= 0 || grantAmount > corePool}
                                                                className={`w-full py-6 rounded-3xl font-black text-xs md:text-sm uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-4 shadow-xl active:scale-[0.98] ${isGranting || grantAmount > corePool ? 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90 shadow-primary/30'}`}
                                                            >
                                                                {isGranting ? (
                                                                    <>
                                                                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                        EXECUTING_SYNC...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <TrendingUp size={20} />
                                                                        AUTHORIZE_TRANSFER_
                                                                    </>
                                                                )}
                                                            </button>
                                                            
                                                            {grantStatus && (
                                                                <motion.div 
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    className={`p-4 rounded-2xl flex items-center gap-3 border ${grantStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}
                                                                >
                                                                    <AlertTriangle size={18} />
                                                                    <p className="text-[10px] font-black uppercase tracking-widest">{grantStatus.message}</p>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </DashboardPanel>
    );
};

export default AdminCoreManager;
