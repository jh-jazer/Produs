import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ChippedBorder from './ChippedBorder';

const SaveTemplateModal = ({ isOpen, onClose, onSave, currentActivitiesCount = 0 }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!name.trim()) return;

        onSave({
            name: name.trim().toUpperCase(),
            description: description.trim() || 'CUSTOM ARCHIVED DAILY PLAN PROTOCOL.'
        });

        setName('');
        setDescription('');
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
                                    <div className="flex flex-col">
                                        <p className="text-[12px] md:text-[14px] font-bold leading-relaxed tracking-[0.2em] text-black/80 dark:text-white/80 uppercase">
                                            SAVE DAILY PROTOCOL
                                        </p>
                                        <span className="text-[8px] font-mono uppercase text-black/40 dark:text-white/40 tracking-widest mt-0.5">
                                            ARCHIVE {currentActivitiesCount} ONGOING OPERATIONS
                                        </span>
                                    </div>
                                    <button onClick={onClose} className="text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">PROTOCOL NAME</label>
                                        <input 
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="E.G., DEEP SUNDAY FOCUS..."
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-black tracking-[0.2em] uppercase placeholder:text-black/20 dark:placeholder:text-white/20 transition-all"
                                            autoFocus
                                            required
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">DESCRIPTION / GOAL</label>
                                        <textarea 
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder="DESCRIBE THE OUTCOME OF THIS PROTOCOL..."
                                            rows={3}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-medium tracking-wide placeholder:text-black/20 dark:placeholder:text-white/20 transition-all resize-none"
                                        />
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
                                            ARCHIVE
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>,
        document.body
    );
};

export default SaveTemplateModal;
