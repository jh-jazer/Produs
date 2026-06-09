import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Copy, Check, MoreVertical, X, Upload } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Avatar from './Avatar';
import ChippedBorder from './ChippedBorder';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import { useSWRConfig } from 'swr';

export default function IdentityCard({
    user,
    isOwnProfile = false,
    onClose,
    isFlippable = isOwnProfile,
    
    // Controlled flippability/editing if desired, otherwise falls back to internal state
    isEditing: controlledIsEditing,
    setIsEditing: controlledSetIsEditing,
    isFlipped: controlledIsFlipped,
    setIsFlipped: controlledSetIsFlipped,
    isIdMenuOpen: controlledIsIdMenuOpen,
    setIsIdMenuOpen: controlledSetIsIdMenuOpen,

    // Parent UI trigger overrides
    setIsConnectionsModalOpen,
    setIsSearchModalOpen,
    setIsQrModalOpen,
    setQrModalMode,

    // Live financial details (for own profile)
    currentBalance = 0,
    netProjection = 0,
    totalSavings = 0,

    // Connection handlers (for viewed profiles)
    isConnected = false,
    isSent = false,
    isIncoming = false,
    handleConnectionAction,
    currentUser
}) {
    // Internal States
    const [localIsEditing, localSetIsEditing] = useState(false);
    const [localIsFlipped, localSetIsFlipped] = useState(false);
    const [localIsIdMenuOpen, localSetIsIdMenuOpen] = useState(false);

    // Sync state getters/setters
    const isEditing = controlledIsEditing !== undefined ? controlledIsEditing : localIsEditing;
    const setIsEditing = controlledSetIsEditing || localSetIsEditing;
    const isFlipped = controlledIsFlipped !== undefined ? controlledIsFlipped : localIsFlipped;
    const setIsFlipped = controlledSetIsFlipped || localSetIsFlipped;
    const isIdMenuOpen = controlledIsIdMenuOpen !== undefined ? controlledIsIdMenuOpen : localIsIdMenuOpen;
    const setIsIdMenuOpen = controlledSetIsIdMenuOpen || localSetIsIdMenuOpen;

    const [hasCopiedId, setHasCopiedId] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Inline edit local states (synced with user prop)
    const [editUsername, setEditUsername] = useState(user?.username?.split('#')[0] || "");
    const [editBio, setEditBio] = useState(user?.bio || "");
    const [editAvatar, setEditAvatar] = useState(user?.avatar || null);
    const [isUploading, setIsUploading] = useState(false);
    
    const fileInputRef = useRef(null);
    const syncUserStore = useAuthStore((state) => state.syncUser);
    const setCredentialsStore = useAuthStore((state) => state.setCredentials);
    const { mutate } = useSWRConfig();

    useEffect(() => {
        if (user) {
            setEditUsername(user.username?.split('#')[0] || "");
            setEditBio(user.bio || "");
            setEditAvatar(user.avatar || null);
        }
    }, [user, isEditing]);

    const handleCopyId = async (e) => {
        if (e) e.stopPropagation();
        if (!user?._id) return;
        try {
            await navigator.clipboard.writeText(user._id);
            setHasCopiedId(true);
            setTimeout(() => setHasCopiedId(false), 2000);
        } catch (err) {
            console.error('Failed to copy ID', err);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/auth/upload/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setEditAvatar(res.data.avatar);
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Image upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveInline = async (e) => {
        if (e) e.stopPropagation();
        try {
            const res = await api.put('/auth/settings', {
                username: editUsername,
                bio: editBio,
                avatar: editAvatar
            });
            
            // Sync states
            if (setCredentialsStore) setCredentialsStore(res.data);
            if (syncUserStore) syncUserStore(res.data);
            
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to save settings:', err);
            alert(err.response?.data?.message || 'Failed to sync modifications.');
        }
    };

    // codenameHash generator
    const codenameHash = React.useMemo(() => {
        if (!user?._id) return "00000000";
        return user._id.slice(-8).toUpperCase();
    }, [user?._id]);

    return (
        <div className={`relative perspective-[1000px] pointer-events-auto select-none ${isFlippable ? 'cursor-pointer' : 'cursor-default'}`} onClick={() => isFlippable && !isEditing && setIsFlipped(!isFlipped)}>
            <motion.div 
                animate={{ rotateY: isFlipped ? 180 : 0 }} 
                transition={{ type: "spring", stiffness: 260, damping: 20 }} 
                style={{ transformStyle: "preserve-3d", originY: 0 }} 
                className="relative w-[82vw] md:w-[320px] min-h-[70vh] md:min-h-[446px]"
            >
                {/* ── FRONT FACE ── */}
                <div className="absolute inset-0 bg-[#d2d6dc] dark:bg-[#1c1f22] text-black dark:text-white border-[3px] border-black rounded-[4px] shadow-[0_25px_60px_rgba(0,0,0,0.55)] flex flex-col p-6 md:p-8 justify-between items-center text-center overflow-hidden" style={{ backfaceVisibility: "hidden" }}>
                    <ChippedBorder opacity={1} />
                    
                    {/* Tactical Lanyard Strap & Clip at Top Center */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-neutral-800 dark:bg-neutral-200 rounded-b-sm flex items-end justify-center pb-1 z-40 border-b border-black">
                        <div className="size-2 rounded-full bg-white dark:bg-black"></div>
                    </div>

                    {/* Stencil Corner Accents */}
                    <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-black dark:border-white pointer-events-none opacity-30 z-30" />
                    <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-black dark:border-white pointer-events-none opacity-30 z-30" />
                    <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-black dark:border-white pointer-events-none opacity-30 z-30" />
                    <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-black dark:border-white pointer-events-none opacity-30 z-30" />

                    {/* Faded Watermark background */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden mt-14">
                        <span className="text-[90px] font-black text-black/[0.04] dark:text-white/[0.03] tracking-tighter leading-none font-sans mt-4 uppercase">
                            PROD
                        </span>
                    </div>

                    <div className="flex flex-col gap-6 w-full items-center mt-4 z-10">
                        {/* Header ID */}
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black dark:text-white/40">
                                {user?.rpg?.archetype?.name && user.rpg.archetype.name !== 'None' ? `${user.rpg.archetype.name.toUpperCase()}_ID` : 'OPERATIVE_ID'}
                            </span>
                            <button 
                                onClick={handleCopyId}
                                title="Click to copy ID"
                                className="text-[8px] font-mono font-black text-black/55 dark:text-white/40 tracking-[0.2em] mt-1 leading-none hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                {codenameHash}
                                {hasCopiedId ? (
                                    <span className="text-[6px] text-emerald-600 dark:text-emerald-400 font-sans tracking-normal font-black">(COPIED!)</span>
                                ) : (
                                    <Copy size={7} className="opacity-40" />
                                )}
                            </button>
                        </div>

                        <div className="h-[1px] bg-black/10 dark:bg-white/10 w-full" />

                        {/* Polaroid Portrait */}
                        <div className="flex flex-col items-center gap-6 w-full">
                            <div
                                onClick={(e) => {
                                    if (isEditing) {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                    }
                                }}
                                className={`size-48 md:size-52 bg-white dark:bg-neutral-800 p-2.5 pb-6 border-[2px] border-black/15 dark:border-white/10 rounded-sm shadow-md shrink-0 relative transition-all ${isEditing ? 'ring-2 ring-primary cursor-pointer hover:scale-105' : ''}`}
                            >
                                {isEditing && (
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                )}
                                <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-900 border border-black/5">
                                    <Avatar config={isEditing ? editAvatar : user?.avatar} className="size-full" />
                                    
                                    {/* Level Badge in Polaroid top-left */}
                                    <div className="absolute top-2 left-2 bg-black text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 leading-none shadow-sm rounded-sm">
                                        LVL_{user?.rpg?.level || user?.guardianLevel || 1}
                                    </div>

                                    {/* EXP Bar (Own Profile only) */}
                                    {isOwnProfile && !isEditing && (
                                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/10 dark:bg-white/5 z-40 overflow-hidden border-t border-black/5 dark:border-white/5">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, (user?.rpg?.exp || 0) / 10)}%` }}
                                                className="h-full bg-black dark:bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                                            />
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/50 rounded-sm flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        {isUploading ? (
                                            <div className="size-5 border-2 border-white border-t-transparent animate-spin mb-1" />
                                        ) : (
                                            <Upload size={18} className="text-white mb-1" />
                                        )}
                                        <span className="text-white text-[7px] font-black uppercase tracking-widest">REPLACE_PHOTO</span>
                                    </div>
                                )}
                            </div>

                            {/* Name and Quote Area */}
                            <div className="flex flex-col items-center gap-1 w-full px-0">
                                {isEditing ? (
                                    <div className="flex flex-col items-center gap-2 w-full px-8">
                                        <div className="relative w-full">
                                            <input
                                                type="text"
                                                value={editUsername}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-[10px] font-black text-center uppercase tracking-[0.3em] outline-none py-1.5 rounded-sm"
                                                maxLength={8}
                                                autoFocus
                                            />
                                        </div>
                                        <textarea
                                            value={editBio}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => setEditBio(e.target.value)}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-[9px] font-mono italic text-center tracking-tight outline-none py-1.5 min-h-[40px] resize-none rounded-sm"
                                            maxLength={160}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center w-full px-6">
                                        <span className="text-[14px] font-black uppercase tracking-[0.25em] text-black dark:text-white leading-none">
                                            {(user?.username?.split('#')[0] || user?.name || 'OPERATIVE').toUpperCase()}
                                        </span>
                                        <span className="text-[9px] font-mono italic opacity-60 tracking-tight leading-tight mt-2 text-center select-text">
                                            "{user?.bio || 'System_Access_Granted'}"
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Networks / Linked To Area */}
                    <div className="grid grid-cols-2 w-full px-2 relative z-10 text-center divide-x divide-black/10 dark:divide-white/10 mt-4 pb-4">
                        <div 
                            onClick={(e) => {
                                if (isOwnProfile && setIsConnectionsModalOpen) {
                                    e.stopPropagation();
                                    setIsConnectionsModalOpen(true);
                                }
                            }}
                            className={`flex flex-col items-center justify-center ${isOwnProfile ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''}`}
                        >
                            <span className="text-[8px] font-black tracking-[0.15em] text-black/55 dark:text-white/40 uppercase leading-none">
                                NETWORKS
                            </span>
                            <span className="text-xl font-black text-black dark:text-white mt-1.5 leading-none">
                                {user?.connections?.length || 0}
                            </span>
                        </div>
                        <div 
                            onClick={(e) => {
                                if (isOwnProfile && setIsConnectionsModalOpen) {
                                    e.stopPropagation();
                                    setIsConnectionsModalOpen(true);
                                }
                            }}
                            className={`flex flex-col items-center justify-center ${isOwnProfile ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''}`}
                        >
                            <span className="text-[8px] font-black tracking-[0.15em] text-black/55 dark:text-white/40 uppercase leading-none">
                                LINKED TO:
                            </span>
                            <span className="text-xl font-black text-black dark:text-white mt-1.5 leading-none uppercase truncate max-w-full px-2">
                                {isOwnProfile ? (
                                    user?.partner?.username ? user.partner.username.split('#')[0] : 'X'
                                ) : (
                                    user?.isShared ? (
                                        currentUser?.username ? currentUser.username.split('#')[0] : 'X'
                                    ) : (
                                        user?.partner ? (user.partner.username || user.partner.name || 'X').split('#')[0] : 'X'
                                    )
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Financial vitals inside ID - Bottom Bar */}
                    <div className="mt-auto w-full bg-black/[0.06] dark:bg-black/40 border-t-2 border-black/15 dark:border-white/10 flex divide-x divide-black/10 dark:divide-white/10 py-3.5 text-center shrink-0">
                        {[
                            { l: 'CURRENT', v: isOwnProfile ? currentBalance : (user?.systemStreaks?.finance ? user.systemStreaks.finance * 15 : 0) },
                            { l: 'PROJECTION', v: isOwnProfile ? netProjection : (user?.systemStreaks?.finance ? user.systemStreaks.finance * 45 : 0) },
                            { l: 'SAVINGS', v: isOwnProfile ? totalSavings : (user?.systemStreaks?.finance ? user.systemStreaks.finance * 120 : 0) }
                        ].map((m, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-center min-w-0">
                                <span className="text-xs font-black text-black dark:text-white leading-none">
                                    {(user?.currency || 'PHP') === 'PHP' ? '₱' : '$'}{Math.abs(m.v).toLocaleString()}
                                </span>
                                <span className="text-[7px] font-black tracking-widest text-black/50 dark:text-white/40 uppercase mt-1 leading-none truncate w-full text-center px-1">
                                    {m.l}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Action overlays & Close Buttons */}
                    {onClose && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            className="absolute top-8 right-8 z-40 p-2 text-black dark:text-white opacity-40 hover:opacity-100 transition-all hover:scale-125 cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    )}

                    {/* connection/dropdown trigger */}
                    <div className="absolute top-8 left-8 z-40">
                        {isOwnProfile ? (
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsIdMenuOpen(!isIdMenuOpen);
                                    }}
                                    className="p-2 text-black dark:text-white opacity-45 hover:opacity-100 transition-opacity"
                                >
                                    <MoreVertical size={16} />
                                </button>
                                <AnimatePresence>
                                    {isIdMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex flex-col items-center gap-3 bg-[#e2e8f0] dark:bg-neutral-900 border-2 border-black p-2 rounded-sm mt-2 shadow-xl absolute left-0"
                                        >
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}
                                                        className="p-1 hover:scale-115 transition-transform"
                                                        title="ABORT_CHANGES"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px] text-black dark:text-white">close</span>
                                                    </button>
                                                    <div className="h-[1px] w-3 bg-black/10 dark:bg-white/10" />
                                                    <button
                                                        onClick={handleSaveInline}
                                                        className="p-1 hover:scale-115 transition-transform"
                                                        title="SYNC_CHANGES"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px] text-black dark:text-white">check</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setIsIdMenuOpen(false); setIsEditing(true); }}
                                                        className="p-1 hover:scale-115 transition-transform"
                                                        title="EDIT_ID"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px] text-black dark:text-white">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setIsIdMenuOpen(false); setIsSearchModalOpen && setIsSearchModalOpen(true); }}
                                                        className="p-1 hover:scale-115 transition-transform"
                                                        title="SEARCH_ID"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px] text-black dark:text-white">search</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setIsIdMenuOpen(false); setIsConnectionsModalOpen && setIsConnectionsModalOpen(true); }}
                                                        className="p-1 hover:scale-115 transition-transform"
                                                        title="NETWORK_ID"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px] text-black dark:text-white">group</span>
                                                    </button>
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                                    className="p-2 text-black dark:text-white opacity-45 hover:opacity-100 transition-opacity"
                                >
                                    <MoreVertical size={16} />
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute left-0 mt-1 bg-[#e2e8f0] dark:bg-neutral-900 border-2 border-black rounded-sm shadow-xl py-1 z-50 min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-150" onClick={(e) => e.stopPropagation()}>
                                        {user.isShared ? (
                                            <>
                                                <div className="px-3 py-2 text-[8px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-black/10 dark:border-white/10">
                                                    <span className="material-symbols-outlined text-[14px]">favorite</span> Partner Shared
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        setIsMenuOpen(false);
                                                        if (window.confirm("Are you sure you want to unlink? This will disconnect your shared habits and planner.")) {
                                                            try {
                                                                await api.post('/auth/partner/unlink');
                                                                alert('Unlinked successfully!');
                                                                if (syncUserStore) {
                                                                    const res = await api.get('/auth/me');
                                                                    syncUserStore(res.data);
                                                                }
                                                                mutate('/auth/me');
                                                                onClose && onClose();
                                                            } catch (err) {
                                                                alert(err.response?.data?.message || 'Failed to unlink partner');
                                                            }
                                                        }
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-[8px] font-black text-red-500 hover:bg-red-500/5 uppercase tracking-widest flex items-center gap-1.5"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">link_off</span> Unlink Partner
                                                </button>
                                            </>
                                        ) : isConnected ? (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setIsMenuOpen(false);
                                                        if(window.confirm(`Disconnect from ${user.username || 'this user'}?`)) {
                                                            handleConnectionAction('disconnect');
                                                        }
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-[8px] font-black text-red-500 hover:bg-red-500/5 uppercase tracking-widest flex items-center gap-1.5"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">link_off</span> Disconnect
                                                </button>
                                                
                                                {!user.partner && !currentUser?.partner && !currentUser?.outgoingPartnerRequest && (
                                                    <button
                                                        onClick={async () => {
                                                            setIsMenuOpen(false);
                                                            try {
                                                                await api.post('/auth/partner/request', { userId: user._id });
                                                                alert('Partner link request sent!');
                                                                onClose && onClose();
                                                            } catch(e) {
                                                                alert(e.response?.data?.message || 'Failed to send request');
                                                            }
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-[8px] font-black text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 uppercase tracking-widest flex items-center gap-1.5 border-t border-black/10 dark:border-white/10"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">handshake</span> Link Partner
                                                    </button>
                                                )}
                                            </>
                                        ) : currentUser?._id !== user._id && (
                                            <>
                                                {isSent ? (
                                                    <button 
                                                        onClick={() => { setIsMenuOpen(false); handleConnectionAction('cancel'); }} 
                                                        className="w-full text-left px-3 py-2 text-[8px] font-black text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 uppercase tracking-widest flex items-center gap-1.5"
                                                    >
                                                        Cancel Request
                                                    </button>
                                                ) : isIncoming ? (
                                                    <div className="flex flex-col">
                                                        <button 
                                                            onClick={() => { setIsMenuOpen(false); handleConnectionAction('accept'); }} 
                                                            className="w-full text-left px-3 py-2 text-[8px] font-black text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/5 uppercase tracking-widest flex items-center gap-1.5"
                                                        >
                                                            Accept Request
                                                        </button>
                                                        <button 
                                                            onClick={() => { setIsMenuOpen(false); handleConnectionAction('reject'); }} 
                                                            className="w-full text-left px-3 py-2 text-[8px] font-black text-red-500 hover:bg-red-500/5 uppercase tracking-widest flex items-center gap-1.5"
                                                        >
                                                            Decline Request
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => { setIsMenuOpen(false); handleConnectionAction('request'); }} 
                                                        className="w-full text-left px-3 py-2 text-[8px] font-black text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 uppercase tracking-widest flex items-center gap-1.5"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">person_add</span> Connect
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── BACK FACE ── */}
                <div className="absolute inset-0 bg-[#d2d6dc] dark:bg-[#1c1f22] text-black dark:text-white border-[3px] border-black rounded-[4px] shadow-[0_25px_60px_rgba(0,0,0,0.55)] flex flex-col p-6 md:p-8 justify-between items-center text-center overflow-hidden" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                    <ChippedBorder opacity={1} />
                    
                    {/* Tactical Lanyard Strap & Clip */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-neutral-800 dark:bg-neutral-200 rounded-b-sm flex items-end justify-center pb-1 z-40 border-b border-black">
                        <div className="size-2 rounded-full bg-white dark:bg-black"></div>
                    </div>

                    {/* Stencil Corner Accents */}
                    <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-black dark:border-white pointer-events-none opacity-30 z-30" />
                    <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-black dark:border-white pointer-events-none opacity-30 z-30" />
                    <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-black dark:border-white pointer-events-none opacity-30 z-30" />
                    <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-black dark:border-white pointer-events-none opacity-30 z-30" />

                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-end justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.02] select-none z-0 pb-20 md:pb-24" style={{ transform: 'translateX(100px)' }}>
                        <span className="font-sans font-black text-[70px] md:text-[90px] tracking-[0.1em] uppercase">PRODUS</span>
                    </div>

                    <div className="flex flex-col gap-6 w-full items-center mt-10">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black dark:text-white/20">System Metadata</span>
                            <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">Global_Unique_Identifier</span>
                        </div>
                        <div className="p-4 bg-white rounded-sm shadow-[0_0_50px_rgba(255,255,255,0.05)] relative z-10">
                            <QRCodeSVG 
                                id="operator-qr-svg"
                                value={user?._id || 'PRODUS_OPERATIVE'} 
                                size={160} 
                                bgColor={"#FFFFFF"} 
                                fgColor={"#000000"} 
                                level={"H"} 
                            />
                        </div>
                        
                        <div className="flex flex-col items-center gap-4 w-full">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-black dark:text-white/10">Full Access Key</span>
                                <button 
                                    onClick={handleCopyId}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2.5 rounded-sm font-mono text-[9px] break-all leading-relaxed opacity-60 text-center uppercase tracking-tighter hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
                                    title="Click to copy ID"
                                >
                                    {user?._id || 'SESSION_DATA_NOT_FOUND'}
                                    {hasCopiedId && <span className="text-[7px] text-emerald-600 dark:text-emerald-400 font-sans tracking-normal font-black">(COPIED!)</span>}
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2.5 w-full pt-1" onClick={(e) => e.stopPropagation()}>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const svg = document.getElementById('operator-qr-svg');
                                        if (!svg) return;
                                        const svgData = new XMLSerializer().serializeToString(svg);
                                        const canvas = document.createElement("canvas");
                                        const ctx = canvas.getContext("2d");
                                        const img = new Image();
                                        img.onload = () => {
                                            canvas.width = img.width;
                                            canvas.height = img.height;
                                            ctx.fillStyle = "white";
                                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                                            ctx.drawImage(img, 0, 0);
                                            const link = document.createElement("a");
                                            link.download = `operator_key_${user?._id?.slice(-6).toUpperCase()}.png`;
                                            link.href = canvas.toDataURL("image/png");
                                            link.click();
                                        };
                                        img.src = "data:image/svg+xml;base64," + btoa(svgData);
                                    }}
                                    className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-black text-[9px] uppercase tracking-[0.4em] hover:bg-black/90 dark:hover:bg-white/90 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    <span className="material-symbols-outlined text-[14px]">download</span>
                                    SAVE QR CODE
                                </button>
                                {isOwnProfile && setIsQrModalOpen && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsQrModalOpen(true);
                                        }}
                                        className="w-full py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white font-black text-[9px] uppercase tracking-[0.4em] hover:bg-black/10 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
                                        SCAN QR CODE
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
