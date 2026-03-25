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
                        className="relative z-10 w-full max-w-md bg-white dark:bg-[#121212] rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-black/[0.08] dark:border-white/10 overflow-hidden ar-corners"
                    >
                        <div className="p-6 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mb-1">Authenticated As</p>
                                <p className="text-sm font-bold text-black dark:text-white">{user?.name}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-8 flex items-center justify-center rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-black/40 dark:text-white/40 transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <div className="p-4 flex flex-col gap-1">
                            <button onClick={() => { onClose(); navigate('/dashboard/profile'); }} className="w-full px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-[20px] transition-all flex items-center gap-4">
                                <span className="material-symbols-outlined text-2xl">person</span> Profile
                            </button>

                            {user?.email === 'ernestodesabillejr@gmail.com' && (
                                <button onClick={() => { onClose(); navigate('/dashboard/admin'); }} className="w-full px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-[20px] transition-all flex items-center gap-4">
                                    <span className="material-symbols-outlined text-2xl">admin_panel_settings</span> Manage
                                </button>
                            )}

                            <button onClick={() => { onClose(); onOpenNotifications(); }} className="w-full px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-[20px] transition-all flex items-center gap-4 relative">
                                <span className="material-symbols-outlined text-2xl">notifications</span> Notifications
                                {unreadCount > 0 && (
                                    <span className="absolute left-9 top-4 size-2.5 bg-primary rounded-full border-2 border-white dark:border-[#121212]" />
                                )}
                            </button>

                            <button onClick={() => { onClose(); onOpenSettings(); }} className="w-full px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-[20px] transition-all flex items-center gap-4">
                                <span className="material-symbols-outlined text-2xl">settings</span> Settings
                            </button>

                            <div className="h-px bg-black/[0.06] dark:bg-white/[0.06] my-2" />

                            <button onClick={() => { onClose(); onOpenBugReport(); }} className="w-full px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-[20px] transition-all flex items-center gap-4">
                                <span className="material-symbols-outlined text-2xl">bug_report</span> Bug Report
                            </button>

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
