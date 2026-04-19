import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

import feedData from '../data/feed_mock_dataset_500_posts.json';
import Avatar from './ui/Avatar';
import ChannelModal from './ui/ChannelModal';
import DailyQuiz from './rpg_components/DailyQuiz';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2 } from 'lucide-react';

const CHANNEL_ICONS = {
    bible_verses: 'auto_stories',
    stoicism: 'self_improvement',
    philosophers: 'history_edu',
    psychology: 'psychology',
    science_trivia: 'biotech',
    geography: 'public',
    history_facts: 'account_balance',
    astronomy: 'dark_mode',
    biology: 'pest_control',
    physics: 'bolt',
    ai_facts: 'memory',
    economics: 'payments',
    mental_models: 'hub',
    study_techniques: 'edit_note',
    productivity: 'rocket_launch',
    creativity: 'palette',
    leadership: 'group',
    startup_lessons: 'business_center',
    famous_quotes: 'format_quote',
    language_facts: 'language',
    math_curiosities: 'calculate',
    ancient_civilizations: 'fort',
    brain_science: 'neurology',
    human_behavior: 'face',
    cultural_facts: 'diversity_3',
    sedimentary_rocks: 'terrain'
};

const activityTypeConfig = {
    habit_check: {
        icon: 'check_circle',
        color: 'emerald',
        verb: 'completed a habit',
    },
    streak_milestone: {
        icon: 'local_fire_department',
        color: 'orange',
        verb: 'hit a streak milestone',
    },
};

function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

/* ─── Item Components ─── */

const AssessmentPanel = ({ isLevel0, isDailyQuizCompleted, setIsAwakeningModalOpen, user }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleInitiateAwakening = async (e) => {
        e.stopPropagation();
        // Immediate SPA Navigation - No waiting for backend
        navigate('/dashboard/neural-sync');
    };

    return (
        <AnimatePresence mode="wait">
            {isLevel0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleInitiateAwakening}
                    className="group bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 flex items-center justify-between border-l-4 border-l-rose-500 shadow-xl shadow-rose-500/5 mb-4 cursor-pointer hover:border-rose-500 transition-all"
                >
                    <div className="flex items-center gap-6">
                        <div className="size-14 rounded-[1.5rem] bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                            <Zap size={28} className="animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight font-exo italic">Identity Required</span>
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-widest font-mono">UPLINK_PENDING</span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest leading-relaxed">System offline. Establish neural sync to unlock full protocol functionality.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                            <div className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] font-mono group-hover:translate-x-[-10px] transition-transform">INITIATE_LINK</div>
                        </div>
                        <div className="size-10 rounded-full border border-rose-500/20 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                            <span className="mb-0.5 ml-0.5">→</span>
                        </div>
                    </div>
                </motion.div>
            ) : !isDailyQuizCompleted ? (
                <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-2 overflow-hidden border-l-4 border-l-emerald-500 shadow-xl shadow-emerald-500/5 mb-4">
                    <DailyQuiz />
                </div>
            ) : (
                <motion.div
                    key="awakened-status"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 flex items-center justify-between border-l-4 border-l-emerald-500/30 mb-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <CheckCircle2 size={20} />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Neural Link Stable</span>
                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest font-mono">SYNC_OK</span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest truncate max-w-[200px] sm:max-w-none">Identity mapping synchronized. Matrix aligned with {user?.rpg?.archetype?.name || 'V0.1'}</p>
                        </div>
                    </div>
                    <div className="hidden sm:block text-right shrink-0">
                        <span className="text-[9px] font-black text-emerald-500/40 uppercase tracking-[0.3em] font-mono italic">ACTIVE_PROGRESSION</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/* ─── Item Components ─── */

const ActivityCard = ({ entry }) => {
    const cfg = activityTypeConfig[entry.type] || activityTypeConfig.habit_check;
    const colorMap = {
        emerald: 'text-emerald-500 bg-emerald-500/10',
        orange: 'text-orange-500 bg-orange-500/10',
    };

    return (
        <div className="bg-white dark:bg-[#121212] rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-6 flex gap-4 hover:shadow-none transition-shadow">
            <div className="size-12 rounded-full bg-slate-100 dark:bg-[#000000] flex items-center justify-center shrink-0 overflow-hidden border-2 border-slate-50 dark:border-white/10 shadow-none">
                <Avatar config={entry.user.avatar} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-black text-slate-900 dark:text-white truncate">{entry.user.name}</span>
                        {entry.user.username && (
                            <span className="text-xs text-slate-400 font-medium truncate">@{entry.user.username}</span>
                        )}
                        {entry.isPartner && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-pink-500/10 text-pink-500 shrink-0">Partner</span>
                        )}
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 uppercase font-bold tracking-widest">{timeAgo(entry.timestamp)}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-base ${colorMap[cfg.color]?.split(' ')[0]}`}>{cfg.icon}</span>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                        {cfg.verb}{' '}
                        <span className="font-black text-slate-900 dark:text-white">{entry.data.habitName}</span>
                        {entry.type === 'streak_milestone' && (
                            <span className="text-orange-500 font-black"> · {entry.data.streak} days 🔥</span>
                        )}
                    </p>
                </div>

                <div className="mt-3">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${colorMap[cfg.color] || 'text-slate-500 bg-slate-100 dark:bg-[#000000]'}`}>
                        <span className="material-symbols-outlined text-[14px]">{entry.data.habitIcon}</span>
                        {entry.data.habitName}
                    </span>
                </div>
            </div>
        </div>
    );
};

const DoseCard = ({ item, activeJournalId, setActiveJournalId, journalText, setJournalText, handleJournalSave, savedStatus, isSaving }) => {
    return (
        <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-none border-l-4 border-l-primary relative overflow-hidden group transition-all">
            <div className="relative z-10 flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-primary uppercase tracking-widest">{item.topic}</span>
                        <span className="size-1 bg-slate-200 dark:bg-[#121212] rounded-full" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Dose</span>
                    </div>
                </div>
                
                {/* Content */}
                <div className="flex flex-col items-center py-4">
                    <p className="text-slate-800 dark:text-slate-100 text-lg md:text-xl font-medium leading-relaxed italic text-center max-w-lg mx-auto">
                        "{item.content}"
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => {
                                if (activeJournalId === item.id) {
                                    setActiveJournalId(null);
                                } else {
                                    setActiveJournalId(item.id);
                                    setJournalText('');
                                }
                            }}
                            className={`flex items-center justify-center size-9 rounded-full transition-all ${
                                activeJournalId === item.id 
                                ? 'text-primary' 
                                : savedStatus[item.id]
                                    ? 'text-emerald-500'
                                    : 'text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-[#000000]/50'
                            }`}
                        >
                            <span className="material-symbols-outlined text-xl">
                                {savedStatus[item.id] ? 'check' : 'edit_note'}
                            </span>
                        </button>
                        
                        <button 
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: `Daily Dose: ${item.topic}`,
                                        text: `"${item.content}" - via Produs`,
                                        url: window.location.origin
                                    });
                                } else {
                                    navigator.clipboard.writeText(`"${item.content}" - via Produs`);
                                }
                            }}
                            className="flex items-center justify-center size-9 rounded-full text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-[#000000]/50 transition-all"
                        >
                            <span className="material-symbols-outlined text-xl">share</span>
                        </button>
                    </div>

                    {activeJournalId === item.id && (
                        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <textarea 
                                value={journalText}
                                onChange={(e) => setJournalText(e.target.value)}
                                placeholder="What does this mean to you?"
                                className="w-full bg-slate-50 dark:bg-[#000000]/50 border-none rounded-2xl p-4 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:ring-1 focus:ring-primary/20 outline-none resize-none h-24 font-medium"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setActiveJournalId(null)} className="px-4 py-1.5 text-[10px] font-black uppercase text-slate-400 transition-colors">Cancel</button>
                                <button onClick={() => handleJournalSave(item)} disabled={!journalText.trim() || isSaving} className="px-6 py-1.5 bg-primary text-white text-[10px] font-black uppercase rounded-full shadow-lg shadow-primary/20 transition-all disabled:opacity-50">
                                    {isSaving ? 'Saving...' : 'Save Reflection'}
                                </button>
                            </div>
                        </div>
                    )}

                    {savedStatus[item.id] && !activeJournalId && (
                        <div className="mt-[-1rem] text-[10px] font-black text-emerald-500 uppercase flex items-center justify-end gap-1 animate-in fade-in zoom-in duration-300">
                            <span className="material-symbols-outlined text-xs">done_all</span>
                            Reflected in Daily Journal
                        </div>
                    )}
                </div>
            </div>
            
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-slate-100 dark:text-slate-800/50 opacity-50 rotate-12 select-none group-hover:scale-110 transition-transform duration-500">
                {item.icon}
            </span>
        </div>
    );
};

/* ─── Main Component ─── */

export default function MainFeed({ isLevel0, isDailyQuizCompleted, setIsAwakeningModalOpen }) {
    const user = useAuthStore(state => state.user);
    const subscriptions = useMemo(() => user?.settings?.subscriptions || [], [user?.settings?.subscriptions]);
    
    // Optimize SWR to prevent excessive reloading on window focus/reconnect
    const { data: rawActivities = [], isLoading: isActivityLoading } = useSWR('/feed', {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        dedupingInterval: 60000 // 1 minute
    });

    const [channelModalOpen, setChannelModalOpen] = useState(false);
    const [activeJournalId, setActiveJournalId] = useState(null);
    const [journalText, setJournalText] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [savedStatus, setSavedStatus] = useState({});

    /* ── Logic: Daily Dose ── */
    const dailyDoses = useMemo(() => {
        if (!subscriptions.length) return [];
        const today = new Date();
        const seed = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate();
        
        return subscriptions.map(channelId => {
            const channelPosts = feedData.posts.filter(p => p.channel_id === channelId);
            if (!channelPosts || !channelPosts.length) return null;
            const channelInfo = feedData.channels.find(c => c.channel_id === channelId);
            const index = seed % channelPosts.length;
            const post = channelPosts[index];
            return {
                type: 'daily_dose',
                topic: channelInfo?.name || channelId,
                icon: CHANNEL_ICONS[channelId] || 'auto_awesome',
                content: post.content,
                id: channelId,
                timestamp: today.toISOString(), // For sorting or interleaved logic
            };
        }).filter(Boolean);
    }, [subscriptions]);

    /* ── Combine & Interleave ── */
    const interleavedFeed = useMemo(() => {
        const result = [];
        const activities = [...rawActivities];
        const doses = [...dailyDoses];

        if (doses.length > 0) result.push(doses.shift());

        let i = 0;
        while (activities.length > 0) {
            result.push(activities.shift());
            i++;
            if (i % 3 === 0 && doses.length > 0) {
                result.push(doses.shift());
            }
        }

        // Add remaining doses if any
        result.push(...doses);
        return result;
    }, [rawActivities, dailyDoses]);

    const handleJournalSave = async (item) => {
        if (!journalText.trim() || isSaving) return;
        setIsSaving(true);
        try {
            await api.post('/journal', {
                title: `Reflection: ${item.topic}`,
                content: `${journalText}\n\n---\nReflecting on: "${item.content}"`,
                mood: '😊',
                tags: ['Daily Dose', item.topic]
            });
            setSavedStatus(prev => ({ ...prev, [item.id]: true }));
            setJournalText('');
            setActiveJournalId(null);
            setTimeout(() => setSavedStatus(prev => ({ ...prev, [item.id]: false })), 4000);
        } catch (error) {
            console.error('Failed to save journal:', error);
        } finally {
            setIsSaving(false);
        }
    };


    if (isActivityLoading && rawActivities.length === 0) {

        return (
            <div className="flex flex-col gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-[#121212] rounded-[2.5rem] p-8 h-40 animate-pulse border border-slate-100 dark:border-white/10" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            <ChannelModal isOpen={channelModalOpen} onClose={() => setChannelModalOpen(false)} />

            {/* Combined Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">dynamic_feed</span>
                    <span className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">News Feed</span>
                </div>
                <button
                    onClick={() => setChannelModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#000000] text-slate-500 hover:text-primary text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                    <span className="material-symbols-outlined text-base">tune</span>
                    Channels
                </button>
            </div>

            {/* The Feed */}
            <div className="flex flex-col gap-4">
                {/* Integrated Assessment Panels */}
                <AssessmentPanel 
                    isLevel0={isLevel0} 
                    isDailyQuizCompleted={isDailyQuizCompleted} 
                    setIsAwakeningModalOpen={setIsAwakeningModalOpen}
                    user={user}
                />

                {interleavedFeed.length === 0 && !isLevel0 ? (
                    <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-12 text-center flex flex-col items-center gap-4">
                        <div className="size-16 rounded-2xl bg-slate-50 dark:bg-[#000000] flex items-center justify-center text-slate-300">
                            <span className="material-symbols-outlined text-4xl">all_inclusive</span>
                        </div>
                        <div className="max-w-xs">
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Silence is Gold</p>
                            <p className="text-xs text-slate-400 mt-2 font-medium">Follow some channels or link with a partner to populate your feed.</p>
                        </div>
                        <button
                            onClick={() => setChannelModalOpen(true)}
                            className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 mt-2"
                        >
                            Browse Channels
                        </button>
                    </div>
                ) : (
                    interleavedFeed.map((entry, idx) => (
                        <React.Fragment key={entry.id || entry._id || idx}>
                            {entry.type === 'daily_dose' ? (
                                <DoseCard 
                                    item={entry}
                                    activeJournalId={activeJournalId}
                                    setActiveJournalId={setActiveJournalId}
                                    journalText={journalText}
                                    setJournalText={setJournalText}
                                    handleJournalSave={handleJournalSave}
                                    savedStatus={savedStatus}
                                    isSaving={isSaving}
                                />
                            ) : (
                                <ActivityCard entry={entry} />
                            )}
                        </React.Fragment>
                    ))
                )}
            </div>
        </div>
    );
}

