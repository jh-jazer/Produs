import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Zap, Clock, CheckCheck } from 'lucide-react';
import useSWR from 'swr';
import api from '../../services/api';
import XpFeed from '../dashboard/XpFeed';
import DashboardModal from './DashboardModal';

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
        <DashboardModal
            isOpen={isOpen}
            onClose={onClose}
            title="NOTIFICATIONS"
            maxWidth="max-w-md"
        >
            <div className="flex flex-col h-[500px] md:h-[550px] -mt-4">
                {/* Tab Navigation */}
                <div className="grid grid-cols-2 mb-6 border-b border-foreground/10 pb-4">
                    {[
                        { id: 'alerts', label: 'ALERTS_', icon: Bell },
                        { id: 'activity', label: 'ACTIVITY_', icon: Zap }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center justify-center gap-2 transition-all relative ${
                                activeTab === tab.id 
                                ? 'text-foreground' 
                                : 'text-foreground/40 hover:text-foreground/60'
                            }`}
                        >
                            <tab.icon size={12} className={activeTab === tab.id ? 'text-primary' : ''} />
                            <span className="text-[10px] font-mono uppercase tracking-widest">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div 
                                    layoutId="activeTab"
                                    className="absolute -bottom-4 left-0 right-0 h-[2px] bg-primary"
                                />
                            )}
                            {tab.id === 'alerts' && unreadCount > 0 && (
                                <span className="absolute -top-1 -right-2 size-1.5 rounded-full bg-primary" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {activeTab === 'alerts' ? (
                            <motion.div
                                key="alerts"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-3 min-h-full flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div />
                                    {notifications.some(n => !n.read) && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="flex items-center gap-1.5 text-[8px] font-mono text-primary uppercase tracking-widest hover:opacity-80 transition-opacity"
                                        >
                                            <CheckCheck size={10} /> Mark all read
                                        </button>
                                    )}
                                </div>

                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <motion.div
                                            key={notification._id}
                                            className={`group relative p-4 rounded-sm border transition-all ${notification.read ? 'bg-transparent border-foreground/5' : 'bg-foreground/5 border-primary/20 shadow-sm'}`}
                                        >
                                            <div className="flex gap-4">
                                                <div className={`size-10 rounded-sm flex items-center justify-center shrink-0 ${getColor(notification.type)}`}>
                                                    <span className="material-symbols-outlined text-xl">{getIcon(notification.type)}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-[10px] font-black uppercase tracking-wider leading-snug ${notification.read ? 'text-foreground/60' : 'text-foreground'}`}>
                                                        {notification.text}
                                                    </p>
                                                    <p className="text-[8px] font-mono text-foreground/40 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                                        <Clock size={8} /> {timeAgo(notification.createdAt)}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification._id)}
                                                        className="size-1.5 rounded-full bg-primary mt-2 shrink-0"
                                                    />
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDelete(notification._id)}
                                                className="absolute top-2 right-2 size-6 flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-rose-500 transition-all font-mono text-[10px]"
                                            >
                                                DEL
                                            </button>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                                        <Bell size={40} className="mb-4 text-foreground/20" />
                                        <p className="text-[10px] font-mono uppercase tracking-widest">No Alerts at Present</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="activity"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="min-h-full flex flex-col"
                            >
                                <XpFeed user={user} markAllRead={true} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardModal>
    );
};

export default NotificationModal;
