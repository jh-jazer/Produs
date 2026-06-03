import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import Avatar from './Avatar';
import { soundManager } from '../../services/sound';
import { UserPlus, Search, X, Heart, Link as LinkIcon, Link2Off, Loader2, Users } from 'lucide-react';
import { useSWRConfig } from 'swr';

const PartnerModal = ({ isOpen, onClose, onProfileClick }) => {
    const { user, setCredentials } = useAuthStore();
    const { mutate } = useSWRConfig();
    const [isLinking, setIsLinking] = useState(false);
    const [linkMessage, setLinkMessage] = useState("");
    const [connections, setConnections] = useState([]);
    const [isFetchingConnections, setIsFetchingConnections] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchConnections = async () => {
        if (!isOpen || user?.partner) return;
        setIsFetchingConnections(true);
        try {
            const res = await api.get('/auth/connections');
            // Only show users who don't have a partner yet and aren't themselves
            const available = res.data.connections.filter(c => !c.partner && c._id !== user._id);
            setConnections(available);
        } catch (err) {
            console.error("Failed to fetch connections for linking", err);
        } finally {
            setIsFetchingConnections(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, [isOpen, user?.partner]);

    const handleLinkPartner = async (email, userId) => {
        setIsLinking(true);
        setLinkMessage("");
        try {
            const res = await api.post('/auth/partner/request', { email, userId });
            setLinkMessage(res.data.message || "Request sent!");
            setCredentials({ ...user, outgoingPartnerRequest: res.data.outgoingRequest });
            mutate('/auth/me');
            setTimeout(() => setLinkMessage(""), 3000);
        } catch (error) {
            setLinkMessage(error.response?.data?.message || "Failed to send request");
        } finally {
            setIsLinking(false);
        }
    };

    const handleAcceptRequest = async () => {
        setIsLinking(true);
        setLinkMessage("");
        try {
            const res = await api.post('/auth/partner/accept');
            soundManager.play('connectionAccepted');
            setLinkMessage(res.data.message || "Linked successfully!");
            setCredentials({ ...user, partner: res.data.partner, incomingPartnerRequest: null });
            mutate('/auth/me');
            setTimeout(() => setLinkMessage(""), 3000);
        } catch (error) {
            setLinkMessage(error.response?.data?.message || "Failed to accept request");
        } finally {
            setIsLinking(false);
        }
    };

    const handleRejectRequest = async () => {
        setIsLinking(true);
        setLinkMessage("");
        try {
            await api.post('/auth/partner/reject');
            setLinkMessage("Request rejected");
            setCredentials({ ...user, incomingPartnerRequest: null });
            mutate('/auth/me');
            setTimeout(() => setLinkMessage(""), 3000);
        } catch (error) {
            setLinkMessage(error.response?.data?.message || "Failed to reject request");
        } finally {
            setIsLinking(false);
        }
    };

    const handleCancelRequest = async () => {
        setIsLinking(true);
        setLinkMessage("");
        try {
            await api.post('/auth/partner/cancel');
            setLinkMessage("Request canceled");
            setCredentials({ ...user, outgoingPartnerRequest: null });
            mutate('/auth/me');
            setTimeout(() => setLinkMessage(""), 3000);
        } catch (error) {
            setLinkMessage(error.response?.data?.message || "Failed to cancel request");
        } finally {
            setIsLinking(false);
        }
    };

    const handleUnlinkPartner = async () => {
        if (!window.confirm("Are you sure you want to unlink? This will disconnect your shared habits and planner.")) return;
        setIsLinking(true);
        setLinkMessage("");
        try {
            await api.post('/auth/partner/unlink');
            setLinkMessage("Unlinked successfully!");
            setCredentials({ ...user, partner: null });
            mutate('/auth/me');
            setTimeout(() => setLinkMessage(""), 3000);
        } catch (error) {
            setLinkMessage(error.response?.data?.message || "Failed to unlink partner");
        } finally {
            setIsLinking(false);
        }
    };

    const filteredConnections = connections.filter(c => 
        c.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-md" />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative z-10 w-full max-w-md bg-slate-50/90 dark:bg-[#080808]/90 backdrop-blur-2xl border border-cyan-500/30 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-black/[0.05] dark:border-white/10 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                                {user?.partner ? <Heart size={24} /> : <LinkIcon size={24} />}
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic font-exo leading-none mb-1">Shared Account</h2>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Partner Collaboration</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="size-10 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center transition-all group"
                        >
                            <X size={20} className="group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                        {user?.partner ? (
                            <div className="space-y-6">
                                <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col items-center text-center space-y-4">
                                    <div className="size-20 rounded-full bg-white dark:bg-[#000000] border-2 border-emerald-500/30 p-1">
                                        <div className="w-full h-full rounded-full overflow-hidden">
                                            <Avatar config={user.partner.avatar} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-1">{user.partner.username}</p>
                                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                            Connected
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 w-full pt-4">
                                        <button
                                            onClick={() => { onProfileClick(user.partner.username); onClose(); }}
                                            className="flex-1 py-3 bg-white dark:bg-[#000000] border border-black/10 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-cyan-500/30 transition-all active:scale-95"
                                        >
                                            View Profile
                                        </button>
                                        <button
                                            onClick={handleUnlinkPartner}
                                            disabled={isLinking}
                                            className="size-12 flex items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                                            title="Unlink Shared User"
                                        >
                                            <Link2Off size={20} />
                                        </button>
                                    </div>
                                </div>
                                {linkMessage && (
                                    <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 text-center">
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${linkMessage.includes('Failed') ? 'text-rose-500' : 'text-emerald-500'}`}>{linkMessage}</p>
                                    </div>
                                )}
                            </div>
                        ) : user?.incomingPartnerRequest ? (
                            <div className="space-y-6">
                                <div className="p-6 rounded-3xl bg-cyan-500/5 border border-cyan-500/20 flex flex-col items-center text-center space-y-4">
                                    <div className="size-16 rounded-full bg-white dark:bg-[#000000] border-2 border-cyan-500/30 p-1">
                                        <div className="w-full h-full rounded-full overflow-hidden">
                                            <Avatar config={user.incomingPartnerRequest.avatar} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-slate-900 dark:text-white leading-tight mb-1">{user.incomingPartnerRequest.username}</p>
                                        <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">New Partner Request</p>
                                    </div>
                                    <div className="flex gap-3 w-full pt-2">
                                        <button
                                            onClick={handleAcceptRequest}
                                            disabled={isLinking}
                                            className="flex-1 py-3 bg-cyan-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                                        >
                                            {isLinking ? '...' : 'Accept Request'}
                                        </button>
                                        <button
                                            onClick={handleRejectRequest}
                                            disabled={isLinking}
                                            className="flex-1 py-3 bg-white dark:bg-[#000000] border border-black/10 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-rose-500 transition-all active:scale-95"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : user?.outgoingPartnerRequest ? (
                            <div className="space-y-6">
                                <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-black/10 dark:border-white/10 flex flex-col items-center text-center space-y-4">
                                    <div className="size-16 rounded-full bg-slate-200 dark:bg-[#000000] p-1.5 grayscale opacity-50">
                                        <div className="w-full h-full rounded-full overflow-hidden">
                                            <Avatar config={user.outgoingPartnerRequest.avatar} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-slate-500 dark:text-slate-400 leading-tight mb-1">{user.outgoingPartnerRequest.username}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">Awaiting response...</p>
                                    </div>
                                    <button
                                        onClick={handleCancelRequest}
                                        disabled={isLinking}
                                        className="w-full py-3 bg-rose-500/5 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                                    >
                                        Cancel Request
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                                        Select an established connection to share your progress and synchronize habits.
                                    </p>
                                </div>

                                {/* Available Connections List */}
                                <div className="space-y-4">
                                    {isFetchingConnections ? (
                                        <div className="py-12 flex flex-col items-center justify-center gap-3">
                                            <Loader2 size={24} className="text-cyan-500 animate-spin" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Loading connections...</p>
                                        </div>
                                    ) : connections.length > 0 ? (
                                        <div className="space-y-2">
                                            <div className="relative mb-4">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                <input 
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search users..."
                                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl py-3 pl-11 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-cyan-500/30 transition-all placeholder:text-slate-600"
                                                />
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
                                                {filteredConnections.length > 0 ? filteredConnections.map(c => (
                                                    <div key={c._id} className="p-3 bg-white dark:bg-[#000000]/40 border border-black/[0.05] dark:border-white/5 rounded-2xl flex items-center justify-between group hover:border-cyan-500/20 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-10 rounded-full bg-slate-100 dark:bg-[#121212] overflow-hidden border border-black/10 dark:border-white/10 group-hover:border-cyan-500/30 transition-all">
                                                                <Avatar config={c.avatar} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{c.name}</p>
                                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">@{c.username}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleLinkPartner(c.email, c._id)}
                                                            disabled={isLinking}
                                                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all active:scale-95"
                                                        >
                                                            <UserPlus size={14} />
                                                            Link
                                                        </button>
                                                    </div>
                                                )) : (
                                                    <div className="py-12 text-center">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">No users found.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-12 p-8 bg-black/5 dark:bg-white/[0.02] border border-dashed border-white/10 rounded-3xl text-center space-y-4 text-slate-500">
                                            <Users size={40} className="mx-auto opacity-20" />
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">No Connections</p>
                                                <p className="text-[10px] font-bold leading-relaxed">Connect with others to start sharing habits and plans.</p>
                                            </div>
                                            <button 
                                                onClick={onClose}
                                                className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-cyan-500 transition-all"
                                            >
                                                Back to Dashboard
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {linkMessage && !user?.partner && (
                            <div className="mt-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 text-center">
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${linkMessage.includes('Failed') ? 'text-rose-500' : 'text-emerald-500'}`}>{linkMessage}</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PartnerModal;
