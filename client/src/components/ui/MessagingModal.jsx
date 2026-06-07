import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';
import DashboardModal from './DashboardModal';
import { Send, AlertTriangle, MessageSquare, Edit2, Check, X } from 'lucide-react';
import { soundManager } from '../../services/sound';
import { useSWRConfig } from 'swr';

const MessagingModal = ({ isOpen, onClose, partner }) => {
    const { user, syncUser, updateSettings } = useAuthStore();
    const { mutate } = useSWRConfig();
    const [messageInput, setMessageInput] = useState('');
    const [sending, setSending] = useState(false);
    const [timeTick, setTimeTick] = useState(0);

    // Nickname State
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [nicknameInput, setNicknameInput] = useState('');
    const [savingNickname, setSavingNickname] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setNicknameInput(user?.partnerNickname || '');
            setIsEditingNickname(false);
        }
    }, [isOpen, user?.partnerNickname]);

    const handleSaveNickname = async (e) => {
        if (e) e.preventDefault();
        if (savingNickname) return;
        setSavingNickname(true);
        soundManager.play('click');
        try {
            await updateSettings({ partnerNickname: nicknameInput.trim() });
            setIsEditingNickname(false);
            soundManager.play('ding');
        } catch (error) {
            console.error('Failed to update partner nickname:', error);
            alert('Failed to update nickname');
        } finally {
            setSavingNickname(false);
        }
    };

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

    // Prepare chronological list of active messages
    const partnerDisplayName = user?.partnerNickname || partner?.name || partner?.username || 'Partner';
    const partnerInitial = (() => {
        const cleanName = partnerDisplayName.startsWith('@') ? partnerDisplayName.slice(1) : partnerDisplayName;
        return cleanName ? cleanName[0].toUpperCase() : 'P';
    })();

    const messages = [];
    if (isMessageActive(partner?.rpg?.linkMessage)) {
        messages.push({
            id: 'partner',
            text: partner.rpg.linkMessage.text,
            time: partner.rpg.linkMessage.updatedAt,
            isSelf: false,
            sender: partnerDisplayName
        });
    }
    if (isMessageActive(user?.rpg?.linkMessage)) {
        messages.push({
            id: 'user',
            text: user.rpg.linkMessage.text,
            time: user.rpg.linkMessage.updatedAt,
            isSelf: true,
            sender: 'You'
        });
    }
    messages.sort((a, b) => new Date(a.time) - new Date(b.time));

    return (
        <DashboardModal
            isOpen={isOpen}
            onClose={onClose}
            title="CHAT"
            subtitle="EPHEMERAL MESSAGING"
            maxWidth="max-w-sm"
        >
            <div className="flex flex-col gap-4 py-2">
                {/* Partner Status Header Bar */}
                <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-4">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm font-display">
                            {partnerInitial}
                        </div>
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950" />
                    </div>
                    <div className="flex-1 min-w-0">
                        {isEditingNickname ? (
                            <form onSubmit={handleSaveNickname} className="flex items-center gap-1.5 mt-0.5">
                                <input
                                    type="text"
                                    value={nicknameInput}
                                    onChange={(e) => setNicknameInput(e.target.value.slice(0, 20))}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full px-3 py-1 text-xs text-black dark:text-white focus:outline-none focus:border-primary font-sans h-7"
                                    placeholder="Set nickname..."
                                    disabled={savingNickname}
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={savingNickname}
                                    className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-colors flex shrink-0"
                                    title="Save Nickname"
                                >
                                    <Check className="size-4" />
                                </button>
                                <button
                                    type="button"
                                    disabled={savingNickname}
                                    onClick={() => {
                                        setNicknameInput(user?.partnerNickname || '');
                                        setIsEditingNickname(false);
                                    }}
                                    className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors flex shrink-0"
                                    title="Cancel"
                                >
                                    <X className="size-4" />
                                </button>
                            </form>
                        ) : (
                            <div className="flex items-center gap-1.5 group select-none">
                                <p className="text-xs font-semibold text-black dark:text-white truncate max-w-[140px]">
                                    {partnerDisplayName}
                                </p>
                                <button
                                    onClick={() => setIsEditingNickname(true)}
                                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-0.5 text-slate-400 hover:text-primary rounded transition-all"
                                    title="Edit Nickname"
                                >
                                    <Edit2 className="size-3" />
                                </button>
                            </div>
                        )}
                        {!isEditingNickname && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                {partner?.username ? `@${partner.username}` : 'Partner'}
                            </p>
                        )}
                    </div>
                    <div className="text-[9px] font-medium bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full">
                        24h Ephemeral
                    </div>
                </div>

                {/* Message Thread */}
                <div className="flex flex-col gap-4 py-2 min-h-[200px] justify-end">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                <MessageSquare className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">No active messages</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                                    Messages sent here disappear automatically after 24 hours. Send one to start the conversation!
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col gap-1 max-w-[85%] ${
                                        msg.isSelf ? 'self-end items-end' : 'self-start items-start'
                                    }`}
                                >
                                    <span className="text-[9px] text-slate-400 font-medium px-1">
                                        {msg.sender}
                                    </span>
                                    <div
                                        className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm text-left ${
                                            msg.isSelf
                                                ? 'bg-primary text-white rounded-tr-sm'
                                                : 'bg-black/5 dark:bg-white/5 text-black dark:text-white rounded-tl-sm border border-black/5 dark:border-white/5'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                    <span className="text-[8px] text-slate-400 dark:text-slate-500 font-mono px-1">
                                        {getRemainingTime({ updatedAt: msg.time })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Compose Area */}
                <form onSubmit={handleSendMessage} className="w-full flex flex-col gap-2 border-t border-black/5 dark:border-white/5 pt-4 mt-2">
                    <div className="relative w-full flex items-center">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value.slice(0, 150))}
                            placeholder={user?.partnerNickname ? `Message ${user.partnerNickname}...` : `Message @${partner?.username || 'partner'}...`}
                            className="w-full h-11 pl-4 pr-12 text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full text-black dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={sending || !messageInput.trim()}
                            className="absolute right-1.5 top-1.5 h-8 w-8 flex items-center justify-center bg-primary text-white hover:bg-primary/95 disabled:opacity-40 disabled:hover:bg-primary transition-all rounded-full shadow-md"
                        >
                            <Send className="size-3.5" />
                        </button>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 px-2">
                        <span className="text-[9px]">Expires in 24 hours</span>
                        <span className="font-mono">{messageInput.length} / 150</span>
                    </div>
                </form>
            </div>
        </DashboardModal>
    );
};

export default MessagingModal;
