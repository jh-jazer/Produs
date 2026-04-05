import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { Zap, Shield, Database, Cpu, Activity, LogOut, ChevronDown, AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Typewriter Component - Animates text character by character for cinematic feel.
 */
const Typewriter = ({ text, speed = 25, onComplete }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        setDisplayedText("");
        setIsComplete(false);
        let i = 0;
        let timeoutId;

        const type = () => {
            if (i < text.length) {
                setDisplayedText(text.slice(0, i + 1));
                i++;
                timeoutId = setTimeout(type, speed);
            } else {
                setIsComplete(true);
                if (onComplete) onComplete();
            }
        };

        timeoutId = setTimeout(type, speed);
        return () => clearTimeout(timeoutId);
    }, [text, speed]);

    return (
        <span className="leading-relaxed whitespace-pre-wrap">
            {displayedText}
            {!isComplete && (
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-1 h-4 ml-1 bg-electric-blue align-middle"
                />
            )}
        </span>
    );
};

const NeuralSyncPage = () => {
    const { user, syncUser, setNeuralSyncDismissed } = useAuthStore();
    const navigate = useNavigate();
    
    // Refs (Top Level)
    const scrollContainerRef = useRef(null);
    const interactionTimeoutRef = useRef(null);
    const autoProceedTimeoutRef = useRef(null);

    // State
    const [isInitializing, setIsInitializing] = useState(true);
    const [sessionHistory, setSessionHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isTypingComplete, setIsTypingComplete] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [logs, setLogs] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [pendingSyncData, setPendingSyncData] = useState(null);
    const [isPostTypingComplete, setIsPostTypingComplete] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const [syncError, setSyncError] = useState(null);
    const [showHUD, setShowHUD] = useState(true);
    const lastScrollY = useRef(0);

    // 1. Initial Diagnostic Boot Sequence
    useEffect(() => {
        const diagnosticLogs = [
            "INITIALIZING_UPLINK...",
            "AUTHENTICATING_USER_ID: " + user?._id?.slice(-8),
            "CALIBRATING_NEURAL_FREQUENCY...",
            "STABILIZING_SYNAPTIC_STREAM...",
            "MAPPING_DASHBOARD_VECTORS...",
            "READY_FOR_SYNCHRONIZATION"
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < diagnosticLogs.length) {
                setLogs(prev => [...prev, diagnosticLogs[i]]);
                i++;
            } else {
                clearInterval(interval);
                setTimeout(() => setIsInitializing(false), 1200);
            }
        }, 300);

        return () => clearInterval(interval);
    }, [user?._id]);

    // 2. Load Question Data & Update History
    useEffect(() => {
        if (!isInitializing && user?.rpg?.pendingQuestions?.length > 0) {
            const fetchQuestion = async () => {
                try {
                    const qId = user.rpg.pendingQuestions[0];
                    const { data } = await api.get(`/rpg/narrative/${qId}`);
                    
                    setSessionHistory(prev => {
                        const exists = prev.find(q => q.questionId === data.questionId);
                        if (!exists) {
                            const newHistory = [...prev, data];
                            setHistoryIndex(newHistory.length - 1);
                            setIsTransitioning(false); // Clear transition when ready
                            return newHistory;
                        }
                        return prev;
                    });
                    
                    setIsTypingComplete(false);
                } catch (error) {
                    console.error("Failed to fetch narrative question", error);
                    navigate('/dashboard');
                }
            };
            fetchQuestion();
        } else if (!isInitializing && !user?.rpg?.pendingQuestions?.length && !successData) {
            navigate('/dashboard');
        }
    }, [isInitializing, user?.rpg?.pendingQuestions, navigate, successData]);

    const currentQuestion = sessionHistory[historyIndex];
    const archivedAnswer = user?.rpg?.completedAnswers?.find(ans => ans.id === currentQuestion?.questionId);

    // 3. Reset all interaction states when switching questions
    useEffect(() => {
        setSelectedOption(null);
        setPendingSyncData(null);
        setIsTypingComplete(false);
        setIsPostTypingComplete(false);
        setSyncError(null);
    }, [currentQuestion?.questionId]);

    // 4. Restore state for archived nodes
    useEffect(() => {
        if (currentQuestion && archivedAnswer) {
            const preservedOption = currentQuestion.options.find(opt => opt.value === archivedAnswer.value);
            if (preservedOption) {
                setSelectedOption(preservedOption);
                setIsTypingComplete(true);
                setIsPostTypingComplete(true);
            }
        }
    }, [currentQuestion, archivedAnswer]);

    // 3. User Interaction Monitoring & HUD Visibility
    useEffect(() => {
        const handleScroll = () => {
            // HUD Visibility Logic
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setShowHUD(false);
            } else {
                setShowHUD(true);
            }
            lastScrollY.current = currentScrollY;
        };

        const handleInteraction = () => {
            setIsUserInteracting(true);
            if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
            interactionTimeoutRef.current = setTimeout(() => {
                setIsUserInteracting(false);
            }, 3000); // 3 seconds of peace before resuming auto-scroll
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('scroll', handleInteraction, { passive: true });
        window.addEventListener('wheel', handleInteraction, { passive: true });
        window.addEventListener('touchmove', handleInteraction, { passive: true });
        window.addEventListener('mousedown', handleInteraction, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('wheel', handleInteraction);
            window.removeEventListener('touchmove', handleInteraction);
            window.removeEventListener('mousedown', handleInteraction);
            if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
        };
    }, []);

    // 4. Auto-Scroll Logic during Typing
    useEffect(() => {
        if (!isTypingComplete && !isInitializing && currentQuestion && !isUserInteracting) {
            const scrollInterval = setInterval(() => {
                window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: 'smooth'
                });
            }, 200);
            
            return () => clearInterval(scrollInterval);
        }
    }, [isTypingComplete, isInitializing, currentQuestion, isUserInteracting]);

    const handlePrev = () => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            // State will be restored by the useEffect
            setSelectedOption(null);
            setPendingSyncData(null);
            setIsTypingComplete(false); 
            setIsPostTypingComplete(false);
        }
    };

    const handleNext = () => {
        if (historyIndex < sessionHistory.length - 1) {
            setHistoryIndex(prev => prev + 1);
            setSelectedOption(null);
            setPendingSyncData(null);
            setIsTypingComplete(false);
            setIsPostTypingComplete(false);
        }
    };

    const handleChoice = async (choice) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setSyncError(null);

        try {
            const { data } = await api.post('/rpg/sync-neural', {
                questionId: currentQuestion.questionId,
                value: choice.value
            });
            
            // Buffer the data and show the result
            setPendingSyncData(data);
            setSelectedOption(choice);
            setIsPostTypingComplete(false);
            setIsSubmitting(false);
        } catch (error) {
            console.error("Neural sync selection failed", error);
            setIsSubmitting(false);
            if (error.response?.status === 400 || error.response?.status === 404) {
                setSyncError("SYNAPTIC_STATE_MISMATCH_DETECTED");
            }
        }
    };

    const handleRecalibrate = async () => {
        try {
            await api.post('/rpg/initiate-awakening');
            window.location.reload();
        } catch (err) {
            console.error("Failed to recalibrate", err);
        }
    };

    const handleProceed = useCallback(() => {
        if (!pendingSyncData) return;
        
        // Clear any automatic timers
        if (autoProceedTimeoutRef.current) {
            clearTimeout(autoProceedTimeoutRef.current);
            autoProceedTimeoutRef.current = null;
        }

        // Check for "Neural Fracture" (Orphaned Link)
        // If there's no pendingQuestions, and the server says it didn't find the next node
        // but a nextId was calculated/attempted, it's an orphan bug, not completion.
        const cleanNextId = pendingSyncData.debug?.cleanNextId;
        const foundNext = pendingSyncData.debug?.foundNext;
        const hasPending = pendingSyncData.rpg?.pendingQuestions?.length > 0;

        if (!hasPending && cleanNextId && !foundNext) {
            setSyncError({
                type: 'SYNAPTIC_FRACTURE',
                target: cleanNextId,
                message: `Coordinate mismatch in neural sector. Targeted sync point [${cleanNextId}] is offline.`
            });
            return;
        }

        // If actual final question (legit completion)
        if (!hasPending && !cleanNextId) {
            setSuccessData(pendingSyncData);
            setSelectedOption(null);
            setPendingSyncData(null);
            setIsPostTypingComplete(false);
            return;
        }

        setIsTransitioning(true); // Initiate transition
        syncUser(pendingSyncData);
        
        // Clear reveal states
        setSelectedOption(null);
        setPendingSyncData(null);
        setIsPostTypingComplete(false);
    }, [pendingSyncData, syncUser]);

    // 5. Automatic Transition after Post-Choice Typing
    useEffect(() => {
        if (isPostTypingComplete && selectedOption && pendingSyncData) {
            // Set 3 second timer for automatic proceed
            autoProceedTimeoutRef.current = setTimeout(() => {
                handleProceed();
            }, 3000);
        }

        return () => {
            if (autoProceedTimeoutRef.current) {
                clearTimeout(autoProceedTimeoutRef.current);
                autoProceedTimeoutRef.current = null;
            }
        };
    }, [isPostTypingComplete, selectedOption, pendingSyncData, handleProceed]);

    const handleTerminate = () => {
        setNeuralSyncDismissed(true);
        navigate('/dashboard');
    };

    if (isInitializing) {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[500] font-mono">
                <div className="w-80 space-y-6">
                    <div className="flex items-center justify-between text-[10px] font-black text-electric-blue uppercase tracking-[0.4em]">
                        <span className="flex items-center gap-2">
                            <Cpu size={12} className="animate-pulse" />
                            DIAGNOSTIC_RUNNING
                        </span>
                        <div className="size-2 rounded-full bg-electric-blue animate-ping" />
                    </div>
                    
                    <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            className="h-full bg-electric-blue shadow-[0_0_15px_rgba(0,163,255,0.5)]"
                        />
                    </div>

                    <div className="h-32 overflow-hidden relative">
                        <motion.div
                            animate={{ y: [0, -100] }}
                            transition={{ duration: 2, ease: "linear" }}
                            className="flex flex-col gap-1.5"
                        >
                            {[...logs, ...logs].map((log, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-[7px] text-white/20">[{new Date().toLocaleTimeString()}]</span>
                                    <span className="text-[9px] text-white/40 uppercase tracking-widest">{log}</span>
                                </div>
                            ))}
                        </motion.div>
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black to-transparent" />
                        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black to-transparent" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-screen bg-[#050505] text-slate-100 selection:bg-rose-500/30 overflow-x-hidden pt-20 pb-40 relative">
            {/* Cinematic Overlay Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,163,255,0.05)_0%,transparent_70%)]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            </div>

            {/* Neural Progress HUD (Floating) */}
            <motion.div
                initial={{ y: 0, opacity: 1, x: "-50%" }}
                animate={{
                    y: showHUD ? 0 : -100,
                    opacity: showHUD ? 1 : 0
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="fixed top-8 left-1/2 z-50 flex flex-col items-center gap-2"
            >
                <div className="flex items-center gap-4 px-6 py-3 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl">
                    <div className="flex items-center gap-3 pr-4 border-r border-white/10">
                        <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 font-mono">UPLINK_STABLE</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 font-mono">SYNC_DEPTH:</span>
                        <span className="text-[10px] font-black text-rose-500 font-mono italic">
                            {(user?.rpg?.completedAnswers?.length || 0) * 5}%
                        </span>
                    </div>
                </div>
                <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="h-px w-32 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"
                />
            </motion.div>

            <div className="max-w-3xl mx-auto px-6 relative z-10" ref={scrollContainerRef}>
                <AnimatePresence mode="wait">
                    {successData ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            className="flex flex-col items-center text-center space-y-12 py-20"
                        >
                            <div className="size-24 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                <Zap size={40} />
                            </div>
                            
                            <div className="space-y-4">
                                <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white font-exo">SYNCHRONIZATION_COMPLETE</h1>
                                <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-xs max-w-sm mx-auto leading-loose">
                                    Your neural patterns have been permanently archived. The archetype foundation is expanding.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block">Level Gain</span>
                                    <span className="text-2xl font-black italic text-rose-500 font-exo">+{successData.level - (user?.level || 1)} LVL</span>
                                </div>
                                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block">Synapse Status</span>
                                    <span className="text-xl font-black italic text-emerald-500 font-exo">ALIGNED</span>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleTerminate}
                                className="w-full py-6 rounded-[2rem] bg-white text-black font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-3 group"
                            >
                                <LogOut size={16} />
                                <span>RETURN_TO_DASHBOARD</span>
                            </motion.button>
                        </motion.div>
                    ) : currentQuestion ? (
                        <motion.div
                            key={currentQuestion.questionId}
                            initial={archivedAnswer ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-24"
                        >
                            {/* Narrative Section */}
                            <div className="space-y-6">
                                {/* Cinematic Chapter Title */}
                                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 pt-10 pb-8 border-b border-white/5">
                                        <div className="flex-1 text-center order-1 md:order-2">
                                            <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter italic text-white font-exo mb-2 select-none">
                                                {currentQuestion?.title || currentQuestion?.section}
                                            </h1>
                                            <div className="flex items-center justify-center gap-4 text-white/20">
                                                <div className="h-px w-10 bg-rose-500" />
                                                <span className="text-[9px] font-mono tracking-[0.6em] uppercase">
                                                    NODE_{currentQuestion?.questionId || '0.0'}
                                                </span>
                                                <div className="h-px w-10 bg-rose-500" />
                                            </div>
                                        </div>

                                        {/* Navigation Buttons */}
                                        <div className="flex items-center gap-4 order-2 md:contents">
                                            <button
                                                disabled={historyIndex <= 0}
                                                onClick={handlePrev}
                                                className="size-10 rounded-2xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all font-black text-2xl md:order-1"
                                            >
                                                <span className="mb-1 leading-none">&lt;</span>
                                            </button>

                                            <button
                                                disabled={historyIndex >= sessionHistory.length - 1}
                                                onClick={handleNext}
                                                className="size-10 rounded-2xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all font-black text-2xl md:order-3"
                                            >
                                                <span className="mb-1 leading-none">&gt;</span>
                                            </button>
                                        </div>
                                    </div>

                                <div className="text-lg md:text-xl font-medium text-slate-300 leading-[1.8] space-y-8 font-display">
                                    {archivedAnswer ? (
                                        <div className="">
                                            {currentQuestion?.story}
                                        </div>
                                    ) : (
                                        <Typewriter 
                                            text={currentQuestion?.story || ""} 
                                            speed={12}
                                            onComplete={() => setIsTypingComplete(true)} 
                                        />
                                    )}

                                    {/* Choice Continuity Reveal */}
                                    <AnimatePresence>
                                        {selectedOption && (
                                            <motion.div 
                                                initial={archivedAnswer ? false : { opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="pt-4 border-t border-white/5 space-y-6"
                                            >
                                                <div className="text-rose-500 font-mono text-sm uppercase tracking-widest flex items-center gap-3">
                                                    <div className="size-1 bg-rose-500 animate-pulse" />
                                                    PATH_SELECTED: {selectedOption.text}
                                                </div>
                                                {selectedOption.postText && (
                                                    archivedAnswer ? (
                                                        <div className="">
                                                            {selectedOption.postText}
                                                        </div>
                                                    ) : (
                                                        <Typewriter 
                                                            text={selectedOption.postText} 
                                                            speed={15}
                                                            onComplete={() => setIsPostTypingComplete(true)}
                                                        />
                                                    )
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Interaction: Pure Text Choices */}
                            <AnimatePresence>
                                {isTypingComplete && (
                                    <motion.div
                                        initial={archivedAnswer ? false : { opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6 pt-4"
                                    >
                                        <div className="flex flex-col gap-6">
                                            {syncError ? (
                                                <div className="pt-12 space-y-6">
                                                    <div className="p-8 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 text-rose-500 space-y-6 relative overflow-hidden backdrop-blur-xl">
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-10 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500 animate-pulse">
                                                                <AlertTriangle size={20} />
                                                            </div>
                                                            <div>
                                                                <div className="font-mono text-[10px] uppercase tracking-[0.4em] opacity-60">
                                                                    {syncError.type || 'NEURAL_ERROR'}
                                                                </div>
                                                                <div className="font-display italic font-black uppercase tracking-tighter text-lg">
                                                                    {syncError.type === 'SYNAPTIC_FRACTURE' ? 'Neural Link Fracture' : 'Synaptic State Mismatch'}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <p className="text-sm font-medium leading-relaxed opacity-90 font-mono tracking-tight">
                                                                {syncError.message || `A mismatch occurred during sequence synchronization with node 1.0.`}
                                                            </p>
                                                            
                                                            {syncError.target && (
                                                                <div className="flex items-center gap-3 py-3 px-4 bg-black/40 rounded-xl border border-rose-500/20">
                                                                    <div className="size-2 rounded-full bg-rose-500 animate-ping" />
                                                                    <span className="text-[10px] font-black font-mono uppercase tracking-widest opacity-60">Missing Coordinate:</span>
                                                                    <span className="text-xs font-black font-mono text-white tracking-widest">[{syncError.target}]</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="pt-4 border-t border-rose-500/10">
                                                            <p className="text-[9px] font-bold opacity-40 uppercase tracking-[0.3em] leading-relaxed">
                                                                // RECALIBRATION_REQUIRED: Stability lost in the narrative stream. Reset to previous sector to restore link.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={handleRecalibrate}
                                                        className="w-full py-5 rounded-[1.5rem] bg-rose-500 text-white font-black text-xs uppercase tracking-[0.4em] shadow-[0_0_40px_rgba(244,63,94,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                                                    >
                                                        <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
                                                        <span>RE-CALIBRATE NEURAL LINK</span>
                                                    </button>
                                                </div>
                                            ) : isTransitioning ? (
                                                <div className="pt-12 flex items-center gap-4 text-white/20 animate-pulse">
                                                    <Database size={16} />
                                                    <span className="text-xs font-mono tracking-[0.5em] uppercase">FETCHING_NEXT_SYNAPSE...</span>
                                                </div>
                                            ) : selectedOption ? (
                                                <motion.div 
                                                    initial={archivedAnswer ? false : { opacity: 0 }}
                                                    animate={{ opacity: (isPostTypingComplete || !selectedOption.postText || archivedAnswer) ? 1 : 0 }}
                                                    className="pt-12"
                                                >
                                                    {/* Show NXT if not archived, OR if archived but there are more questions in history */}
                                                    {(!archivedAnswer || historyIndex < sessionHistory.length - 1) && (
                                                        <button 
                                                            onClick={archivedAnswer ? handleNext : handleProceed}
                                                            className="w-fit text-lg md:text-xl font-black text-white hover:text-rose-500 transition-all font-display italic uppercase tracking-tighter flex items-center gap-4 group"
                                                        >
                                                            <span>NXT</span>
                                                            <div className="size-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-rose-500 group-hover:translate-x-2 transition-all">
                                                                <span className="text-xs">&gt;</span>
                                                            </div>
                                                        </button>
                                                    )}
                                                </motion.div>
                                            ) : historyIndex < sessionHistory.length - 1 ? (
                                                <div className="space-y-4 pt-12">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="size-1 bg-white/20" />
                                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] font-mono">SYNC_COMMITTED</span>
                                                    </div>
                                                    <div className="text-slate-400 font-medium italic opacity-60">
                                                        The neural path for this chapter has been permanently archived. Use the navigation to return to the active sync.
                                                    </div>
                                                </div>
                                            ) : (
                                                currentQuestion.options.map((option, index) => (
                                                    <motion.button
                                                        key={index}
                                                        whileHover={{ x: 5 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => handleChoice(option)}
                                                        disabled={isSubmitting}
                                                        className="relative w-fit text-left text-lg md:text-xl font-medium text-slate-400 hover:text-white transition-all font-display flex items-center group"
                                                    >
                                                        <span className="absolute -left-8 opacity-0 group-hover:opacity-100 transition-all text-rose-500 font-mono text-sm group-hover:translate-x-2">/</span>
                                                        {option.text}
                                                    </motion.button>
                                                ))
                                            )}
                                        </div>

                                        <div className="flex flex-col items-center pt-24 text-white/5 font-mono text-[9px] uppercase tracking-[0.4em]">
                                            // SESSION_PROGRESS_AUTO_ARCHIVED
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <div className="py-40 flex flex-col items-center gap-6 text-white/20">
                            <Activity className="animate-spin-slow" />
                            <span className="text-xs font-mono tracking-[0.5em]">RECONSTRUCTING_STREAM...</span>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Top-Left Exit Control */}
            <div className="fixed top-8 left-8 z-[100]">
                <button 
                    onClick={handleTerminate}
                    className="flex items-center gap-3 group text-white/20 hover:text-white transition-all font-mono text-[10px] uppercase tracking-[0.4em]"
                >
                    <div className="size-8 rounded-lg border border-white/5 flex items-center justify-center group-hover:border-white/20 group-hover:rotate-90 transition-all">
                        <span className="text-sm font-bold">×</span>
                    </div>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">Exit_Link</span>
                </button>
            </div>

            {/* Tactical Frame Elements */}
            <div className="fixed inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent" />
            <div className="fixed inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent" />
            <div className="fixed bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
    );
};

export default NeuralSyncPage;
