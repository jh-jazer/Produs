import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, Shield, Sparkles } from 'lucide-react';
import SystemWindow from '../ui/SystemWindow';

const AwakeningOverlay = ({ onAwaken }) => {
    return (
        <div className="w-full max-w-xl mx-auto flex items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
            >
                <SystemWindow 
                    variant="glass"
                    subtitle="NEURAL_SYNC_REQUIRED"
                    module="CORE_SYNC_00"
                    status="GATED"
                >
                    <div className="space-y-8 py-4">
                        <div className="flex flex-col items-center gap-6 text-center">
                            
                            
                            <div className="space-y-3">
                                <p className="text-sm font-black text-white uppercase tracking-widest italic font-exo">
                                    System Access Suspended
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-[0.2em] max-w-sm mx-auto">
                                    Your neural vectors are currently in a baseline state. Synchronization is required to map your archetype and unlock mission-critical dashboard zones.
                                </p>
                            </div>
                        </div>

                        

                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(34,211,238,0.3)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onAwaken}
                            className="w-full py-4 bg-cyan-500 text-black font-black text-[11px] uppercase tracking-[0.4em] rounded-2xl shadow-lg flex items-center justify-center gap-3 group transition-all"
                        >
                            <Sparkles size={10} className="group-hover:rotate-12 transition-transform" />
                            AWAKEN
                        </motion.button>
                        
                        
                    </div>
                </SystemWindow>
            </motion.div>
        </div>
    );
};

export default AwakeningOverlay;
