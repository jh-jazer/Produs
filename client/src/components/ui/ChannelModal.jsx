import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSWRConfig } from 'swr';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';
import feedData from '../../data/feed_mock_dataset_500_posts.json';

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
};

const MIN_CHANNELS = 1;

const ChannelModal = ({ isOpen, onClose }) => {
    const { user, setCredentials } = useAuthStore();
    const { mutate } = useSWRConfig();

    const [selected, setSelected] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // Initialise from user settings when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelected(user?.settings?.subscriptions || []);
            setSearch('');
            setSaved(false);
        }
    }, [isOpen, user]);

    const toggle = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
        setSaved(false);
    };

    const handleSave = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const { data } = await api.put('/auth/subscriptions', { subscriptions: selected });
            // Update local auth state so the feed updates immediately
            setCredentials({
                ...user,
                settings: {
                    ...user.settings,
                    subscriptions: data.subscriptions,
                },
            });
            mutate('/auth/me');
            setSaved(true);
            setTimeout(() => {
                onClose();
            }, 800);
        } catch (err) {
            console.error('Failed to update channels:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = feedData.channels.filter(ch =>
        ch.name.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 16 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 16 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#192233] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                Manage Channels
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Followed channels appear in your daily feed.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors ml-4 shrink-0"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="px-6 pt-4 pb-2">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search channels…"
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium outline-none focus:border-primary transition-colors"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <span className="material-symbols-outlined text-slate-400 text-base">cancel</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Badge count */}
                    <div className="px-6 py-2 flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            {selected.length} channel{selected.length !== 1 ? 's' : ''} followed
                        </span>
                        {selected.length > 0 && (
                            <button
                                onClick={() => { setSelected([]); setSaved(false); }}
                                className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Channel Grid */}
                    <div className="flex-1 overflow-y-auto px-6 pb-4 custom-scrollbar">
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                                <p className="text-sm font-bold">No channels found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {filtered.map(channel => {
                                    const active = selected.includes(channel.channel_id);
                                    return (
                                        <button
                                            key={channel.channel_id}
                                            onClick={() => toggle(channel.channel_id)}
                                            className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all text-left group ${
                                                active
                                                    ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700'
                                            }`}
                                        >
                                            <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                                active
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                    : 'bg-white dark:bg-slate-800 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                                            }`}>
                                                <span className="material-symbols-outlined text-base">
                                                    {CHANNEL_ICONS[channel.channel_id] || 'auto_awesome'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-black truncate leading-tight ${
                                                    active ? 'text-primary' : 'text-slate-700 dark:text-slate-300'
                                                }`}>
                                                    {channel.name}
                                                </p>
                                            </div>
                                            {active && (
                                                <span className="material-symbols-outlined text-primary text-sm shrink-0">
                                                    check_circle
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 items-center">
                        <button
                            onClick={onClose}
                            className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading || selected.length < MIN_CHANNELS}
                            className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                        >
                            {loading ? (
                                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : saved ? (
                                <><span className="material-symbols-outlined text-sm">check_circle</span> Saved!</>
                            ) : (
                                <><span className="material-symbols-outlined text-sm">save</span> Save Channels</>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ChannelModal;
