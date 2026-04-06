import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import useAuthStore from '../store/useAuthStore';

import api from '../services/api';

import Avatar from '../components/ui/Avatar';
import AvatarEditor from '../components/ui/AvatarEditor';
import ProfileModal from '../components/ui/ProfileModal';
import ConnectionsModal from '../components/ui/ConnectionsModal';
import PartnerModal from '../components/ui/PartnerModal';

function Profile() {
    const navigate = useNavigate();
    const { user, updateSettings, setCredentials, viewMode, setViewMode } = useAuthStore();
    const isSyncing = false;
    const isOnline = true;

    const today = new Date().toISOString().split('T')[0];

    // SWR Data Fetching
    const { data: allHabits = [], isLoading: isHabitsLoading } = useSWR('/habits');
    const { data: currentTasksRaw = [], isLoading: isTasksLoading } = useSWR(`/planner/tasks?date=${today}`);
    const { data: wishlist = [], isLoading: isWishlistLoading, mutate: mutateWishlist } = useSWR('/finance/wishlist');

    const isLoading = isHabitsLoading || isTasksLoading || isWishlistLoading;

    const coreHabits = React.useMemo(() => {
        const systemIds = ['journal', 'finance', 'planner', 'workout'];
        return systemIds.map(id => allHabits.find(h => h.systemId === id)).filter(Boolean);
    }, [allHabits]);

    const currentTasks = React.useMemo(() => {
        return [...currentTasksRaw].sort((a, b) => {
            const priorityScore = { high: 3, medium: 2, low: 1, none: 0 };
            return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
        }).slice(0, 3);
    }, [currentTasksRaw]);

    // Profile settings state
    const [username, setUsername] = useState(user?.username || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [avatar, setAvatar] = useState(user?.avatar || "");
    const [banner, setBanner] = useState(user?.banner || "");
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [profileModalUser, setProfileModalUser] = useState(null);

    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
    const [showId, setShowId] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [mood, setMood] = useState(user?.settings?.mood || "neutral");
    const [wishlistInput, setWishlistInput] = useState("");


    const syncUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setCredentials(res.data);
        } catch (err) {
            console.error("Failed to sync user state", err);
        }
    };

    useEffect(() => {
        const checkAvailability = async () => {
            // Only check if username changed and is valid length
            if (isEditing && username !== user?.username && username.length >= 3) {
                setIsCheckingUsername(true);
                try {
                    const res = await api.get(`/auth/check-username?username=${username}`);
                    setIsUsernameAvailable(res.data.available);
                } catch (err) {
                    console.error('Failed to check username:', err);
                } finally {
                    setIsCheckingUsername(false);
                }
            } else {
                setIsUsernameAvailable(null);
            }
        };

        const timeout = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timeout);
    }, [username, isEditing, user?.username]);

    const handleAddWishlist = async (e) => {
        e.preventDefault();
        if (!wishlistInput.trim()) return;

        try {
            const res = await api.post('/finance/wishlist', {
                title: wishlistInput,
                budgetPrice: 0,
                priority: 'Medium',
                category: 'General'
            });
            // Handle both structure possibilities depending on server res wrapper
            const newObj = res.data.data || res.data;
            mutateWishlist();
            setWishlistInput("");
        } catch (error) {

            console.error("Failed to save wishlist", error);
        }
    };

    const toggleWishlist = async (id) => {
        const item = wishlist.find(i => (i._id === id || i.id === id));
        if (!item) return;
        const isCompleted = item.purchased || item.completed;

        try {
            await api.patch(`/finance/wishlist/${item._id}`, { purchased: !isCompleted });
            mutateWishlist();
        } catch (error) {
            console.error("Failed to update wishlist", error);
        }
    };


    const updateMood = async (newMood) => {
        setMood(newMood);
        try {
            await updateSettings({ mood: newMood });
        } catch (error) {
            console.error("Failed to update mood", error);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setSaveMessage("");
        try {
            await updateSettings({ username, bio, avatar, banner });
            setSaveMessage("Profile updated successfully!");
            setIsEditing(false);
            setTimeout(() => setSaveMessage(""), 3000);
        } catch (error) {
            console.error("Failed to update profile", error);
            setSaveMessage("Failed to update profile. Username might be taken.");
        } finally {
            setIsSaving(false);
        }
    };


    const moodEmojis = {
        great: { emoji: "🤩", label: "Great" },
        good: { emoji: "🙂", label: "Good" },
        neutral: { emoji: "😐", label: "Neutral" },
        bad: { emoji: "😔", label: "Bad" },
        awful: { emoji: "😭", label: "Awful" },
    };

    if (isLoading) {
        return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
    }

    return (<>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl mx-auto pb-12 px-0 md:px-0"
        >
            {/* Discord-style Header Card */}
        <div className="bg-white dark:bg-[#121212] rounded-[24px] shadow-none border border-slate-200 dark:border-white/10 overflow-hidden mb-8 relative">

                {/* Banner Section */}
                <div className="h-40 sm:h-56 w-full bg-slate-200 dark:bg-[#1e1f22] relative group">
                    {banner ? (
                        <img src={banner} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20"></div>
                    )}
                    {isEditing && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4">
                            <span className="material-symbols-outlined text-white text-3xl mb-2">image</span>
                            <input
                                type="text"
                                value={banner}
                                onChange={(e) => setBanner(e.target.value)}
                                placeholder="Banner Image URL..."
                                className="w-full max-w-md bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm font-medium rounded-xl px-4 py-2 outline-none focus:border-white focus:bg-white/20 transition-all text-center backdrop-blur-sm"
                            />
                        </div>
                    )}
                </div>

                {/* Avatar and Welcome Row */}
                <div className="px-2 sm:px-8 pb-8 relative">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8 mt-[-40px] px-4 md:px-8 relative z-10">
                        {/* Avatar Column */}
                        <div className="relative group">
                            <div className="size-32 rounded-full border-[6px] border-white dark:border-[#1e293b] bg-slate-100 dark:bg-[#000000] overflow-hidden shadow-xl ring-2 ring-primary/5">
                                <Avatar config={avatar || user?.avatar} />
                            </div>
                            {isEditing && (
                                <button
                                    onClick={() => setIsAvatarEditorOpen(true)}
                                    className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                >
                                    <span className="material-symbols-outlined text-white text-2xl">edit</span>
                                    <span className="text-white text-[8px] font-black uppercase tracking-widest mt-1">Change</span>
                                </button>
                            )}
                        </div>

                        {/* Info Column */}
                        <div className="flex-1 text-center md:text-left space-y-1">
                            {isEditing ? (
                                <div className="space-y-2 pb-2">
                                    <input
                                        type="text"
                                        value={user?.name}
                                        readOnly
                                        className="bg-transparent text-3xl font-black text-slate-900 dark:text-white tracking-tight outline-none w-full border-b border-transparent focus:border-primary/30"
                                    />
                                    <div className="flex items-center gap-2 justify-center md:justify-start">
                                        <span className="text-xl font-black text-slate-400">@</span>
                                        <div className="relative flex-1 max-w-[200px]">
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => {
                                                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                                                    setSaveMessage("");
                                                }}
                                                placeholder="username"
                                                className={`w-full bg-slate-100 dark:bg-[#000000]/50 border ${isUsernameAvailable === true ? 'border-emerald-500/50' : isUsernameAvailable === false ? 'border-rose-500/50' : 'border-slate-200 dark:border-white/10'} text-slate-900 dark:text-white font-bold rounded-lg px-2 py-1 text-sm outline-none focus:border-primary transition-colors`}
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                                {isCheckingUsername ? (
                                                    <div className="size-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                ) : isUsernameAvailable === true ? (
                                                    <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
                                                ) : isUsernameAvailable === false ? (
                                                    <span className="material-symbols-outlined text-rose-500 text-base">cancel</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 justify-center md:justify-start">
                                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{user?.name}</h1>
                                        {user?.verified && (
                                            <span className="material-symbols-outlined text-primary text-xl" title="Verified Member">verified</span>
                                        )}
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">@{user?.username}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md font-medium">
                                        {user?.bio || "Just another focused human."}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Actions Column */}
                        <div className="flex flex-col items-center md:items-end gap-3 pb-1">
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 bg-slate-100 dark:bg-[#000000] hover:bg-slate-200 dark:hover:bg-[#121212] rounded-xl text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving || isUsernameAvailable === false || isCheckingUsername}
                                        className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                                    >
                                        {isSaving ? '...' : 'Save'}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsConnectionsModalOpen(true)}
                                        className="size-10 flex items-center justify-center rounded-xl border bg-slate-100 dark:bg-[#000000] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-primary hover:border-primary/30 transition-colors relative"
                                        title="Network"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">group</span>
                                        {user?.incomingConnectionRequests?.length > 0 && (
                                            <span className="absolute -top-1 -right-1 size-3 bg-rose-500 rounded-full border-2 border-white dark:border-[#192233] animate-pulse" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setIsPartnerModalOpen(true)}
                                        className={`size-10 flex items-center justify-center rounded-xl border transition-colors relative ${user?.partner
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                            : 'bg-slate-100 dark:bg-[#000000] border-slate-200 dark:border-white/10 text-slate-500 hover:text-primary'
                                            }`}
                                        title="Shared Account"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">{user?.partner ? 'favorite' : 'link'}</span>
                                    </button>
                                    {viewMode !== 'partner' && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-4 py-2 bg-[#121212] text-white dark:bg-white dark:text-slate-900 rounded-xl font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-black/10 dark:shadow-white/5"
                                        >
                                            <span className="material-symbols-outlined text-base">edit</span>
                                            Edit
                                        </button>
                                    )}
                                </div>
                            )}
                            

                        </div>

                    </div>

                    {/* Bio and Settings Area */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10">
                        {isEditing ? (
                            <div className="space-y-6">
                                {/* Bio Edit */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">description</span> About You
                                    </label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Add a short bio to let others know what you are focusing on..."
                                        rows={3}
                                        className="w-full bg-white dark:bg-[#121212]/50 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all resize-none"
                                    />
                                </div>

                                {/* Avatar Customization Button */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">face</span> Character Customization</label>
                                    <button
                                        onClick={() => setIsAvatarEditorOpen(true)}
                                        className="w-full bg-white dark:bg-[#121212]/50 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-slate-300 rounded-xl px-4 py-3 hover:bg-slate-100 dark:hover:bg-[#000000] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-lg">palette</span>
                                        Customize Character
                                    </button>
                                </div>



                                {/* Partner Linking UI — removed from here, accessible via icon button */}
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#b5bac1] mb-3 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px] text-primary">adjust</span>
                                    Currently Focusing On
                                </h3>

                                <div className="space-y-2">
                                    {currentTasks?.length > 0 ? currentTasks.map((task) => (
                                        <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#121212]/40 border border-slate-100 dark:border-white/10">
                                            <div className={`size-2.5 rounded-full shrink-0 ${task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate flex-1">{task.title}</p>
                                            {task.priority && task.priority !== 'none' && (
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${task.priority === 'high' ? 'bg-rose-500/10 text-rose-500' : task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 dark:bg-[#000000] text-slate-500'}`}>
                                                    {task.priority}
                                                </span>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="p-3 text-sm text-slate-500 dark:text-[#80848e] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">coffee</span>
                                            Currently chilling. Nothing on the board today.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Mood Tracker */}
                <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl shadow-none border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 w-full text-center">How are you feeling?</h3>
                    <div className="flex items-center gap-2">
                        {Object.entries(moodEmojis).map(([key, data]) => (
                            <button
                                key={key}
                                onClick={() => updateMood(key)}
                                className={`text-3xl hover:scale-110 transition-transform p-2 rounded-2xl ${mood === key ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}
                                title={data.label}
                            >
                                {data.emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Core Streaks */}
                <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl shadow-none border border-slate-200 dark:border-white/10 lg:col-span-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Core System Streaks 🔥</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {coreHabits.length > 0 ? coreHabits.map((habit) => (
                            <div key={habit._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#121212]/50 border border-slate-100 dark:border-white/10 flex items-center gap-3">
                                <div className={`size-10 rounded-xl bg-${habit.color}-500/20 text-${habit.color}-500 flex items-center justify-center shrink-0`}>
                                    <span className="material-symbols-outlined">{habit.icon}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold truncate">{habit.name}</p>
                                    <p className="text-xs font-black text-orange-500">{habit.streak} days</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-500 col-span-4 text-center py-4">Core system habits missing!</p>
                        )}
                    </div>
                </div>

                {/* Achievements */}
                <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl shadow-none border border-slate-200 dark:border-white/10 lg:col-span-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Achievements 🏆</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            {
                                id: 'first_habit',
                                icon: 'check_circle',
                                label: 'First Habit',
                                desc: 'Tracked your first habit',
                                color: 'emerald',
                                unlocked: allHabits.length > 0,
                            },
                            {
                                id: 'streak_7',
                                icon: 'local_fire_department',
                                label: '7-Day Streak',
                                desc: 'Kept a streak for 7+ days',
                                color: 'orange',
                                unlocked: allHabits.some(h => h.streak >= 7),
                            },
                            {
                                id: 'streak_30',
                                icon: 'whatshot',
                                label: '30-Day Grind',
                                desc: 'Achieved a 30-day streak',
                                color: 'rose',
                                unlocked: allHabits.some(h => h.streak >= 30),
                            },
                            {
                                id: 'wishlist',
                                icon: 'star',
                                label: 'Dream Chaser',
                                desc: 'Completed a wishlist item',
                                color: 'amber',
                                unlocked: wishlist.some(i => i.purchased || i.completed),
                            },
                            {
                                id: 'planner',
                                icon: 'event_available',
                                label: 'Day Planner',
                                desc: 'Set up today\'s tasks',
                                color: 'blue',
                                unlocked: currentTasks.length > 0,
                            },
                            {
                                id: 'triple_habit',
                                icon: 'auto_awesome',
                                label: 'Triple Threat',
                                desc: 'Tracking 3+ habits at once',
                                color: 'violet',
                                unlocked: allHabits.length >= 3,
                            },
                            {
                                id: 'profile',
                                icon: 'badge',
                                label: 'Identity Set',
                                desc: 'Set up your profile info',
                                color: 'cyan',
                                unlocked: !!(user?.bio || user?.username),
                            },
                            {
                                id: 'partner',
                                icon: 'favorite',
                                label: 'Better Together',
                                desc: 'Enabled account sharing',
                                color: 'pink',
                                unlocked: !!user?.partner,
                            },
                        ].map((ach) => (
                            <div
                                key={ach.id}
                                className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all ${ach.unlocked
                                    ? `bg-${ach.color}-500/5 border-${ach.color}-500/20`
                                    : 'bg-slate-50 dark:bg-[#121212]/30 border-slate-100 dark:border-white/10 grayscale opacity-40'
                                    }`}
                            >
                                <div className={`size-12 rounded-2xl flex items-center justify-center ${ach.unlocked ? `bg-${ach.color}-500/15 text-${ach.color}-500` : 'bg-slate-200 dark:bg-[#000000] text-slate-400'
                                    }`}>
                                    <span className="material-symbols-outlined text-2xl">{ach.icon}</span>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{ach.label}</p>
                                    <p className="text-[10px] text-slate-400 font-medium leading-snug mt-0.5">{ach.desc}</p>
                                </div>
                                {ach.unlocked && (
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-${ach.color}-500/10 text-${ach.color}-500`}>
                                        Unlocked
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Wishlist */}
                <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl shadow-none border border-slate-200 dark:border-white/10">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Wishlist ✨</h3>

                    <form onSubmit={handleAddWishlist} className="mb-4">
                        <input
                            type="text"
                            placeholder="Add something..."
                            value={wishlistInput}
                            onChange={(e) => setWishlistInput(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-white/10 text-sm font-medium rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors"
                        />
                    </form>

                    <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                        {wishlist.length > 0 ? wishlist.map(item => {
                            const isCompleted = item.purchased || item.completed;
                            const itemId = item._id || item.id;
                            return (
                            <div key={itemId} onClick={() => toggleWishlist(itemId)} className={`relative flex flex-col rounded-2xl border p-3 cursor-pointer group transition-all ${isCompleted ? 'bg-slate-50 dark:bg-[#121212] border-slate-200 dark:border-white/10 opacity-60' : 'bg-white dark:bg-[#1e1f22] border-slate-100 dark:border-white/10/80 hover:border-primary/50 shadow-none'} overflow-hidden`}>
                                
                                {/* Optional Image or Placeholder */}
                                {item.imageUrl ? (
                                    <div className="w-full h-24 mb-3 rounded-xl bg-slate-100 dark:bg-[#000000] overflow-hidden shrink-0">
                                        <img src={item.imageUrl} alt={item.title} className={`w-full h-full object-cover transition-transform duration-500 ${isCompleted ? 'grayscale' : 'group-hover:scale-110'}`} />
                                    </div>
                                ) : (
                                    <div className={`w-full h-24 mb-3 rounded-xl flex items-center justify-center shrink-0 bg-slate-50 dark:bg-[#000000]/50 border border-slate-100 dark:border-white/10/30 ${isCompleted ? 'grayscale' : ''}`}>
                                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">image</span>
                                    </div>
                                )}
                                
                                <h4 className={`text-sm tracking-tight font-bold truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>{item.title || item.text}</h4>
                                <div className="flex justify-end items-center mt-2 pt-2 border-t border-slate-50 dark:border-white/10/50">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleWishlist(itemId); }}
                                        className={`size-6 rounded-full border flex flex-col items-center justify-center shrink-0 transition-colors ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent group-hover:border-emerald-500 group-hover:text-emerald-500'}`}
                                    >
                                        <span className="material-symbols-outlined text-[14px]">check</span>
                                    </button>
                                </div>
                            </div>
                        )}) : (
                            <div className="col-span-2 flex flex-col items-center justify-center py-6 text-center">
                                <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 mb-2">shopping_bag</span>
                                <p className="text-xs font-medium text-slate-500">Nothing on your wishlist yet.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </motion.div>

        {/* Connections Modal */}
        <ConnectionsModal
            isOpen={isConnectionsModalOpen}
            onClose={() => setIsConnectionsModalOpen(false)}
            onProfileClick={(username) => { setProfileModalUser(username); setIsConnectionsModalOpen(false); }}
        />

        {/* Shared Account Modal */}
        <PartnerModal
            isOpen={isPartnerModalOpen}
            onClose={() => setIsPartnerModalOpen(false)}
            onProfileClick={(username) => { setProfileModalUser(username); setIsPartnerModalOpen(false); }}
        />

        {/* Avatar Editor Modal */}
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
        {/* Profile Overlay Modal */}
        <AnimatePresence>
            {profileModalUser && (
                <ProfileModal
                    username={profileModalUser}
                    onClose={() => setProfileModalUser(null)}
                />
            )}
        </AnimatePresence>
    </>
    );
}

export default Profile;
