/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateMasteryRank } from '../../constants/assessment';
import SystemWindow from '../ui/SystemWindow';
import api from '../../services/api';
import { useSWRConfig } from 'swr';
import useAuthStore from '../../store/useAuthStore';
import { Zap, Brain, Sparkles, ChevronRight } from 'lucide-react';

const NeuralSyncModal = ({ isOpen, onClose }) => {
    const { user, syncUser } = useAuthStore();
    const { mutate } = useSWRConfig();
    const [isSyncing, setIsSyncing] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [syncComplete, setSyncComplete] = useState(false);
    const [evolutionData, setEvolutionData] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [diagnosticLogs, setDiagnosticLogs] = useState([]);

    const pendingIds = user?.rpg?.pendingQuestions || [];

    useEffect(() => {
        const fetchQuestion = async () => {
            if (pendingIds.length > 0 && !currentQuestion) {
                const nextId = pendingIds[0].toString();
                try {
                    const { data } = await api.get(`/rpg/narrative/${nextId}`);
                    setCurrentQuestion(data);
                } catch (error) {
                    console.error('Failed to fetch neural synapse:', error);
                }
            }
        };
        fetchQuestion();
    }, [pendingIds, currentQuestion]);

    // Diagnostic Sequence Effect
    useEffect(() => {
        if (isOpen && currentQuestion && isInitializing) {
            const logs = [
                "AUTHENTICATING_USER_UPLINK...",
                "ACCESSING_NEURAL_DATABASE_v4.2...",
                "CALIBRATING_SYNAPTIC_OVERFLOW...",
                "SYNCHRONIZING_ARCHETYPE_MARKERS...",
                "NEURAL_HANDSHAKE_ESTABLISHED.",
                "UPLINK_STABILIZED."
            ];
            
            let currentLog = 0;
            const interval = setInterval(() => {
                if (currentLog < logs.length) {
                    setDiagnosticLogs(prev => [...prev, logs[currentLog]]);
                    currentLog++;
                } else {
                    clearInterval(interval);
                    setTimeout(() => setIsInitializing(false), 800);
                }
            }, 300);

            return () => clearInterval(interval);
        }
    }, [isOpen, currentQuestion, isInitializing]);

    const Typewriter = ({ text, delay = 30, className = "" }) => {
        const [displayedText, setDisplayedText] = useState("");
        const [currentIndex, setCurrentIndex] = useState(0);

        useEffect(() => {
            if (currentIndex < text.length) {
                const timeout = setTimeout(() => {
                    setDisplayedText(prev => prev + text[currentIndex]);
                    setCurrentIndex(prev => prev + 1);
                }, delay);
                return () => clearTimeout(timeout);
            }
        }, [currentIndex, text, delay]);

        return <span className={className}>{displayedText}</span>;
    };

    const handleOptionSelect = (opt) => {
        if (opt.postText) {
            setSelectedOption(opt);
            setShowFeedback(true);
        } else {
            handleSync(opt.value);
        }
    };

    const handleSync = async (value) => {
        setIsSyncing(true);
        try {
            const { data } = await api.post('/rpg/sync-neural', { 
                questionId: currentQuestion.questionId, 
                value 
            });
            
            setEvolutionData(data);
            setIsSyncing(false);
            setSyncComplete(true);
            setShowFeedback(false);
            setSelectedOption(null);
            
            setTimeout(() => {
                if (data.pendingQuestions && data.pendingQuestions.length > 0) {
                    setSyncComplete(false);
                    setCurrentQuestion(null);
                } else {
                    onClose();
                }
                syncUser(data);
                mutate('/auth/me');
            }, 3000);

        } catch (error) {
            console.error('Neural Sync failed:', error);
            setIsSyncing(false);
        }
    };

    if (!isOpen || !currentQuestion) return null;

    return (
        <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 font-outfit">
            <div className="w-full max-w-2xl">
                <SystemWindow 
                    title="NEURAL_SYNC_AUTHORIZED" 
                    subtitle={`LEVEL ${user.level} SYNCHRONIZATION`}
                    status="UPLINK_ACTIVE"
                    onClose={onClose}
                >
                    <div className="flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest animate-pulse max-w-fit mx-auto">
                        <div className="size-1 bg-emerald-500 rounded-full" />
                        Neural State Saved
                    </div>
                    <AnimatePresence mode="wait">
                        {isInitializing ? (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="py-20 flex flex-col items-center justify-center gap-6"
                            >
                                <div className="relative">
                                    <div className="size-24 rounded-full border-4 border-accent/20 flex items-center justify-center animate-spin-slow">
                                        <Brain size={40} className="text-accent animate-pulse" />
                                    </div>
                                    <div className="absolute inset-0 size-24 rounded-full border-t-4 border-accent animate-spin" />
                                </div>
                                <div className="text-left w-64 h-32 overflow-hidden bg-black/20 p-4 rounded-xl border border-white/5 font-mono text-[9px] text-accent/60 space-y-1">
                                    {diagnosticLogs.map((log, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <span className="text-accent">&gt;&gt;</span>
                                            <span className={idx === diagnosticLogs.length - 1 ? "text-accent font-black animate-pulse" : ""}>
                                                {log}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Initializing_Sync_Protocol</p>
                            </motion.div>
                        ) : !syncComplete ? (
                            <motion.div
                                key="sync-question"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8 p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]">
                                            <Brain size={24} className="animate-pulse" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-accent uppercase tracking-[0.2em] font-mono mb-1">Pulse_Signal_Active</div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                SYNAPSE_{currentQuestion.questionId}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                        <div className="size-1 bg-accent rounded-full animate-ping" />
                                        Bitstream_{Math.floor(Math.random() * 1000)}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {currentQuestion.story && (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="bg-slate-100 dark:bg-[#000000] p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent pointer-events-none" />
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic z-10 relative">
                                                "<Typewriter text={currentQuestion.story} delay={15} />"
                                            </p>
                                        </motion.div>
                                    )}

                                    <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-tight uppercase font-exo">
                                        <Typewriter text={currentQuestion.question} delay={20} />
                                    </h3>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {!showFeedback ? (
                                        currentQuestion.options.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                disabled={isSyncing}
                                                onClick={() => handleOptionSelect(opt)}
                                                className="p-5 rounded-[1.5rem] border-2 border-slate-200 dark:border-white/10 hover:border-accent hover:bg-accent/5 flex items-center justify-between group transition-all text-left disabled:opacity-50"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="size-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center font-black group-hover:bg-accent group-hover:text-white transition-colors font-mono">
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white uppercase tracking-widest">{opt.text}</span>
                                                </div>
                                                <ChevronRight className="text-slate-300 dark:text-white/10 group-hover:text-accent group-hover:translate-x-1 transition-all" size={16} />
                                            </button>
                                        ))
                                    ) : (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-6"
                                        >
                                            <div className="bg-accent/5 border border-accent/20 p-8 rounded-[2rem] relative overflow-hidden">
                                                <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-accent/5 -rotate-12" />
                                                <div className="text-[10px] font-black text-accent uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <Zap size={10} /> Neural Feedback Received
                                                </div>
                                                <p className="text-base font-medium text-slate-700 dark:text-slate-200 leading-relaxed italic z-10 relative">
                                                    "{selectedOption.postText}"
                                                </p>
                                            </div>

                                            <div className="flex gap-4">
                                                <button 
                                                    onClick={() => setShowFeedback(false)}
                                                    className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
                                                >
                                                    Wait, Go Back
                                                </button>
                                                <button 
                                                    onClick={() => handleSync(selectedOption.value)}
                                                    disabled={isSyncing}
                                                    className="flex-[2] py-4 rounded-2xl bg-accent text-white font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(var(--accent-rgb),0.4)] flex items-center justify-center gap-2"
                                                >
                                                    Confirm Phase <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Fallback Exit Button */}
                                <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex justify-center">
                                    <button 
                                        onClick={onClose}
                                        className="h-12 px-10 rounded-2xl bg-white/5 hover:bg-rose-500/10 border-2 border-white/10 hover:border-rose-500/30 text-slate-500 hover:text-rose-500 font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center gap-3 group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-rose-500/5 group-hover:translate-x-full transition-transform duration-700 -skew-x-12" />
                                        <span className="material-symbols-outlined text-[16px]">power_settings_new</span>
                                        SAVE STATE & TERMINATE
                                        <span className="material-symbols-outlined text-[16px]">power_settings_new</span>
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="sync-success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 text-center space-y-6"
                            >
                                <div className="size-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                    <Sparkles size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase font-exo">Sync_Successful</h2>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em] font-mono">NEURAL_MAPPING_STABILIZED</p>
                                </div>

                                {evolutionData?.newRank && (
                                    <div className="px-6 py-4 bg-accent/10 border border-accent/20 rounded-2xl flex flex-col items-center gap-2 max-w-xs mx-auto">
                                        <span className="text-[9px] font-black text-accent uppercase tracking-widest">Promotion Achieved</span>
                                        <span className="text-4xl font-black text-white font-exo italic">RANK {evolutionData.newRank}</span>
                                    </div>
                                )}

                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse">
                                    Initializing next synapse...
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </SystemWindow>
            </div>
        </div>
    );
};

export default NeuralSyncModal;
