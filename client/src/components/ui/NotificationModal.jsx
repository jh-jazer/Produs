import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import api from '../../services/api';

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const NotificationModal = ({ isOpen, onClose }) => {
    const { data: notifications = [], mutate } = useSWR('/notifications');

    const handleMarkAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}`, { read: true });
            mutate();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.patch('/notifications', { read: true });
            mutate();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            mutate();
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'achievement': return 'emoji_events';
            case 'habit': return 'history_edu';
            case 'finance': return 'payments';
            case 'partner': return 'favorite';
            default: return 'notifications';
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'achievement': return 'text-amber-500 bg-amber-500/10';
            case 'habit': return 'text-primary bg-primary/10';
            case 'finance': return 'text-emerald-500 bg-emerald-500/10';
            case 'partner': return 'text-rose-500 bg-rose-500/10';
            default: return 'text-slate-400 bg-slate-400/10';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                        className="relative z-10 w-full max-w-md bg-white dark:bg-[#121212] rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-black/[0.08] dark:border-white/10 overflow-hidden ar-corners flex flex-col max-h-[70vh]"
                    >
                        <div className="p-6 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
                            <div>
                                <h3 className="text-xl font-semibold text-black dark:text-white tracking-[-0.02em]">Notifications</h3>
                                <p className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest mt-0.5">Stay updated with your progress</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {notifications.some(n => !n.read) && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-[10px] font-bold text-primary hover:opacity-80 transition-opacity uppercase tracking-widest px-2"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="size-8 flex items-center justify-center rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-black/40 dark:text-white/40 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <motion.div
                                        key={notification._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`group relative p-4 rounded-2xl border transition-all ${notification.read ? 'bg-transparent border-black/[0.04] dark:border-white/[0.04]' : 'bg-black/[0.02] dark:bg-white/[0.02] border-primary/20 shadow-sm'}`}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${getColor(notification.type)}`}>
                                                <span className="material-symbols-outlined text-xl">{getIcon(notification.type)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold leading-snug ${notification.read ? 'text-black/60 dark:text-white/60' : 'text-black dark:text-white'}`}>
                                                    {notification.text}
                                                </p>
                                                <p className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest mt-1">
                                                    {timeAgo(notification.createdAt)}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                    className="size-2 rounded-full bg-primary mt-2 shrink-0"
                                                    title="Mark as read"
                                                />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(notification._id)}
                                            className="absolute top-2 right-2 size-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-rose-500 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                                    <span className="material-symbols-outlined text-5xl mb-4">notifications_off</span>
                                    <p className="text-sm font-bold uppercase tracking-widest">No notifications yet</p>
                                    <p className="text-[10px] font-medium mt-1">We'll let you know when something happens.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-black/[0.06] dark:border-white/[0.06] bg-black/[0.01] dark:bg-white/[0.01]">
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-[24px] font-semibold text-xs uppercase tracking-[0.3em] hover:opacity-90 transition-all active:scale-[0.98]"
                            >
                                Done
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default NotificationModal;
