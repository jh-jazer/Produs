import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const UserMenuModal = ({ isOpen, onClose, user, unreadCount, onOpenSettings, onOpenNotifications, onOpenBugReport, onOpenStats, onSignOut }) => {
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
                        className="relative z-10 w-full max-w-md bg-slate-50/90 dark:bg-[#080808]/90 backdrop-blur-2xl border border-primary/30 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden"
                    >
                        <div className="p-6 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
                            <div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-white/40 mb-1 flex items-center gap-2">
                                    <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                                    Authenticated As
                                </h2>
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold text-black dark:text-white leading-tight">{user?.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {user?.username && <p className="text-[9px] font-medium text-primary/80 tracking-wider">@{user.username}</p>}
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
                                <button onClick={() => { onClose(); navigate('/dashboard/admin'); }} className="w-full px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-primary/5 dark:hover:bg-white/5 rounded-[20px] transition-all flex items-center gap-4">
                                    <span className="material-symbols-outlined text-lg opacity-40">admin_panel_settings</span>
                                    <span>System_Control_</span>
                                </button>
                            )}



                            <button onClick={() => { onClose(); onOpenNotifications(); }} className="w-full px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-primary/5 dark:hover:bg-white/5 rounded-[20px] transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-lg opacity-40 group-hover:opacity-100 transition-opacity">notifications</span>
                                    <span>Notifications_</span>
                                </div>
                                {unreadCount > 0 && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[8px] animate-in fade-in slide-in-from-right-2 duration-500">
                                        <span className="size-1 rounded-full bg-rose-500 animate-pulse" />
                                        {unreadCount}
                                    </div>
                                )}
                            </button>

                            <button onClick={() => { onClose(); onOpenSettings(); }} className="w-full px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-primary/5 dark:hover:bg-white/5 rounded-[20px] transition-all flex items-center gap-4">
                                <span className="material-symbols-outlined text-lg opacity-40">settings</span>
                                <span>Settings_</span>
                            </button>



                            <button onClick={() => { onClose(); onOpenStats(); }} className="w-full px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-primary/5 dark:hover:bg-white/5 rounded-[20px] transition-all flex items-center gap-4">
                                <span className="material-symbols-outlined text-lg opacity-40">bar_chart</span>
                                <span>Statistics_</span>
                            </button>

                            <button onClick={() => { onClose(); onOpenBugReport(); }} className="w-full px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-primary/5 dark:hover:bg-white/5 rounded-[20px] transition-all flex items-center gap-4">
                                <span className="material-symbols-outlined text-lg opacity-40">bug_report</span>
                                <span>Report_Bug_</span>
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
