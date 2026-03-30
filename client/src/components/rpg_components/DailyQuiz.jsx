import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SystemWindow from '../ui/SystemWindow';
import api from '../../services/api';
import { useSWRConfig } from 'swr';
import { Sparkles, Brain, CheckCircle2, XCircle, ArrowRight, TrendingUp, Zap } from 'lucide-react';

const DAILY_QUESTIONS = [
    {
        id: 'habits',
        channel: 'HABITS',
        question: 'Did you maintain your primary streaks today?',
        icon: <Zap className="text-amber-400" size={18} />,
        options: [
            { label: 'FLAWLESS', score: 5, color: 'text-emerald-400' },
            { label: 'PARTIAL', score: 3, color: 'text-amber-400' },
            { label: 'FAILED', score: 1, color: 'text-rose-500' }
        ]
    },
    {
        id: 'planner',
        channel: 'PLANNER',
        question: 'How many high-priority tasks did you clear?',
        icon: <CheckCircle2 className="text-blue-400" size={18} />,
        options: [
            { label: 'ALL', score: 5, color: 'text-emerald-400' },
            { label: 'SOME', score: 3, color: 'text-amber-400' },
            { label: 'NONE', score: 1, color: 'text-rose-500' }
        ]
    },
    {
        id: 'finance',
        channel: 'FINANCE',
        question: 'Did you stay within your daily budget?',
        icon: <TrendingUp className="text-emerald-400" size={18} />,
        options: [
            { label: 'UNDER', score: 5, color: 'text-emerald-400' },
            { label: 'ON_TARGET', score: 4, color: 'text-emerald-400' },
            { label: 'OVER', score: 1, color: 'text-rose-500' }
        ]
    },
    {
        id: 'health',
        channel: 'HEALTH',
        question: 'Did you hit your movement/hydration targets?',
        icon: <Zap className="text-cyan-400" size={18} />,
        options: [
            { label: 'OPTIMAL', score: 5, color: 'text-emerald-400' },
            { label: 'NEUTRAL', score: 3, color: 'text-amber-400' },
            { label: 'POOR', score: 1, color: 'text-rose-500' }
        ]
    },
    {
        id: 'journal',
        channel: 'DAILY_JOURNAL',
        question: 'Have you performed your daily brain dump?',
        icon: <Brain className="text-blue-400" size={18} />,
        options: [
            { label: 'COMPLETE', score: 5, color: 'text-emerald-400' },
            { label: 'PARTIAL', score: 3, color: 'text-amber-400' },
            { label: 'PENDING', score: 0, color: 'text-rose-500' }
        ]
    }
];

const DailyQuiz = ({ onComplete }) => {
    const { mutate } = useSWRConfig();
    const [index, setIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [reward, setReward] = useState(null);

    const handleAnswer = (score) => {
        const newAnswers = { ...answers, [DAILY_QUESTIONS[index].id]: score };
        setAnswers(newAnswers);

        if (index < DAILY_QUESTIONS.length - 1) {
            setIndex(index + 1);
        } else {
            submitQuiz(newAnswers);
        }
    };

    const submitQuiz = async (finalAnswers) => {
        setIsSubmitting(true);
        try {
            const { data } = await api.post('/api/rpg/daily-quiz');
            setReward(data);
            setShowResults(true);
            
            // Re-fetch user data to update sidebar stats and assessment section
            mutate('/auth/me');
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Failed to submit daily quiz:', error);
            setIsSubmitting(false);
        }
    };

    if (showResults) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-1"
            >
                <div className="relative group overflow-hidden rounded-[22px] p-6 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent backdrop-blur-3xl shadow-sm">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <CheckCircle2 size={60} className="text-emerald-500" />
                    </div>
                    
                    <div className="relative z-10 space-y-4 text-center">
                        <div className="size-12 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
                            <Sparkles className="text-emerald-500 size-6 animate-pulse" />
                        </div>
                        
                        <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-500/60 font-mono">NEURAL_SYNC_SUCCESSFUL</p>
                            <h2 className="text-lg font-bold text-black dark:text-white tracking-[-0.02em]">Reflection Complete</h2>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <div className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                +{reward?.xpAwarded || 25} XP // SYNC
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    const current = DAILY_QUESTIONS[index];

    return (
        <div className="px-1 shadow-2xl shadow-emerald-500/5">
            <SystemWindow 
                title="DAILY_REFLECTION"
                subtitle={`CHANNEL: ${current.channel} [${index + 1}/${DAILY_QUESTIONS.length}]`}
                status="AWAIT_NEURAL_INPUT"
                className="w-full"
            >
                <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-emerald-500"
                            animate={{ width: `${((index + 1) / DAILY_QUESTIONS.length) * 100}%` }}
                        />
                    </div>

                    <div className="flex items-center gap-3 py-2 min-h-[60px]">
                        <div className="size-10 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10">
                            {current.icon}
                        </div>
                        <h3 className="text-lg font-bold text-black dark:text-white tracking-tight leading-tight">
                            {current.question}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {current.options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(opt.score)}
                                className="group relative p-3 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-black/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 text-center flex flex-col items-center gap-1"
                            >
                                <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${opt.color}`}>
                                    {opt.label}
                                </span>
                                <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full" />
                            </button>
                        ))}
                    </div>

                    {isSubmitting && (
                        <div className="absolute inset-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
                            <div className="size-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500 font-mono">Syncing_Vectors...</p>
                        </div>
                    )}
                </div>
            </SystemWindow>
        </div>
    );
};

export default DailyQuiz;
