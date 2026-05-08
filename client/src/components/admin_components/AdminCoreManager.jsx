import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, Search, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import CoreDisplay from '../ui/CoreDisplay';

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
        <HUDPanel title="CORE_RESERVES_MANAGEMENT_" subtitle="Resource Allocation Protocol">
            <div className="space-y-12">
                <div className="relative border-b border-foreground/5 pb-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
                            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest text-center md:text-right w-full">Available_Liquidity_</span>
                            <div className="w-full md:w-auto px-10 py-6 bg-foreground text-background rounded-sm border border-foreground/20 flex items-center justify-center">
                                <span className="text-5xl font-black tabular-nums tracking-tighter leading-none">
                                    {corePool?.toLocaleString() || '000'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col space-y-6">
                    <div className="flex flex-col gap-4 mb-2">
                        <div className="flex items-center gap-3">
                            <Users size={14} className="text-foreground/40" />
                            <h4 className="font-black text-[9px] uppercase tracking-[0.4em] text-foreground/40">USER_NODES_</h4>
                        </div>
                        <div className="relative group w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 size-3" />
                            <input 
                                type="text"
                                placeholder="IDENTIFY_OPERATIVE..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-foreground/[0.03] border-b border-foreground/10 focus:border-foreground/40 rounded-none pl-11 pr-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none transition-all w-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredUsers.map((u) => (
                                <motion.div
                                    key={u._id}
                                    layout
                                    className={`group border transition-all ${expandedId === u._id ? 'bg-foreground/[0.05] border-foreground/20' : 'bg-foreground/[0.02] border-foreground/5 hover:border-foreground/10'}`}
                                >
                                    <button
                                        onClick={() => toggleExpand(u._id)}
                                        className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`size-10 rounded-sm bg-foreground/5 overflow-hidden border transition-all ${expandedId === u._id ? 'border-foreground/40' : 'border-foreground/5'}`}>
                                                {u.avatar && <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} alt="" className="size-full grayscale opacity-60 group-hover:opacity-100 transition-all" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground leading-none">{u.username?.split('#')[0] || u.name?.split('#')[0]}</h3>
                                                    {u.role === 'admin' && <ShieldCheck size={10} className="text-amber-500" />}
                                                </div>
                                                <p className="text-[8px] font-mono text-foreground/40 uppercase tracking-widest">{u.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                            <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
                                                <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest mb-1">Balance_</span>
                                                <div className="flex items-center gap-2">
                                                    <CoreDisplay amount={u.rpg?.cores || 0} variant="minimal" className="scale-90 opacity-60" />
                                                </div>
                                            </div>
                                            <div className={`size-8 rounded-none flex items-center justify-center transition-all ${expandedId === u._id ? 'bg-foreground text-background rotate-180' : 'bg-foreground/5 text-foreground/20'}`}>
                                                <ChevronDown size={14} />
                                            </div>
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {expandedId === u._id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden border-t border-foreground/5"
                                            >
                                                <div className="p-8 space-y-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-6">
                                                            <div className="flex items-center justify-between px-1">
                                                                <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Grant_Quantity_</label>
                                                                <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Reserves: {corePool}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <input 
                                                                    type="number"
                                                                    value={grantAmount}
                                                                    onChange={(e) => setGrantAmount(Math.max(1, Math.min(corePool, parseInt(e.target.value) || 0)))}
                                                                    className="flex-1 bg-foreground/[0.03] border-b border-foreground/10 rounded-none px-4 py-3 text-3xl font-black outline-none transition-all text-foreground tabular-nums"
                                                                />
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {[1, 10, 50, corePool].map((preset) => (
                                                                        <button
                                                                            key={preset}
                                                                            onClick={() => setGrantAmount(preset)}
                                                                            className="px-3 py-1.5 bg-foreground/5 hover:bg-foreground text-[8px] font-black uppercase tracking-widest hover:text-background transition-all rounded-none"
                                                                        >
                                                                            {preset === corePool ? 'MAX' : `+${preset}`}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col justify-end space-y-4">
                                                            <button
                                                                onClick={() => handleGrant(u)}
                                                                disabled={isGranting || grantAmount <= 0 || grantAmount > corePool}
                                                                className={`w-full py-4 rounded-none font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 active:scale-[0.98] ${isGranting || grantAmount > corePool ? 'bg-foreground/10 text-foreground/20 cursor-not-allowed' : 'bg-foreground text-background hover:opacity-90'}`}
                                                            >
                                                                {isGranting ? (
                                                                    <>
                                                                        <RefreshCw className="animate-spin" size={14} />
                                                                        SYNCING_
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <TrendingUp size={16} />
                                                                        AUTHORIZE_TRANSFER_
                                                                    </>
                                                                )}
                                                            </button>
                                                            
                                                            {grantStatus && (
                                                                <motion.div 
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    className={`p-4 rounded-none flex items-center gap-3 border ${grantStatus.type === 'success' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/5 text-rose-500 border-rose-500/20'}`}
                                                                >
                                                                    <AlertTriangle size={14} />
                                                                    <p className="text-[9px] font-black uppercase tracking-widest">{grantStatus.message}</p>
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
        </HUDPanel>
    );
};

export default AdminCoreManager;
