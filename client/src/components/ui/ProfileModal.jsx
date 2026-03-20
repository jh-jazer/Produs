import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import Avatar from './Avatar';

function ProfileModal({ username, onClose }) {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const currentUser = useAuthStore((state) => state.user);
    const setCredentials = useAuthStore((state) => state.setCredentials);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // If username is null/undefined don't fetch
                if (!username) return;
                
                setIsLoading(true);
                setError(null);
                const res = await api.get(`/auth/profile/${username}`);
                setProfile(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Profile not found or is private.");
            } finally {
                // Remove the redundant setIsLoading(true) and just end the loading state after a small delay for visual polish
                setTimeout(() => setIsLoading(false), 200);
            }
        };

        fetchProfile();
    }, [username]);

    const isConnected = currentUser?.connections?.some(id => id === profile?._id || id?._id === profile?._id);
    const isSent = currentUser?.outgoingConnectionRequests?.some(id => id === profile?._id || id?._id === profile?._id);
    const isIncoming = currentUser?.incomingConnectionRequests?.some(id => id === profile?._id || id?._id === profile?._id);

    const handleConnectionAction = async (action) => {
        if (!currentUser || isConnecting) return;
        try {
            setIsConnecting(true);
            const endpoint = `/auth/connection/${action}/${profile._id}`;
            await api.post(endpoint);
            
            // Refetch current user to update state
            const userRes = await api.get('/auth/me');
            setCredentials(userRes.data);
        } catch (err) {
            console.error(`Failed ${action}`, err);
        } finally {
            setIsConnecting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-[500px] bg-white dark:bg-[#2b2d31] rounded-[28px] shadow-2xl overflow-hidden border border-slate-200 dark:border-[#1e1f22] flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Banner Section */}
                <div className="h-40 w-full bg-slate-200 dark:bg-[#1e1f22] relative shrink-0">
                    {profile?.banner ? (
                        <img src={profile.banner} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/30 to-purple-500/30"></div>
                    )}
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-all z-20"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>

                    {/* Avatar - Moved here to prevent clipping */}
                    {!isLoading && profile && (
                        <div className="absolute -bottom-12 left-6 size-24 rounded-full border-[6px] border-white dark:border-[#2b2d31] bg-white dark:bg-[#1e1f22] z-10 overflow-hidden shadow-md flex items-center justify-center">
                            <Avatar config={profile.avatar} />
                            <div className="absolute bottom-1 right-1 size-5 bg-emerald-500 border-[3px] border-white dark:border-[#2b2d31] rounded-full"></div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-14 relative">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading identity...</p>
                        </div>
                    ) : error ? (
                         <div className="py-20 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">lock</span>
                            <p className="text-sm font-medium text-slate-500">{error}</p>
                         </div>
                    ) : profile ? (
                        <>
                            {/* Identity Area */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white truncate">{profile.name}</h2>
                                    <p className="text-sm font-bold text-slate-500 dark:text-[#b5bac1]">@{profile.username}</p>
                                </div>
                                
                                {/* Quick Actions */}
                                <div className="shrink-0 flex gap-2">
                                    {profile.isShared ? (
                                        <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/10 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-xs">favorite</span>
                                            Partner
                                        </div>
                                    ) : isConnected ? (
                                        <div className="flex gap-2">
                                            <div className="px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/10 flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-xs">verified</span>
                                                Connected
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if(window.confirm(`Disconnect from ${profile.name}?`)) {
                                                        handleConnectionAction('disconnect');
                                                    }
                                                }}
                                                disabled={isConnecting}
                                                className="px-3 py-1.5 bg-slate-100 dark:bg-[#1e1f22] text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:text-rose-500 transition-colors"
                                            >
                                                Disconnect
                                            </button>
                                        </div>
                                    ) : currentUser?._id !== profile._id && (
                                        <>
                                            {isSent ? (
                                                <button onClick={() => handleConnectionAction('cancel')} disabled={isConnecting} className="px-3 py-1.5 bg-slate-100 dark:bg-[#1e1f22] text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:text-rose-500 transition-colors">Pending...</button>
                                            ) : isIncoming ? (
                                                <button onClick={() => handleConnectionAction('accept')} disabled={isConnecting} className="px-3 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity animate-pulse">Accept</button>
                                            ) : (
                                                <button onClick={() => handleConnectionAction('request')} disabled={isConnecting} className="px-3 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-sm">person_add</span>
                                                    Connect
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Core Streaks Area */}
                            <div className="mt-6 grid grid-cols-3 gap-2.5">
                                <div className="p-2.5 bg-violet-500/5 dark:bg-violet-500/10 rounded-2xl border border-violet-500/10 flex flex-col items-center text-center">
                                    <span className="material-symbols-outlined text-[20px] text-violet-500 mb-1">menu_book</span>
                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{profile.systemStreaks?.journal || 0}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Journal</p>
                                </div>
                                <div className="p-2.5 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/10 flex flex-col items-center text-center">
                                    <span className="material-symbols-outlined text-[20px] text-emerald-500 mb-1">payments</span>
                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{profile.systemStreaks?.finance || 0}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Finance</p>
                                </div>
                                <div className="p-2.5 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl border border-amber-500/10 flex flex-col items-center text-center">
                                    <span className="material-symbols-outlined text-[20px] text-amber-500 mb-1">event_note</span>
                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{profile.systemStreaks?.planner || 0}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Planner</p>
                                </div>
                            </div>

                            {/* Bio Snippet */}
                            <div className="mt-4 bg-slate-50 dark:bg-[#111214] rounded-2xl p-4 border border-slate-100 dark:border-transparent">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">About Them</h3>
                                <p className="text-sm text-slate-700 dark:text-[#dbdee1] leading-relaxed font-medium">
                                    {profile.bio || "Just another human on their focused journey."}
                                </p>
                                
                                <div className="mt-4 grid grid-cols-3 gap-3 pb-1 border-t border-slate-200 dark:border-slate-800 pt-3 opacity-60">
                                    <div className="text-center">
                                        <p className="text-[12px] font-black text-slate-900 dark:text-white">{profile.topHabits?.length || 0}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Habits</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[12px] font-black text-slate-900 dark:text-white">{profile.achievementCount || 0}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Awards</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[12px] font-black text-slate-900 dark:text-white">{new Date(profile.joined).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Joined</p>
                                    </div>
                                </div>
                            </div>

                            {/* Shared Sections (Partner Only) */}
                            {profile.isShared && (
                                <div className="mt-4 space-y-4">
                                    {/* Shared Progress Row */}
                                    <div className="flex gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 items-center">
                                        <div className="size-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                                            <span className="material-symbols-outlined">favorite</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">Shared Relationship</p>
                                            <p className="text-[10px] text-emerald-500 font-bold mt-1">Full access to habits and planner</p>
                                        </div>
                                    </div>

                                    {/* Shared Habits Grid */}
                                    <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/50">
                                         <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-xs">grid_view</span> Habits
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {profile.allHabits?.slice(0, 4).map(habit => (
                                                <div key={habit._id} className="p-2 bg-white dark:bg-[#2b2d31] rounded-xl border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-2">
                                                    <div className={`size-8 rounded-lg bg-${habit.color}-500/10 text-${habit.color}-500 flex items-center justify-center shrink-0`}>
                                                        <span className="material-symbols-outlined text-base">{habit.icon}</span>
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-900 dark:text-white truncate">{habit.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            </motion.div>
        </div>,
        document.body
    );
}

export default ProfileModal;
