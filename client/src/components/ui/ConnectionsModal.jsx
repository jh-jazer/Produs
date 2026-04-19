import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import Avatar from './Avatar';
import useAuthStore from '../../store/useAuthStore';
import { DashboardContext } from '../../context/DashboardContext';
import { Search } from 'lucide-react';
import DashboardModal from './DashboardModal';

const ConnectionsModal = ({ isOpen, onClose, onProfileClick }) => {
    const { user, syncUser } = useAuthStore();
    const { setIsSearchModalOpen } = useContext(DashboardContext);
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

            const res = await api.get('/auth/me');
            syncUser(res.data);
        } catch (err) {
            console.error(`Failed to ${action} connection`, err);
        }
    };

    return (
        <DashboardModal
            isOpen={isOpen}
            onClose={onClose}
            title="Connections"
            subtitle="Manage your network"
            maxWidth="max-w-md"
        >
            <div className="flex flex-col gap-6">
                {/* Search Bar - Global Discovery Entry */}
                <div 
                    onClick={() => {
                        setIsSearchModalOpen(true);
                        onClose();
                    }}
                    className="w-full bg-black/5 dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/10 rounded-2xl py-4 px-6 flex items-center gap-4 cursor-pointer group hover:border-cyan-500/30 transition-all shadow-sm"
                >
                    <Search size={18} className="text-slate-400 group-hover:text-cyan-500 transition-colors" />
                    <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex-1">
                        Search users...
                    </span>
                    <div className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 text-[9px] font-black text-slate-400 group-hover:text-cyan-500 transition-colors">
                        ESC
                    </div>
                </div>

                {/* Tabs / Navigation */}
                <div className="flex p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl shrink-0">
                    {[
                        { id: 'connections', label: 'Network', icon: 'hub', count: connectionsData.connections.length },
                        { id: 'incoming', label: 'Requests', icon: 'inbox', count: connectionsData.incoming.length },
                        { id: 'outgoing', label: 'Pending', icon: 'outgoing_mail', count: connectionsData.outgoing.length }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveConnectionsTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all relative ${
                                activeConnectionsTab === tab.id
                                    ? 'bg-white dark:bg-[#121212] text-cyan-500 shadow-lg shadow-black/5'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`size-4 flex items-center justify-center rounded-full text-[8px] font-black ${
                                    activeConnectionsTab === tab.id ? 'bg-cyan-500 text-white' : 'bg-slate-300 dark:bg-[#121212] text-slate-600 dark:text-slate-400'
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="min-h-[300px]">
                    {isFetchingConnections ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <div className="size-10 rounded-full border-4 border-cyan-500/10 border-t-cyan-500 animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Searching...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeConnectionsTab === 'connections' && (
                                connectionsData.connections.length > 0 ? connectionsData.connections.map(u => (
                                     <div key={u._id} className={`p-4 border rounded-2xl flex items-center justify-between group transition-all hover:border-cyan-500/20 ${user?.partner?._id === u._id ? 'bg-rose-500/5 border-rose-500/20 shadow-none' : 'bg-white dark:bg-[#000000]/40 border-black/5 dark:border-white/5'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-full overflow-hidden border-2 border-slate-200 dark:border-white/10 group-hover:border-cyan-500/30 transition-all flex items-center justify-center">
                                                <Avatar config={u.avatar} scale={0.9} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-tight uppercase italic">{u.name}</p>
                                                    {user?.partner?._id === u._id && (
                                                        <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[7px] font-black uppercase tracking-widest leading-none">Shared</span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">@{u.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <button onClick={() => { onProfileClick(u.username); onClose(); }} className="size-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#000000] border border-black/10 dark:border-white/10 text-slate-400 hover:text-cyan-500 transition-all active:scale-90" title="View Profile">
                                                <span className="material-symbols-outlined text-[20px]">person</span>
                                            </button>
                                            {user?.partner?._id !== u._id && (
                                                <button
                                                    onClick={() => {
                                                        if(window.confirm(`Terminate link with ${u.name}?`)) {
                                                            handleConnectionAction('disconnect', u._id);
                                                        }
                                                    }}
                                                    className="size-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#000000] border border-black/10 dark:border-white/10 text-slate-400 hover:text-rose-500 transition-all active:scale-90"
                                                    title="Disconnect"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">link_off</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-20 text-center space-y-4">
                                        <div className="size-16 mx-auto rounded-3xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-500 opacity-20">
                                            <span className="material-symbols-outlined text-4xl">hub</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">No connections yet.</p>
                                    </div>
                                )
                            )}

                            {activeConnectionsTab === 'incoming' && (
                                connectionsData.incoming.length > 0 ? connectionsData.incoming.map(u => (
                                    <div key={u._id} className="p-4 bg-cyan-500/[0.03] border border-cyan-500/20 rounded-2xl flex items-center justify-between animate-in slide-in-from-right duration-500">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-full overflow-hidden border-2 border-cyan-500/30 flex items-center justify-center">
                                                <Avatar config={u.avatar} scale={1} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white italic uppercase">{u.name}</p>
                                                <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">Wants to connect</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleConnectionAction('reject', u._id)} className="size-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#000000] border border-black/10 dark:border-white/10 text-slate-400 hover:text-rose-500 transition-all active:scale-90">
                                                <span className="material-symbols-outlined text-[20px]">close</span>
                                            </button>
                                            <button onClick={() => handleConnectionAction('accept', u._id)} className="size-10 flex items-center justify-center rounded-xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:scale-110 active:scale-90 transition-all">
                                                <span className="material-symbols-outlined text-[20px]">check</span>
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-20 text-center space-y-4">
                                        <div className="size-16 mx-auto rounded-3xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-500 opacity-20">
                                            <span className="material-symbols-outlined text-4xl">inbox</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">No incoming requests.</p>
                                    </div>
                                )
                            )}

                            {activeConnectionsTab === 'outgoing' && (
                                connectionsData.outgoing.length > 0 ? connectionsData.outgoing.map(u => (
                                    <div key={u._id} className="p-4 bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-full overflow-hidden border-2 border-slate-200 dark:border-white/10 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                                <Avatar config={u.avatar} scale={0.9} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-400 group-hover:text-white transition-colors italic uppercase">{u.name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">Request sent</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleConnectionAction('cancel', u._id)} className="px-4 py-2 bg-white/5 hover:bg-rose-500/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all active:scale-95">
                                            Cancel
                                        </button>
                                    </div>
                                )) : (
                                    <div className="py-20 text-center space-y-4">
                                        <div className="size-16 mx-auto rounded-3xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-500 opacity-20">
                                            <span className="material-symbols-outlined text-4xl">send</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">No pending requests.</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DashboardModal>
    );
};

export default ConnectionsModal;
