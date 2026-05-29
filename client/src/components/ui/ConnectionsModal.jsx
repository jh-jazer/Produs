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
            if (action === 'accept') endpoint = `/auth/connection/accept/${targetUserId}`;
            else if (action === 'reject') endpoint = `/auth/connection/reject/${targetUserId}`;
            else if (action === 'cancel') endpoint = `/auth/connection/cancel/${targetUserId}`;
            else if (action === 'disconnect') endpoint = `/auth/connection/disconnect/${targetUserId}`;

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
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-sm py-4 px-6 flex items-center gap-4 cursor-pointer group hover:border-primary/30 transition-all shadow-sm"
                >
                    <Search size={18} className="text-foreground/40 group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] flex-1">
                        Search_Neural_Nodes...
                    </span>
                    <div className="px-2 py-1 rounded-sm bg-foreground/5 text-[9px] font-black text-foreground/40 group-hover:text-primary transition-colors uppercase">
                        ESC
                    </div>
                </div>

                {/* Tabs / Navigation */}
                <div className="flex p-1 bg-foreground/5 rounded-sm shrink-0">
                    {[
                        { id: 'connections', label: 'Network', icon: 'hub', count: connectionsData.connections.length },
                        { id: 'incoming', label: 'Requests', icon: 'inbox', count: connectionsData.incoming.length },
                        { id: 'outgoing', label: 'Pending', icon: 'outgoing_mail', count: connectionsData.outgoing.length }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveConnectionsTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-[9px] font-black uppercase tracking-wider transition-all relative ${
                                activeConnectionsTab === tab.id
                                    ? 'bg-white dark:bg-[#1a1a1a] text-primary shadow-xl'
                                    : 'text-foreground/40 hover:text-foreground'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`size-4 flex items-center justify-center rounded-full text-[8px] font-black ${
                                    activeConnectionsTab === tab.id ? 'bg-primary text-white' : 'bg-foreground/10 text-foreground/40'
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
                            <div className="size-10 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Searching_Network...</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {activeConnectionsTab === 'connections' && (
                                connectionsData.connections.length > 0 ? connectionsData.connections.map(u => (
                                     <div key={u._id} className={`p-4 border rounded-sm flex items-center justify-between group transition-all hover:bg-foreground/5 ${user?.partner?._id === u._id ? 'bg-primary/5 border-primary/20' : 'bg-transparent border-foreground/10'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-full overflow-hidden border border-foreground/10 flex items-center justify-center">
                                                <Avatar config={u.avatar} scale={0.9} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[11px] font-black text-foreground leading-none uppercase tracking-wider">{u.name}</p>
                                                    {user?.partner?._id === u._id && (
                                                        <span className="px-1 py-0.5 rounded-sm bg-primary text-white text-[7px] font-black uppercase tracking-widest leading-none">Shared</span>
                                                    )}
                                                </div>
                                                <p className="text-[9px] text-foreground/40 font-mono uppercase tracking-widest mt-1">@{u.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => { onProfileClick(u.username); onClose(); }} className="size-8 flex items-center justify-center rounded-sm bg-foreground/5 border border-foreground/10 text-foreground/40 hover:text-primary transition-all active:scale-90" title="View Profile">
                                                <span className="material-symbols-outlined text-[18px]">person</span>
                                            </button>
                                            {user?.partner?._id !== u._id && (
                                                <button
                                                    onClick={() => {
                                                        if(window.confirm(`Terminate link with ${u.name}?`)) {
                                                            handleConnectionAction('disconnect', u._id);
                                                        }
                                                    }}
                                                    className="size-8 flex items-center justify-center rounded-sm bg-foreground/5 border border-foreground/10 text-foreground/40 hover:text-red-500 transition-all active:scale-90"
                                                    title="Disconnect"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">link_off</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-16 text-center space-y-4">
                                        <div className="size-12 mx-auto rounded-sm bg-foreground/5 flex items-center justify-center text-foreground/20">
                                            <span className="material-symbols-outlined text-2xl">hub</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">No_Active_Nodes</p>
                                    </div>
                                )
                            )}

                            {activeConnectionsTab === 'incoming' && (
                                connectionsData.incoming.length > 0 ? connectionsData.incoming.map(u => (
                                    <div key={u._id} className="p-4 bg-primary/5 border border-primary/20 rounded-sm flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-full overflow-hidden border border-primary/30 flex items-center justify-center">
                                                <Avatar config={u.avatar} scale={1} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-foreground uppercase tracking-wider">{u.name}</p>
                                                <p className="text-[9px] text-primary font-black uppercase tracking-widest mt-1">Connection_Requested</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleConnectionAction('reject', u._id)} className="size-8 flex items-center justify-center rounded-sm bg-foreground/5 border border-foreground/10 text-foreground/40 hover:text-red-500 transition-all active:scale-90">
                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                            </button>
                                            <button onClick={() => handleConnectionAction('accept', u._id)} className="size-8 flex items-center justify-center rounded-sm bg-primary text-white shadow-lg shadow-primary/20 hover:scale-110 active:scale-90 transition-all">
                                                <span className="material-symbols-outlined text-[18px]">check</span>
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-16 text-center space-y-4">
                                        <div className="size-12 mx-auto rounded-sm bg-foreground/5 flex items-center justify-center text-foreground/20">
                                            <span className="material-symbols-outlined text-2xl">inbox</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">Queue_Empty</p>
                                    </div>
                                )
                            )}

                            {activeConnectionsTab === 'outgoing' && (
                                connectionsData.outgoing.length > 0 ? connectionsData.outgoing.map(u => (
                                    <div key={u._id} className="p-4 bg-foreground/[0.02] border border-foreground/10 rounded-sm flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-full overflow-hidden border border-foreground/10 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                                <Avatar config={u.avatar} scale={0.9} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-foreground/40 group-hover:text-foreground transition-colors uppercase tracking-wider">{u.name}</p>
                                                <p className="text-[9px] text-foreground/30 font-black uppercase tracking-widest mt-1 animate-pulse">Handshake_Sent</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleConnectionAction('cancel', u._id)} className="px-3 py-1.5 bg-foreground/5 hover:bg-red-500/10 rounded-sm text-[8px] font-black uppercase tracking-widest text-foreground/40 hover:text-red-500 transition-all active:scale-95">
                                            Cancel
                                        </button>
                                    </div>
                                )) : (
                                    <div className="py-16 text-center space-y-4">
                                        <div className="size-12 mx-auto rounded-sm bg-foreground/5 flex items-center justify-center text-foreground/20">
                                            <span className="material-symbols-outlined text-2xl">send</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">No_Pending_Links</p>
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
