import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, Search, ChevronRight, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import CoreDisplay from '../ui/CoreDisplay';

const AdminCoreManager = ({ corePool, recentUsers, onGrantComplete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [grantAmount, setGrantAmount] = useState(1);
    const [isGranting, setIsGranting] = useState(false);
    const [grantStatus, setGrantStatus] = useState(null);

    const filteredUsers = recentUsers.filter(u => 
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleGrant = async () => {
        if (!selectedUser || grantAmount <= 0) return;
        
        setIsGranting(true);
        setGrantStatus(null);
        
        try {
            const { data } = await api.post('/admin/cores/grant', {
                userId: selectedUser._id,
                amount: grantAmount
            });
            
            setGrantStatus({ type: 'success', message: data.message });
            if (onGrantComplete) onGrantComplete();
            
            // Clear selection after a delay
            setTimeout(() => {
                setSelectedUser(null);
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

    return (
        <div className="space-y-8">
            {/* Pool Status Card */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                    <Zap size={120} className="text-amber-500" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 border border-amber-500/20">
                                <Zap size={20} fill="currentColor" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic font-exo">Core Registry Status</h3>
                        </div>
                        <p className="max-w-md text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                            Cores are a finite resource of 1000 units. Admins can distribute them to users for high-priority initiatives.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Current_Pool_Capacity_</span>
                        <div className="px-10 py-6 bg-black dark:bg-white rounded-[2rem] shadow-2xl shadow-amber-500/10">
                            <span className="text-5xl font-black text-white dark:text-black tabular-nums tracking-tighter">
                                {corePool?.toLocaleString() || '000'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Selector */}
                <div className="bg-white dark:bg-zinc-900/40 border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 flex flex-col h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Users size={18} className="text-primary" />
                            <h4 className="font-black text-xs uppercase tracking-widest text-slate-700 dark:text-white/70">Registry Selection</h4>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search identity..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-full pl-10 pr-4 py-2 text-[10px] font-black uppercase tracking-wider outline-none transition-all w-48 md:w-64"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {filteredUsers.map((u) => (
                            <button
                                key={u._id}
                                onClick={() => setSelectedUser(u)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${selectedUser?._id === u._id ? 'bg-primary/10 border-primary/30' : 'bg-black/[0.02] dark:bg-white/[0.02] border-transparent hover:bg-black/[0.05] dark:hover:bg-white/[0.05]'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-slate-200 dark:bg-zinc-800 overflow-hidden border border-black/5 dark:border-white/10 shrink-0">
                                        {u.avatar && <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} alt="" className="size-full" />}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-[11px] text-slate-900 dark:text-white uppercase tracking-wider">{u.username || u.name}</p>
                                        <p className="text-[9px] text-slate-500 font-medium truncate max-w-[150px]">{u.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Balance</span>
                                        <CoreDisplay amount={u.rpg?.cores || 0} variant="minimal" className="scale-75 origin-right" />
                                    </div>
                                    <ChevronRight size={16} className={`transition-transform ${selectedUser?._id === u._id ? 'text-primary rotate-90' : 'text-slate-300'}`} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grant Interface */}
                <div className="bg-white dark:bg-zinc-900/40 border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <Zap size={18} className="text-amber-500" />
                            <h4 className="font-black text-xs uppercase tracking-widest text-slate-700 dark:text-white/70">Resource Transfer Protocol</h4>
                        </div>

                        {!selectedUser ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                                <div className="size-16 rounded-full border-2 border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center">
                                    <Users size={24} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Select an identity from the registry to begin</p>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex items-center gap-4">
                                    <div className="size-14 rounded-2xl bg-white dark:bg-zinc-800 border border-primary/20 flex items-center justify-center text-primary">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Target_Subject</p>
                                        <h5 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">{selectedUser.username || selectedUser.name}</h5>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 block">Grant_Quantity_</label>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="number"
                                            value={grantAmount}
                                            onChange={(e) => setGrantAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                            className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-amber-500/50 rounded-2xl px-6 py-5 text-2xl font-black outline-none transition-all text-slate-900 dark:text-white tabular-nums"
                                        />
                                        <div className="flex flex-col gap-2">
                                            <button onClick={() => setGrantAmount(v => v + 1)} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-amber-500/20 rounded-xl transition-all"><ChevronRight className="-rotate-90" size={20} /></button>
                                            <button onClick={() => setGrantAmount(v => Math.max(1, v - 1))} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-amber-500/20 rounded-xl transition-all"><ChevronRight className="rotate-90" size={20} /></button>
                                        </div>
                                    </div>
                                </div>

                                {grantStatus && (
                                    <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 ${grantStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                        <AlertTriangle size={18} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">{grantStatus.message}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pt-8">
                        <button
                            onClick={handleGrant}
                            disabled={!selectedUser || isGranting || grantAmount <= 0 || grantAmount > corePool}
                            className={`w-full py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-xl active:scale-[0.98] ${!selectedUser || isGranting || grantAmount > corePool ? 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed opacity-50 grayscale' : 'bg-amber-500 text-white hover:bg-amber-400 shadow-amber-500/20'}`}
                        >
                            {isGranting ? (
                                <>
                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    <Zap size={18} fill="currentColor" />
                                    Authorize Grant
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCoreManager;
