import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Zap, Clock, X, CheckCheck } from 'lucide-react';
import useSWR from 'swr';
import api from '../../services/api';
import XpFeed from '../dashboard/XpFeed';

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

const NotificationModal = ({ isOpen, onClose, user }) => {
    const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' | 'activity'
    const { data: notifications = [], mutate } = useSWR('/notifications');
    const unreadCount = notifications.filter(n => !n.read).length;

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
                        <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
                            <div>
                                <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-tighter italic font-exo">Intelligence_Hub</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="size-1 rounded-full bg-cyan-500 animate-pulse" />
                                    <p className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest leading-none">SYSTEM_MONITOR_LIVE</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-8 flex items-center justify-center rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-black/40 dark:text-white/40 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex px-6 pt-4 border-b border-black/[0.03] dark:border-white/[0.03] bg-black/[0.01] dark:bg-white/[0.01] gap-8">
                            {[
                                { id: 'alerts', label: 'ALERTS_', icon: Bell },
                                { id: 'activity', label: 'ACTIVITY_', icon: Zap }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-3 flex items-center gap-2 transition-all relative ${
                                        activeTab === tab.id 
                                        ? 'text-black dark:text-white' 
                                        : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
                                    }`}
                                >
                                    <tab.icon size={12} className={activeTab === tab.id ? 'text-cyan-500' : ''} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] italic font-exo">{tab.label}</span>
                                    {activeTab === tab.id && (
                                        <motion.div 
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"
                                        />
                                    )}
                                    {tab.id === 'alerts' && unreadCount > 0 && (
                                        <span className="mb-2 size-1.5 rounded-full bg-rose-500" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            <AnimatePresence mode="wait">
                                {activeTab === 'alerts' ? (
                                    <motion.div
                                        key="alerts"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-3"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SYSTEM_NOTIFICATIONS</span>
                                            {notifications.some(n => !n.read) && (
                                                <button
                                                    onClick={handleMarkAllAsRead}
                                                    className="flex items-center gap-1.5 text-[9px] font-black text-cyan-500 uppercase tracking-widest hover:text-cyan-400 transition-colors"
                                                >
                                                    <CheckCheck size={10} /> Mark all read
                                                </button>
                                            )}
                                        </div>

                                        {notifications.length > 0 ? (
                                            notifications.map((notification) => (
                                                <motion.div
                                                    key={notification._id}
                                                    className={`group relative p-4 rounded-2xl border transition-all ${notification.read ? 'bg-transparent border-black/[0.04] dark:border-white/[0.04]' : 'bg-black/[0.02] dark:bg-white/[0.02] border-cyan-500/20 shadow-sm'}`}
                                                >
                                                    <div className="flex gap-4">
                                                        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${getColor(notification.type)}`}>
                                                            <span className="material-symbols-outlined text-xl">{getIcon(notification.type)}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs font-bold leading-snug ${notification.read ? 'text-black/60 dark:text-white/60' : 'text-black dark:text-white'}`}>
                                                                {notification.text}
                                                            </p>
                                                            <p className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                                                <Clock size={8} /> {timeAgo(notification.createdAt)}
                                                            </p>
                                                        </div>
                                                        {!notification.read && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(notification._id)}
                                                                className="size-1.5 rounded-full bg-cyan-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                                                            />
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(notification._id)}
                                                        className="absolute top-2 right-2 size-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-rose-500 transition-all font-mono text-[10px]"
                                                    >
                                                        DEL
                                                    </button>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                                                <Bell size={40} className="mb-4 text-slate-300" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">No Alerts at Present</p>
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="activity"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <XpFeed user={user} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="p-6 border-t border-black/[0.06] dark:border-white/[0.06] bg-black/[0.01] dark:bg-white/[0.01]">
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-[24px] font-black text-[10px] uppercase tracking-[0.4em] hover:opacity-90 transition-all active:scale-[0.98] italic font-exo shadow-lg"
                            >
                                CLOSE_PORTAL_
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default NotificationModal;
