import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';
import { useSWRConfig } from 'swr';
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
    cultural_facts: 'diversity_3'
};

const COLOR_MAP = {
    slate: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    primary: 'bg-primary/10 text-primary border-primary/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

const OnboardingModal = ({ isOpen, onClose }) => {
    const { user, completeOnboarding } = useAuthStore();
    const { mutate } = useSWRConfig();
    const [step, setStep] = useState(1);
    const [timezone, setTimezone] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [themeMode, setThemeMode] = useState('light');
    const [username, setUsername] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
    const [error, setError] = useState('');
    const [selectedSubscription, setSelectedSubscription] = useState('Free'); // Legacy kept for compatibility
    const [selectedChannels, setSelectedChannels] = useState(['productivity', 'stoicism']);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);

    const handleFinish = async () => {
        setLoading(true);
        setError('');
        try {
            await completeOnboarding({ 
                timezone, 
                currency, 
                themeMode,
                username, 
                subscription: selectedSubscription,
                subscriptions: selectedChannels 
            });
            // Immediately refresh user data
            mutate('/auth/me');
            if (onClose) onClose();
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            setError(error.response?.data?.message || 'Failed to complete onboarding.');
            setStep(1); // Send them back to username step if it fails
        } finally {
            setLoading(false);
        }
    };

    const stepVariants = {
        enter: { opacity: 0, x: 20 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    const checkUsername = async (val) => {
        if (val.length < 3) {
            setIsUsernameAvailable(null);
            return;
        }
        setIsCheckingUsername(true);
        try {
            const { data } = await api.get(`/auth/check-username?username=${val}`);
            setIsUsernameAvailable(data.available);
        } catch (err) {
            console.error('Username check failed:', err);
        } finally {
            setIsCheckingUsername(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#121212]/60 backdrop-blur-xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-xl bg-white dark:bg-[#121212] rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-black/[0.08] dark:border-white/10 overflow-hidden ar-corners"
            >
                <div className="p-8 md:p-12">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="space-y-2 text-center md:text-left">
                                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Identity</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Choose your unique handle in the Produs ecosystem.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => {
                                                const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                                                setUsername(val);
                                                checkUsername(val);
                                            }}
                                            placeholder="username"
                                            className="w-full bg-slate-50 dark:bg-[#000000] border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 py-5 text-lg font-black outline-none focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-300"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            {isCheckingUsername && <div className="size-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
                                            {isUsernameAvailable === true && <span className="material-symbols-outlined text-emerald-500 font-black">check_circle</span>}
                                            {isUsernameAvailable === false && <span className="material-symbols-outlined text-rose-500 font-black">cancel</span>}
                                        </div>
                                    </div>
                                    {isUsernameAvailable === false && (
                                        <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 px-2 italic">This username is already claimed.</p>
                                    )}
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!isUsernameAvailable || loading}
                                    className="w-full py-5 bg-[#121212] dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale"
                                >
                                    Continue
                                </button>
                            </motion.div>
                        ) : step === 2 ? (
                            <motion.div
                                key="step2"
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="space-y-2 text-center md:text-left">
                                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Localization</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Set your regional preferences for a tailored experience.</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Timezone Info */}
                                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#000000] border border-slate-100 dark:border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                <span className="material-symbols-outlined">schedule</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detected Timezone</p>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">{timezone || 'Detecting...'}</p>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-emerald-500 font-black text-xl">check_circle</span>
                                    </div>

                                    {/* Currency */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="size-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-emerald-500 text-base">account_balance_wallet</span>
                                            </div>
                                            <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Primary Currency</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 w-full">
                                            <button
                                                onClick={() => setCurrency('USD')}
                                                className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 relative overflow-hidden ${currency === 'USD' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212]/50 hover:border-slate-300'}`}
                                            >
                                                {currency === 'USD' && <div className="absolute inset-0 bg-primary/5" />}
                                                <span className={`text-3xl font-black relative z-10 ${currency === 'USD' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>$</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">USD</span>
                                                {currency === 'USD' && <span className="absolute top-2.5 right-2.5 material-symbols-outlined text-primary text-base">check_circle</span>}
                                            </button>
                                            <button
                                                onClick={() => setCurrency('PHP')}
                                                className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 relative overflow-hidden ${currency === 'PHP' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212]/50 hover:border-slate-300'}`}
                                            >
                                                {currency === 'PHP' && <div className="absolute inset-0 bg-primary/5" />}
                                                <span className={`text-3xl font-black relative z-10 ${currency === 'PHP' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>₱</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">PHP</span>
                                                {currency === 'PHP' && <span className="absolute top-2.5 right-2.5 material-symbols-outlined text-primary text-base">check_circle</span>}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-6 py-4 bg-slate-100 dark:bg-[#000000] text-slate-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setStep(3)}
                                        className="flex-1 py-4 bg-[#121212] dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.99]"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        ) : step === 3 ? (
                            <motion.div
                                key="step3"
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="space-y-2 text-center md:text-left">
                                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Appearance</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Select your preferred visual mode for the interface.</p>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'light', name: 'Light', icon: 'light_mode' },
                                        { id: 'dark', name: 'Dark', icon: 'dark_mode' },
                                        { id: 'system', name: 'System', icon: 'settings_brightness' }
                                    ].map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => setThemeMode(mode.id)}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden ${themeMode === mode.id ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212]/50 hover:border-slate-300'}`}
                                        >
                                            <span className={`material-symbols-outlined text-2xl relative z-10 ${themeMode === mode.id ? 'text-primary' : 'text-slate-400'}`}>{mode.icon}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest relative z-10 ${themeMode === mode.id ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>{mode.name}</span>
                                            {themeMode === mode.id && <span className="absolute top-2 right-2 material-symbols-outlined text-primary text-xs">check_circle</span>}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="px-6 py-4 bg-slate-100 dark:bg-[#000000] text-slate-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setStep(4)}
                                        className="flex-1 py-4 bg-[#121212] dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.99]"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step4"
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="space-y-2 text-center md:text-left">
                                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Curate</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Select the pillars of wisdom you wish to receive daily.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {feedData.channels.map((channel) => (
                                        <button
                                            key={channel.channel_id}
                                            onClick={() => {
                                                setSelectedChannels(prev =>
                                                    prev.includes(channel.channel_id)
                                                        ? prev.filter(id => id !== channel.channel_id)
                                                        : [...prev, channel.channel_id]
                                                );
                                            }}
                                            className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                                                selectedChannels.includes(channel.channel_id)
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-slate-100 dark:border-white/10 bg-white dark:bg-[#121212]/50 hover:border-slate-200 dark:hover:border-white/10'
                                            }`}
                                        >
                                            <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                                                selectedChannels.includes(channel.channel_id)
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                    : 'bg-slate-100 dark:bg-[#000000] text-slate-400'
                                            }`}>
                                                <span className="material-symbols-outlined text-base">
                                                    {CHANNEL_ICONS[channel.channel_id] || 'auto_awesome'}
                                                </span>
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <p className={`text-[10px] font-black truncate leading-tight ${
                                                    selectedChannels.includes(channel.channel_id) ? 'text-primary' : 'text-slate-600 dark:text-slate-400'
                                                }`}>
                                                    {channel.name}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setStep(3)}
                                        className="px-6 py-4 bg-slate-100 dark:bg-[#000000] text-slate-500 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleFinish}
                                        disabled={loading || selectedChannels.length === 0}
                                        className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Produs <span className="material-symbols-outlined text-sm">rocket_launch</span></>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default OnboardingModal;
