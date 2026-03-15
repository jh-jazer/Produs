import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSWRConfig } from 'swr';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';

const SUGGESTIONS = [
    { name: 'Drink Water', icon: 'local_drink', color: 'emerald', category: 'Health' },
    { name: 'Evening Walk', icon: 'directions_run', color: 'orange', category: 'Health' },
    { name: 'Meditation', icon: 'self_improvement', color: 'purple', category: 'Mindset' },
    { name: 'Read 30m', icon: 'menu_book', color: 'blue', category: 'Mindset' },
    { name: 'Coding', icon: 'code', color: 'cyan', category: 'Creative' },
    { name: 'Journaling', icon: 'history_edu', color: 'violet', category: 'Mindset' },
    { name: 'Track Expenses', icon: 'payments', color: 'emerald', category: 'Finance' },
    { name: 'Deep Work', icon: 'bolt', color: 'amber', category: 'Productivity' },
    { name: 'Plan Tomorrow', icon: 'event_note', color: 'indigo', category: 'Productivity' },
];

const COLOR_MAP = {
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    violet: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
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
    const [selectedHabits, setSelectedHabits] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);

    const toggleHabit = (habit) => {
        if (selectedHabits.find(h => h.name === habit.name)) {
            setSelectedHabits(selectedHabits.filter(h => h.name !== habit.name));
        } else if (selectedHabits.length < 3) {
            setSelectedHabits([...selectedHabits, habit]);
        }
    };

    const handleFinish = async () => {
        setLoading(true);
        setError('');
        try {
            await completeOnboarding({ timezone, currency, username, selectedHabits });
            // Immediately refresh habits to avoid lag
            mutate('/habits');
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            setError(error.response?.data?.message || 'Failed to complete onboarding.');
            setStep(2); // Send them back to username step if it fails
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
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#192233] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
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
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center ring-8 ring-primary/5">
                                        <span className="material-symbols-outlined text-3xl text-primary font-black">celebration</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                        Welcome to Produs, {user?.name?.split(' ')[0]}!
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                        Let's set up your workspace for high performance. First, let's confirm your local time.
                                    </p>
                                </div>

                                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-slate-400">schedule</span>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detected Timezone</p>
                                                <p className="text-sm font-bold dark:text-white">{timezone}</p>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-emerald-500 font-black">check_circle</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm hover:scale-[1.01] transition-all shadow-xl active:scale-[0.99]"
                                >
                                    Confirm & Continue
                                </button>
                            </motion.div>
                        ) : step === 2 ? (
                            <motion.div
                                key="step2"
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <div className="size-16 bg-blue-500/10 rounded-2xl flex items-center justify-center ring-8 ring-blue-500/5">
                                        <span className="material-symbols-outlined text-3xl text-blue-500 font-black">alternate_email</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                        Choose a username
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                        This is how you'll be known to your partners and on your public profile.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 relative">
                                        <span className="text-xl font-black text-slate-400">@</span>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')); setError(''); }}
                                            placeholder="username"
                                            className={`w-full bg-slate-50 dark:bg-slate-900/50 border ${isUsernameAvailable === true ? 'border-emerald-500/50' : isUsernameAvailable === false ? 'border-rose-500/50' : 'border-slate-200 dark:border-slate-700'} text-slate-900 dark:text-white font-medium rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors`}
                                            autoFocus
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            {isCheckingUsername ? (
                                                <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                            ) : isUsernameAvailable === true ? (
                                                <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                                            ) : isUsernameAvailable === false ? (
                                                <span className="material-symbols-outlined text-rose-500 text-lg">cancel</span>
                                            ) : null}
                                        </div>
                                    </div>
                                    {isUsernameAvailable === true && <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1">Username is available!</p>}
                                    {isUsernameAvailable === false && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-1">Username is already taken</p>}
                                    {error && <p className="text-xs font-bold text-red-500 px-1">{error}</p>}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setStep(3)}
                                        disabled={!username.trim() || username.length < 3 || isUsernameAvailable === false || isCheckingUsername}
                                        className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm hover:scale-[1.01] transition-all shadow-xl active:scale-[0.99] disabled:opacity-50 disabled:grayscale"
                                    >
                                        Next
                                    </button>
                                </div>
                            </motion.div>
                        ) : step === 3 ? (
                            <motion.div
                                key="step2"
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <div className="size-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center ring-8 ring-emerald-500/5">
                                        <span className="material-symbols-outlined text-3xl text-emerald-500 font-black">payments</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                        Set your currency
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                        Choose how you'd like your financial data to be displayed in the finance dashboard.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <button
                                        onClick={() => { setCurrency('USD'); setStep(4); }}
                                        className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${currency === 'USD' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-105' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                                    >
                                        <span className="text-4xl font-black text-slate-900 dark:text-white">$</span>
                                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">US Dollar</span>
                                    </button>
                                    <button
                                        onClick={() => { setCurrency('PHP'); setStep(4); }}
                                        className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${currency === 'PHP' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-105' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                                    >
                                        <span className="text-4xl font-black text-slate-900 dark:text-white">₱</span>
                                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">PH Peso</span>
                                    </button>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setStep(4)}
                                        className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm hover:scale-[1.01] transition-all shadow-xl active:scale-[0.99] disabled:opacity-50 disabled:grayscale"
                                    >
                                        Next
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
                                className="space-y-8"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Pick your first 3</h2>
                                        <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-tighter">
                                            {selectedHabits.length}/3 Selected
                                        </div>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                        Choose 3 habits to start your streaks today. You can always add more later.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {SUGGESTIONS.map((habit) => {
                                        const isSelected = selectedHabits.find(h => h.name === habit.name);
                                        const colorClasses = COLOR_MAP[habit.color] || COLOR_MAP.emerald;

                                        return (
                                            <button
                                                key={habit.name}
                                                onClick={() => toggleHabit(habit)}
                                                className={`p-4 rounded-[1.5rem] border text-left transition-all relative ${isSelected
                                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                                                    : `bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:border-primary/30`
                                                    }`}
                                            >
                                                <div className={`size-10 rounded-xl flex items-center justify-center mb-3 ${isSelected ? 'bg-white/20' : colorClasses.split(' ')[0]}`}>
                                                    <span className="material-symbols-outlined text-xl">{habit.icon}</span>
                                                </div>
                                                <p className="text-sm font-bold leading-tight">{habit.name}</p>
                                                {isSelected && (
                                                    <motion.div
                                                        layoutId="check"
                                                        className="absolute top-3 right-3"
                                                    >
                                                        <span className="material-symbols-outlined text-sm font-black text-white">check</span>
                                                    </motion.div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(3)}
                                        className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleFinish}
                                        disabled={selectedHabits.length !== 3 || loading}
                                        className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-sm hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                        ) : (
                                            <>Ignite Dashboard <span className="material-symbols-outlined text-sm">rocket_launch</span></>
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
