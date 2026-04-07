import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

const PartnerModal = ({ isOpen, onClose, onProfileClick }) => {
    const { user, setCredentials } = useAuthStore();
    const [partnerEmail, setPartnerEmail] = useState("");
    const [isLinking, setIsLinking] = useState(false);
    const [linkMessage, setLinkMessage] = useState("");

    const handleLinkPartner = async (e) => {
        e.preventDefault();
        if (!partnerEmail.trim()) return;
        setIsLinking(true);
        setLinkMessage("");
        try {
            const res = await api.post('/auth/partner/request', { email: partnerEmail });
            setLinkMessage(res.data.message || "Request sent!");
            setCredentials({ ...user, outgoingPartnerRequest: res.data.outgoingRequest });
            setPartnerEmail("");
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
            setLinkMessage(res.data.message || "Linked successfully!");
            setCredentials({ ...user, partner: res.data.partner, incomingPartnerRequest: null });
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
            setTimeout(() => setLinkMessage(""), 3000);
        } catch (error) {
            setLinkMessage(error.response?.data?.message || "Failed to cancel request");
        } finally {
            setIsLinking(false);
        }
    };

    const handleUnlinkPartner = async () => {
        setIsLinking(true);
        setLinkMessage("");
        try {
            await api.post('/auth/partner/unlink');
            setLinkMessage("Unlinked successfully!");
            setCredentials({ ...user, partner: null });
            setTimeout(() => setLinkMessage(""), 3000);
        } catch (error) {
            setLinkMessage(error.response?.data?.message || "Failed to unlink partner");
        } finally {
            setIsLinking(false);
        }
    };

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
                <div className="absolute inset-0 bg-[#121212]/60 backdrop-blur-sm" />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative z-10 w-full max-w-md bg-slate-50/90 dark:bg-[#080808]/90 backdrop-blur-2xl border border-cyan-500/30 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl">{user?.partner ? 'favorite' : 'link'}</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white">Shared Account</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">View each other's Habits &amp; Planner</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="size-8 rounded-xl bg-slate-100 dark:bg-[#000000] hover:bg-slate-200 dark:hover:bg-[#121212] flex items-center justify-center transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px] text-slate-500">close</span>
                        </button>
                    </div>

                    {user?.partner ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                <div className="size-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl font-black text-emerald-600 shrink-0">
                                    {user.partner.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{user.partner.name}</p>
                                        <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">check_circle</span> Shared
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { onProfileClick(user.partner.username); }}
                                        className="size-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-[#000000] border border-slate-200 dark:border-white/10 text-slate-400 hover:text-primary hover:border-primary/30 transition-all active:scale-95"
                                        title={`Visit ${user.partner.name}'s Profile`}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                    </button>
                                </div>
                            </div>
                            {linkMessage && (
                                <p className={`text-xs font-bold ${linkMessage.includes('Failed') || linkMessage.includes('rejected') || linkMessage.includes('canceled') ? 'text-rose-500' : 'text-emerald-500'}`}>{linkMessage}</p>
                            )}
                            <button
                                onClick={handleUnlinkPartner}
                                disabled={isLinking}
                                className="w-full py-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-2xl font-black text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">link_off</span>
                                {isLinking ? 'Unlinking...' : 'Unlink Shared User'}
                            </button>
                        </div>
                    ) : user?.incomingPartnerRequest ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-black text-primary uppercase">
                                        {user.incomingPartnerRequest.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white text-wrap pr-1">{user.incomingPartnerRequest.name} wants to share!</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Incoming Request</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={handleAcceptRequest}
                                        disabled={isLinking}
                                        className="flex-1 py-2 bg-primary text-white rounded-xl font-black text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {isLinking ? '...' : 'Accept'}
                                    </button>
                                    <button
                                        onClick={handleRejectRequest}
                                        disabled={isLinking}
                                        className="flex-1 py-2 bg-slate-200 dark:bg-[#000000] text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs hover:bg-slate-300 dark:hover:bg-[#121212] transition-colors disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                            {linkMessage && (
                                <p className={`text-xs font-bold ${linkMessage.includes('Failed') || linkMessage.includes('rejected') ? 'text-rose-500' : 'text-emerald-500'}`}>{linkMessage}</p>
                            )}
                        </div>
                    ) : user?.outgoingPartnerRequest ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#121212]/50 border border-slate-200 dark:border-white/10 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-slate-200 dark:bg-[#000000] flex items-center justify-center text-lg font-black text-slate-400 uppercase">
                                        {user.outgoingPartnerRequest.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white text-wrap pr-1">Share request sent to {user.outgoingPartnerRequest.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Waiting for approval...</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCancelRequest}
                                    disabled={isLinking}
                                    className="w-full py-2 bg-slate-100 dark:bg-[#000000] text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl font-black text-xs transition-all disabled:opacity-50"
                                >
                                    Cancel Request
                                </button>
                            </div>
                            {linkMessage && (
                                <p className={`text-xs font-bold ${linkMessage.includes('Failed') || linkMessage.includes('canceled') ? 'text-rose-500' : 'text-emerald-500'}`}>{linkMessage}</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                Enter an email address to share your progress and collaborate on habits.
                            </p>
                            <form onSubmit={handleLinkPartner} className="space-y-3">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">mail</span>
                                    <input
                                        type="email"
                                        value={partnerEmail}
                                        onChange={(e) => setPartnerEmail(e.target.value)}
                                        placeholder="user@email.com"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#121212]/50 border border-slate-200 dark:border-white/10 text-sm font-medium rounded-2xl outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                {linkMessage && (
                                    <p className={`text-xs font-bold ${linkMessage.includes('Failed') ? 'text-rose-500' : 'text-emerald-500'}`}>{linkMessage}</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={isLinking || !partnerEmail.trim()}
                                    className="w-full py-3 bg-primary text-white rounded-2xl font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-40 flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                    {isLinking ? 'Sending...' : 'Send Share Request'}
                                </button>
                            </form>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PartnerModal;
