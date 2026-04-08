/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Avatar from './Avatar';
import useAuthStore from '../../store/useAuthStore';

const ConnectionsModal = ({ isOpen, onClose, onProfileClick }) => {
    const { user, syncUser } = useAuthStore();
    const [connectionsData, setConnectionsData] = useState({ connections: [], incoming: [], outgoing: [] });
    const [isFetchingConnections, setIsFetchingConnections] = useState(false);
    const [activeConnectionsTab, setActiveConnectionsTab] = useState('connections');

    const fetchConnections = async () => {
        if (!isOpen) return;
        try {
            setIsFetchingConnections(true);
            const res = await api.get('/auth/connections');
            setConnectionsData(res.data);
        } catch (err) {
            console.error("Failed to fetch connections", err);
        } finally {
            setIsFetchingConnections(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, [isOpen]);

    const handleConnectionAction = async (action, targetUserId) => {
        try {
            let endpoint = '';
            if (action === 'accept') endpoint = `/auth/connections/accept/${targetUserId}`;
            else if (action === 'reject') endpoint = `/auth/connections/reject/${targetUserId}`;
            else if (action === 'cancel') endpoint = `/auth/connections/cancel/${targetUserId}`;
            else if (action === 'disconnect') endpoint = `/auth/connections/disconnect/${targetUserId}`;

            await api.post(endpoint);
            fetchConnections();

            // Sync local user state to update notifications (red dot)
            const res = await api.get('/auth/me');
            syncUser(res.data);
        } catch (err) {
            console.error(`Failed to ${action} connection`, err);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-[#121212]/60 dark:bg-black/80 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-slate-50/90 dark:bg-[#080808]/90 backdrop-blur-2xl border border-cyan-500/30 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col max-h-[85vh]"
                >
                    <div className="p-6 border-b border-black/[0.05] dark:border-white/10 flex items-center justify-between">
                        <div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-white/40 mb-2 flex items-center gap-2">
                                <span className="size-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                Connections
                            </h2>
                            <p className="text-xl font-black text-slate-900 dark:text-white">Manage your network</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="size-10 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 text-slate-500 hover:text-rose-500 transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1.5 bg-black/5 dark:bg-white/5 m-4 rounded-2xl shrink-0">
                        {[
                            { id: 'connections', label: 'Network', icon: 'hub', count: connectionsData.connections.length },
                            { id: 'incoming', label: 'Requests', icon: 'inbox', count: connectionsData.incoming.length },
                            { id: 'outgoing', label: 'Pending', icon: 'outgoing_mail', count: connectionsData.outgoing.length }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveConnectionsTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[14px] text-xs font-black uppercase tracking-tighter transition-all relative ${
                                    activeConnectionsTab === tab.id
                                        ? 'bg-white dark:bg-[#121212] text-cyan-500 shadow-none'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className={`size-4 flex items-center justify-center rounded-full text-[9px] font-black ${
                                        activeConnectionsTab === tab.id ? 'bg-cyan-500 text-white' : 'bg-slate-300 dark:bg-[#121212] text-slate-600 dark:text-slate-400'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
                        {isFetchingConnections ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <div className="size-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading network...</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {activeConnectionsTab === 'connections' && (
                                    connectionsData.connections.length > 0 ? connectionsData.connections.map(u => (
                                         <div key={u._id} className={`p-3 border rounded-2xl flex items-center justify-between group ${user?.partner?._id === u._id ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-500/5 dark:border-rose-500/20 shadow-none' : 'bg-slate-50 dark:bg-[#121212]/40 border-slate-100 dark:border-white/10'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="size-11 rounded-full bg-white dark:bg-[#000000] overflow-hidden border border-slate-200 dark:border-white/10 shadow-none flex items-center justify-center">
                                                    <Avatar config={u.avatar} scale={0.8} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{u.name}</p>
                                                        {user?.partner?._id === u._id && (
                                                            <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest leading-none shadow-none">Shared</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">@{u.username}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { onProfileClick(u.username); }} className="size-9 flex items-center justify-center rounded-xl bg-white dark:bg-[#000000] border border-slate-200 dark:border-white/10 text-slate-400 hover:text-primary transition-all active:scale-95" title="View Profile">
                                                    <span className="material-symbols-outlined text-[18px]">person</span>
                                                </button>
                                                {user?.partner?._id !== u._id && (
                                                    <button
                                                        onClick={() => {
                                                            if(window.confirm(`Disconnect from ${u.name}?`)) {
                                                                handleConnectionAction('disconnect', u._id);
                                                            }
                                                        }}
                                                        className="size-9 flex items-center justify-center rounded-xl bg-white dark:bg-[#000000] border border-slate-200 dark:border-white/10 text-slate-400 hover:text-rose-500 transition-all active:scale-95"
                                                        title="Disconnect"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">link_off</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-12 text-center opacity-40">
                                            <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                                            <p className="text-xs font-black uppercase tracking-widest">Network empty</p>
                                        </div>
                                    )
                                )}

                                {activeConnectionsTab === 'incoming' && (
                                    connectionsData.incoming.length > 0 ? connectionsData.incoming.map(u => (
                                        <div key={u._id} className="p-3 bg-slate-50 dark:bg-[#121212]/40 border border-slate-100 dark:border-white/10 rounded-2xl flex items-center justify-between animate-in slide-in-from-right duration-300">
                                            <div className="flex items-center gap-3">
                                                <div className="size-11 rounded-full bg-white dark:bg-[#000000] overflow-hidden border border-slate-200 dark:border-white/10 shadow-none flex items-center justify-center">
                                                    <Avatar config={u.avatar} scale={0.8} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{u.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">@{u.username}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleConnectionAction('reject', u._id)} className="size-9 flex items-center justify-center rounded-xl bg-white dark:bg-[#000000] border border-slate-200 dark:border-white/10 text-slate-400 hover:text-rose-500 transition-all active:scale-95" title="Reject">
                                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                                </button>
                                                <button onClick={() => handleConnectionAction('accept', u._id)} className="size-9 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-110 active:scale-90 transition-all" title="Accept">
                                                    <span className="material-symbols-outlined text-[18px]">check</span>
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-12 text-center opacity-40">
                                            <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                                            <p className="text-xs font-black uppercase tracking-widest">No pending requests</p>
                                        </div>
                                    )
                                )}

                                {activeConnectionsTab === 'outgoing' && (
                                    connectionsData.outgoing.length > 0 ? connectionsData.outgoing.map(u => (
                                        <div key={u._id} className="p-3 bg-slate-50 dark:bg-[#121212]/40 border border-slate-100 dark:border-white/10 rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="size-11 rounded-full bg-white dark:bg-[#000000] overflow-hidden border border-slate-200 dark:border-white/10 shadow-none flex items-center justify-center">
                                                    <Avatar config={u.avatar} scale={0.8} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{u.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">@{u.username}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleConnectionAction('cancel', u._id)} className="px-3 py-1.5 bg-slate-100 dark:bg-[#000000] rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors" title="Cancel Request">
                                                Cancel
                                            </button>
                                        </div>
                                    )) : (
                                        <div className="py-12 text-center opacity-40">
                                            <span className="material-symbols-outlined text-4xl mb-2">send</span>
                                            <p className="text-xs font-black uppercase tracking-widest">No sent requests</p>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ConnectionsModal;
