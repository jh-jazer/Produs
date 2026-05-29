import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import Avatar from './Avatar';
import useAuthStore from '../../store/useAuthStore';
import { DashboardContext } from '../../context/DashboardContext';
import { Search, Link, LinkIcon, Send, X, Heart } from 'lucide-react';
import DashboardModal from './DashboardModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useSWRConfig } from 'swr';

const ConnectionsModal = ({ isOpen, onClose, onProfileClick }) => {
    const { user, syncUser } = useAuthStore();
    const { setIsSearchModalOpen } = useContext(DashboardContext);
    const { mutate } = useSWRConfig();
    const [connectionsData, setConnectionsData] = useState({ connections: [], incoming: [], outgoing: [] });
    const [isFetchingConnections, setIsFetchingConnections] = useState(false);

    // Per-card link request state: { [userId]: 'idle' | 'loading' | 'sent' | 'error' }
    const [cardLinkState, setCardLinkState] = useState({});

    // Partner link request state
    const [partnerEmail, setPartnerEmail] = useState('');
    const [partnerRequestStatus, setPartnerRequestStatus] = useState(null); // null | 'loading' | 'success' | 'error'
    const [partnerRequestMsg, setPartnerRequestMsg] = useState('');
    const [isCancelingPartner, setIsCancelingPartner] = useState(false);

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
        if (isOpen) {
            setCardLinkState({});
            fetchConnections();
        }
    }, [isOpen]);

    // Reset partner form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setPartnerEmail('');
            setPartnerRequestStatus(null);
            setPartnerRequestMsg('');
        }
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
            mutate('/auth/me');
        } catch (err) {
            console.error(`Failed to ${action} connection`, err);
        }
    };

    const handleLinkRequest = async (targetUser) => {
        if (!targetUser?.email) return;
        setCardLinkState(prev => ({ ...prev, [targetUser._id]: 'loading' }));
        try {
            await api.post('/auth/partner/request', { email: targetUser.email });
            setCardLinkState(prev => ({ ...prev, [targetUser._id]: 'sent' }));
            const res = await api.get('/auth/me');
            syncUser(res.data);
            mutate('/auth/me');
        } catch (err) {
            setCardLinkState(prev => ({ ...prev, [targetUser._id]: 'error' }));
            // Reset after 2s
            setTimeout(() => setCardLinkState(prev => ({ ...prev, [targetUser._id]: 'idle' })), 2000);
        }
    };

    const handleSendPartnerRequest = async (e) => {
        e.preventDefault();
        if (!partnerEmail.trim()) return;
        try {
            setPartnerRequestStatus('loading');
            await api.post('/auth/partner/request', { email: partnerEmail.trim() });
            setPartnerRequestStatus('success');
            setPartnerRequestMsg('Link request sent!');
            setPartnerEmail('');
            const res = await api.get('/auth/me');
            syncUser(res.data);
            mutate('/auth/me');
        } catch (err) {
            setPartnerRequestStatus('error');
            setPartnerRequestMsg(err.response?.data?.message || 'Failed to send request');
        }
    };

    const handleCancelPartnerRequest = async () => {
        try {
            setIsCancelingPartner(true);
            await api.post('/auth/partner/cancel');
            const res = await api.get('/auth/me');
            syncUser(res.data);
            mutate('/auth/me');
            setPartnerRequestStatus(null);
            setPartnerRequestMsg('');
            setCardLinkState({});
        } catch (err) {
            console.error('Failed to cancel partner request', err);
        } finally {
            setIsCancelingPartner(false);
        }
    };

    const hasPartner = !!user?.partner;
    const hasPendingRequest = !!user?.outgoingPartnerRequest;

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

                {/* Pending Partner Request Notification Banner */}
                {hasPendingRequest && (
                    <div className="p-4 rounded-sm border border-rose-500/20 bg-rose-500/5 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-rose-500 text-lg">pending_actions</span>
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest leading-none">Awaiting Partner Response</p>
                                <p className="text-[8px] text-foreground/50 uppercase tracking-wider font-mono">
                                    Requested: @{user?.outgoingPartnerRequest?.username || 'user'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={handleCancelPartnerRequest}
                            disabled={isCancelingPartner}
                            className="px-3 py-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-sm text-[8px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isCancelingPartner ? '...' : 'Cancel Request'}
                        </button>
                    </div>
                )}

                {/* Content Area */}
                <div className="min-h-[300px]">
                    {isFetchingConnections ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <div className="size-10 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Searching_Network...</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Connections List */}
                            <div className="space-y-2">
                                {connectionsData.connections.length > 0 ? (
                                    <>
                                        <p className="text-[8px] font-mono uppercase tracking-[0.3em] text-foreground/30 pb-1">
                                            {connectionsData.connections.length} {connectionsData.connections.length === 1 ? 'Connection' : 'Connections'}
                                        </p>
                                        {connectionsData.connections.map(u => (
                                            <div key={u._id} className={`p-4 border rounded-sm flex items-center justify-between group transition-all hover:bg-foreground/5 ${user?.partner?._id === u._id ? 'bg-primary/5 border-primary/20' : 'bg-transparent border-foreground/10'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-full overflow-hidden border border-foreground/10 flex items-center justify-center">
                                                         <Avatar config={u.avatar} scale={0.9} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                             <p className="text-[11px] font-black text-foreground leading-none uppercase tracking-wider">{u.username}</p>
                                                            {user?.partner?._id === u._id && (
                                                                <span className="px-1 py-0.5 rounded-sm bg-primary text-white text-[7px] font-black uppercase tracking-widest leading-none">Shared</span>
                                                            )}
                                                            {/* Show "No partner" badge if they have no partner */}
                                                            {!u.partner && user?.partner?._id !== u._id && (
                                                                <span className="px-1 py-0.5 rounded-sm bg-foreground/5 text-foreground/30 text-[7px] font-black uppercase tracking-widest leading-none border border-foreground/10">
                                                                    Unlinked
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[9px] text-foreground/40 font-mono uppercase tracking-widest mt-1">@{u.username}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            onProfileClick(u.username);
                                                            onClose();
                                                        }}
                                                        className="size-8 flex items-center justify-center rounded-sm bg-foreground/5 border border-foreground/10 text-foreground/40 hover:text-primary transition-all active:scale-90"
                                                        title="View Profile"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                                    </button>
                                                    {user?.partner?._id !== u._id && (() => {
                                                        const s = cardLinkState[u._id] || 'idle';
                                                        const isOutgoingTarget = user?.outgoingPartnerRequest?._id === u._id || user?.outgoingPartnerRequest === u._id;
                                                        
                                                        // Determine if disabled and what the tooltip should be
                                                        let isDisabled = false;
                                                        let tooltip = 'Send partner link request';
                                                        
                                                        if (isOutgoingTarget) {
                                                            tooltip = 'Cancel pending partner request';
                                                        } else if (u.partner) {
                                                            isDisabled = true;
                                                            tooltip = 'This user already has a partner';
                                                        } else if (hasPartner) {
                                                            isDisabled = true;
                                                            tooltip = 'You already have a partner';
                                                        } else if (hasPendingRequest) {
                                                            isDisabled = true;
                                                            tooltip = 'You already have a pending partner request';
                                                        } else if (!u.email) {
                                                            isDisabled = true;
                                                            tooltip = 'No email associated with this connection';
                                                        }

                                                        if (s === 'sent') tooltip = 'Request sent!';
                                                        
                                                        return (
                                                            <button
                                                                onClick={() => {
                                                                    if (isOutgoingTarget) {
                                                                        handleCancelPartnerRequest();
                                                                    } else {
                                                                        handleLinkRequest(u);
                                                                    }
                                                                }}
                                                                disabled={(!isOutgoingTarget && isDisabled) || s === 'loading' || s === 'sent'}
                                                                title={tooltip}
                                                                className={`size-8 flex items-center justify-center rounded-sm border transition-all ${
                                                                    isOutgoingTarget
                                                                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 active:scale-90'
                                                                        : isDisabled
                                                                            ? 'opacity-30 cursor-not-allowed bg-foreground/5 border-foreground/10 text-foreground/40'
                                                                            : s === 'sent'
                                                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 active:scale-90'
                                                                                : s === 'error'
                                                                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 active:scale-90'
                                                                                    : 'bg-foreground/5 border-foreground/10 text-foreground/40 hover:text-rose-400 hover:border-rose-400/30 hover:bg-rose-500/5 active:scale-90'
                                                                }`}
                                                            >
                                                                {isCancelingPartner && isOutgoingTarget ? (
                                                                    <div className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                                                ) : isOutgoingTarget ? (
                                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                                ) : s === 'loading' ? (
                                                                    <div className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                                                ) : s === 'sent' ? (
                                                                    <span className="material-symbols-outlined text-[16px]">check</span>
                                                                ) : (
                                                                    <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                                                                        {/* Left arm */}
                                                                        <rect x="0" y="8" width="7" height="4" rx="2"/>
                                                                        <rect x="5" y="6.5" width="3" height="2.5" rx="1"/>
                                                                        <rect x="5" y="9" width="3" height="2" rx="1"/>
                                                                        <rect x="5" y="11" width="3" height="2" rx="1"/>
                                                                        {/* Clasped grip in center */}
                                                                        <rect x="7" y="7.5" width="6" height="5" rx="1.5"/>
                                                                        {/* Right arm */}
                                                                        <rect x="13" y="8" width="7" height="4" rx="2"/>
                                                                        <rect x="12" y="6.5" width="3" height="2.5" rx="1"/>
                                                                        <rect x="12" y="9" width="3" height="2" rx="1"/>
                                                                        <rect x="12" y="11" width="3" height="2" rx="1"/>
                                                                        {/* Tension line in center */}
                                                                        <line x1="10" y1="7" x2="10" y2="13" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4"/>
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        );
                                                    })()}
                                                    {user?.partner?._id !== u._id && (
                                                        <button
                                                            onClick={() => {
                                                                if(window.confirm(`Terminate link with ${u.username}?`)) {
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
                                        ))}
                                    </>
                                ) : (
                                    <div className="py-10 text-center space-y-4">
                                        <div className="size-12 mx-auto rounded-sm bg-foreground/5 flex items-center justify-center text-foreground/20">
                                            <span className="material-symbols-outlined text-2xl">hub</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">No_Active_Nodes</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardModal>
    );
};

export default ConnectionsModal;
