import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ARCHETYPE_QUIZ, calculateScores, ARCHETYPE_PROTOCOLS } from '../../constants/assessment';
import SystemWindow from '../ui/SystemWindow';
import api from '../../services/api';
import { useSWRConfig } from 'swr';
import { ArrowLeft, Zap, Shield, Target, Brain, Heart, Users } from 'lucide-react';

const AwakeningAssessment = ({ isOpen, onClose }) => {
    const { mutate } = useSWRConfig();
    const [step, setStep] = useState(1); // 1: Briefing, 2: Quiz, 3: Syncing, 4: Revealed
    const [quizIndex, setQuizIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(2); // Default to Neutral (index 2)

    const quizOptions = [
        { label: "Strongly Disagree", score: 1, color: "rose-500" },
        { label: "Disagree", score: 2, color: "orange-400" },
        { label: "Neutral", score: 3, color: "neutral-400" },
        { label: "Agree", score: 4, color: "emerald-400" },
        { label: "Strongly Agree", score: 5, color: "cyan-400" }
    ];

    const handleAnswer = (score) => {
        const next = [...answers, { id: ARCHETYPE_QUIZ[quizIndex].id, score }];
        if (quizIndex < ARCHETYPE_QUIZ.length - 1) {
            setAnswers(next);
            setQuizIndex(quizIndex + 1);
            setActiveIndex(2);
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
            // Wait for dramatic effect
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const { data } = await api.post('/auth/awaken', { stats });
            setResults(data);
            setStep(4);
            mutate('/auth/me');
        } catch (error) {
            console.error('Awakening failed:', error);
            setIsSyncing(false);
            setStep(2);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 md:p-8 font-outfit overflow-hidden">
            <div className="w-full max-w-5xl relative">
                <AnimatePresence mode="wait">
                    {/* Step 1: Briefing */}
                    {step === 1 && (
                        <motion.div
                            key="briefing"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="w-full flex justify-center"
                        >
                            <SystemWindow 
                                title="NEURAL_AWAKENING_PROTOCOL"
                                subtitle="AXION_REDUX // IDENT_CONFIRMED"
                                status="READY_FOR_SYNC"
                                className="max-w-2xl text-center"
                            >
                                <div className="space-y-8 py-6">
                                    <div className="size-24 mx-auto bg-cyan-400/5 border border-cyan-400/20 flex items-center justify-center rounded-full relative">
                                        <Zap className="text-cyan-400 size-12 animate-pulse" />
                                        <div className="absolute inset-0 border-2 border-cyan-400/20 rounded-full animate-ping scale-150 opacity-20" />
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-black text-white italic tracking-tighter font-exo uppercase">Awaken Your Potential</h2>
                                        <p className="text-sm text-neutral-400 leading-relaxed uppercase tracking-widest max-w-md mx-auto font-medium">
                                            The system has detected a dormant signature. To initialize your core identity and assign your strategic archetype, we must map your neural vectors.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-6">
                                        <div className="text-center space-y-1">
                                            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Questions</p>
                                            <p className="text-xl font-black text-white font-exo">30</p>
                                        </div>
                                        <div className="text-center space-y-1 border-x border-white/5">
                                            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Type</p>
                                            <p className="text-xl font-black text-cyan-400 font-exo">LIKERT</p>
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Difficulty</p>
                                            <p className="text-xl font-black text-rose-500 font-exo">HIGH</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(2)}
                                        className="w-full py-5 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-black text-xs uppercase tracking-[0.8em] transition-all hover:scale-[1.02] font-exo shadow-[0_0_40px_rgba(34,211,238,0.3)]"
                                    >
                                        INITIATE_PROTOCOL
                                    </button>
                                </div>
                            </SystemWindow>
                        </motion.div>
                    )}

                    {/* Step 2: Quiz */}
                    {step === 2 && (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="w-full flex justify-center"
                        >
                            <SystemWindow 
                                title="SYNAPSE_MAPPING"
                                subtitle={`EVALUATION_SEQ: ${quizIndex + 1} / ${ARCHETYPE_QUIZ.length}`}
                                status="SYNCING"
                                className="w-full max-w-4xl"
                            >
                                <div className="space-y-8">
                                    {/* Progress */}
                                    <div className="relative h-1 w-full bg-white/5 overflow-hidden">
                                        <motion.div 
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-blue-500"
                                            animate={{ width: `${((quizIndex + 1) / ARCHETYPE_QUIZ.length) * 100}%` }}
                                        />
                                    </div>

                                    <div className="space-y-6 min-h-[120px]">
                                        <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white leading-tight uppercase font-exo">
                                            {ARCHETYPE_QUIZ[quizIndex].question}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-5 gap-2 md:gap-4 pt-4">
                                        {quizOptions.map((opt, idx) => {
                                            const isFocused = idx === activeIndex;
                                            return (
                                                <button
                                                    key={idx}
                                                    onMouseEnter={() => setActiveIndex(idx)}
                                                    onClick={() => handleAnswer(opt.score)}
                                                    className={`flex flex-col items-center gap-3 transition-all group outline-none ${isFocused ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
                                                >
                                                    <div className={`size-14 md:size-20 rounded-2xl flex items-center justify-center border-2 transition-all ${isFocused ? `border-${opt.color} bg-${opt.color}/10 shadow-[0_0_20px_var(--${opt.color})]` : 'border-white/10'}`}>
                                                        <span className="text-2xl font-black text-white">{opt.score}</span>
                                                    </div>
                                                    <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest text-center h-8 flex items-center ${isFocused ? `text-${opt.color}` : 'text-neutral-500'}`}>
                                                        {opt.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex justify-between items-center pt-8 border-t border-white/5">
                                        {quizIndex > 0 ? (
                                            <button
                                                onClick={() => {
                                                    setQuizIndex(quizIndex - 1);
                                                    setAnswers(answers.slice(0, -1));
                                                }}
                                                className="flex items-center gap-2 text-[10px] font-mono text-cyan-400/40 hover:text-cyan-400 transition-all uppercase tracking-[0.4em] group/back"
                                            >
                                                <ArrowLeft size={10} className="group-hover/back:-translate-x-1 transition-transform" />
                                                <span>GO_BACK</span>
                                            </button>
                                        ) : <div />}
                                        
                                        <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                                            SYNC_STABILITY: {(85 + Math.random() * 15).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            </SystemWindow>
                        </motion.div>
                    )}

                    {/* Step 3: Syncing */}
                    {step === 3 && (
                        <motion.div
                            key="syncing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full flex justify-center"
                        >
                            <SystemWindow title="NEURAL_STABILIZATION" subtitle="CALCULATING ARCHETYPE PATHS" status="SYNC_DATA" className="w-full max-w-lg text-center py-24">
                                <div className="relative size-32 mx-auto mb-16">
                                    <motion.div 
                                        className="absolute inset-0 border-[4px] border-t-cyan-400 border-transparent"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        style={{ borderRadius: '50%' }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-cyan-400 animate-pulse">
                                        {Math.floor(Math.random()*100)}%
                                    </div>
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-[0.6em] text-white animate-pulse italic font-exo">AWAKENING_CORE</h2>
                                <p className="mt-4 text-[10px] text-cyan-400/40 tracking-[0.3em] font-mono uppercase">Decoding behavior patterns...</p>
                            </SystemWindow>
                        </motion.div>
                    )}

                    {/* Step 4: Revealed */}
                    {step === 4 && (
                        <motion.div
                            key="revealed"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full flex justify-center"
                        >
                            <SystemWindow 
                                title="IDENTITY_AWAKENED"
                                subtitle="NEURAL_PROFILE_OPTIMIZED"
                                status="EVOLUTION_COMPLETE"
                                className="w-full max-w-5xl text-center"
                            >
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] font-mono">NEW_ARCHETYPE_DETECTED</div>
                                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white font-exo italic drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                            {results?.rpg?.archetype?.name}
                                        </h2>
                                        <div className="flex justify-center gap-2">
                                            <div className="px-3 py-1 bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest">LEVEL 1</div>
                                            <div className="px-3 py-1 bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest">AWAKENED</div>
                                        </div>
                                    </div>

                                    <div className="max-w-2xl mx-auto border border-white/5 bg-white/5 p-8 space-y-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Brain size={120} />
                                        </div>
                                        
                                        <p className="text-sm font-medium text-neutral-400 uppercase tracking-widest leading-relaxed relative z-10 italic">
                                            " {ARCHETYPE_PROTOCOLS[results?.rpg?.archetype?.name]?.flavor} "
                                        </p>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/5">
                                            {Object.entries(results?.rpg?.stats || {}).map(([stat, val]) => (
                                                <div key={stat} className="space-y-1">
                                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">{stat}</p>
                                                    <p className="text-xl font-black text-white font-exo">{val}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="w-full max-w-sm mx-auto py-5 bg-white text-black font-black text-xs uppercase tracking-[0.8em] transition-all hover:scale-[1.05] font-exo shadow-[0_0_60px_rgba(255,255,255,0.1)]"
                                    >
                                        ENTER_DASHBOARD
                                    </button>
                                </div>
                            </SystemWindow>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AwakeningAssessment;
