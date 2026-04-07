import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const BugReportModal = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState(null); // 'success' or 'error'

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus(null);

        try {
            await api.post('/bugs', { title, description, severity });
            setStatus('success');
            setTitle('');
            setDescription('');
            setSeverity('medium');
            setTimeout(() => {
                onClose();
                setStatus(null);
            }, 2000);
        } catch (error) {
            console.error('Failed to submit bug report:', error);
            setStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#121212]/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative z-10 w-full max-w-lg bg-slate-50/90 dark:bg-[#080808]/90 backdrop-blur-2xl border border-cyan-500/30 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-8"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-rose-500 text-2xl">bug_report</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Report a Bug</h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Help us improve the orbit.</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-[#000000] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        {status === 'success' ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 text-center"
                            >
                                <div className="size-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                                    <span className="material-symbols-outlined text-emerald-500 text-4xl">check_circle</span>
                                </div>
                                <h3 className="text-xl font-bold dark:text-white mb-2">Report Received!</h3>
                                <p className="text-slate-500 dark:text-slate-400">Our engineers are on it. Thank you!</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Problem Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Briefly, what is wrong?"
                                        className="w-full bg-slate-50 dark:bg-[#121212]/50 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3 text-sm font-medium focus:border-primary transition-colors outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Detailed Description</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What happened? How can we reproduce it?"
                                        className="w-full bg-slate-50 dark:bg-[#121212]/50 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3 text-sm font-medium focus:border-primary transition-colors outline-none resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Severity</label>
                                        <select
                                            value={severity}
                                            onChange={(e) => setSeverity(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-[#121212]/50 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3 text-sm font-bold focus:border-primary transition-colors outline-none appearance-none"
                                        >
                                            <option value="low">Low - Minor issue</option>
                                            <option value="medium">Medium - Important</option>
                                            <option value="high">High - Breaking thing</option>
                                            <option value="critical">Critical - Unusable</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            disabled={isSubmitting}
                                            type="submit"
                                            className="w-full py-3 bg-[#121212] dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm hover:opacity-90 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Reporting...' : 'Submit Report'}
                                        </button>
                                    </div>
                                </div>
                                {status === 'error' && (
                                    <p className="text-center text-xs font-bold text-rose-500">Failed to send report. Please try again.</p>
                                )}
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BugReportModal;
