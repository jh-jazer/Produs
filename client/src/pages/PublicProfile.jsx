import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import Avatar from '../components/ui/Avatar';

function PublicProfile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);
    const setCredentials = useAuthStore((state) => state.setCredentials);
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const res = await api.get(`/auth/profile/${encodeURIComponent(username)}`);
                setProfile(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Profile not found or is private.");
            } finally {
                setIsLoading(false);
            }
        };

        if (username) {
            fetchProfile();
        }
    }, [username]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#121212] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#121212] flex flex-col items-center justify-center p-6 text-center">
                <div className="size-20 bg-slate-200 dark:bg-[#000000] rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-slate-400">lock</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">Profile Not Available</h1>
                <p className="text-slate-500 mb-8 max-w-md">{error}</p>
                <button 
                    onClick={() => navigate(-1)} 
                    className="px-6 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const isOwnProfile = currentUser?.username === username || currentUser?._id === profile?._id;
    const isConnected = currentUser?.connections?.includes(profile?._id);
    const isSent = currentUser?.outgoingConnectionRequests?.includes(profile?._id);
    const isIncoming = currentUser?.incomingConnectionRequests?.includes(profile?._id);

    const handleRequestConnection = async () => {
        if (!currentUser || isConnected || isSent || isConnecting) return;
        try {
            setIsConnecting(true);
            await api.post(`/auth/connection/request/${profile._id}`);
            // Update auth store with new requests
            const updatedUser = { 
                ...currentUser, 
                outgoingConnectionRequests: [...(currentUser.outgoingConnectionRequests || []), profile._id] 
            };
            setCredentials(updatedUser);
        } catch (err) {
            console.error("Failed to send request", err);
            alert(err.response?.data?.message || "Failed to send request");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleAcceptConnection = async () => {
        if (!currentUser || !isIncoming || isConnecting) return;
        try {
            setIsConnecting(true);
            await api.post(`/auth/connection/accept/${profile._id}`);
            // Update auth store
            const updatedUser = { 
                ...currentUser, 
                incomingConnectionRequests: (currentUser.incomingConnectionRequests || []).filter(id => id !== profile._id),
                connections: [...(currentUser.connections || []), profile._id]
            };
            setCredentials(updatedUser);
        } catch (err) {
            console.error("Failed to accept request", err);
            alert(err.response?.data?.message || "Failed to accept request");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleCancelRequest = async () => {
        if (!currentUser || !isSent || isConnecting) return;
        try {
            setIsConnecting(true);
            await api.post(`/auth/connection/cancel/${profile._id}`);
            // Update auth store
            const updatedUser = { 
                ...currentUser, 
                outgoingConnectionRequests: (currentUser.outgoingConnectionRequests || []).filter(id => id !== profile._id)
            };
            setCredentials(updatedUser);
        } catch (err) {
            console.error("Failed to cancel request", err);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-[#1e1f22] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Navigation / Header Area */}
            <div className="absolute top-4 left-4 z-20">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-md rounded-full shadow-none font-medium text-sm text-slate-700 dark:text-slate-200 transition-colors border border-white/20 dark:border-white/10"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Back
                </button>
            </div>
            {isOwnProfile ? (
                <div className="absolute top-4 right-4 z-20">
                    <Link to="/dashboard/profile" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full shadow-none font-medium text-sm hover:bg-primary/90 transition-colors">
                        <span className="material-symbols-outlined text-lg">edit</span>
                        Edit Profile
                    </Link>
                </div>
            ) : currentUser ? (
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    {isConnected ? (
                         <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full shadow-none font-medium text-sm">
                            <span className="material-symbols-outlined text-lg">how_to_reg</span>
                            Connected
                        </div>
                    ) : isSent ? (
                        <button 
                            onClick={handleCancelRequest}
                            disabled={isConnecting}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-[#000000] text-slate-600 dark:text-slate-300 rounded-full shadow-none font-medium text-sm hover:bg-rose-500 hover:text-white transition-all group"
                        >
                            <span className="material-symbols-outlined text-lg group-hover:hidden">pending</span>
                            <span className="material-symbols-outlined text-lg hidden group-hover:inline">close</span>
                            <span className="group-hover:hidden">Request Sent</span>
                            <span className="hidden group-hover:inline">Cancel Request</span>
                        </button>
                    ) : isIncoming ? (
                        <button 
                            onClick={handleAcceptConnection}
                            disabled={isConnecting}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full shadow-none font-medium text-sm hover:bg-primary/90 transition-colors animate-pulse hover:animate-none"
                        >
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            Accept Request
                        </button>
                    ) : (
                        <button 
                            onClick={handleRequestConnection}
                            disabled={isConnecting}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full shadow-none font-medium text-sm hover:bg-primary/90 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">person_add</span>
                            {isConnecting ? 'Sending...' : 'Connect'}
                        </button>
                    )}
                </div>
            ) : null}

            {/* Background blur/pattern for ambiance */}
            {profile.banner && (
                <div
                    className="absolute inset-0 opacity-20 dark:opacity-10 blur-3xl scale-110 pointer-events-none"
                    style={{ backgroundImage: `url(${profile.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
            )}

            {/* Profile Card Container (Discord Style) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[600px] bg-white dark:bg-[#2b2d31] rounded-[24px] shadow-2xl overflow-hidden relative z-10 border border-slate-200 dark:border-[#1e1f22]"
            >
                {/* Banner Header */}
                <div className="h-[210px] w-full bg-slate-200 dark:bg-[#1e1f22] relative">
                    {profile.banner ? (
                        <img src={profile.banner} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/30 to-purple-500/30 dark:from-primary/20 dark:to-purple-500/20"></div>
                    )}
                </div>

                {/* Body Content */}
                <div className="p-6 pt-0 relative">

                    {/* Avatar Header Row */}
                    <div className="flex justify-between items-end mb-4">
                        <div className="size-[120px] rounded-full border-[8px] border-white dark:border-[#2b2d31] bg-white dark:bg-[#1e1f22] mt-[-60px] relative z-10 overflow-hidden shadow-none shrink-0 flex items-center justify-center">
                            <Avatar config={profile.avatar} />

                            {/* Online Status Indicator (Optional Discord touch) */}
                            <div className="absolute bottom-1 right-1 size-6 bg-emerald-500 border-4 border-white dark:border-[#2b2d31] rounded-full z-20"></div>
                        </div>

                        {/* Badges / Extras (Right Side) */}
                        <div className="flex gap-2 pb-2">
                            <div className="size-8 rounded-md bg-slate-100 dark:bg-[#1e1f22] flex items-center justify-center text-amber-500 hover:scale-110 transition-transform cursor-help" title="Early Supporter">
                                <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                            </div>
                            <div className="size-8 rounded-md bg-slate-100 dark:bg-[#1e1f22] flex items-center justify-center text-emerald-500 hover:scale-110 transition-transform cursor-help" title="Active Scholar">
                                <span className="material-symbols-outlined text-[18px]">school</span>
                            </div>
                        </div>
                    </div>

                    {/* Name & Title */}
                    <div className="bg-slate-50 dark:bg-[#111214] rounded-2xl p-4 shadow-inner border border-slate-100 dark:border-transparent">
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{profile.name}</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-[#b5bac1] mt-0.5">{profile.username}</p>

                        {/* "Playing" / Activity (Top Habit) */}
                        <div className="mt-4">
                            <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#b5bac1] mb-3 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-orange-500">local_fire_department</span>
                                Current Activity
                            </h3>

                            <div className="space-y-3">
                                {profile.topHabits?.length > 0 ? profile.topHabits.slice(0, 1).map((habit) => (
                                    <div key={habit._id} className="flex flex-col sm:flex-row gap-3 sm:items-center p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-[#2b2d31] transition-colors border border-transparent dark:hover:border-[#1e1f22]">
                                        <div className={`size-14 rounded-xl bg-${habit.color}-500/20 text-${habit.color}-500 flex items-center justify-center shrink-0`}>
                                            <span className="material-symbols-outlined text-3xl">{habit.icon}</span>
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-xs font-bold text-slate-500 dark:text-[#b5bac1] uppercase tracking-wider mb-0.5">Maintaining</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{habit.name}</p>
                                            <p className="text-sm font-medium text-slate-600 dark:text-[#dbdee1] mt-0.5 flex items-center gap-1">
                                                For <span className="font-black text-orange-500">{habit.streak} days</span> straight
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-3 text-sm text-slate-500 dark:text-[#80848e]">
                                        Currently chilling. No active streak.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Shared Partner Data */}
                    {profile.isShared && (
                        <div className="mt-6 space-y-4">
                            {/* Habits Section */}
                             <div className="bg-slate-50 dark:bg-[#111214] rounded-2xl p-4 border border-slate-100 dark:border-transparent">
                                <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#b5bac1] mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500 text-lg">grid_view</span> Shared Habits
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {profile.allHabits?.map(habit => (
                                        <div key={habit._id} className="p-2.5 bg-white dark:bg-[#2b2d31] rounded-xl border border-slate-100 dark:border-white/10/50 flex items-center gap-3">
                                            <div className={`size-9 rounded-lg bg-${habit.color}-500/10 text-${habit.color}-500 flex items-center justify-center shrink-0`}>
                                                <span className="material-symbols-outlined text-xl">{habit.icon}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-slate-900 dark:text-white leading-none truncate">{habit.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Streak: <span className="text-orange-500">{habit.streak}d</span></p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Tasks Section */}
                                <div className="bg-slate-50 dark:bg-[#111214] rounded-2xl p-4 border border-slate-100 dark:border-transparent">
                                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#b5bac1] mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">calendar_today</span> Today's Focus
                                    </h3>
                                    <div className="space-y-2">
                                        {profile.tasks?.length > 0 ? profile.tasks.map(task => (
                                            <div key={task._id} className="flex items-center gap-2.5 p-2 bg-white dark:bg-[#2b2d31] rounded-xl border border-slate-100 dark:border-white/10/50">
                                                <div className={`size-4 rounded-md border-2 shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'} flex items-center justify-center`}>
                                                    {task.completed && <span className="material-symbols-outlined text-white text-[10px]">check</span>}
                                                </div>
                                                <p className={`text-xs font-bold leading-tight truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>{task.title}</p>
                                            </div>
                                        )) : (
                                            <p className="text-[10px] text-slate-500 font-medium italic py-2">No tasks planned for today.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Wishlist Section */}
                                <div className="bg-slate-50 dark:bg-[#111214] rounded-2xl p-4 border border-slate-100 dark:border-transparent">
                                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#b5bac1] mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-rose-500 text-lg">favorite</span> Wishlist
                                    </h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {profile.wishlist?.length > 0 ? profile.wishlist.slice(0, 3).map(item => (
                                            <div key={item._id} className="p-2 bg-white dark:bg-[#2b2d31] rounded-xl border border-slate-100 dark:border-white/10/50 flex flex-col gap-0.5">
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{item.title}</p>
                                                <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tight">{item.budgetPrice > 0 ? `$${item.budgetPrice}` : 'Wish item'}</p>
                                            </div>
                                        )) : (
                                            <p className="text-[10px] text-slate-500 font-medium italic py-2">No items listed yet.</p>
                                        )}
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}

                </div>
            </motion.div>
        </div>
    );
}

export default PublicProfile;
