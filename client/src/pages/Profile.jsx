import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import Avatar from '../components/ui/Avatar';
import AvatarEditor from '../components/ui/AvatarEditor';

function Profile() {
    const { user, updateSettings, setCredentials } = useAuthStore();
    const [topHabits, setTopHabits] = useState([]);
    const [currentTasks, setCurrentTasks] = useState([]);
    const [wishlistInput, setWishlistInput] = useState("");
    const [wishlist, setWishlist] = useState(user?.settings?.wishlist || []);
    const [mood, setMood] = useState(user?.settings?.mood || "neutral");

    // Profile settings state
    const [username, setUsername] = useState(user?.username || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [avatar, setAvatar] = useState(user?.avatar || "");
    const [banner, setBanner] = useState(user?.banner || "");
    const [isPublic, setIsPublic] = useState(user?.settings?.isPublic || false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const [partnerEmail, setPartnerEmail] = useState("");
    const [isLinking, setIsLinking] = useState(false);
    const [linkMessage, setLinkMessage] = useState("");
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Fetch habits to calculate top streaks
                const habitsRes = await api.get('/habits');
                const sortedHabits = habitsRes.data.sort((a, b) => b.streak - a.streak).slice(0, 3);
                setTopHabits(sortedHabits);

                // Fetch tasks for today's focus
                const today = new Date().toISOString().split('T')[0];
                const plannerRes = await api.get(`/planner/tasks?date=${today}`);
                // Simple sort by priority for focus
                const sortedTasks = plannerRes.data.sort((a, b) => {
                    const priorityScore = { high: 3, medium: 2, low: 1, none: 0 };
                    return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
                }).slice(0, 3);
                setCurrentTasks(sortedTasks);

            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleAddWishlist = async (e) => {
        e.preventDefault();
        if (!wishlistInput.trim()) return;

        const newItem = { id: Date.now().toString(), text: wishlistInput, completed: false };
        const newWishlist = [...wishlist, newItem];

        setWishlist(newWishlist);
        setWishlistInput("");

        try {
            await updateSettings({ wishlist: newWishlist });
        } catch (error) {
            console.error("Failed to save wishlist", error);
        }
    };

    const toggleWishlist = async (id) => {
        const newWishlist = wishlist.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        );
        setWishlist(newWishlist);

        try {
            await updateSettings({ wishlist: newWishlist });
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
            await updateSettings({ username, bio, avatar, banner, isPublic });
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
            className="w-full max-w-5xl mx-auto pb-12"
        >
            {/* Discord-style Header Card */}
            <div className="bg-white dark:bg-[#192233] rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8 relative">

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
                <div className="px-6 sm:px-8 pb-8 relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 mb-4">
                        {/* Overlapping Avatar */}
                        <div className="size-28 sm:size-32 rounded-full border-[6px] border-white dark:border-[#192233] bg-white dark:bg-[#1e1f22] mt-[-56px] sm:mt-[-64px] relative z-10 overflow-hidden shadow-sm shrink-0 group">
                            <Avatar config={avatar} className="size-full" />
                            {isEditing && (
                                <button
                                    onClick={() => setIsAvatarEditorOpen(true)}
                                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center group-hover:bg-black/40 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-white text-2xl">edit</span>
                                    <span className="text-white text-[10px] font-bold uppercase tracking-widest mt-1">Edit Avatar</span>
                                </button>
                            )}
                        </div>

                        {/* Name/Username Area */}
                        <div className="text-center sm:text-left flex-1 pb-2 w-full pt-4 sm:pt-0">
                            {isEditing ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-black text-slate-400">@</span>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="username"
                                            className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium rounded-lg px-3 py-1.5 outline-none focus:border-primary transition-colors w-full sm:max-w-[200px]"
                                        />
                                    </div>
                                    {saveMessage && <p className={`text-xs font-bold ${saveMessage.includes('Failed') ? 'text-red-500' : 'text-emerald-500'}`}>{saveMessage}</p>}
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                        {user?.name || username || "Your Profile"}
                                    </h1>
                                    <p className="text-primary font-medium">@{username || "username"}</p>
                                </>
                            )}
                        </div>

                        {/* Public Link Share (View Mode only) */}
                        {!isEditing && isPublic && username && (
                            <a href={`/u/${username}`} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-bold transition-colors">
                                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                View Public Link
                            </a>
                        )}

                        {/* Action Buttons (Edit Mode / View Mode) */}
                        <div className="flex items-center justify-center sm:justify-start gap-2 pt-2 sm:pt-0 sm:self-center w-full sm:w-auto">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors w-full sm:w-auto text-center"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 w-full sm:w-auto text-center"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsPartnerModalOpen(true)}
                                        className={`size-9 flex items-center justify-center rounded-lg border transition-colors relative ${user?.partner
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
                                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary hover:border-primary/30'
                                            }`}
                                        title={user?.partner ? `Linked with ${user.partner.name}` : user?.incomingPartnerRequest ? 'Incoming Partner Request!' : 'Link a Partner'}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">{user?.partner ? 'favorite' : 'link'}</span>
                                        {!user?.partner && user?.incomingPartnerRequest && (
                                            <span className="absolute -top-1 -right-1 size-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#192233] animate-pulse" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg shadow-sm font-bold text-sm hover:opacity-90 transition-opacity w-full sm:w-auto"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                        Edit Profile
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bio and Settings Area */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {isEditing ? (
                            <div className="space-y-6">
                                {/* Avatar Customization Button */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">face</span> Avatar Customization</label>
                                    <button
                                        onClick={() => setIsAvatarEditorOpen(true)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 rounded-xl px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-lg">palette</span>
                                        Customize Character
                                    </button>
                                </div>


                                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">public</span> Public Profile</h3>
                                        <p className="text-xs text-slate-500 mt-0.5 max-w-sm">Allow others to view your profile banner, avatar, bio, and top streaks via a shareable link.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsPublic(!isPublic)}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 ${isPublic ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-0'}`}></div>
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
                                        <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#2b2d31] border border-slate-200 dark:border-[#1e1f22]">
                                            <div className={`size-2.5 rounded-full shrink-0 ${task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate flex-1">{task.title}</p>
                                            {task.priority && task.priority !== 'none' && (
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${task.priority === 'high' ? 'bg-rose-500/10 text-rose-500' : task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
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
                <div className="bg-white dark:bg-[#192233] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4">
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

                {/* Top Streaks */}
                <div className="bg-white dark:bg-[#192233] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Top 3 Habit Streaks 🔥</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {topHabits.length > 0 ? topHabits.map((habit) => (
                            <div key={habit._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <div className={`size-10 rounded-xl bg-${habit.color}-500/20 text-${habit.color}-500 flex items-center justify-center shrink-0`}>
                                    <span className="material-symbols-outlined">{habit.icon}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold truncate">{habit.name}</p>
                                    <p className="text-xs font-black text-orange-500">{habit.streak} days</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-500 col-span-3 text-center py-4">Complete habits to start standard streaks!</p>
                        )}
                    </div>
                </div>

                {/* Achievements */}
                <div className="bg-white dark:bg-[#192233] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Achievements 🏆</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            {
                                id: 'first_habit',
                                icon: 'check_circle',
                                label: 'First Habit',
                                desc: 'Tracked your first habit',
                                color: 'emerald',
                                unlocked: topHabits.length > 0,
                            },
                            {
                                id: 'streak_7',
                                icon: 'local_fire_department',
                                label: '7-Day Streak',
                                desc: 'Kept a streak for 7+ days',
                                color: 'orange',
                                unlocked: topHabits.some(h => h.streak >= 7),
                            },
                            {
                                id: 'streak_30',
                                icon: 'whatshot',
                                label: '30-Day Grind',
                                desc: 'Achieved a 30-day streak',
                                color: 'rose',
                                unlocked: topHabits.some(h => h.streak >= 30),
                            },
                            {
                                id: 'wishlist',
                                icon: 'star',
                                label: 'Dream Chaser',
                                desc: 'Completed a wishlist item',
                                color: 'amber',
                                unlocked: wishlist.some(i => i.completed),
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
                                unlocked: topHabits.length >= 3,
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
                                desc: 'Linked with a partner',
                                color: 'pink',
                                unlocked: !!user?.partner,
                            },
                        ].map((ach) => (
                            <div
                                key={ach.id}
                                className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all ${ach.unlocked
                                    ? `bg-${ach.color}-500/5 border-${ach.color}-500/20`
                                    : 'bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 grayscale opacity-40'
                                    }`}
                            >
                                <div className={`size-12 rounded-2xl flex items-center justify-center ${ach.unlocked ? `bg-${ach.color}-500/15 text-${ach.color}-500` : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
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
                <div className="bg-white dark:bg-[#192233] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Wishlist ✨</h3>

                    <form onSubmit={handleAddWishlist} className="mb-4">
                        <input
                            type="text"
                            placeholder="Add something..."
                            value={wishlistInput}
                            onChange={(e) => setWishlistInput(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors"
                        />
                    </form>

                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {wishlist.length > 0 ? wishlist.map(item => (
                            <div key={item.id} className="flex items-center gap-3 group">
                                <button
                                    onClick={() => toggleWishlist(item.id)}
                                    className={`size-5 rounded border flex items-center justify-center shrink-0 transition-colors ${item.completed ? 'bg-primary border-primary text-white' : 'border-slate-300 dark:border-slate-600'}`}
                                >
                                    {item.completed && <span className="material-symbols-outlined text-[14px]">check</span>}
                                </button>
                                <span className={`text-sm font-medium ${item.completed ? 'line-through text-slate-400' : ''}`}>{item.text}</span>
                            </div>
                        )) : (
                            <p className="text-xs text-slate-500 text-center pt-2">Nothing on your wishlist yet.</p>
                        )}
                    </div>
                </div>

            </div>
        </motion.div>

        {/* Partner Link Modal */}
        {
            isPartnerModalOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    onClick={() => { setIsPartnerModalOpen(false); setLinkMessage(''); }}
                >
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 w-full max-w-md bg-white dark:bg-[#192233] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-xl">{user?.partner ? 'favorite' : 'link'}</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Partner Link</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">View each other's Habits &amp; Planner</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setIsPartnerModalOpen(false); setLinkMessage(''); }}
                                className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
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
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-slate-900 dark:text-white">{user.partner.name}</p>
                                        <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">check_circle</span> Linked
                                        </p>
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
                                    {isLinking ? 'Unlinking...' : 'Unlink Partner'}
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
                                            <p className="text-sm font-black text-slate-900 dark:text-white text-wrap pr-1">{user.incomingPartnerRequest.name} wants to link!</p>
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
                                            className="flex-1 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
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
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-lg font-black text-slate-400 uppercase">
                                            {user.outgoingPartnerRequest.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white text-wrap pr-1">Request sent to {user.outgoingPartnerRequest.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Waiting for approval...</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCancelRequest}
                                        disabled={isLinking}
                                        className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl font-black text-xs transition-all disabled:opacity-50"
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
                                    Enter your partner's email address to link accounts. They'll need to accept your request before it becomes active.
                                </p>
                                <form onSubmit={handleLinkPartner} className="space-y-3">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">mail</span>
                                        <input
                                            type="email"
                                            value={partnerEmail}
                                            onChange={(e) => setPartnerEmail(e.target.value)}
                                            placeholder="partner@email.com"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-2xl outline-none focus:border-primary transition-colors"
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
                                        {isLinking ? 'Sending...' : 'Send Link Request'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )
        }

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
    </>
    );
}

export default Profile;
