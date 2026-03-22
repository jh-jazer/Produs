import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSWRConfig } from 'swr';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';
import useSWR, { mutate } from 'swr';
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

const OnboardingModal = ({ isOpen }) => {
    const { user, completeOnboarding } = useAuthStore();
    const { mutate } = useSWRConfig();
    const [step, setStep] = useState(1);
    const [timezone, setTimezone] = useState('');
    const [currency, setCurrency] = useState('USD');
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
                username, 
                subscription: selectedSubscription,
                subscriptions: selectedChannels 
            });
            // Immediately refresh user data
            mutate('/auth/me');
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-[#121212]/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#121212] rounded-3xl md:rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden max-h-[95vh] flex flex-col"
            >
                <div className="p-4 md:p-12 overflow-y-auto custom-scrollbar flex-1">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="space-y-4 md:space-y-6"
                            >
                                <div className="space-y-2">
                                    <div className="size-12 md:size-16 bg-blue-500/10 rounded-3xl flex items-center justify-center ring-8 ring-blue-500/5 shadow-inner">
                                        <span className="material-symbols-outlined text-2xl md:text-3xl text-blue-500 font-bold">person_add</span>
                                    </div>
                                    <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight pt-2">
                                        Claim Your Identity
                                    </h2>
                                    <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 font-medium pb-4">
                                        Your journey starts here. Choose a unique handle for the community.
                                    </p>
                                </div>
                                <div className="space-y-2 pb-2">
                                    <div className="flex items-center gap-2 relative">
                                        <div className="absolute left-5 text-slate-400 font-black text-lg select-none">@</div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')); setError(''); setIsUsernameAvailable(null); }}
                                            placeholder="username"
                                            className={`w-full bg-slate-50/50 dark:bg-[#121212]/30 border-2 ${isUsernameAvailable === true ? 'border-emerald-500 shadow-emerald-500/10' : isUsernameAvailable === false ? 'border-rose-500 shadow-rose-500/10' : 'border-slate-200 dark:border-white/10 focus:border-primary focus:shadow-primary/10'} text-slate-900 dark:text-white font-bold rounded-2xl pl-10 pr-12 py-3.5 outline-none text-base transition-all`}
                                            autoFocus
                                        />
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center">
                                            {isCheckingUsername ? (
                                                <div className="size-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                            ) : isUsernameAvailable === true ? (
                                                <span className="material-symbols-outlined text-emerald-500 text-xl font-black">check_circle</span>
                                            ) : isUsernameAvailable === false ? (
                                                <span className="material-symbols-outlined text-rose-500 text-xl font-black">cancel</span>
                                            ) : null}
                                        </div>
                                    </div>
                                    {isUsernameAvailable === true && <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-2 text-left">Username is available!</p>}
                                    {isUsernameAvailable === false && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-2 text-left">Username is already taken</p>}
                                    {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest px-2 text-left">{error}</p>}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={async () => {
                                            if (!username.trim()) {
                                                setError('Username is required.');
                                                return;
                                            }
                                            if (username.length < 3) {
                                                setError('Username must be at least 3 characters.');
                                                return;
                                            }

                                            setIsCheckingUsername(true);
                                            try {
                                                const { data } = await api.get(`/auth/check-username?username=${username}`);
                                                if (data.available) {
                                                    setIsUsernameAvailable(true);
                                                    setError('');
                                                    setStep(2);
                                                } else {
                                                    setIsUsernameAvailable(false);
                                                }
                                            } catch (err) {
                                                console.error('Error checking username:', err);
                                                setError('Failed to verify username. Please try again.');
                                            } finally {
                                                setIsCheckingUsername(false);
                                            }
                                        }}
                                        className="w-full py-3.5 bg-[#121212] dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-sm transition-all shadow-xl active:scale-[0.99]"
                                    >
                                        Next
                                    </button>
                                </div>
                            </motion.div>
                        ) : step === 2 ? (
                            <motion.div
                                key="step2"
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="space-y-5"
                            >
                                <div className="space-y-2">
                                    <div className="size-12 md:size-16 bg-primary/10 rounded-3xl flex items-center justify-center ring-8 ring-primary/5 shadow-inner">
                                        <span className="material-symbols-outlined text-2xl md:text-3xl text-primary font-bold">public</span>
                                    </div>
                                    <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight pt-2">
                                        Set Your Environment
                                    </h2>
                                    <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 font-medium pb-2 max-w-[400px]">
                                        Confirm your timezone and choose your primary currency.
                                    </p>
                                </div>

                                {/* Timezone Card */}
                                <div className="w-full bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/80 dark:to-[#192233] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-none relative overflow-hidden text-left">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                    <div className="flex justify-between items-center relative z-10 w-full">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
                                                <span className="material-symbols-outlined text-primary text-lg font-black">schedule</span>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detected Timezone</span>
                                                <span className="text-slate-900 dark:text-white font-black text-sm md:text-base">{timezone}</span>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-emerald-500 font-black text-xl">check_circle</span>
                                    </div>
                                </div>

                                {/* Currency */}
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
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">United States Dollar</span>
                                        {currency === 'USD' && <span className="absolute top-2.5 right-2.5 material-symbols-outlined text-primary text-base">check_circle</span>}
                                    </button>
                                    <button
                                        onClick={() => setCurrency('PHP')}
                                        className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 relative overflow-hidden ${currency === 'PHP' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212]/50 hover:border-slate-300'}`}
                                    >
                                        {currency === 'PHP' && <div className="absolute inset-0 bg-primary/5" />}
                                        <span className={`text-3xl font-black relative z-10 ${currency === 'PHP' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>₱</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Philippine Peso</span>
                                        {currency === 'PHP' && <span className="absolute top-2.5 right-2.5 material-symbols-outlined text-primary text-base">check_circle</span>}
                                    </button>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-5 py-3.5 bg-slate-100 dark:bg-[#000000] text-slate-500 dark:text-slate-400 rounded-xl font-black text-xs transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setStep(3)}
                                        className="flex-1 py-3 bg-[#121212] dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-sm transition-all shadow-xl active:scale-[0.99]"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step3"
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="space-y-4 md:space-y-6"
                            >
                                <div className="space-y-2 text-center md:text-left w-full">
                                    <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Fuel Your Mind</h2>
                                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-tight mb-4">
                                        Curate your daily inspiration. Select the pillars that align with your current goals.
                                    </p>
                                </div>

                                <div className="flex flex-col items-center w-full relative">
                                    <div className="grid grid-cols-2 gap-2 w-full mb-6 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar relative z-10 pb-4">
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
                                                <div className={`size-8 md:size-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                    selectedChannels.includes(channel.channel_id)
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                        : 'bg-slate-100 dark:bg-[#000000] text-slate-400'
                                                }`}>
                                                    <span className="material-symbols-outlined text-base md:text-lg">
                                                        {CHANNEL_ICONS[channel.channel_id] || 'auto_awesome'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <p className={`text-[10px] md:text-xs font-black truncate leading-tight ${
                                                        selectedChannels.includes(channel.channel_id) ? 'text-primary' : 'text-slate-600 dark:text-slate-400'
                                                    }`}>
                                                        {channel.name}
                                                    </p>
                                                </div>
                                                {selectedChannels.includes(channel.channel_id) && (
                                                    <span className="material-symbols-outlined text-primary text-sm pr-1">check_circle</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="pointer-events-none absolute bottom-[68px] left-0 w-full h-12 bg-gradient-to-t from-white dark:from-[#192233] to-transparent z-20" />

                                    <div className="flex gap-3 w-full">
                                        <button 
                                            onClick={() => setStep(2)} 
                                            className="px-6 py-3.5 bg-slate-100 dark:bg-[#000000] text-slate-500 rounded-2xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-[#121212] transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleFinish}
                                            disabled={loading || selectedChannels.length === 0}
                                            className="flex-1 py-3.5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>Ignite Dashboard <span className="material-symbols-outlined text-sm">rocket_launch</span></>
                                            )}
                                        </button>
                                    </div>
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
