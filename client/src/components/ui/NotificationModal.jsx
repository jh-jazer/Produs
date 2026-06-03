import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Zap, Clock, CheckCheck, Users } from 'lucide-react';
import useSWR, { useSWRConfig } from 'swr';
import api from '../../services/api';
import XpFeed from '../dashboard/XpFeed';
import DashboardModal from './DashboardModal';
import Avatar from './Avatar';
import useAuthStore from '../../store/useAuthStore';
import { soundManager } from '../../services/sound';

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
    const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' | 'social' | 'activity'
    const { data: notifications = [], mutate } = useSWR('/notifications');
    const { mutate: globalMutate } = useSWRConfig();
    const unreadCount = notifications.filter(n => !n.read).length;
    const { syncUser } = useAuthStore();

    useEffect(() => {
        const syncProfile = async () => {
            if (isOpen) {
                try {
                    const res = await api.get('/auth/me');
                    syncUser(res.data);
                    globalMutate('/auth/me');
                } catch (e) {
                    console.error("Failed to sync profile on modal open", e);
                }
            }
        };
        syncProfile();
    }, [isOpen, syncUser, globalMutate]);

    // Social tab state
    const [connectionsData, setConnectionsData] = useState({ incoming: [], outgoing: [] });
    const [isFetchingRequests, setIsFetchingRequests] = useState(false);
    const [handlingId, setHandlingId] = useState(null);

    const fetchRequests = useCallback(async () => {
        if (!isOpen) return;
        try {
            setIsFetchingRequests(true);
            const res = await api.get('/auth/connections');
            setConnectionsData(res.data);
        } catch (err) {
            console.error('Failed to fetch connection requests', err);
        } finally {
            setIsFetchingRequests(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && activeTab === 'social') {
            fetchRequests();
        }
    }, [isOpen, activeTab, fetchRequests]);

    const handleCancelRequest = async (targetUserId) => {
        try {
            setHandlingId(targetUserId);
            await api.post(`/auth/connection/cancel/${targetUserId}`);
            await fetchRequests();
            const res = await api.get('/auth/me');
            syncUser(res.data);
            globalMutate('/auth/me');
        } catch (err) {
            console.error('Failed to cancel connection request', err);
        } finally {
            setHandlingId(null);
        }
    };

    const handleConnectionAction = async (action, targetUserId) => {
        try {
            setHandlingId(targetUserId);
            const endpoint = action === 'accept'
                ? `/auth/connection/accept/${targetUserId}`
                : `/auth/connection/reject/${targetUserId}`;
            await api.post(endpoint);
            if (action === 'accept') {
                soundManager.play('connectionAccepted');
            }
            // Refresh both requests list and user state
            await fetchRequests();
            const res = await api.get('/auth/me');
            syncUser(res.data);
            globalMutate('/auth/me');
        } catch (err) {
            console.error(`Failed to ${action} connection`, err);
        } finally {
            setHandlingId(null);
        }
    };

    const handlePartnerRequest = async (action) => {
        try {
            setHandlingId('partner');
            const endpoint = `/auth/partner/${action}`;
            await api.post(endpoint);
            if (action === 'accept') {
                soundManager.play('connectionAccepted');
            }
            
            // Sync user data
            const res = await api.get('/auth/me');
            syncUser(res.data);
            globalMutate('/auth/me');
            
            // Refresh notifications SWR
            mutate();
        } catch (err) {
            console.error(`Failed to ${action} partner request`, err);
        } finally {
            setHandlingId(null);
        }
    };

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



    const getIcon = (type, notif) => {
        if (notif?.icon) return notif.icon;
        switch (type) {
            case 'achievement': return 'emoji_events';
            case 'habit': return 'history_edu';
            case 'finance': return 'payments';
            case 'partner': return 'favorite';
            case 'connection': return 'person_add';
            default: return 'notifications';
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'achievement': return 'text-amber-500 bg-amber-500/10';
            case 'habit': return 'text-primary bg-primary/10';
            case 'finance': return 'text-emerald-500 bg-emerald-500/10';
            case 'partner': return 'text-rose-500 bg-rose-500/10';
            case 'connection': return 'text-primary bg-primary/10';
            default: return 'text-slate-400 bg-slate-400/10';
        }
    };

    const totalSocialBadge = 
        (connectionsData.incoming?.length || 0) + 
        (connectionsData.outgoing?.length || 0) + 
        (user?.incomingPartnerRequest ? 1 : 0) + 
        (user?.outgoingPartnerRequest ? 1 : 0);

    const hasIncoming = (connectionsData.incoming?.length > 0) || !!user?.incomingPartnerRequest;
    const incomingBadgeCount = (connectionsData.incoming?.length || 0) + (user?.incomingPartnerRequest ? 1 : 0);

    const hasOutgoing = (connectionsData.outgoing?.length > 0) || !!user?.outgoingPartnerRequest;
    const outgoingBadgeCount = (connectionsData.outgoing?.length || 0) + (user?.outgoingPartnerRequest ? 1 : 0);

    const tabs = [
        { id: 'alerts',   label: 'ALERTS_',   icon: Bell,  badge: unreadCount },
        { id: 'social',   label: 'SOCIAL_',    icon: Users, badge: totalSocialBadge },
        { id: 'activity', label: 'ACTIVITY_',  icon: Zap,   badge: 0 },
    ];

    return (
        <DashboardModal
            isOpen={isOpen}
            onClose={onClose}
            title="NOTIFICATIONS"
            maxWidth="max-w-md"
        >
            <div className="flex flex-col h-[500px] md:h-[550px] -mt-4">
                {/* Tab Navigation */}
                <div className="grid grid-cols-3 mb-6 border-b border-foreground/10 pb-4">
                    {tabs.map((tab) => (
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
                            {tab.badge > 0 && (
                                <span className="absolute -top-1 -right-2 size-1.5 rounded-full bg-primary" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {/* ── ALERTS TAB ── */}
                        {activeTab === 'alerts' && (
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

                                                    {notification.type === 'partner' && !notification.read && user?.incomingPartnerRequest && (
                                                        <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={async () => {
                                                                    await handlePartnerRequest('accept');
                                                                    handleMarkAsRead(notification._id);
                                                                }}
                                                                disabled={handlingId !== null}
                                                                className="px-3 py-1.5 bg-rose-500 text-white rounded-sm text-[8px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                                                            >
                                                                {handlingId === 'partner' ? '...' : 'Accept'}
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    await handlePartnerRequest('reject');
                                                                    handleMarkAsRead(notification._id);
                                                                }}
                                                                disabled={handlingId !== null}
                                                                className="px-3 py-1.5 bg-foreground/5 hover:bg-foreground/10 text-foreground border border-foreground/10 rounded-sm text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                                                            >
                                                                Decline
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification._id)}
                                                        className="size-1.5 rounded-full bg-primary mt-2 shrink-0"
                                                    />
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                                        <Bell size={40} className="mb-4 text-foreground/20" />
                                        <p className="text-[10px] font-mono uppercase tracking-widest">No Alerts at Present</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ── SOCIAL TAB ── */}
                        {activeTab === 'social' && (
                            <motion.div
                                key="social"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4 min-h-full flex flex-col"
                            >
                                {isFetchingRequests ? (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
                                        <div className="size-8 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                                        <p className="text-[9px] font-mono uppercase tracking-widest text-foreground/40">Loading...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Incoming */}
                                        <div className="space-y-2">
                                            <p className="text-[8px] font-mono uppercase tracking-[0.3em] text-foreground/30 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[12px]">inbox</span>
                                                Incoming
                                                {incomingBadgeCount > 0 && (
                                                    <span className="ml-auto size-4 flex items-center justify-center rounded-full bg-primary/10 text-primary text-[8px] font-black">
                                                        {incomingBadgeCount}
                                                    </span>
                                                )}
                                            </p>
                                            {hasIncoming ? (
                                                <>
                                                    {user?.incomingPartnerRequest && (
                                                        <motion.div
                                                            layout
                                                            initial={{ opacity: 0, y: 8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-sm flex items-center justify-between gap-3"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="size-9 rounded-full overflow-hidden border border-rose-500/30 flex items-center justify-center shrink-0">
                                                                    <Avatar config={user.incomingPartnerRequest.avatar} scale={1} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-[11px] font-black text-foreground uppercase tracking-wider truncate">{user.incomingPartnerRequest.name}</p>
                                                                    <p className="text-[9px] text-foreground/40 font-mono uppercase tracking-widest mt-0.5 truncate">@{user.incomingPartnerRequest.username}</p>
                                                                    <p className="text-[8px] text-rose-500 font-black uppercase tracking-widest mt-1">Partner Link Request</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <button
                                                                    onClick={() => handlePartnerRequest('reject')}
                                                                    disabled={handlingId !== null}
                                                                    className="size-8 flex items-center justify-center rounded-sm bg-foreground/5 border border-foreground/10 text-foreground/40 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all active:scale-90 disabled:opacity-40"
                                                                    title="Decline"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handlePartnerRequest('accept')}
                                                                    disabled={handlingId !== null}
                                                                    className="size-8 flex items-center justify-center rounded-sm bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:scale-110 active:scale-90 transition-all disabled:opacity-40"
                                                                    title="Accept"
                                                                >
                                                                    {handlingId === 'partner' ? (
                                                                        <div className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                                                    ) : (
                                                                        <span className="material-symbols-outlined text-[16px]">check</span>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                    {connectionsData.incoming?.map((u) => (
                                                        <motion.div
                                                            key={u._id}
                                                            layout
                                                            initial={{ opacity: 0, y: 8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            className="p-4 bg-primary/5 border border-primary/20 rounded-sm flex items-center justify-between gap-3"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="size-9 rounded-full overflow-hidden border border-primary/30 flex items-center justify-center shrink-0">
                                                                    <Avatar config={u.avatar} scale={1} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-[11px] font-black text-foreground uppercase tracking-wider truncate">{u.name}</p>
                                                                    <p className="text-[9px] text-foreground/40 font-mono uppercase tracking-widest mt-0.5 truncate">@{u.username}</p>
                                                                    <p className="text-[8px] text-primary font-black uppercase tracking-widest mt-1">Wants to connect</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <button
                                                                    onClick={() => handleConnectionAction('reject', u._id)}
                                                                    disabled={handlingId === u._id}
                                                                    className="size-8 flex items-center justify-center rounded-sm bg-foreground/5 border border-foreground/10 text-foreground/40 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all active:scale-90 disabled:opacity-40"
                                                                    title="Decline"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleConnectionAction('accept', u._id)}
                                                                    disabled={handlingId === u._id}
                                                                    className="size-8 flex items-center justify-center rounded-sm bg-primary text-white shadow-lg shadow-primary/20 hover:scale-110 active:scale-90 transition-all disabled:opacity-40"
                                                                    title="Accept"
                                                                >
                                                                    {handlingId === u._id ? (
                                                                        <div className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                                                    ) : (
                                                                        <span className="material-symbols-outlined text-[16px]">check</span>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </>
                                            ) : (
                                                <p className="text-[9px] font-mono text-foreground/20 uppercase tracking-widest pl-1">No incoming requests</p>
                                            )}
                                        </div>

                                        {/* Divider */}
                                        <div className="h-px bg-foreground/5" />

                                        {/* Outgoing */}
                                        <div className="space-y-2">
                                            <p className="text-[8px] font-mono uppercase tracking-[0.3em] text-foreground/30 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[12px]">outgoing_mail</span>
                                                Sent
                                                {outgoingBadgeCount > 0 && (
                                                    <span className="ml-auto size-4 flex items-center justify-center rounded-full bg-foreground/10 text-foreground/40 text-[8px] font-black">
                                                        {outgoingBadgeCount}
                                                    </span>
                                                )}
                                            </p>
                                            {hasOutgoing ? (
                                                <>
                                                    {user?.outgoingPartnerRequest && (
                                                        <motion.div
                                                            layout
                                                            initial={{ opacity: 0, y: 8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-sm flex items-center justify-between gap-3 group"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="size-9 rounded-full overflow-hidden border border-rose-500/10 flex items-center justify-center shrink-0">
                                                                    <Avatar config={user.outgoingPartnerRequest.avatar} scale={1} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-[11px] font-black text-foreground uppercase tracking-wider truncate">{user.outgoingPartnerRequest.name}</p>
                                                                    <p className="text-[9px] text-foreground/40 font-mono uppercase tracking-widest mt-0.5 truncate">@{user.outgoingPartnerRequest.username}</p>
                                                                    <p className="text-[8px] text-rose-500 font-black uppercase tracking-widest mt-1 animate-pulse">Partner link pending</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handlePartnerRequest('cancel')}
                                                                disabled={handlingId !== null}
                                                                className="px-3 py-1.5 bg-rose-500/5 hover:bg-rose-500/10 rounded-sm text-[8px] font-black uppercase tracking-widest text-rose-500 transition-all active:scale-95 disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                                                            >
                                                                {handlingId === 'partner' ? (
                                                                    <div className="size-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-[12px]">close</span>
                                                                )}
                                                                Cancel
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                    {connectionsData.outgoing?.map((u) => (
                                                        <motion.div
                                                            key={u._id}
                                                            layout
                                                            initial={{ opacity: 0, y: 8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            className="p-4 bg-foreground/[0.02] border border-foreground/10 rounded-sm flex items-center justify-between gap-3 group"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="size-9 rounded-full overflow-hidden border border-foreground/10 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all flex items-center justify-center shrink-0">
                                                                    <Avatar config={u.avatar} scale={1} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-[11px] font-black text-foreground/50 group-hover:text-foreground uppercase tracking-wider truncate transition-colors">{u.name}</p>
                                                                    <p className="text-[9px] text-foreground/30 font-mono uppercase tracking-widest mt-0.5 truncate">@{u.username}</p>
                                                                    <p className="text-[8px] text-foreground/30 font-black uppercase tracking-widest mt-1 animate-pulse">Awaiting response</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleCancelRequest(u._id)}
                                                                disabled={handlingId === u._id}
                                                                className="px-3 py-1.5 bg-foreground/5 hover:bg-rose-500/10 rounded-sm text-[8px] font-black uppercase tracking-widest text-foreground/40 hover:text-rose-500 transition-all active:scale-95 disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                                                            >
                                                                {handlingId === u._id ? (
                                                                    <div className="size-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-[12px]">close</span>
                                                                )}
                                                                Cancel
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </>
                                            ) : (
                                                <p className="text-[9px] font-mono text-foreground/20 uppercase tracking-widest pl-1">No sent requests</p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {/* ── ACTIVITY TAB ── */}
                        {activeTab === 'activity' && (
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
