import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const HandshakeLoading = ({ handshakeLog, isSubmitting, onHandshake }) => {
    return (
        <div className="space-y-12 w-full max-w-md">
            <div className="size-24 rounded-full border-4 border-rose-500/20 flex items-center justify-center mx-auto relative">
                <Brain size={40} className="text-rose-500 animate-pulse" />
                <div className="absolute inset-0 size-24 rounded-full border-t-4 border-rose-500 animate-spin" />
            </div>
            
            <div className="text-left bg-black/40 p-6 rounded-[2rem] border border-white/5 font-mono text-[10px] text-rose-500/80 space-y-2 min-h-[160px] backdrop-blur-xl">
                {handshakeLog.map((log, idx) => (
                    <div key={idx} className="flex gap-3">
                        <span className="opacity-40">&gt;&gt;</span>
                        <span className={idx === handshakeLog.length - 1 ? "text-rose-500 font-bold animate-pulse" : ""}>{log}</span>
                    </div>
                ))}
            </div>

            {!isSubmitting && handshakeLog.length === 0 && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onHandshake}
                    className="w-full py-6 rounded-[2rem] bg-rose-500 text-white font-black text-xs uppercase tracking-[0.5em] shadow-[0_0_50px_rgba(244,63,94,0.3)]"
                >
                    ESTABLISH_NEURAL_HANDSHAKE
                </motion.button>
            )}
        </div>
    );
};

export default HandshakeLoading;
