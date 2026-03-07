import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import SmallCalendar from '../components/planner_components/SmallCalendar';
import FinancialStats from '../components/finance_components/FinancialStats';
import JournalSnippet from '../components/journal_components/JournalSnippet';

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const { user, setCredentials } = useAuthStore();
    const navigate = useNavigate();
    const [timezone, setTimezone] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setTimezone(detectedTimezone);
    }, []);

    const handleComplete = async () => {
        setLoading(true);
        try {
            const { data } = await api.put('/auth/onboarding', { timezone, currency });
            setCredentials({ ...user, ...data });
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);

    const variants = {
        enter: { opacity: 0, y: 10 },
        center: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 }
    };

    const firstName = user?.name ? user.name.split(' ')[0] : 'User';

    return (
        <div className="w-full max-w-[1200px] flex flex-col gap-6 animate-in fade-in duration-700">
            {/* Main Layout Grid */}
            <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-140px)] min-h-[520px] pt-4">

                {/* Left Column - Onboarding Content */}
                <div className="w-full md:w-2/3 flex flex-col gap-4 h-full">
                    <div className="flex flex-col gap-1 pb-2">
                        <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black tracking-tight">
                            {step === 1 ? `Welcome, ${firstName}!` :
                                step === 2 ? "Just a quick sync..." :
                                    "Ready for lift-off"}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            {step === 1 ? "Let's personalize your experience." :
                                step === 2 ? "Setting up your local environment." :
                                    "Your dashboard is almost ready."}
                        </p>
                    </div>

                    {/* Onboarding Card */}
                    <div className="flex-1 bg-white dark:bg-[#192233] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center p-8 relative overflow-hidden">
                        {/* Progress bar at top of card */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800 flex">
                            <motion.div
                                className="bg-primary h-full"
                                animate={{ width: `${(step / 4) * 100}%` }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    variants={variants}
                                    className="flex flex-col items-center text-center max-w-md"
                                >
                                    <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-8 ring-primary/5">
                                        <span className="material-symbols-outlined text-3xl text-primary font-black">celebration</span>
                                    </div>
                                    <h2 className="text-xl font-bold mb-3 dark:text-white">The journey begins today</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                                        Produs helps you manage habits, tasks, and finances in one high-performance interface.
                                    </p>
                                    <button
                                        onClick={nextStep}
                                        className="px-10 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl dark:shadow-white/5"
                                    >
                                        Let's start
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    variants={variants}
                                    className="flex flex-col items-center text-center max-w-md"
                                >
                                    <div className="size-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 ring-8 ring-amber-500/5">
                                        <span className="material-symbols-outlined text-3xl text-amber-500 font-bold">schedule</span>
                                    </div>
                                    <h2 className="text-xl font-bold mb-3 dark:text-white">Local Time Sync</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                                        We'll use your local browser time to keep your habits accurate.
                                    </p>
                                    <div className="w-full bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-8">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-slate-400 uppercase tracking-widest">Detected Timezone</span>
                                            <span className="text-primary font-black">{timezone}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={nextStep}
                                        className="px-10 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl dark:shadow-white/5"
                                    >
                                        Looks correct
                                    </button>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    variants={variants}
                                    className="flex flex-col items-center text-center max-w-md"
                                >
                                    <div className="size-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 ring-8 ring-emerald-500/5">
                                        <span className="material-symbols-outlined text-3xl text-emerald-500 font-bold">payments</span>
                                    </div>
                                    <h2 className="text-xl font-bold mb-3 dark:text-white">Currency Preference</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                                        Choose how you'd like your financial data to be displayed.
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 w-full mb-8">
                                        <button
                                            onClick={() => { setCurrency('USD'); nextStep(); }}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${currency === 'USD' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                                        >
                                            <span className="text-2xl font-black text-slate-900 dark:text-white">$</span>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">US Dollar</span>
                                        </button>
                                        <button
                                            onClick={() => { setCurrency('PHP'); nextStep(); }}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${currency === 'PHP' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                                        >
                                            <span className="text-2xl font-black text-slate-900 dark:text-white">₱</span>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">PH Peso</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    variants={variants}
                                    className="flex flex-col items-center text-center max-w-md"
                                >
                                    <div className="size-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 ring-8 ring-emerald-500/5">
                                        <span className="material-symbols-outlined text-3xl text-emerald-500 font-bold">auto_awesome</span>
                                    </div>
                                    <h2 className="text-xl font-bold mb-3 dark:text-white">You're all set</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                                        Explore your new workspace. Real-time insights and goal tracking are now active.
                                    </p>
                                    <button
                                        onClick={handleComplete}
                                        disabled={loading}
                                        className="px-12 py-3 bg-primary text-white rounded-xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                        ) : (
                                            <>Jump to dashboard <span className="material-symbols-outlined text-sm">arrow_forward</span></>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Column - Preview of Dashboard Components */}
                <div className="w-full md:w-1/3 flex flex-col gap-4 h-full opacity-30 grayscale pointer-events-none blur-[1px]">
                    <SmallCalendar />
                    <FinancialStats />
                    <JournalSnippet />
                </div>

            </div>
        </div>
    );
};

export default Onboarding;

