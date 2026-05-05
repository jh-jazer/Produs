import React, { useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRModal from '../ui/QRModal';
import { QrCode, Zap, Shield, Target, Brain, Sparkles, ChevronRight, User, Mail, Calendar, CheckCircle2, Eye, EyeOff, Copy, Check, Lock, Edit2, Save, X, Handshake, Users, Cpu } from 'lucide-react';
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
import { MoodTracker } from './DashboardRealityWidgets';

const IdentityHeader = ({ user: initialUser, habits = [] }) => {
    const { protocolMode } = useContext(DashboardContext);
    const { updateSettings } = useAuthStore();

    const updateMood = async (newMood) => {
        try { await updateSettings({ mood: newMood }); } catch (e) { console.error('Failed to update mood', e); }
    };
    const [user, setUser] = useState(initialUser);
    const [isIdVisible, setIsIdVisible] = useState(false);
    const [hasCopiedId, setHasCopiedId] = useState(false);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [banner, setBanner] = useState(user?.banner || "");
    const [avatar, setAvatar] = useState(user?.avatar || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [usernameBase, setUsernameBase] = useState(user?.username ? user.username.split('#')[0] : "");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const [bannerPosition, setBannerPosition] = useState(user?.settings?.bannerPosition || 50);
    const [isDragging, setIsDragging] = useState(false);
    const bannerRef = useRef(null);

    // Modals State
    const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
    const [profileModalUser, setProfileModalUser] = useState(null);

    // Live Clock State
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        setUser(initialUser);
        setBanner(initialUser?.banner || "");
        setAvatar(initialUser?.avatar || "");
        setBio(initialUser?.bio || "");
        setUsernameBase(initialUser?.username ? initialUser.username.split('#')[0] : "");
        setBannerPosition(initialUser?.settings?.bannerPosition || 50);
    }, [initialUser]);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await updateSettings({ 
                banner, 
                avatar, 
                bio,
                bannerPosition,
                username: usernameBase
            });
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

    const handlePointerDown = (e) => {
        if (!isEditing || !banner) return;
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging || !bannerRef.current) return;
        
        const rect = bannerRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const percentage = Math.max(0, Math.min(100, (y / rect.height) * 100));
        setBannerPosition(Math.round(percentage));
    };

    const handlePointerUp = (e) => {
        if (!isDragging) return;
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
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

    if (protocolMode === 'rpg') return null;

    return (
        <div className="w-full max-w-4xl mx-auto px-4 md:px-0">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mt-8 mb-12"
            >
                {/* 1. The ID Card Container */}
                <div className="bg-[#f8f9fa] dark:bg-[#0a0a0a] rounded-[2rem] border-2 border-black/5 dark:border-white/10 overflow-hidden relative group">
                    
                    {/* Tactical Background Accents */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 bg-grid-light dark:bg-grid opacity-[0.03]" />
                    </div>

                    {/* Card Header: System Identification - Compact Layout */}
                    <div className="relative z-10 px-8 py-4 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.05] dark:border-white/[0.05] flex items-center gap-6 justify-start">
                        {/* 1. Level Indicator */}
                        <div className="flex items-center">
                            <span className="text-[12px] font-black text-black dark:text-white font-exo italic tracking-[0.2em]">LVL_{user.level || 0}</span>
                        </div>

                        <div className="w-px h-6 bg-black/10 dark:bg-white/10" />

                        {/* 2. Operative Identity */}
                        <div className="flex flex-col items-start">
                            <p className="text-[9px] font-black text-black/60 dark:text-white/60 uppercase tracking-[0.2em] leading-none mb-1">{(user.username || user.name || 'OPERATOR').split('#')[0].replace(/\d+/g, '')}</p>
                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em] leading-none">{archeName || 'UNAWAKENED'}</p>
                        </div>

                        {/* 3. System ID */}
                        <div className="flex items-center gap-3 ml-auto">
                            <span className="text-[9px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.4em] font-sans">
                                ID: {isIdVisible ? user._id : '••••••••••••••••'}
                            </span>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setIsIdVisible(!isIdVisible)}
                                    className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white"
                                >
                                    {isIdVisible ? <EyeOff size={11} /> : <Eye size={11} />}
                                </button>
                                <button 
                                    onClick={handleCopyId}
                                    className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white"
                                >
                                    {hasCopiedId ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row gap-10">
                        {/* Left Section: Photo & Mood */}
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                                <motion.div 
                                    className="w-40 md:w-48 h-56 md:h-64 bg-white dark:bg-slate-50 relative overflow-visible flex items-center justify-center p-2"
                                >

                                    <Avatar config={avatar || user.avatar} className="size-full" />
                                    
                                    {isEditing && (
                                        <button
                                            onClick={() => setIsAvatarEditorOpen(true)}
                                            className="absolute inset-0 bg-black/60 rounded-[2rem] flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20"
                                        >
                                            <Edit2 size={24} className="text-white" />
                                            <span className="text-white text-[8px] font-black uppercase tracking-widest mt-1">REPLACE_PHOTO</span>
                                        </button>
                                    )}
                                </motion.div>
                                
                            </div>

                        </div>

                        {/* Right Section: Operative Data Area - Streamlined */}
                        <div className="flex-1 pt-2">
                            {/* Empty space as requested */}
                        </div>
                    </div>

                    {/* Card Footer: Security Elements & Actions */}
                    <div className="relative z-10 px-8 py-6 bg-black/[0.04] dark:bg-white/[0.04] border-t border-black/[0.05] dark:border-white/10 flex items-center justify-between mt-4">
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <MoodTracker user={user} updateMood={updateMood} standalone />
                                    <span className="text-[6px] font-bold text-black dark:text-white font-mono tracking-[0.4em] uppercase truncate max-w-[250px]">{user.bio || 'STAY_FOCUSED'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 bg-black/5 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10 transition-all">
                                        Cancel_
                                    </button>
                                    <button onClick={handleSaveProfile} className="px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                        Save_Changes_
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setIsQrModalOpen(true)} className="size-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-black/40 dark:text-white/40 hover:text-primary transition-all">
                                        <QrCode size={18} />
                                    </button>
                                    <button onClick={() => setIsConnectionsModalOpen(true)} className="size-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-black/40 dark:text-white/40 hover:text-primary transition-all">
                                        <Users size={18} />
                                    </button>
                                    <button onClick={() => setIsEditing(true)} className="h-10 px-5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                                        Edit_Profile_
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Modals */}
            <ConnectionsModal
                isOpen={isConnectionsModalOpen}
                onClose={() => setIsConnectionsModalOpen(false)}
                onProfileClick={(username) => { setProfileModalUser(username); setIsConnectionsModalOpen(false); }}
            />

            <QRModal 
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                userId={user._id}
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
