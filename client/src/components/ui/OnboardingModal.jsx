import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSWRConfig } from 'swr';
import useAuthStore from '../../store/useAuthStore';

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
        try {
            await completeOnboarding({ timezone, selectedHabits });
            // Immediately refresh habits to avoid lag
            mutate('/habits');
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
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
                        ) : (
                            <motion.div
                                key="step2"
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
                                        onClick={() => setStep(1)}
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
