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
    const [stage, setStage] = useState('PATH');
    const [step, setStep] = useState(2); // 2: Quiz, 3: Syncing, 4: Revealed
    const [quizIndex, setQuizIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [results, setResults] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);

    const [isHandshaking, setIsHandshaking] = useState(false);
    const [handshakeComplete, setHandshakeComplete] = useState(false);
    const [handshakeLog, setHandshakeLog] = useState([]);
    
    const PATH_QUESTIONS = useMemo(() => ARCHETYPE_QUIZ.slice(0, 15), []);

    const handleAnswer = (value) => {
        const nextAnswers = [...answers, { id: PATH_QUESTIONS[quizIndex].id, value }];
        setAnswers(nextAnswers);

        if (quizIndex < PATH_QUESTIONS.length - 1) {
            setQuizIndex(quizIndex + 1);
        } else {
            finalizeAssessment(nextAnswers);
        }
    };

    const finalizeAssessment = async (finalAnswers) => {
        setIsSyncing(true);
        setStep(3);
        
        const result = calculateScores(finalAnswers);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Record the results but don't finalize level 1 yet
            const { data } = await api.post('/auth/awaken', { result });
            setResults(data);
            setIsSyncing(false);
            setStep(4); // Move to Handshake step
        } catch (error) {
            console.error('Awakening calculation failed:', error);
            setIsSyncing(false);
            setStep(2);
        }
    };

    const handleHandshake = async () => {
        setIsSyncing(true);
        const logs = [
            "INITIATING_FINAL_SYNERGY...",
            "NEURAL_HANDSHAKE_ESTABLISHED.",
            "UPLINK_STABILIZED.",
            "ASSIGNING_PATH_VECTORS...",
            "GRANTING_LEVEL_1_CLEARANCE."
        ];
        
        for(let i = 0; i < logs.length; i++) {
            setHandshakeLog(prev => [...prev, logs[i]]);
            await new Promise(r => setTimeout(r, 400));
        }

        try {
            const { data } = await api.post('/auth/finalize-awakening');
            setResults(data);
            syncUser(data);
            setHandshakeComplete(true);
            setIsSyncing(false);
            mutate('/auth/me');
        } catch (error) {
            console.error("Handshake failed", error);
            setIsSyncing(false);
        }
    };

    if (!isInline && !isOpen) return null;

    const currentQuestion = PATH_QUESTIONS[quizIndex];

    const mainContent = (
        <PanelWrapper 
            isInline={isInline}
            title={step === 2 ? `PROTOCOL: PATH_INIT` : step === 3 ? "NEURAL_STABILIZATION" : "PATH_IDENTIFIED"}
            subtitle={step === 2 ? `SYNAPSE ${quizIndex + 1} / ${PATH_QUESTIONS.length}` : step === 3 ? "ESTABLISHING CORE INSTINCT" : "IDENTITY_FOUNDATION_READY"}
            status={step === 2 ? "SYNCING" : step === 3 ? "SYNC_DATA" : "COMPLETE"}
            className={step === 4 ? "border-l-accent" : ""}
        >
            <AnimatePresence mode="wait">
                {/* Step 2: Quiz */}
                {step === 2 && (
                    <motion.div
                        key="quiz-step"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="space-y-10"
                    >
                        <div className="relative h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                className="absolute inset-y-0 left-0 bg-accent"
                                animate={{ width: `${((quizIndex + 1) / PATH_QUESTIONS.length) * 100}%` }}
                            />
                        </div>

                        <div className="min-h-[80px]">
                            <h3 className="text-xl md:text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-tight uppercase font-exo">
                                {currentQuestion.question}
                            </h3>
                        </div>

                        <div className="flex flex-col gap-3">
                            {currentQuestion.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(opt.value)}
                                    className="p-5 rounded-3xl border-2 border-slate-200 dark:border-white/10 hover:border-accent hover:bg-accent/5 flex items-center gap-4 transition-all group text-left"
                                >
                                    <div className="size-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center font-black group-hover:bg-accent group-hover:text-white transition-colors">
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white uppercase tracking-widest">{opt.text}</span>
                                </button>
                            ))}
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
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Syncing */}
                {step === 3 && (
                    <motion.div
                        key="syncing-step"
                        className="py-16 text-center"
                    >
                        <div className="relative size-24 mx-auto mb-10">
                            <motion.div 
                                className="absolute inset-0 border-2 border-t-accent border-transparent rounded-full font-mono text-[10px] text-accent flex items-center justify-center"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                                {Math.floor(Math.random()*100)}%
                            </motion.div>
                        </div>
                        <h2 className="text-lg font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white animate-pulse italic font-exo">ANALYZING_CORE_INSTINCT</h2>
                        <p className="mt-4 text-[9px] text-slate-400 tracking-[0.2em] font-mono uppercase">Mapping Neural Origin...</p>
                    </motion.div>
                )}

                {/* Step 4: Handshake / Final Reveal */}
                {step === 4 && (
                    <motion.div
                        key="handshake-step"
                        className="text-center space-y-8 py-10"
                    >
                        {!handshakeComplete ? (
                            <div className="space-y-8 max-w-sm mx-auto">
                                <div className="size-20 bg-accent/5 rounded-full flex items-center justify-center mx-auto text-accent border border-accent/20 animate-pulse relative">
                                    <Brain size={32} />
                                    <div className="absolute inset-0 size-20 rounded-full border-t-2 border-accent animate-spin" />
                                </div>
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black text-accent uppercase tracking-[0.4em] font-mono animate-pulse">Ready_For_Handshake</div>
                                    <h2 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase font-exo">Establish Neural Synergy</h2>
                                    <p className="text-[9px] text-slate-400 tracking-[0.2em] font-mono leading-relaxed uppercase">The archetype foundation is ready. Finalize your link to unlock Level 1 clearance.</p>
                                </div>

                                <div className="bg-black/20 p-4 rounded-xl border border-white/5 font-mono text-[8px] text-accent/60 space-y-1 text-left min-h-[100px]">
                                    {handshakeLog.map((log, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <span>&gt;&gt;</span>
                                            <span>{log}</span>
                                        </div>
                                    ))}
                                </div>

                                {!isSyncing && handshakeLog.length === 0 && (
                                    <button 
                                        onClick={handleHandshake}
                                        className="w-full py-5 rounded-[2rem] bg-accent text-white font-black text-[10px] uppercase tracking-[0.5em] shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        INITIALIZE_HANDSHAKE
                                    </button>
                                )}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-10"
                            >
                                <div className="space-y-4">
                                    <div className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.6em] font-mono">SYSTEM_AWAKENED</div>
                                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-slate-900 dark:text-white font-exo italic">
                                        {results?.rpg?.path}
                                    </h1>
                                    <p className="max-w-md mx-auto text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-[0.1em] italic">
                                        Your core path has been stabilized. You are officially recognized as a specialist with Level 1 clearance within the Produs collective.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                                    <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
                                        <span className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest block">Status</span>
                                        <span className="text-xl font-black italic text-emerald-500 font-exo">LEVEL 1</span>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
                                        <span className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest block">Clearance</span>
                                        <span className="text-xl font-black italic text-emerald-500 font-exo">ACTIVE</span>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="w-full max-w-sm py-6 rounded-[2.5rem] bg-slate-900 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.5em] shadow-2xl hover:bg-emerald-500 hover:text-white transition-all group"
                                >
                                    BEGIN_JOURNEY
                                </button>
                            </motion.div>
                        )}
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
