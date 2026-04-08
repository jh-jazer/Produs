/* eslint-disable */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const UserMenuModal = ({ isOpen, onClose, user, unreadCount, onOpenSettings, onOpenNotifications, onOpenBugReport, onSignOut }) => {
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#121212]/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative z-10 w-full max-w-md bg-slate-50/90 dark:bg-[#080808]/90 backdrop-blur-2xl border border-cyan-500/30 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden"
                    >
                        <div className="p-6 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
                            <div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-white/40 mb-1 flex items-center gap-2">
                                    <span className="size-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                    Authenticated As
                                </h2>
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold text-black dark:text-white leading-tight">{user?.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {user?.username && <p className="text-[9px] font-medium text-cyan-500/80 tracking-wider">@{user.username}</p>}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-8 flex items-center justify-center rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-black/40 dark:text-white/40 transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <div className="p-4 flex flex-col gap-1">


                            {(user?.email === 'ernestodesabillejr@gmail.com' || user?.isAdmin) && (
                                <button onClick={() => { onClose(); navigate('/dashboard/admin'); }} className="w-full px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-cyan-500/5 dark:hover:bg-white/5 rounded-[20px] transition-all flex items-center gap-4">
                                    <span className="material-symbols-outlined text-2xl">admin_panel_settings</span> Manage
                                </button>
                            )}



                            <button onClick={() => { onClose(); onOpenSettings(); }} className="w-full px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-cyan-500/5 dark:hover:bg-white/5 rounded-[20px] transition-all flex items-center gap-4">
                                <span className="material-symbols-outlined text-2xl">settings</span> Settings
                            </button>



                            {user?.email !== 'ernestodesabillejr@gmail.com' && !user?.isAdmin && (
                                <button onClick={() => { onClose(); onOpenBugReport(); }} className="w-full px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-cyan-500/5 dark:hover:bg-white/5 rounded-[20px] transition-all flex items-center gap-4">
                                    <span className="material-symbols-outlined text-2xl">bug_report</span> Bug Report
                                </button>
                            )}

                            <button onClick={onSignOut} className="w-full px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-signal-orange hover:bg-signal-orange/5 rounded-[20px] transition-all flex items-center gap-4">
                                <span className="material-symbols-outlined text-2xl">logout</span> Sign Out
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UserMenuModal;
