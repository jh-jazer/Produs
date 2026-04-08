import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Target, Brain, Sparkles, ChevronRight, User, Mail, Calendar, CheckCircle2, Eye, EyeOff, Copy, Check, Lock, Edit2, Save, X, Share2, Users } from 'lucide-react';
import { getLevelProgress } from '../../utils/rpgHelpers';
import { ARCHETYPE_PROTOCOLS } from '../../constants/assessment';
import Avatar from '../ui/Avatar';
import AvatarEditor from '../ui/AvatarEditor';
import ConnectionsModal from '../ui/ConnectionsModal';
import PartnerModal from '../ui/PartnerModal';
import ProfileModal from '../ui/ProfileModal';
import { DashboardContext } from '../../context/DashboardContext';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';

const IdentityHeader = ({ user: initialUser, habits = [] }) => {
    const { protocolMode, setProtocolMode } = useContext(DashboardContext);
    const { updateSettings } = useAuthStore();
    const [user, setUser] = useState(initialUser);
    const [isIdVisible, setIsIdVisible] = useState(false);
    const [hasCopiedId, setHasCopiedId] = useState(false);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [banner, setBanner] = useState(user?.banner || "");
    const [avatar, setAvatar] = useState(user?.avatar || "");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);

    // Modals State
    const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
    const [profileModalUser, setProfileModalUser] = useState(null);

    useEffect(() => {
        setUser(initialUser);
        setBanner(initialUser?.banner || "");
        setAvatar(initialUser?.avatar || "");
    }, [initialUser]);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await updateSettings({ banner, avatar });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingBanner(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/auth/upload/banner', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setBanner(res.data.url);
        } catch (error) {
            console.error("Failed to upload banner", error);
        } finally {
            setIsUploadingBanner(false);
        }
    };

    const handleCopyId = async () => {
        try {
            await navigator.clipboard.writeText(user._id);
            setHasCopiedId(true);
            setTimeout(() => setHasCopiedId(false), 2000);
        } catch (err) {
            console.error('Failed to copy ID', err);
        }
    };
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(h => h.completedDates?.some(d => d.startsWith(today))).length;
    const totalHabits = habits.length;
    const habitProgress = totalHabits > 0 ? (completedToday / totalHabits * 100) : 0;

    const rpg = user.rpg || { stats: {}, archetype: { name: 'None', tier: 1, stage: 'Unawakened' } };
    const { name: archeName, tier, stage } = rpg.archetype;
    const protocol = ARCHETYPE_PROTOCOLS[archeName] || ARCHETYPE_PROTOCOLS['None'];
    
    // Calculate level progress using total user EXP
    const progressData = getLevelProgress(user.exp || 0);

    return (
        <div className="glass-panel w-full rounded-[2.5rem] mb-6 md:mb-12 relative overflow-hidden flex flex-col">
            {/* 1. Tactical Banner Segment */}
            <div className="w-full h-32 md:h-40 relative group overflow-hidden">
                {banner ? (
                    <img 
                        src={banner}
                        alt="Profile Banner" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-900 dark:to-[#0a0a0a] transition-all duration-700">
                        {/* Abstract tactical grid over empty banner */}
                        <div className="absolute inset-0 bg-grid-light dark:bg-grid opacity-20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                )}

                {isEditing && (
                    <label className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4 z-20 cursor-pointer transition-colors ${isUploadingBanner ? 'opacity-100' : 'hover:bg-black/40'}`}>
                        {isUploadingBanner ? (
                            <div className="size-8 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2" />
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-white text-3xl mb-2">add_photo_alternate</span>
                                <span className="text-white text-sm font-bold uppercase tracking-widest">Upload Banner</span>
                                <span className="text-white/60 text-[10px] uppercase font-black tracking-widest mt-1">16:9 Recommended</span>
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerUpload}
                            disabled={isUploadingBanner}
                            className="hidden"
                        />
                    </label>
                )}
                
                {/* 1.1 Tactical Toggles Area */}
                <div className="absolute top-4 right-6 flex flex-col md:flex-row items-end md:items-center gap-4">
                    {/* Protocol Selector Toggle */}
                    <div className="flex bg-black/40 dark:bg-black/60 backdrop-blur-md rounded-2xl p-1 border border-white/10 shadow-2xl">
                        <button
                            onClick={() => setProtocolMode('reality')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${protocolMode === 'reality' ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-white/40 hover:text-white/70'}`}
                        >
                            <User size={10} />
                            <span className="hidden md:block">REALITY</span>
                        </button>
                        <button
                            onClick={() => (user.rpg?.path || user.rpg?.pendingQuestions?.length > 0 || user.level === 0) && setProtocolMode('rpg')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                protocolMode === 'rpg' 
                                ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                                : (!user.rpg?.path && !user.rpg?.pendingQuestions?.length && user.level > 0) 
                                    ? 'text-white/20 cursor-not-allowed' 
                                    : 'text-white/40 hover:text-white/70'
                            }`}
                        >
                            {(user.rpg?.path || user.rpg?.pendingQuestions?.length > 0 || user.level === 0) ? (
                                <Zap size={10} className={protocolMode === 'rpg' ? 'animate-pulse' : ''} />
                            ) : (
                                <Lock size={10} className="text-white/20" />
                            )}
                            <span className="hidden md:block">ISEKAI</span>
                        </button>
                    </div>

                    
                </div>
            </div>

            {/* 2. Profile Overlay & Header Section */}
            <div className="px-4 md:px-12 pb-8 md:pb-10 -mt-10 md:-mt-12 relative z-10 space-y-6 md:space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8">
                        {/* Avatar */}
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="size-24 md:size-32 rounded-3xl md:rounded-[2.5rem] bg-white dark:bg-[#121212] p-1 shadow-2xl border-4 border-white/80 dark:border-white/10 ring-8 ring-black/5 dark:ring-white/[0.02] relative group"
                        >
                            <div className="w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-white/5">
                                <Avatar config={avatar || user.avatar} className="size-full" />
                            </div>
                            {isEditing && (
                                <button
                                    onClick={() => setIsAvatarEditorOpen(true)}
                                    className="absolute inset-0 bg-black/60 rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                >
                                    <Edit2 size={24} className="text-white" />
                                    <span className="text-white text-[8px] font-black uppercase tracking-widest mt-1">Change</span>
                                </button>
                            )}
                        </motion.div>

                        {/* User Identity Info */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1 md:pb-5">
                            <AnimatePresence mode="wait">
                                {protocolMode === 'rpg' ? (
                                    <motion.div 
                                        key="rpg-info"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex items-center gap-3 mb-1"
                                    >
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                                            {stage || 'UNMAPPED'}
                                        </span>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="reality-info"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex items-center gap-3 mb-1"
                                    >
                                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest font-mono italic">
                                            {isIdVisible ? user._id : '**************'}
                                        </span>
                                        <button 
                                            onClick={() => setIsIdVisible(!isIdVisible)}
                                            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-500 transition-colors"
                                            title={isIdVisible ? "Hide ID" : "Show ID"}
                                        >
                                            {isIdVisible ? <EyeOff size={10} /> : <Eye size={10} />}
                                        </button>
                                        <button
                                            onClick={handleCopyId}
                                            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-500 transition-colors"
                                            title="Copy ID"
                                        >
                                            {hasCopiedId ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                                        </button>
                                        <div className="size-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            <motion.h1 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white font-exo leading-none"
                            >
                                @{user.username || user.name || 'USER_LINK_LOST'}
                            </motion.h1>
                        </div>
                    </div>

                    {/* Metric Card (Level or Reality) */}
                    <AnimatePresence mode="wait">
                        {protocolMode === 'rpg' ? (
                            <motion.div 
                                key="rpg-metric"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: 0.2 }}
                                className="glass-card flex items-center gap-5 p-4 md:p-5 rounded-3xl md:self-end"
                            >
                                {/* Level Icon Badge */}
                                <div className="size-12 lg:size-14 rounded-2xl bg-slate-900 dark:bg-white flex flex-col items-center justify-center shrink-0 border border-black/5 dark:border-white/5 shadow-none">
                                    <span className="text-[7px] md:text-[8px] font-black text-white/40 dark:text-black/40 uppercase tracking-tighter italic leading-none mb-0.5">LVL</span>
                                    <span className="text-xl md:text-2xl font-black text-white dark:text-black italic font-exo leading-none">{user.level || 1}</span>
                                </div>

                                <div className="flex flex-col min-w-[200px] md:min-w-[240px]">
                                <div className="flex justify-between items-end mb-1.5 px-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-exo italic leading-none">
                                                {progressData.xpInLevel}
                                            </span>
                                            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                / {progressData.xpRequired} XP TO LVL UP
                                            </span>
                                        </div>
                                        <span className="text-[9px] md:text-[10px] font-black text-cyan-500 uppercase tracking-widest font-mono italic">{Math.round(progressData.progress)}%_SYNC</span>
                                    </div>
                                    
                                    <div className="h-2 w-full bg-black/[0.04] dark:bg-white/5 rounded-full overflow-hidden relative">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressData.progress}%` }}
                                            transition={{ duration: 1.2, ease: "circOut" }}
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-cyan-400"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="reality-actions"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: 0.2 }}
                                className="flex justify-center items-center gap-3 w-full md:w-auto md:self-end"
                            >
                                {isEditing ? (
                                    <div className="flex items-center justify-center gap-2 w-full md:w-auto">
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setBanner(user?.banner || "");
                                                setAvatar(user?.avatar || "");
                                            }}
                                            className="px-6 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-2 uppercase tracking-widest"
                                        >
                                            <X size={14} />
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving || isUploadingBanner}
                                            className="px-6 py-3 bg-cyan-500 text-white rounded-2xl font-black text-xs hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest"
                                        >
                                            {isSaving ? (
                                                <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Save size={14} />
                                            )}
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex justify-center items-center gap-3 w-full md:w-auto">
                                        <button
                                            onClick={() => setIsConnectionsModalOpen(true)}
                                            className="size-12 lg:size-14 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-cyan-500 hover:border-cyan-500/30 transition-all relative group shadow-sm"
                                            title="Network"
                                        >
                                            <Users size={20} className="group-hover:scale-110 transition-transform" />
                                            {user?.incomingConnectionRequests?.length > 0 && (
                                                <span className="absolute -top-1 -right-1 size-3 bg-rose-500 rounded-full border-2 border-white dark:border-[#0a0a0a] animate-pulse" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setIsPartnerModalOpen(true)}
                                            className={`size-12 lg:size-14 flex items-center justify-center rounded-2xl border transition-all shadow-sm group ${user?.partner
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:text-cyan-500'
                                                }`}
                                            title="Shared Account"
                                        >
                                            <Share2 size={20} className="group-hover:scale-110 transition-transform" />
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="size-12 lg:size-14 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-cyan-500 hover:border-cyan-500/30 transition-all shadow-sm group"
                                            title="Edit Profile"
                                        >
                                            <Edit2 size={20} className="group-hover:scale-110 transition-transform" />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 3. XP Progress Tracker (Space Reserved) */}
                <div className="space-y-4"></div>

                {/* 4. Lore / Bio Section */}
                <div className="flex items-center gap-4 md:gap-8 pt-4 md:pt-8 border-t border-black/[0.05] dark:border-white/5">
                    <div className="hidden md:flex size-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 items-center justify-center text-cyan-500 shrink-0">
                        <AnimatePresence mode="wait">
                            {protocolMode === 'rpg' ? (
                                <motion.div
                                    key="rpg-icon"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                >
                                    <Sparkles size={28} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="reality-icon"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    className="text-cyan-500"
                                >
                                    <Target size={28} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="relative flex-1">
                        <span className="absolute -left-4 -top-6 text-6xl text-black/[0.05] dark:text-white/5 font-serif italic selection:bg-transparent pointer-events-none">"</span>
                        <AnimatePresence mode="wait">
                            {protocolMode === 'rpg' ? (
                                <motion.p 
                                    key="rpg-flavor"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20, filter: 'blur(5px)' }}
                                    className="text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed tracking-[0.15em] uppercase px-4 max-w-4xl"
                                >
                                    {protocol.flavor}
                                </motion.p>
                            ) : (
                                <motion.p 
                                    key="reality-bio"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20, filter: 'blur(5px)' }}
                                    className="text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed tracking-[0.05em] px-4 max-w-4xl normal-case"
                                >
                                    {user.bio || "Operator objective undefined. Establishing focus protocols..."}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ConnectionsModal
                isOpen={isConnectionsModalOpen}
                onClose={() => setIsConnectionsModalOpen(false)}
                onProfileClick={(username) => { setProfileModalUser(username); setIsConnectionsModalOpen(false); }}
            />

            <PartnerModal
                isOpen={isPartnerModalOpen}
                onClose={() => setIsPartnerModalOpen(false)}
                onProfileClick={(username) => { setProfileModalUser(username); setIsPartnerModalOpen(false); }}
            />

            {isAvatarEditorOpen && (
                <AvatarEditor
                    initialConfig={avatar}
                    onClose={() => setIsAvatarEditorOpen(false)}
                    onSave={(newConfig) => {
                        setAvatar(newConfig);
                        setIsAvatarEditorOpen(false);
                    }}
                />
            )}

            <AnimatePresence>
                {profileModalUser && (
                    <ProfileModal
                        username={profileModalUser}
                        onClose={() => setProfileModalUser(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default IdentityHeader;
