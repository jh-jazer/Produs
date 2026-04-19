import React from 'react';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

const DiagnosticLoader = ({ logs }) => {
    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[500] font-mono">
            <div className="w-80 space-y-6">
                <div className="flex items-center justify-between text-[10px] font-black text-electric-blue uppercase tracking-[0.4em]">
                    <span className="flex items-center gap-2">
                        <Cpu size={12} className="animate-pulse" />
                        DIAGNOSTIC_RUNNING
                    </span>
                    <div className="size-2 rounded-full bg-electric-blue animate-ping" />
                </div>
                
                <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        className="h-full bg-electric-blue shadow-[0_0_15px_rgba(0,163,255,0.5)]"
                    />
                </div>

                <div className="h-48 overflow-hidden relative border-t border-white/5 pt-4">
                    <motion.div
                        animate={{ y: logs.length > 5 ? -(logs.length - 5) * 20 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-2"
                    >
                        {logs.map((log, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className="text-[7px] text-white/20 font-mono mt-0.5 whitespace-nowrap">
                                    [{log.timestamp}]
                                </span>
                                <span className="text-[9px] text-white/50 uppercase tracking-widest font-mono leading-tight">
                                    {log.text}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black to-transparent" />
                    <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black to-transparent" />
                </div>
            </div>
        </div>
    );
};

export default DiagnosticLoader;
