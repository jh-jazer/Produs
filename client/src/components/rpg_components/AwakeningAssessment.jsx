import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ARCHETYPE_QUIZ, calculateScores, ARCHETYPE_PROTOCOLS } from '../../constants/assessment';
import SystemWindow from '../ui/SystemWindow';
import api from '../../services/api';
import { useSWRConfig } from 'swr';
import useAuthStore from '../../store/useAuthStore';
import { ArrowLeft, Zap, Shield, Target, Brain, Heart, Users, Sparkles } from 'lucide-react';

/**
 * PanelWrapper - Switching between holographic window (Modal)
 * and a clean integrated card (Inline Feed).
 */
const PanelWrapper = ({ children, title, subtitle, status, isInline, className = "" }) => {
    if (!isInline) {
        return (
            <SystemWindow 
                title={title} 
                subtitle={subtitle} 
                status={status} 
                className={className}
            >
                {children}
            </SystemWindow>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ layout: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            className={`bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group transition-all border-l-4 border-l-accent mb-4 ${className}`}
        >
            {/* Header for Inline version */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                        <Zap size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] font-mono">
                            {title || 'PROTOCOL: AWAKENING'}
                        </span>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            {subtitle || 'Identity Synchronization Active'}
                        </div>
                    </div>
                </div>
                {status && (
                    <span className="text-[8px] font-black px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/40 uppercase tracking-widest font-mono">
                        {status}
                    </span>
                )}
            </div>
            {children}
        </motion.div>
    );
};

const AwakeningAssessment = ({ isOpen, onClose, isInline = false }) => {
    const { mutate } = useSWRConfig();
    const syncUser = useAuthStore(state => state.syncUser);
    const [step, setStep] = useState(2); // Start directly at Step 2 (Quiz)
    const [quizIndex, setQuizIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [results, setResults] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null); // No default focus

    const quizOptions = [
        { label: "Strongly Disagree", score: 1, color: "rose-500" },
        { label: "Disagree", score: 2, color: "orange-400" },
        { label: "Neutral", score: 3, color: "neutral-400" },
        { label: "Agree", score: 4, color: "emerald-400" },
        { label: "Strongly Agree", score: 5, color: "accent" }
    ];

    const handleAnswer = (score) => {
        const next = [...answers, { id: ARCHETYPE_QUIZ[quizIndex].id, score }];
        if (quizIndex < ARCHETYPE_QUIZ.length - 1) {
            setAnswers(next);
            setQuizIndex(quizIndex + 1);
            // Don't reset to 2 to avoid 'ghost glow' on next question
        } else {
            setAnswers(next);
            finalizeAssessment(next);
        }
    };

    const finalizeAssessment = async (finalAnswers) => {
        setIsSyncing(true);
        setStep(3);
        
        const stats = calculateScores(finalAnswers);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const { data } = await api.post('/auth/awaken', { stats });
            setResults(data);
            setStep(4);
            
            // Sync level/rpg directly — backend returns { level, exp, rpg } (no .user wrapper)
            syncUser(data);
            
            mutate('/auth/me');
        } catch (error) {
            console.error('Awakening failed:', error);
            // If user is already awakened, just close and proceed
            const isAlreadyAwakened = error?.response?.status === 400;
            if (isAlreadyAwakened) {
                onClose?.();
            } else {
                setIsSyncing(false);
                setStep(2);
            }
        }
    };

    if (!isInline && !isOpen) return null;

    const mainContent = (
        <PanelWrapper 
            isInline={isInline}
            title={step === 2 ? "SYNAPSE_MAPPING" : step === 3 ? "NEURAL_STABILIZATION" : "IDENTITY_AWAKENED"}
            subtitle={step === 2 ? `SEQUENCE: ${quizIndex + 1} / ${ARCHETYPE_QUIZ.length}` : step === 3 ? "CALCULATING ARCHETYPE PATHS" : "NEURAL_PROFILE_OPTIMIZED"}
            status={step === 2 ? "SYNCING" : step === 3 ? "SYNC_DATA" : "COMPLETE"}
            className={step === 4 ? "border-l-emerald-500" : ""}
        >
            <AnimatePresence mode="wait">
                {/* Step 2: Quiz */}
                {step === 2 && (
                    <motion.div
                        key="quiz-step"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-10"
                    >
                        {/* Simple Tactical Progress Line */}
                        <div className="relative h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                className="absolute inset-y-0 left-0 bg-accent"
                                animate={{ width: `${((quizIndex + 1) / ARCHETYPE_QUIZ.length) * 100}%` }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            />
                        </div>

                        <div className="min-h-[100px] flex items-center">
                            <h3 className="text-xl md:text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-tight uppercase font-exo">
                                {ARCHETYPE_QUIZ[quizIndex].question}
                            </h3>
                        </div>

                        <div 
                            className="grid grid-cols-5 gap-2 md:gap-4 pt-4 pb-4"
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            {quizOptions.map((opt, idx) => {
                                const isFocused = idx === activeIndex;
                                return (
                                    <button
                                        key={idx}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                        onClick={() => handleAnswer(opt.score)}
                                        className={`flex flex-col items-center gap-3 transition-opacity outline-none ${isFocused ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                                    >
                                        <div className={`size-12 md:size-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${isFocused ? `border-${opt.color} bg-${opt.color}/10 scale-110 shadow-[0_0_20px_rgba(34,211,238,0.2)]` : 'border-slate-200 dark:border-white/10 dark:bg-white/5'}`}>
                                            <span className="text-lg font-black text-slate-900 dark:text-white">{opt.score}</span>
                                        </div>
                                        <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest text-center h-4 transition-colors ${isFocused ? `text-${opt.color}` : 'text-slate-400'}`}>
                                            {opt.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-white/5">
                            {quizIndex > 0 ? (
                                <button
                                    onClick={() => {
                                        setQuizIndex(quizIndex - 1);
                                        setAnswers(answers.slice(0, -1));
                                    }}
                                    className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-accent transition-colors uppercase tracking-widest"
                                >
                                    <ArrowLeft size={10} />
                                    <span>BACK</span>
                                </button>
                            ) : <div />}
                            <div className="text-[10px] font-mono text-slate-300 dark:text-white/20 uppercase tracking-widest">
                                LINK_STABILITY: {(85 + Math.random() * 15).toFixed(2)}%
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Syncing */}
                {step === 3 && (
                    <motion.div
                        key="syncing-step"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-16 text-center"
                    >
                        <div className="relative size-24 mx-auto mb-10">
                            <motion.div 
                                className="absolute inset-0 border-2 border-t-accent border-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-accent">
                                {Math.floor(Math.random()*100)}%
                            </div>
                        </div>
                        <h2 className="text-lg font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white animate-pulse italic font-exo">AWAKENING_CORE</h2>
                        <p className="mt-4 text-[9px] text-slate-400 tracking-[0.2em] font-mono uppercase">Decoding behavior patterns...</p>
                    </motion.div>
                )}

                {/* Step 4: Revealed */}
                {step === 4 && (
                    <motion.div
                        key="revealed-step"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-10"
                    >
                        <div className="space-y-4">
                            <div className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] font-mono">NEW_ARCHETYPE_DETECTED</div>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-900 dark:text-white font-exo italic mb-2">
                                {results?.rpg?.archetype?.name}
                            </h2>
                            <div className="flex justify-center gap-3">
                                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">LEVEL 1</div>
                                <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest">AWAKENED</div>
                            </div>
                        </div>

                        <div className="max-w-xl mx-auto border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] rounded-3xl p-8 space-y-6 relative overflow-hidden">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed relative z-10 italic">
                                " {ARCHETYPE_PROTOCOLS[results?.rpg?.archetype?.name]?.flavor} "
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-slate-200 dark:border-white/10">
                                {Object.entries(results?.rpg?.stats || {}).map(([stat, val]) => (
                                    <div key={stat} className="space-y-1 text-center">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat}</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white font-exo">{val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-3xl font-black text-xs uppercase tracking-[0.5em] transition-transform hover:scale-[1.02] shadow-xl shadow-black/20"
                        >
                            START_DASHBOARD
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </PanelWrapper>
    );

    if (isInline) {
        return <div className="w-full">{mainContent}</div>;
    }

    return (
        <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 md:p-8 font-outfit overflow-hidden">
            <div className="w-full max-w-5xl relative">
                {mainContent}
            </div>
        </div>
    );
};

export default AwakeningAssessment;
