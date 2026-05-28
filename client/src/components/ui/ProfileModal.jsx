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
                className="fixed inset-0 bg-black/60 dark:bg-[#050505]/80 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-[500px] bg-slate-50/90 dark:bg-[#080808]/90 backdrop-blur-2xl border border-cyan-500/30 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Banner Section */}
                <div className="h-40 w-full bg-black/[0.04] dark:bg-[#050505] relative shrink-0">
                    {profile?.banner ? (
                        <img src={profile.banner} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-electric-blue/10 to-signal-orange/10"></div>
                    )}
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-all z-20"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>

                    {/* Avatar - Moved here to prevent clipping */}
                    {!isLoading && profile && (
                        <div className="absolute -bottom-12 left-6 size-24 rounded-full border-[6px] border-white dark:border-[#121212] bg-white dark:bg-[#050505] z-10 overflow-hidden shadow-none flex items-center justify-center">
                            <Avatar config={profile.avatar} />
                            <div className="absolute bottom-1 right-1 size-5 bg-emerald-500 border-[3px] border-white dark:border-[#121212] rounded-full"></div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-14 relative">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <div className="size-8 rounded-full border-[3px] border-electric-blue border-t-transparent animate-spin mb-4" />
                            <p className="text-[9px] font-semibold text-black/30 dark:text-white/30 uppercase tracking-[0.4em]">Loading identity...</p>
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
                                    <h2 className="text-xl font-black text-black dark:text-white truncate tracking-[-0.02em] uppercase">
                                        {profile.username ? `@${profile.username.split('#')[0].replace(/\d+/g, '')}` : profile.name}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-[0.2em]">{profile.name}</p>
                                        {profile.rpg?.archetype?.stage && (
                                            <p className="text-[9px] font-black uppercase tracking-widest text-electric-blue italic">
                                                // {profile.rpg.archetype.stage}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Quick Actions */}
                                <div className="shrink-0 flex gap-2">
                                    {profile.isShared ? (
                                        <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-semibold uppercase tracking-[0.3em] rounded-lg border border-emerald-500/10 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-xs">favorite</span>
                                            Partner
                                        </div>
                                    ) : isConnected ? (
                                        <div className="flex gap-2">
                                            <div className="px-3 py-1.5 bg-electric-blue/10 text-electric-blue text-[9px] font-semibold uppercase tracking-[0.3em] rounded-lg border border-electric-blue/10 flex items-center gap-1.5">
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
                                                className="px-3 py-1.5 bg-black/[0.05] dark:bg-white/[0.05] text-black/40 dark:text-white/40 text-[9px] font-semibold uppercase tracking-[0.3em] rounded-lg hover:text-signal-orange transition-colors"
                                            >
                                                Disconnect
                                            </button>
                                        </div>
                                    ) : currentUser?._id !== profile._id && (
                                        <>
                                            {isSent ? (
                                                <button onClick={() => handleConnectionAction('cancel')} disabled={isConnecting} className="px-3 py-1.5 bg-black/[0.05] dark:bg-white/[0.05] text-black/40 dark:text-white/40 text-[9px] font-semibold uppercase tracking-[0.3em] rounded-lg">Pending</button>
                                            ) : isIncoming ? (
                                                <button onClick={() => handleConnectionAction('accept')} disabled={isConnecting} className="px-3 py-1.5 bg-electric-blue text-white text-[9px] font-semibold uppercase tracking-[0.3em] rounded-lg hover:opacity-90 transition-opacity">Accept</button>
                                            ) : (
                                                <button onClick={() => handleConnectionAction('request')} disabled={isConnecting} className="px-3 py-1.5 bg-electric-blue text-white text-[9px] font-semibold uppercase tracking-[0.3em] rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 shadow-lg shadow-electric-blue/20">
                                                    <span className="material-symbols-outlined text-sm">person_add</span>
                                                    Connect
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* RPG Stats Section */}
                            {profile.rpg && (
                                <div className="mt-6 bg-black/[0.03] dark:bg-[#050505] rounded-2xl p-4 border border-black/[0.05] dark:border-white/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-black/30 dark:text-white/30">System Profile</h3>
                                        <span className="text-[9px] font-bold text-electric-blue">LVL {profile.level || 1}</span>
                                    </div>
                                    <div className="grid grid-cols-6 gap-2">
                                        {Object.entries(profile.rpg.stats || {}).map(([stat, val]) => (
                                            <div key={stat} className="flex flex-col items-center">
                                                <span className="text-[9px] font-black uppercase tracking-tighter text-black/20 dark:text-white/20 mb-1">{stat}</span>
                                                <span className="text-[10px] font-bold text-black/60 dark:text-white/80">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Core Streaks Area */}
                            <div className="mt-6 grid grid-cols-4 gap-2.5">
                                <div className="p-2.5 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl border border-amber-500/10 flex flex-col items-center text-center">
                                    <span className="material-symbols-outlined text-lg text-amber-500 mb-1">event_note</span>
                                    <p className="text-sm font-semibold text-black dark:text-white leading-none">{profile.systemStreaks?.planner || 0}</p>
                                    <p className="text-[8px] font-semibold text-black/30 dark:text-white/30 uppercase tracking-[0.2em] mt-1.5 leading-none">Daily Planning</p>
                                </div>
                                <div className="p-2.5 bg-red-500/5 dark:bg-red-500/10 rounded-2xl border border-red-500/10 flex flex-col items-center text-center">
                                    <span className="material-symbols-outlined text-lg text-red-500 mb-1">track_changes</span>
                                    <p className="text-sm font-semibold text-black dark:text-white leading-none">{profile.systemStreaks?.workout || 0}</p>
                                    <p className="text-[8px] font-semibold text-black/30 dark:text-white/30 uppercase tracking-[0.2em] mt-1.5 leading-none">Goal Setting</p>
                                </div>
                                <div className="p-2.5 bg-blue-500/5 dark:bg-blue-500/10 rounded-2xl border border-blue-500/10 flex flex-col items-center text-center">
                                    <span className="material-symbols-outlined text-lg text-blue-500 mb-1">history_edu</span>
                                    <p className="text-sm font-semibold text-black dark:text-white leading-none">{profile.systemStreaks?.journal || 0}</p>
                                    <p className="text-[8px] font-semibold text-black/30 dark:text-white/30 uppercase tracking-[0.2em] mt-1.5 leading-none">Journaling</p>
                                </div>
                                <div className="p-2.5 bg-purple-500/5 dark:bg-purple-500/10 rounded-2xl border border-purple-500/10 flex flex-col items-center text-center">
                                    <span className="material-symbols-outlined text-lg text-purple-500 mb-1">payments</span>
                                    <p className="text-sm font-semibold text-black dark:text-white leading-none">{profile.systemStreaks?.finance || 0}</p>
                                    <p className="text-[8px] font-semibold text-black/30 dark:text-white/30 uppercase tracking-[0.2em] mt-1.5 leading-none">Finance Tracking</p>
                                </div>
                            </div>

                             {/* Bio Snippet */}
                            <div className="mt-4 bg-black/[0.03] dark:bg-[#050505] rounded-2xl p-4 border border-black/[0.05] dark:border-white/10">
                                <h3 className="text-[9px] font-semibold uppercase tracking-[0.3em] text-black/30 dark:text-white/30 mb-2.5">About</h3>
                                <p className="text-xs text-black/70 dark:text-white/70 leading-relaxed font-medium">
                                    {profile.bio || "Just another human on their focused journey."}
                                </p>
                                
                                <div className="mt-4 grid grid-cols-3 gap-3 pb-1 border-t border-black/[0.06] dark:border-white/10 pt-3 opacity-80">
                                    <div className="text-center">
                                        <p className="text-xs font-semibold text-black dark:text-white">{profile.topHabits?.length || 0}</p>
                                        <p className="text-[8px] font-semibold text-black/30 dark:text-white/30 uppercase tracking-[0.2em] mt-0.5">Habits</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-semibold text-black dark:text-white">{profile.achievementCount || 0}</p>
                                        <p className="text-[8px] font-semibold text-black/30 dark:text-white/30 uppercase tracking-[0.2em] mt-0.5">Awards</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-semibold text-black dark:text-white">{new Date(profile.joined).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
                                        <p className="text-[8px] font-semibold text-black/30 dark:text-white/30 uppercase tracking-[0.2em] mt-0.5">Joined</p>
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
                                    <div className="bg-slate-100 dark:bg-[#121212]/50 rounded-2xl p-4 border border-slate-200 dark:border-white/10/50">
                                         <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-xs">grid_view</span> Habits
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {profile.allHabits?.slice(0, 4).map(habit => (
                                                <div key={habit._id} className="p-2 bg-white dark:bg-[#2b2d31] rounded-xl border border-slate-200/50 dark:border-white/10/50 flex items-center gap-2">
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
