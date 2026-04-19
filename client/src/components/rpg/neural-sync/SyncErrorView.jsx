import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const SyncErrorView = ({ syncError, onRecalibrate }) => {
    return (
        <div className="pt-12 space-y-6">
            <div className="p-8 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 text-rose-500 space-y-6 relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500 animate-pulse">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.4em] opacity-60">
                            {syncError.type || 'NEURAL_ERROR'}
                        </div>
                        <div className="font-display italic font-black uppercase tracking-tighter text-lg">
                            {syncError.type === 'SYNAPTIC_FRACTURE' ? 'Neural Link Fracture' : 'Synaptic State Mismatch'}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-sm font-medium leading-relaxed opacity-90 font-mono tracking-tight">
                        {syncError.message || `A mismatch occurred during sequence synchronization with node 1.0.`}
                    </p>
                    
                    {syncError.target && (
                        <div className="flex items-center gap-3 py-3 px-4 bg-black/40 rounded-xl border border-rose-500/20">
                            <div className="size-2 rounded-full bg-rose-500 animate-ping" />
                            <span className="text-[10px] font-black font-mono uppercase tracking-widest opacity-60">Missing Coordinate:</span>
                            <span className="text-xs font-black font-mono text-white tracking-widest">[{syncError.target}]</span>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-rose-500/10">
                    <p className="text-[9px] font-bold opacity-40 uppercase tracking-[0.3em] leading-relaxed">
                        // RECALIBRATION_REQUIRED: Stability lost in the narrative stream. Reset to previous sector to restore link.
                    </p>
                </div>
            </div>
            
            <button 
                onClick={onRecalibrate}
                className="w-full py-5 rounded-[1.5rem] bg-rose-500 text-white font-black text-xs uppercase tracking-[0.4em] shadow-[0_0_40px_rgba(244,63,94,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
                <span>RE-CALIBRATE NEURAL LINK</span>
            </button>
        </div>
    );
};

export default SyncErrorView;
