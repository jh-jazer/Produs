import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';
import DashboardModal from './DashboardModal';
import { Send, AlertTriangle } from 'lucide-react';
import { soundManager } from '../../services/sound';
import { useSWRConfig } from 'swr';

const MessagingModal = ({ isOpen, onClose, partner }) => {
    const { user, syncUser } = useAuthStore();
    const { mutate } = useSWRConfig();
    const [messageInput, setMessageInput] = useState('');
    const [sending, setSending] = useState(false);
    const [timeTick, setTimeTick] = useState(0);

    // Auto-update countdown every 30s
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => {
            setTimeTick(prev => prev + 1);
        }, 30000);
        return () => clearInterval(interval);
    }, [isOpen]);

    const isMessageActive = (msg) => {
        if (!msg || !msg.text || !msg.updatedAt) return false;
        const msgDate = new Date(msg.updatedAt);
        const timeDiff = Date.now() - msgDate.getTime();
        return timeDiff < 24 * 60 * 60 * 1000;
    };

    const getRemainingTime = (msg) => {
        if (!msg || !msg.updatedAt) return "";
        const expiresAt = new Date(msg.updatedAt).getTime() + 24 * 60 * 60 * 1000;
        const timeLeft = expiresAt - Date.now();
        if (timeLeft <= 0) return "Expired";
        const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
        const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
        if (hoursLeft > 0) {
            return `${hoursLeft}h ${minutesLeft}m left`;
        }
        return `${minutesLeft}m left`;
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (sending || !messageInput.trim()) return;
        setSending(true);
        soundManager.play('click');

        try {
            const res = await api.post('/rpg/link-message', { text: messageInput.trim() });
            if (res.data && res.data.rpg) {
                syncUser(res.data.rpg);
                soundManager.play('ding');
                setMessageInput('');
                mutate('/auth/partner'); // Revalidate partner profile to fetch their latest linkMessage
            }
        } catch (error) {
            console.error('Failed to send link message:', error);
            alert(error.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <DashboardModal
            isOpen={isOpen}
            onClose={onClose}
            title="SECURE SIGNAL"
            subtitle="EPHEMERAL COMMUNICATIONS"
            maxWidth="max-w-sm"
        >
            <div className="flex flex-col gap-6 py-2">
                {/* Linked Status */}
                <div className="flex items-center justify-between border-b border-dashed border-black/10 dark:border-white/10 pb-4">
                    <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">STATUS</span>
                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-sm text-[8px] font-mono text-rose-500 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        LINKED
                    </div>
                </div>

                {/* Transmissions Board */}
                <div className="flex flex-col gap-4">
                    {/* Partner's Message */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[8px] font-mono font-black uppercase tracking-[0.1em] text-slate-400 text-left">
                            FROM @{partner?.username?.toUpperCase() || 'PARTNER'}
                        </span>
                        {isMessageActive(partner?.rpg?.linkMessage) ? (
                            <div className="bg-black/5 dark:bg-white/5 rounded-sm p-3.5 text-left border border-black/5 dark:border-white/5 relative">
                                <p className="text-[11px] text-black dark:text-white leading-relaxed font-mono whitespace-pre-wrap">
                                    "{partner.rpg.linkMessage.text}"
                                </p>
                                <div className="flex items-center justify-end gap-1 mt-2 text-[8px] font-mono text-slate-400 uppercase">
                                    <span>EXPIRES IN {getRemainingTime(partner.rpg.linkMessage).toUpperCase()}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="border border-dashed border-black/10 dark:border-white/10 rounded-sm p-4 text-center">
                                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                                    NO ACTIVE TRANSMISSION
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Your Active Message */}
                    {isMessageActive(user?.rpg?.linkMessage) && (
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[8px] font-mono font-black uppercase tracking-[0.1em] text-slate-400 text-left">
                                YOUR ACTIVE SIGNAL
                            </span>
                            <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-sm p-3.5 text-left border border-black/5 dark:border-white/5 border-dashed relative">
                                <p className="text-[11px] text-black/70 dark:text-white/70 leading-relaxed font-mono whitespace-pre-wrap">
                                    "{user.rpg.linkMessage.text}"
                                </p>
                                <div className="flex items-center justify-end gap-1 mt-2 text-[8px] font-mono text-slate-400 uppercase">
                                    <span>EXPIRES IN {getRemainingTime(user.rpg.linkMessage).toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Compose Area */}
                <form onSubmit={handleSendMessage} className="w-full flex flex-col gap-2 border-t border-dashed border-black/10 dark:border-white/10 pt-4 mt-2">
                    <div className="relative w-full">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value.slice(0, 150))}
                            placeholder="Write a message that expires in 24 hrs..."
                            className="w-full h-10 px-3 pr-10 text-[11px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm text-black dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 font-mono transition-all"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={sending || !messageInput.trim()}
                            className="absolute right-2 top-2 h-6 w-6 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white disabled:opacity-35 disabled:hover:bg-black dark:disabled:hover:bg-white dark:disabled:hover:text-black transition-all rounded-sm"
                        >
                            <Send className="size-3" />
                        </button>
                    </div>
                    <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-400 uppercase tracking-widest">
                        <span>LIMIT: 150 CHARACTERS</span>
                        <span>{messageInput.length}/150</span>
                    </div>
                </form>
            </div>
        </DashboardModal>
    );
};

export default MessagingModal;
