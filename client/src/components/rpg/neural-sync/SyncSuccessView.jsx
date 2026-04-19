import React from 'react';
import { motion } from 'framer-motion';
import { Zap, LogOut } from 'lucide-react';

const SyncSuccessView = ({ successData, currentLevel, onReturn }) => {
    return (
        <motion.div
            key="success"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="flex flex-col items-center text-center space-y-12 py-20"
        >
            <div className="size-24 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <Zap size={40} />
            </div>
            
            <div className="space-y-4">
                <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white font-exo">SYNCHRONIZATION_COMPLETE</h1>
                <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-xs max-w-sm mx-auto leading-loose">
                    Your neural patterns have been permanently archived. The archetype foundation is expanding.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block">Level Gain</span>
                    <span className="text-2xl font-black italic text-rose-500 font-exo">+{successData.level - (currentLevel || 1)} LVL</span>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block">Synapse Status</span>
                    <span className="text-xl font-black italic text-emerald-500 font-exo">ALIGNED</span>
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReturn}
                className="w-full py-6 rounded-[2rem] bg-white text-black font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-3 group"
            >
                <LogOut size={16} />
                <span>RETURN_TO_DASHBOARD</span>
            </motion.button>
        </motion.div>
    );
};

export default SyncSuccessView;
