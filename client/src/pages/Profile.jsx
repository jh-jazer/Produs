import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import Avatar from '../components/ui/Avatar';
import AvatarEditor from '../components/ui/AvatarEditor';
import ProfileModal from '../components/ui/ProfileModal';

function Profile() {
    const navigate = useNavigate();
    const { user, updateSettings, setCredentials, viewMode, setViewMode } = useAuthStore();
    const [coreHabits, setCoreHabits] = useState([]);
    const [allHabits, setAllHabits] = useState([]);
    const [currentTasks, setCurrentTasks] = useState([]);
    const [wishlistInput, setWishlistInput] = useState("");
    const [wishlist, setWishlist] = useState([]);
    const [mood, setMood] = useState(user?.settings?.mood || "neutral");

    // Profile settings state
    const [username, setUsername] = useState(user?.username || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [avatar, setAvatar] = useState(user?.avatar || "");
    const [banner, setBanner] = useState(user?.banner || "");
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);
    const [connectionsData, setConnectionsData] = useState({ connections: [], incoming: [], outgoing: [] });
    const [isFetchingConnections, setIsFetchingConnections] = useState(false);
    const [activeConnectionsTab, setActiveConnectionsTab] = useState('connections');
    const [isEditing, setIsEditing] = useState(false);
    const [profileModalUser, setProfileModalUser] = useState(null);

    const syncUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setCredentials(res.data);
        } catch (err) {
            console.error("Failed to sync user state", err);
        }
    };

    useEffect(() => {
        const fetchConnections = async () => {
            if (!isConnectionsModalOpen) return;
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
        fetchConnections();
    }, [isConnectionsModalOpen]);

    const handleConnectionAction = async (action, userId) => {
        try {
            await api.post(`/auth/connection/${action}/${userId}`);
            // Refresh data
            const res = await api.get('/auth/connections');
            setConnectionsData(res.data);
            // Also sync the global user store to update badges
            syncUser();
        } catch (err) {
            console.error(`Failed to ${action} connection`, err);
        }
    };

    const [partnerEmail, setPartnerEmail] = useState("");
    const [isLinking, setIsLinking] = useState(false);
    const [linkMessage, setLinkMessage] = useState("");
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
    const [showId, setShowId] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setIsLoading(true);
                // Fetch habits to identify core system habits and total counts
                const habitsRes = await api.get('/habits');
                setAllHabits(habitsRes.data);
                
                const systemIds = ['journal', 'finance', 'planner'];
                const systemHabits = systemIds.map(id => habitsRes.data.find(h => h.systemId === id)).filter(Boolean);
                setCoreHabits(systemHabits);

                // Fetch tasks for today's focus
                const today = new Date().toISOString().split('T')[0];
                const plannerRes = await api.get(`/planner/tasks?date=${today}`);
                // Simple sort by priority for focus
                const sortedTasks = plannerRes.data.sort((a, b) => {
                    const priorityScore = { high: 3, medium: 2, low: 1, none: 0 };
                    return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
                }).slice(0, 3);
                setCurrentTasks(sortedTasks);

                // Fetch unified wishlist from finance
                const wishlistRes = await api.get('/finance/wishlist');
                setWishlist(wishlistRes.data || []);

            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, []);

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
            setWishlist([...wishlist, newObj]);
            setWishlistInput("");
        } catch (error) {
            console.error("Failed to save wishlist", error);
        }
    };

    const toggleWishlist = async (id) => {
        const item = wishlist.find(i => (i._id === id || i.id === id));
        if (!item) return;
        const isCompleted = item.purchased || item.completed;
        const newWishlist = wishlist.map(i =>
            (i._id === id || i.id === id) ? { ...i, purchased: !isCompleted, completed: !isCompleted } : i
        );
        setWishlist(newWishlist);

        try {
            if (item._id) {
                await api.patch(`/finance/wishlist/${item._id}`, { purchased: !isCompleted });
            } else {
                await updateSettings({ wishlist: newWishlist });
            }
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
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8 mt-[-40px] px-8 relative z-10">
                        {/* Avatar Column */}
                        <div className="relative group">
                            <div className="size-32 rounded-full border-[6px] border-white dark:border-[#1e293b] bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-xl ring-2 ring-primary/5">
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
                                                className={`w-full bg-slate-100 dark:bg-slate-800/50 border ${isUsernameAvailable === true ? 'border-emerald-500/50' : isUsernameAvailable === false ? 'border-rose-500/50' : 'border-slate-200 dark:border-slate-700'} text-slate-900 dark:text-white font-bold rounded-lg px-2 py-1 text-sm outline-none focus:border-primary transition-colors`}
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
                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
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
                                        className="size-10 flex items-center justify-center rounded-xl border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary hover:border-primary/30 transition-colors relative"
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
                                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary'
                                            }`}
                                        title="Shared Account"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">{user?.partner ? 'favorite' : 'link'}</span>
                                    </button>
                                    {viewMode !== 'partner' && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-black/10 dark:shadow-white/5"
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
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
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
                                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all resize-none"
                                    />
                                </div>

                                {/* Avatar Customization Button */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">face</span> Character Customization</label>
                                    <button
                                        onClick={() => setIsAvatarEditorOpen(true)}
                                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 rounded-xl px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
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
                                        <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
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

                {/* Core Streaks */}
                <div className="bg-white dark:bg-[#192233] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Core System Streaks 🔥</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {coreHabits.length > 0 ? coreHabits.map((habit) => (
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
                            <p className="text-sm text-slate-500 col-span-3 text-center py-4">Core system habits missing!</p>
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

                    <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                        {wishlist.length > 0 ? wishlist.map(item => {
                            const isCompleted = item.purchased || item.completed;
                            const itemId = item._id || item.id;
                            return (
                            <div key={itemId} onClick={() => toggleWishlist(itemId)} className={`relative flex flex-col rounded-2xl border p-3 cursor-pointer group transition-all ${isCompleted ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-[#1e1f22] border-slate-100 dark:border-slate-800/80 hover:border-primary/50 shadow-sm'} overflow-hidden`}>
                                
                                {/* Optional Image or Placeholder */}
                                {item.imageUrl ? (
                                    <div className="w-full h-24 mb-3 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                        <img src={item.imageUrl} alt={item.title} className={`w-full h-full object-cover transition-transform duration-500 ${isCompleted ? 'grayscale' : 'group-hover:scale-110'}`} />
                                    </div>
                                ) : (
                                    <div className={`w-full h-24 mb-3 rounded-xl flex items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/30 ${isCompleted ? 'grayscale' : ''}`}>
                                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">image</span>
                                    </div>
                                )}
                                
                                <h4 className={`text-sm tracking-tight font-bold truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>{item.title || item.text}</h4>
                                <div className="flex justify-end items-center mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/50">
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
        <AnimatePresence>
            {isConnectionsModalOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsConnectionsModalOpen(false)}
                        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-[#192233] rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/20">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">group</span>
                                    Connections
                                </h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Manage your network</p>
                            </div>
                            <button
                                onClick={() => setIsConnectionsModalOpen(false)}
                                className="size-10 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900/50 m-4 rounded-2xl shrink-0">
                            {[
                                { id: 'connections', label: 'Network', icon: 'hub', count: connectionsData.connections.length },
                                { id: 'incoming', label: 'Requests', icon: 'inbox', count: connectionsData.incoming.length },
                                { id: 'outgoing', label: 'Pending', icon: 'outgoing_mail', count: connectionsData.outgoing.length }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveConnectionsTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[14px] text-xs font-black uppercase tracking-tighter transition-all relative ${
                                        activeConnectionsTab === tab.id
                                            ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span className={`size-4 flex items-center justify-center rounded-full text-[9px] font-black ${
                                            activeConnectionsTab === tab.id ? 'bg-primary text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
                            {isFetchingConnections ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4">
                                    <div className="size-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading network...</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {activeConnectionsTab === 'connections' && (
                                        connectionsData.connections.length > 0 ? connectionsData.connections.map(u => (
                                             <div key={u._id} className={`p-3 border rounded-2xl flex items-center justify-between group ${user?.partner?._id === u._id ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-500/5 dark:border-rose-500/20 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="size-11 rounded-full bg-white dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center">
                                                        <Avatar config={u.avatar} scale={0.8} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{u.name}</p>
                                                            {user?.partner?._id === u._id && (
                                                                <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest leading-none shadow-sm">Shared</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">@{u.username}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => { setProfileModalUser(u.username); setIsConnectionsModalOpen(false); }} className="size-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary transition-all active:scale-95" title="View Profile">
                                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                                    </button>
                                                    {user?.partner?._id !== u._id && (
                                                        <button
                                                            onClick={() => {
                                                                if(window.confirm(`Disconnect from ${u.name}?`)) {
                                                                    handleConnectionAction('disconnect', u._id);
                                                                }
                                                            }}
                                                            className="size-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 transition-all active:scale-95"
                                                            title="Disconnect"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">link_off</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="py-12 text-center opacity-40">
                                                <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                                                <p className="text-xs font-black uppercase tracking-widest">Network empty</p>
                                            </div>
                                        )
                                    )}

                                    {activeConnectionsTab === 'incoming' && (
                                        connectionsData.incoming.length > 0 ? connectionsData.incoming.map(u => (
                                            <div key={u._id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between animate-in slide-in-from-right duration-300">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-11 rounded-full bg-white dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center">
                                                        <Avatar config={u.avatar} scale={0.8} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{u.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">@{u.username}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleConnectionAction('reject', u._id)} className="size-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 transition-all active:scale-95" title="Reject">
                                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                                    </button>
                                                    <button onClick={() => handleConnectionAction('accept', u._id)} className="size-9 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-110 active:scale-90 transition-all" title="Accept">
                                                        <span className="material-symbols-outlined text-[18px]">check</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="py-12 text-center opacity-40">
                                                <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                                                <p className="text-xs font-black uppercase tracking-widest">No pending requests</p>
                                            </div>
                                        )
                                    )}

                                    {activeConnectionsTab === 'outgoing' && (
                                        connectionsData.outgoing.length > 0 ? connectionsData.outgoing.map(u => (
                                            <div key={u._id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-11 rounded-full bg-white dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center">
                                                        <Avatar config={u.avatar} scale={0.8} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{u.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">@{u.username}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleConnectionAction('cancel', u._id)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors" title="Cancel Request">
                                                    Cancel
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="py-12 text-center opacity-40">
                                                <span className="material-symbols-outlined text-4xl mb-2">send</span>
                                                <p className="text-xs font-black uppercase tracking-widest">No sent requests</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Shared Account Modal */}
        <AnimatePresence>
            {isPartnerModalOpen && (
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
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
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
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Shared Account</h2>
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
                                    <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{user.partner.name}</p>
                                            <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">check_circle</span> Shared
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => { setProfileModalUser(user.partner.username); setIsPartnerModalOpen(false); }}
                                            className="size-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary hover:border-primary/30 transition-all active:scale-95"
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
                                            <p className="text-sm font-black text-slate-900 dark:text-white text-wrap pr-1">Share request sent to {user.outgoingPartnerRequest.name}</p>
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
                                        {isLinking ? 'Sending...' : 'Send Share Request'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

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
