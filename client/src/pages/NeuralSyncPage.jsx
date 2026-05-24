import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { Activity, Cpu, Database } from 'lucide-react';
import Typewriter from '../components/ui/Typewriter';

// Modular Components
import DiagnosticLoader from '../components/rpg/neural-sync/DiagnosticLoader';
import HandshakeLoading from '../components/rpg/neural-sync/HandshakeLoading';
import HandshakeResult from '../components/rpg/neural-sync/HandshakeResult';
import SyncSuccessView from '../components/rpg/neural-sync/SyncSuccessView';
import SyncErrorView from '../components/rpg/neural-sync/SyncErrorView';


/**
 * Removed local Typewriter - using shared component from ui/
 */

const NeuralSyncPage = () => {
    const { user, syncUser, setNeuralSyncDismissed } = useAuthStore();

    const navigate = useNavigate();
    const location = useLocation();

    
    // Refs (Top Level)
    const scrollContainerRef = useRef(null);
    const interactionTimeoutRef = useRef(null);

    // State
    const [isInitializing, setIsInitializing] = useState(true);
    const [sessionHistory, setSessionHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isTypingComplete, setIsTypingComplete] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [isHandshaking, setIsHandshaking] = useState(false);
    const [handshakeLog, setHandshakeLog] = useState([]);
    const [handshakeComplete, setHandshakeComplete] = useState(false);
    const [finalPathData, setFinalPathData] = useState(null);
    const [logs, setLogs] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [pendingSyncData, setPendingSyncData] = useState(null);
    const [isPostTypingComplete, setIsPostTypingComplete] = useState(false);
    const [areOptionsTypingComplete, setAreOptionsTypingComplete] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const [syncError, setSyncError] = useState(null);
    const [showHUD, setShowHUD] = useState(true);
    const [prefetchedNode, setPrefetchedNode] = useState(null);
    const [isFastForwarding, setIsFastForwarding] = useState(false);
    const lastScrollY = useRef(0);
    const hasScrolledToBottomRef = useRef(false);
    const hasBootedRef = useRef(false);

    // 1. Initial Diagnostic Boot Sequence & History Retrieval
    useEffect(() => {
        if (hasBootedRef.current) return;
        hasBootedRef.current = true;
        const diagnosticLogs = [
            "INITIALIZING_UPLINK...",
            "AUTHENTICATING_USER_ID: " + user?._id?.slice(-8),
            "CALIBRATING_NEURAL_FREQUENCY...",
            "STABILIZING_SYNAPTIC_STREAM...",
            "MAPPING_DASHBOARD_VECTORS...",
            "READY_FOR_SYNCHRONIZATION"
        ];

        const addLog = (text) => {
            setLogs(prev => [...prev, { text, timestamp: new Date().toLocaleTimeString() }]);
        };

        const bootSequence = async () => {
            // Speed diagnostic logs
            for (let i = 0; i < diagnosticLogs.length; i++) {
                addLog(diagnosticLogs[i]);
                await new Promise(r => setTimeout(r, 200));
            }

            // --- IMMEDIATE INITIALIZATION ---
            if (!user?.rpg?.path) {
                try {
                    addLog("INITIALIZING_BACKEND_SESSION...");
                    const { data } = await api.post('/rpg/initiate-awakening');
                    syncUser(data.rpg);
                    addLog("SESSION_ESTABLISHED");
                } catch (err) {
                    console.error("Backend initialization failed", err);
                    addLog("ERROR: SESSION_FAILURE");
                }
            }

            // Fetch History
            let historicalNodes = [];
            try {
                addLog("RECOVERING_NEURAL_ARCHIVES...");
                const { data: history } = await api.get('/rpg/narrative-history');
                historicalNodes = history.map(h => ({
                    questionId: h.questionId,
                    story: h.story,
                    question: h.question,
                    options: h.options || [], 
                    section: h.section
                }));
            } catch (err) {
                console.warn("Failed to recover narrative archives", err);
            }

            // --- CRITICAL: FETCH FIRST QUESTION BEFORE ENDING INITIALIZATION ---
            // Re-check user state after potential syncUser
            const currentUser = useAuthStore.getState().user;
            if (currentUser?.rpg?.pendingQuestions?.length > 0) {
                const qId = currentUser.rpg.pendingQuestions[0];
                const alreadyFetched = historicalNodes.find(q => String(q.questionId) === String(qId));
                
                if (!alreadyFetched) {
                    try {
                        addLog("FETCHING_INITIAL_QUERY...");
                        const { data } = await api.get(`/rpg/narrative/${qId}`);
                        historicalNodes = [...historicalNodes, data];
                    } catch (error) {
                        console.error("Failed to fetch first narrative question", error);
                    }
                }
            }

            // Final State Sync
            if (historicalNodes.length > 0) {
                setSessionHistory(historicalNodes);
                setHistoryIndex(historicalNodes.length - 1);
            }

            addLog("BOOT_COMPLETE // SYSTEM_READY");
            setTimeout(() => setIsInitializing(false), 800);
        };

        bootSequence();
    }, [user?._id, user?.rpg?.pendingQuestions]);

    // 2. Continuous Sync (for subsequent questions)
    useEffect(() => {
        if (!isInitializing && user?.rpg?.pendingQuestions?.length > 0 && !successData) {
            const fetchNextQuestion = async () => {
                const qId = user.rpg.pendingQuestions[0];
                const existsInHistory = sessionHistory.find(q => String(q.questionId) === String(qId));
                
                if (existsInHistory) {
                    const idx = sessionHistory.findIndex(q => String(q.questionId) === String(qId));
                    if (historyIndex !== idx) setHistoryIndex(idx);
                    setIsTransitioning(false);
                    return;
                }

                try {
                    const { data } = await api.get(`/rpg/narrative/${qId}`);
                    setSessionHistory(prev => {
                        const exists = prev.find(q => q.questionId === data.questionId);
                        if (!exists) {
                            const newHistory = [...prev, data];
                            setHistoryIndex(newHistory.length - 1);
                            setIsTransitioning(false);
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
            fetchNextQuestion();
        } else if (!isInitializing && !user?.rpg?.pendingQuestions?.length && !successData && !handshakeComplete) {
            const hasAnyProgress = (user?.rpg?.completedAnswers?.length ?? 0) > 0;
            if (hasAnyProgress) {
                navigate('/dashboard');
            } else {
                const redirectTimer = setTimeout(() => {
                    if (!useAuthStore.getState().user?.rpg?.pendingQuestions?.length) {
                        navigate('/dashboard');
                    }
                }, 3000); 
                return () => clearTimeout(redirectTimer);
            }
        }
    }, [isInitializing, user?.rpg?.pendingQuestions, navigate, successData, handshakeComplete, sessionHistory, historyIndex]);

    const currentQuestion = sessionHistory[historyIndex];
    const archivedAnswer = user?.rpg?.completedAnswers?.find(ans => ans.id === currentQuestion?.questionId);

    // 4. Reset all interaction states when switching questions
    useEffect(() => {
        setSelectedOption(null);
        setPendingSyncData(null);
        setIsTypingComplete(false);
        setIsPostTypingComplete(false);
        setAreOptionsTypingComplete(false);
        setSyncError(null);
        hasScrolledToBottomRef.current = false; // Reset for new question
        // Do NOT clear prefetchedNode here, handleProceed will manage it
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


    const startFF = () => setIsFastForwarding(true);
    const stopFF = () => setIsFastForwarding(false);

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
            }, 3000); 
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('wheel', handleInteraction, { passive: true });
        window.addEventListener('touchmove', handleInteraction, { passive: true });
        window.addEventListener('keydown', handleInteraction, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('wheel', handleInteraction);
            window.removeEventListener('touchmove', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
        };
    }, []);

    // 4. Auto-Scroll Logic during Typing & Reveal
    useEffect(() => {
        if (!isInitializing && currentQuestion && !isUserInteracting && !isHandshaking) {
            // Scroll during: 
            // 1. Initial story reveal
            // 2. Options reveal (simultaneous typing)
            // 3. Post-choice feedback reveal
            // 4. Briefly after typing completes to ensure options are visible
            const isAnyTyping = !isTypingComplete || (!areOptionsTypingComplete && !selectedOption) || (selectedOption && !isPostTypingComplete);
            
            if (isAnyTyping) {
                const scrollInterval = setInterval(() => {
                    const scrollTarget = document.documentElement.scrollHeight - window.innerHeight + 100;
                    window.scrollTo({
                        top: scrollTarget,
                        behavior: isFastForwarding ? 'auto' : 'smooth'
                    });
                }, isFastForwarding ? 25 : 100);
                return () => clearInterval(scrollInterval);
            }

            // One final scroll check when story typing completes to ensure options are seen
            // ONLY RUN ONCE per question reveal to avoid fighting user manual scroll
            if (isTypingComplete && !selectedOption && !hasScrolledToBottomRef.current) {
                const timer = setTimeout(() => {
                    if (hasScrolledToBottomRef.current) return;
                    window.scrollTo({
                        top: document.documentElement.scrollHeight,
                        behavior: 'smooth'
                    });
                    hasScrolledToBottomRef.current = true;
                }, 100);
                return () => clearTimeout(timer);
            }
        }
    }, [isTypingComplete, isInitializing, currentQuestion, isUserInteracting, selectedOption, isPostTypingComplete]);

    const handlePrev = () => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            // State will be restored by the useEffect
            setSelectedOption(null);
            setIsPostTypingComplete(false);
            setAreOptionsTypingComplete(false);
            setIsFastForwarding(false); // Reset overclock on transition
        }
    };

    const handleNext = () => {
        if (historyIndex < sessionHistory.length - 1) {
            setHistoryIndex(prev => prev + 1);
            setIsPostTypingComplete(false);
            setAreOptionsTypingComplete(false);
            setIsFastForwarding(false); // Reset overclock on transition
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

            // Pre-fetch next node immediately in background
            const nextId = data.rpg?.pendingQuestions?.[0];
            if (nextId) {
                api.get(`/rpg/narrative/${nextId}`)
                    .then(res => setPrefetchedNode(res.data))
                    .catch(err => console.warn("Background pre-fetch failed", err));
            }
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
            // Hard refresh removed - letting state re-sync naturally via navigation
            navigate('/dashboard'); 
        } catch (err) {
            console.error("Failed to recalibrate", err);
        }
    };

    const handleProceed = useCallback(() => {
        if (!pendingSyncData) return;
        
        const nextId = pendingSyncData.rpg?.pendingQuestions?.[0];
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
            if (user?.level === 0) {
                setIsHandshaking(true);
            } else {
                syncUser(pendingSyncData);
                navigate('/dashboard');
            }
            setSelectedOption(null);
            setPendingSyncData(null);
            setIsPostTypingComplete(false);
            return;
        }

        // --- OPTIMIZED TRANSITION ---
        // If we already have the pre-fetched data, push it to history instantly bypass re-fetch
        if (prefetchedNode && String(prefetchedNode.questionId) === String(nextId)) {
            setSessionHistory(prev => {
                const exists = prev.find(q => q.questionId === prefetchedNode.questionId);
                if (!exists) return [...prev, prefetchedNode];
                return prev;
            });
            setHistoryIndex(sessionHistory.length); // Next index will be length
            setPrefetchedNode(null); // Clear buffer
            setIsTypingComplete(false);
            setIsPostTypingComplete(false);
            setAreOptionsTypingComplete(false);
            setIsFastForwarding(false); // Reset overclock on transition
            setSelectedOption(null);
            setPendingSyncData(null);
            syncUser(pendingSyncData);
            // No need for isTransitioning(true) as it's instant
            return;
        }

        setIsFastForwarding(false); // Reset overclock on transition
        setIsTransitioning(true); // Fallback to normal fetch if pre-fetch isn't ready
        syncUser(pendingSyncData);
        
        // Clear reveal states
        setSelectedOption(null);
        setPendingSyncData(null);
        setIsPostTypingComplete(false);
    }, [pendingSyncData, syncUser, prefetchedNode, sessionHistory.length, navigate, user?.level]);

    const handleHandshake = async () => {
        setIsHandshaking(true);
        setIsSubmitting(true);
        const logs = [
            "INITIATING_FINAL_SYNERGY...",
            "BYPASSING_IDENTITY_ENCRYPTION...",
            "SYNCHRONIZING_CORE_INSTINCTS...",
            "NEURAL_HANDSHAKE_ESTABLISHED.",
            "UPLINK_STABILIZED.",
            "ASSIGNING_PATH_VECTORS...",
            "GRANTING_LEVEL_1_CLEARANCE."
        ];
        
        // Play out the logs
        for(let i = 0; i < logs.length; i++) {
            setHandshakeLog(prev => [...prev, logs[i]]);
            await new Promise(r => setTimeout(r, 400));
        }

        try {
            const { data } = await api.post('/auth/finalize-awakening');
            setFinalPathData(data);
            syncUser(data);
            setHandshakeComplete(true);
            setIsSubmitting(false);
        } catch (error) {
            console.error("Handshake failed", error);
            setIsSubmitting(false);
        }
    };

    const handleTerminate = () => {
        setNeuralSyncDismissed(true);
        navigate('/dashboard');
    };

    if (isInitializing) {
        return <DiagnosticLoader logs={logs} />;
    }

    return (
        <div className="min-h-screen w-screen bg-dark-mode-image text-slate-100 selection:bg-rose-500/30 overflow-x-hidden pt-6 pb-20 relative">
            {/* Cinematic Overlay Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,163,255,0.05)_0%,transparent_70%)]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            </div>


            <div className="max-w-3xl mx-auto px-6 relative z-10" ref={scrollContainerRef}>
                <AnimatePresence mode="wait">
                    {isHandshaking ? (
                        <motion.div
                            key="handshake"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center text-center space-y-12 pt-4"
                        >
                            {!handshakeComplete ? (
                                <HandshakeLoading 
                                    handshakeLog={handshakeLog}
                                    isSubmitting={isSubmitting}
                                    onHandshake={handleHandshake}
                                />
                            ) : (
                                <HandshakeResult 
                                    finalPathData={finalPathData}
                                    onBegin={handleTerminate}
                                />
                            )}                        </motion.div>
                    ) : successData ? (
                        <SyncSuccessView 
                            successData={successData}
                            currentLevel={user?.level}
                            onReturn={handleTerminate}
                        />
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
                                            multiplier={isFastForwarding ? 4 : 1}
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
                                                            multiplier={isFastForwarding ? 4 : 1}
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
                                                <SyncErrorView 
                                                    syncError={syncError}
                                                    onRecalibrate={handleRecalibrate}
                                                />
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
                                                            onClick={
                                                                archivedAnswer 
                                                                    ? handleNext 
                                                                    : (currentQuestion?.questionId?.startsWith('4.') ? handleHandshake : handleProceed)
                                                            }
                                                            className="w-fit text-lg md:text-xl font-black text-white hover:text-rose-500 transition-all font-display italic uppercase tracking-tighter flex items-center gap-4 group"
                                                        >
                                                            <span>{(!archivedAnswer && currentQuestion?.questionId?.startsWith('4.')) ? 'FINISH' : 'NXT'}</span>
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
                                                <AnimatePresence>
                                                    {isTypingComplete && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                                            className="flex flex-col gap-4"
                                                        >
                                                            <div className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.4em] mb-2 font-mono ml-1 underline decoration-rose-500/20 underline-offset-8">CHOOSE</div>
                                                            <div className="flex flex-col gap-6">
                                                                {currentQuestion.options.map((option, index) => (
                                                                    <motion.button
                                                                        key={index}
                                                                        whileHover={{ x: 5 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => handleChoice(option)}
                                                                        disabled={isSubmitting}
                                                                        className="relative w-fit text-left text-lg md:text-xl font-medium text-slate-400 hover:text-white transition-all font-display flex items-center group"
                                                                    >
                                                                        <span className="absolute -left-8 opacity-0 group-hover:opacity-100 transition-all text-rose-500 font-mono text-sm group-hover:translate-x-2">/</span>
                                                                        {archivedAnswer ? (
                                                                            <span>{option.text}</span>
                                                                        ) : (
                                                                            <Typewriter 
                                                                                text={option.text} 
                                                                                speed={15}
                                                                                multiplier={isFastForwarding ? 4 : 1}
                                                                                onComplete={() => {
                                                                                    // Since they type simultaneously, we only care when the last one finishes
                                                                                    // but for simplicity, the autoscroll logic uses areOptionsTypingComplete.
                                                                                    // We'll set it here; multiple calls won't hurt.
                                                                                    if (index === currentQuestion.options.length - 1) {
                                                                                        setAreOptionsTypingComplete(true);
                                                                                    }
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </motion.button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
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

            {/* Fast Forward Controls & HUD */}
            <AnimatePresence>
                {(isFastForwarding || (!isTypingComplete || (selectedOption && !isPostTypingComplete))) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 right-8 z-[110] flex flex-col items-end gap-4"
                    >
                        {/* Overclock Button acting as the primary indicator */}
                        {!isTypingComplete || (selectedOption && !isPostTypingComplete) ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onMouseDown={startFF}
                                onMouseUp={stopFF}
                                onTouchStart={startFF}
                                onTouchEnd={stopFF}
                                onMouseLeave={stopFF}
                                className={`px-6 py-3 rounded-2xl border font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center gap-4 shadow-2xl backdrop-blur-xl group ${
                                    isFastForwarding 
                                    ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_50px_rgba(244,63,94,0.4)]' 
                                    : 'bg-black/40 border-white/10 text-white/40 hover:text-white hover:border-white/20'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Cpu size={14} className={isFastForwarding ? 'animate-spin' : ''} />
                                    {isFastForwarding && (
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3].map(i => (
                                                <motion.div 
                                                    key={i}
                                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                                    className="w-1 h-2 bg-white rounded-full"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-80">
                                    {isFastForwarding ? 'FAST_FORWARDING...' : 'HOLD_TO_FAST_FORWARD'}
                                </span>
                            </motion.button>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NeuralSyncPage;
