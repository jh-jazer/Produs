import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ChippedBorder from './ChippedBorder';

const AddPlanModal = ({ isOpen, onClose, onAdd }) => {
    const [newPlan, setNewPlan] = useState({ title: '', startTime: '09:00', endTime: '10:00' });

    const handleDeploy = async (e) => {
        if (e) e.preventDefault();
        if (!newPlan.title.trim()) return;
        await onAdd({ ...newPlan, type: 'task' });
        setNewPlan({ title: '', startTime: '09:00', endTime: '10:00' });
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-10 w-full max-w-md bg-white dark:bg-[#080808] p-8 md:p-10 rounded-sm group overflow-hidden border border-black dark:border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <ChippedBorder opacity={0.4} />

                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-8">
                                    <p className="text-[12px] md:text-[14px] font-bold leading-relaxed tracking-[0.2em] text-black/80 dark:text-white/80 uppercase">
                                        ADD NEW ACTIVITY
                                    </p>
                                    <button onClick={onClose} className="text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>

                                <form onSubmit={handleDeploy} className="space-y-6">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">ACTIVITY NAME</label>
                                        <input 
                                            value={newPlan.title}
                                            onChange={e => setNewPlan({...newPlan, title: e.target.value})}
                                            placeholder="DESCRIBE THE OPERATION..."
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-black tracking-[0.2em] uppercase placeholder:text-black/20 dark:placeholder:text-white/20 transition-all"
                                            autoFocus
                                            required
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">START TIME</label>
                                            <input 
                                                type="time" 
                                                value={newPlan.startTime} 
                                                onChange={e => setNewPlan({...newPlan, startTime: e.target.value})} 
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-black tracking-[0.1em] uppercase transition-all" 
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">END TIME</label>
                                            <input 
                                                type="time" 
                                                value={newPlan.endTime} 
                                                onChange={e => setNewPlan({...newPlan, endTime: e.target.value})} 
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-black tracking-[0.1em] uppercase transition-all" 
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-row gap-6 w-full pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 font-black uppercase tracking-[0.4em] text-[9px] hover:bg-black/10 hover:text-black dark:hover:bg-white/10 dark:hover:text-white transition-all active:scale-[0.98] rounded-sm"
                                        >
                                            CANCEL
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.4em] text-[9px] hover:bg-black/90 dark:hover:bg-white/90 transition-all active:scale-[0.98] rounded-sm relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-2 h-2 bg-white dark:bg-black rotate-45 translate-x-1 -translate-y-1" />
                                            DEPLOY
                                        </button>
                                    </div>
                                </form>
                                
                                <div className="absolute bottom-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                                    <span className="material-symbols-outlined text-9xl">terminal</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>,
        document.body
    );
};

export default AddPlanModal;
