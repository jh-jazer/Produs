/* eslint-disable */
import React, { useMemo, useState } from 'react';
import feedData from '../../data/feed_mock_dataset_500_posts.json';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';
import ChannelModal from './ChannelModal';

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

const DailyContentFeed = () => {
    const user = useAuthStore(state => state.user);
    const subscriptions = user?.settings?.subscriptions || [];

    const [channelModalOpen, setChannelModalOpen] = useState(false);

    // State for inline journaling
    const [activeJournalId, setActiveJournalId] = useState(null);
    const [journalText, setJournalText] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [savedStatus, setSavedStatus] = useState({}); // track saved status per item

    // Select a consistent item for the day based on the date
    const dailyItems = useMemo(() => {
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
                topic: channelInfo?.name || channelId,
                icon: CHANNEL_ICONS[channelId] || 'auto_awesome',
                content: post.content,
                id: channelId,
                length: post.length
            };
        }).filter(Boolean);
    }, [subscriptions]);

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
            
            // Clear "Saved" status after a few seconds
            setTimeout(() => {
                setSavedStatus(prev => ({ ...prev, [item.id]: false }));
            }, 3000);
        } catch (error) {
            console.error('Failed to save journal from feed:', error);
            alert('Failed to save journal. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
        <ChannelModal isOpen={channelModalOpen} onClose={() => setChannelModalOpen(false)} />
        <div className="flex flex-col gap-4 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Daily Dose</span>
                </div>
                <button
                    onClick={() => setChannelModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#000000] text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                    <span className="material-symbols-outlined text-base">tune</span>
                    Manage Channels
                </button>
            </div>

            {!dailyItems.length ? (
                <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-3xl p-10 flex flex-col items-center gap-4 text-center">
                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-primary">rss_feed</span>
                    </div>
                    <div>
                        <p className="font-black text-slate-900 dark:text-white">No channels followed yet</p>
                        <p className="text-xs text-slate-500 mt-1">Follow channels to see daily curated content in your feed.</p>
                    </div>
                    <button
                        onClick={() => setChannelModalOpen(true)}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-sm shadow-lg shadow-primary/20"
                    >
                        Browse Channels
                    </button>
                </div>
            ) : (
            <div className="grid grid-cols-1 gap-4">
                {dailyItems.map((item) => (
                    <div 
                        key={item.id}
                        className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-none border-l-4 border-l-primary relative overflow-hidden group transition-all"
                    >
                        <div className="relative z-10 flex flex-col gap-8">
                            {/* Row 1: Header (Icon + Channel + Date) */}
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-primary uppercase tracking-widest">{item.topic}</span>
                                    <span className="size-1 bg-slate-200 dark:bg-[#121212] rounded-full" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Today</span>
                                </div>
                            </div>
                            
                            {/* Row 2: Content (Centered Verse) */}
                            <div className="flex flex-col items-center py-4">
                                <p className="text-slate-800 dark:text-slate-100 text-lg md:text-xl font-medium leading-relaxed italic text-center max-w-lg mx-auto">
                                    "{item.content}"
                                </p>
                            </div>

                            {/* Row 3: Actions (Right Aligned Icons) */}
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
                                        title="Daily Journal Reflection"
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
                                                alert('Copied to clipboard!');
                                            }
                                        }}
                                        className="flex items-center justify-center size-9 rounded-full text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-[#000000]/50 transition-all"
                                        title="Share Inspiration"
                                    >
                                        <span className="material-symbols-outlined text-xl">share</span>
                                    </button>
                                </div>

                                {/* Inline Journal Input */}
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
                                            <button 
                                                onClick={() => setActiveJournalId(null)}
                                                className="px-4 py-1.5 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={() => handleJournalSave(item)}
                                                disabled={!journalText.trim() || isSaving}
                                                className="px-6 py-1.5 bg-primary text-white text-[10px] font-black uppercase rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                                            >
                                                {isSaving ? 'Saving...' : 'Save to Daily Journal'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {savedStatus[item.id] && !activeJournalId && (
                                    <div className="mt-[-1rem] text-[10px] font-black text-emerald-500 uppercase flex items-center justify-end gap-1 animate-in fade-in zoom-in duration-300">
                                        <span className="material-symbols-outlined text-xs">done_all</span>
                                        Saved to your Daily Journal
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Subtle background decoration */}
                        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-slate-100 dark:text-slate-800/50 opacity-50 rotate-12 select-none group-hover:scale-110 transition-transform duration-500">
                            {item.icon}
                        </span>
                    </div>
                ))}
            </div>
            )}
        </div>
        </>
    );
};

export default DailyContentFeed;
