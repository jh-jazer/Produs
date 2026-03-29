import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSWRConfig } from 'swr';
import { ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import SystemWindow from './SystemWindow';
import { ARCHETYPE_QUIZ, INTEREST_ORBS, ARCHETYPE_PROTOCOLS, calculateScores } from '../../constants/assessment';

const OnboardingModal = ({ isOpen, onClose }) => {
    const { mutate } = useSWRConfig();
    const [step, setStep] = useState(1);
    const [isShowingForm, setIsShowingForm] = useState(false);
    const [username, setUsername] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [interests, setInterests] = useState([]);
    const [isGlitching, setIsGlitching] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    
    // Neural Link States
    const [isBooting, setIsBooting] = useState(true);
    const [bootTextIndex, setBootTextIndex] = useState(0);
    const [isAuthorizing, setIsAuthorizing] = useState(false);

    const bootLines = [
        "System booting...",
        "Neural link established.",
        "Biometric signature detected.",
        "Identity remains unconfirmed.",
        "How shall you be recorded in the archives?"
    ];

    const [quizIndex, setQuizIndex] = useState(0);
    const [isSyncingResults, setIsSyncingResults] = useState(false);
    const [calculatedArchetype, setCalculatedArchetype] = useState(null);
    const [isDenied, setIsDenied] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showStats, setShowStats] = useState(false);

    // Shuffling removed as we use a fixed 1-5 Likert scale
    const quizOptions = [
        { label: "Strongly Disagree", score: 1, color: "rose-500" },
        { label: "Disagree", score: 2, color: "orange-400" },
        { label: "Neutral", score: 3, color: "neutral-400" },
        { label: "Agree", score: 4, color: "emerald-400" },
        { label: "Strongly Agree", score: 5, color: "cyan-400" }
    ];

    useEffect(() => {
        if (!isOpen) return;
        
        const clock = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);

        let timer;
        if (isBooting) {
            timer = setInterval(() => {
                setBootTextIndex(prev => {
                    if (prev < bootLines.length - 1) return prev + 1;
                    clearInterval(timer);
                    return prev;
                });
            }, 2500); 
        }
        return () => {
            clearInterval(clock);
            clearInterval(timer);
        };
    }, [isOpen, isBooting]);

    // Global Keydown for Navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            // Step 1: Identity Induction
            if (step === 1) {
                if (e.key === 'Enter' && isUsernameAvailable && !isCheckingUsername) {
                    e.preventDefault();
                    setStep(2);
                }
            }
            // Step 2: Confirmation
            else if (step === 2 && !isShowingForm && !isDenied) {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveIndex(0);
                } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveIndex(1);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (activeIndex === 0) {
                        setStep(3);
                        setIsShowingForm(true);
                    } else {
                        setIsDenied(true);
                    }
                }
            }
            // Step 3: Assessment (Likert Scale 1-5)
            else if (step === 3 && isShowingForm) {
                if (e.key >= '1' && e.key <= '5') {
                    e.preventDefault();
                    handleAnswer(parseInt(e.key));
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setActiveIndex(prev => (prev - 1 + 5) % 5);
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setActiveIndex(prev => (prev + 1) % 5);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAnswer(quizOptions[activeIndex].score);
                }
            }
            // Step 4: Resolution (Go Back/Enter)
            else if (step === 4 && !isSyncingResults) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setShowStats(true);
                } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
                    e.preventDefault();
                    if (showStats) {
                        if (e.key === 'ArrowLeft' || e.key === 'Enter') setShowStats(false);
                    } else {
                        handleOnboardingComplete();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [step, isShowingForm, isOpen, activeIndex, isDenied, showStats, quizAnswers, quizIndex]);

    const handleAnswer = (score) => {
        const next = [...quizAnswers, { id: ARCHETYPE_QUIZ[quizIndex].id, score }];
        if (quizIndex < ARCHETYPE_QUIZ.length - 1) {
            setQuizAnswers(next);
            setQuizIndex(quizIndex + 1);
            setActiveIndex(2); // Reset focus to Neutral (index 2)
        } else {
            setQuizAnswers(next);
            setIsSyncingResults(true);
            setStep(4);
            setTimeout(() => {
                setCalculatedArchetype(calculateWeightedArchetype(next));
                setIsSyncingResults(false);
            }, 2500);
        }
    };

    const checkUsername = async (val) => {
        if (val.length < 3) {
            setIsUsernameAvailable(null);
            return;
        }
        setIsCheckingUsername(true);
        try {
            const { data } = await api.get(`/auth/check-username?username=${val}`);
            setIsUsernameAvailable(data.available);
        } catch (err) {
            console.error('Username check failed:', err);
        } finally {
            setIsCheckingUsername(false);
        }
    };

    const calculateWeightedArchetype = (finalAnswers = quizAnswers) => {
        const stats = calculateScores(finalAnswers);
        const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
        const primary = sorted[0][0];
        const secondary = sorted[1][0];

        // Exhaustive Stat Vector Mapping
        switch (primary) {
            case 'str':
                if (secondary === 'dex') return 'Blade Dancer';
                if (secondary === 'end') return 'Sentinel';
                if (secondary === 'cha') return 'Commander';
                return 'Sentinel';
            case 'dex':
                if (secondary === 'str') return 'Blade Dancer';
                if (secondary === 'int') return 'Architect';
                if (secondary === 'end') return 'Shadow Monk';
                return 'Architect';
            case 'int':
                if (secondary === 'wis') return 'Alchemist';
                if (secondary === 'dex') return 'Architect';
                if (secondary === 'cha') return 'Bard';
                return 'Alchemist';
            case 'wis':
                if (secondary === 'end') return stats.str < 10 ? 'Oracle' : 'Druid';
                if (secondary === 'dex') return 'Shadow Monk';
                if (secondary === 'int') return 'Alchemist';
                return 'Oracle';
            case 'cha':
                if (secondary === 'str') return 'Commander';
                if (secondary === 'int') return 'Bard';
                if (secondary === 'wis') return 'Oracle';
                return 'Commander';
            case 'end':
                if (secondary === 'str') return 'Sentinel';
                if (secondary === 'wis') return 'Druid';
                if (secondary === 'cha') return 'Commander';
                return 'Sentinel';
            default:
                return 'Blade Dancer'; 
        }
    };

    const handleOnboardingComplete = async () => {
        setLoading(true);
        try {
            const archetype = calculateWeightedArchetype();
            const archetypeData = ARCHETYPE_PROTOCOLS[archetype] || ARCHETYPE_PROTOCOLS['None'];
            const channels = archetypeData.channels || [];
            
            const store = useAuthStore.getState();
            await store.completeOnboarding({ 
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, 
                currency: 'USD',
                username, 
                archetype,
                perk: archetypeData.perk,
                statMultipliers: archetypeData.multipliers,
                subscriptions: channels,
                interests,
            });
            
            mutate('/auth/me');
            if (onClose) onClose();
        } catch (error) {
            console.error('Onboarding update failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    if (isBooting) {
        return (
            <div className="fixed inset-0 z-[250] bg-black flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden font-outfit">
                <div className="w-full max-w-4xl text-center relative flex justify-center">
                    <AnimatePresence mode="wait">
                        <SystemWindow 
                            key={bootTextIndex}
                            status={bootTextIndex < bootLines.length - 1 ? "ANALYZING" : "ID_CORE"}
                            module={bootTextIndex < bootLines.length - 1 ? "SYS_BOOT" : "ID_SIG"}
                            className="w-full max-w-2xl"
                        >
                            <div className="min-h-[100px] flex flex-col justify-start pt-4">
                                {bootTextIndex < bootLines.length - 1 ? (
                                    <motion.p
                                        key={bootTextIndex}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="text-2xl md:text-3xl font-black text-white italic tracking-tighter font-exo drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                                    >
                                        {bootLines[bootTextIndex]}
                                    </motion.p>
                                ) : (
                                    <motion.div
                                        key="final-step"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-4 -mt-2"
                                    >
                                        <p className="text-xl md:text-2xl font-black text-white tracking-tighter font-exo italic">
                                            {bootLines[bootLines.length - 1]}
                                        </p>
                                        
                                        <div className="space-y-4 max-w-sm mx-auto">
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => {
                                                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                                                    setUsername(val);
                                                    checkUsername(val);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && isUsernameAvailable && !isCheckingUsername && !isAuthorizing) {
                                                        const btn = document.getElementById('authorize-btn');
                                                        if (btn) btn.click();
                                                    }
                                                }}
                                                autoFocus
                                                placeholder="IDENT_REQUIRED"
                                                className="w-full bg-transparent border-b-2 border-cyan-400/30 px-0 py-4 text-xl font-black outline-none focus:border-cyan-400 transition-all text-cyan-400 placeholder:text-cyan-400/10 tracking-[0.4em] font-mono text-center uppercase"
                                            />
                                            <div className="flex flex-col items-center gap-4">
                                                <button
                                                    id="authorize-btn"
                                                    onClick={() => { 
                                                        setIsAuthorizing(true);
                                                        setIsGlitching(true);
                                                        setTimeout(() => {
                                                            setIsAuthorizing(false);
                                                            setIsGlitching(false);
                                                            setIsBooting(false); 
                                                            setStep(2); 
                                                            setIsShowingForm(false); 
                                                        }, 1200);
                                                    }}
                                                    disabled={!isUsernameAvailable || isCheckingUsername || isAuthorizing}
                                                    className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-600 disabled:from-neutral-800 disabled:to-neutral-900 text-white font-black uppercase tracking-[1em] text-[10px] hover:scale-[1.02] focus:scale-[1.02] cursor-pointer transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] font-exo relative group overflow-hidden focus:outline-none"
                                                >
                                                    <span className="relative z-10">{isAuthorizing ? 'Authorizing...' : 'Enter'}</span>
                                                </button>
                                                {isUsernameAvailable === false && (
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 animate-pulse font-mono">[ ERROR: IDENT_UNAVAILABLE ]</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </SystemWindow>
                    </AnimatePresence>
                </div>
                
                <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black overflow-y-auto bg-grid font-outfit">
            <div className="w-full max-w-6xl h-full flex flex-col items-center justify-center p-8 md:p-12 relative">
                
                

                <AnimatePresence mode="wait">
                    {/* Phase 2: Neural Alignment */}
                    {step === 2 && (
                        <div key="step2" className="w-full flex justify-center">
                            {!isShowingForm ? (
                                isDenied ? (
                                    <SystemWindow 
                                        title="NEURAL_DENIED"
                                        subtitle="CONNECTION_TERMINATED"
                                        variant="danger"
                                        className="w-full max-w-md"
                                    >
                                        <div className="space-y-6">
                                            <p className="text-red-500/80 font-mono text-xs leading-relaxed tracking-wider uppercase">
                                                SORRY BUT THIS SYSTEM DOESNT ALLOW GOING BACK, YOU HAVE TO PUSH THROUGH.
                                            </p>
                                            <button 
                                                onClick={() => setIsDenied(false)}
                                                className="w-full py-3 border border-red-500/30 bg-red-500/10 text-red-500 font-black italic uppercase tracking-[0.3em] hover:bg-red-500/20 transition-all cursor-pointer font-exo text-[10px]"
                                            >
                                                RETRY_CONNECTION
                                            </button>
                                        </div>
                                    </SystemWindow>
                                ) : (
                                    <SystemWindow 
                                        title="SYSTEM AWAKENING"
                                        subtitle={`PROTOCOL_AXION // USER: ${username}`}
                                        status="ID_AUTHENTICATED"
                                        className="max-w-xl text-center"
                                    >
                                        <div className="space-y-6">
                                            <p className="text-lg text-neutral-400 max-w-md mx-auto leading-relaxed uppercase tracking-[0.2em] font-medium font-exo">
                                                CERTAIN CONDITIONS HAVE BEEN MET.
                                                <br />
                                                <span className="text-[10px] font-bold opacity-60 font-outfit normal-case italic">To optimize your reality, we must calibrate your frequencies.</span>
                                            </p>
                                            <div className="space-y-3">
                                                <p className="text-2xl md:text-3xl font-black text-white italic tracking-tighter mb-4 font-exo">INITIATE AWAKENING?</p>
                                                <div className="flex justify-center gap-8 font-black text-white px-8">
                                                    <button
                                                        onMouseEnter={() => setActiveIndex(0)}
                                                        onClick={() => { setStep(3); setIsShowingForm(true); }}
                                                        className={`flex-1 py-3 md:py-4 font-black text-[10px] uppercase tracking-[0.6em] transition-all cursor-pointer focus:outline-none font-exo ${activeIndex === 0 ? 'bg-gradient-to-r from-cyan-400 to-blue-600 shadow-[0_0_40px_rgba(34,211,238,0.4)] scale-105' : 'bg-white/5 opacity-40 hover:opacity-100 hover:scale-105'}`}
                                                    >
                                                        YES
                                                    </button>
                                                    <button 
                                                        onMouseEnter={() => setActiveIndex(1)}
                                                        onClick={() => setIsDenied(true)}
                                                        className={`flex-1 py-3 md:py-4 border font-black text-[10px] uppercase tracking-[0.6em] transition-all cursor-pointer focus:outline-none font-exo ${activeIndex === 1 ? 'border-red-500/40 text-red-500 bg-red-500/10 scale-105 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-white/10 text-white/30 hover:text-white hover:border-white'}`}
                                                    >
                                                        NO
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </SystemWindow>
                                )
                            ) : (
                                <SystemWindow 
                                    title="FREQ_SYNC_REDUX"
                                    subtitle="Align your primary focus frequencies"
                                    status="DATA_CAPTURE"
                                    className="w-full max-w-6xl"
                                >
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                                        {INTEREST_ORBS.map(orb => {
                                            const active = interests.includes(orb.id);
                                            const cardPolygon = 'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)';
                                            return (
                                                <button
                                                    key={orb.id}
                                                    onClick={() => active ? setInterests(interests.filter(i => i !== orb.id)) : interests.length < 3 && setInterests([...interests, orb.id])}
                                                    className={`relative p-8 flex flex-col items-center justify-center gap-4 transition-all duration-500 group border-l-4 ${active ? 'bg-gradient-to-br from-cyan-400 to-blue-600 border-white shadow-[0_0_40px_rgba(34,211,238,0.4)] scale-95' : 'bg-neutral-900/40 border-cyan-400/20 hover:border-cyan-400'}`}
                                                    style={{ clipPath: cardPolygon }}
                                                >
                                                    <div className={`size-14 flex items-center justify-center border ${active ? 'border-white bg-white/20' : 'border-white/10'}`} style={{ color: active ? 'white' : orb.color }}>
                                                        <span className="material-symbols-rounded text-3xl">{orb.icon}</span>
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] text-center ${active ? 'text-white' : 'text-neutral-400 group-hover:text-cyan-400'} font-exo`}>{orb.name}</span>
                                                    {active && <div className="absolute top-2 right-4 size-4 bg-white flex items-center justify-center"><span className="material-symbols-rounded text-black text-[10px] font-bold">check</span></div>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="flex gap-6 items-center mb-2">
                                            <div className="h-0.5 w-12 bg-cyan-400/30" />
                                            <p className="text-[10px] font-mono font-black uppercase tracking-[0.5em] text-cyan-400">CONSENSUS: {interests.length}/3</p>
                                            <div className="h-0.5 w-12 bg-cyan-400/30" />
                                        </div>
                                        <button
                                            onClick={() => { setStep(3); setIsShowingForm(false); }}
                                            disabled={interests.length !== 3}
                                            className="px-24 py-5 bg-white disabled:bg-white/10 text-black disabled:text-white/20 font-black text-xs uppercase tracking-[0.8em] transition-all font-exo"
                                        >
                                            Sync Frequencies
                                        </button>
                                    </div>
                                </SystemWindow>
                            )}
                        </div>
                    )}

                    {/* Phase 3: Cognitive Stress Test */}
                    {step === 3 && (
                        <div key="step3" className="w-full flex justify-center">
                            {!isShowingForm ? (
                                <SystemWindow 
                                    title="STRESS_PROTOCOL"
                                    subtitle="NEURAL VECTOR EVALUATION"
                                    status="ARMED"
                                    className="max-w-xl text-center"
                                >
                                    <div className="py-8 space-y-10">
                                        <p className="text-xl text-neutral-400 max-w-sm mx-auto leading-relaxed uppercase tracking-[0.2em] font-medium font-exo mb-12">
                                            Role identification required. Finalize neural mapping.
                                        </p>
                                        <button
                                            onClick={() => setIsShowingForm(true)}
                                            className="px-20 py-6 border-2 border-rose-600 bg-rose-600/10 text-rose-500 font-black text-xs uppercase tracking-[0.6em] transition-all hover:bg-rose-600 hover:text-white focus:bg-rose-600 focus:text-white font-exo animate-pulse cursor-pointer focus:outline-none"
                                        >
                                            Initiate Test
                                        </button>
                                    </div>
                                </SystemWindow>
                            ) : (
                                <SystemWindow 
                                    module="EVAL_SEQ"
                                    className="w-full max-w-4xl"
                                >
                                    <div className="space-y-4 md:space-y-6">
                                        {/* Progress Bar */}
                                        <div className="relative h-1 w-full bg-white/5 overflow-hidden">
                                            <motion.div 
                                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-blue-500"
                                                animate={{ width: `${((quizIndex + 1) / ARCHETYPE_QUIZ.length) * 100}%` }}
                                            />
                                        </div>

                                        <div className="space-y-4 md:space-y-6">
                                            <h3 className="text-xl md:text-2xl font-black italic tracking-tighter text-white leading-tight uppercase font-exo">
                                                {ARCHETYPE_QUIZ[quizIndex].question}
                                            </h3>

                                            <div className="grid grid-cols-5 gap-2 md:gap-4 pt-8">
                                                {quizOptions.map((opt, idx) => {
                                                    const isFocused = idx === activeIndex;
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onMouseEnter={() => setActiveIndex(idx)}
                                                            onClick={() => handleAnswer(opt.score)}
                                                            className={`flex flex-col items-center gap-3 transition-all group focus:outline-none ${isFocused ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
                                                        >
                                                            <div className={`size-12 md:size-16 rounded-2xl flex items-center justify-center border-2 transition-all ${isFocused ? `border-${opt.color} bg-${opt.color}/10 shadow-[0_0_20px_var(--${opt.color})]` : 'border-white/10'}`}>
                                                                <span className="text-xl font-black text-white">{opt.score}</span>
                                                            </div>
                                                            <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest text-center h-8 flex items-center ${isFocused ? `text-${opt.color}` : 'text-neutral-500'}`}>
                                                                {opt.label}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex justify-start pt-1 md:pt-2">
                                                {quizIndex > 0 && (
                                                    <button
                                                        onClick={() => {
                                                            setQuizIndex(quizIndex - 1);
                                                            setQuizAnswers(quizAnswers.slice(0, -1));
                                                        }}
                                                        className="flex items-center gap-2 text-[10px] font-mono text-cyan-400/40 hover:text-cyan-400 focus:text-cyan-400 transition-all cursor-pointer focus:outline-none uppercase tracking-[0.4em] group/back"
                                                    >
                                                        <ArrowLeft size={10} className="group-hover/back:-translate-x-1 transition-transform" />
                                                        <span>GO_BACK</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </SystemWindow>
                            )}
                        </div>
                    )}

                    {/* Phase 4: Resolution */}
                    {step === 4 && (
                        <div key="step4" className="w-full flex justify-center">
                            {isSyncingResults ? (
                                <SystemWindow title="SYNCHRONIZING" subtitle="FINALIZING ARCHETYPE MAPPING" status="SYNC_DATA" className="w-full max-w-lg text-center py-24">
                                    <div className="relative size-32 mx-auto mb-16">
                                        <motion.div 
                                            className="absolute inset-0 border-[4px] border-t-cyan-400 border-transparent"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            style={{ borderRadius: '50%' }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-cyan-400 animate-pulse">
                                            0x{Math.floor(Math.random()*1000).toString(16).toUpperCase()}
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-[0.6em] text-white animate-pulse italic font-exo">STABILIZING_CORE</h2>
                                </SystemWindow>
                            ) : (
                                <SystemWindow 
                                    title="SYSTEM AWAKENED"
                                    subtitle="Access Authorized // Neural Profile Revealed"
                                    status="VERIFIED"
                                    className="w-full max-w-5xl text-center"
                                >
                                    <div className="space-y-4 md:space-y-6">
                                        <AnimatePresence mode="wait">
                                            {!showStats ? (
                                                <motion.div 
                                                    key="reveal"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="space-y-6"
                                                >
                                                    <div className="space-y-3">
                                                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[0.4em] text-cyan-400 font-exo">
                                                            {calculatedArchetype}
                                                        </h2>
                                                        <div className="size-12 mx-auto border border-white/20 flex items-center justify-center text-white bg-white/5">
                                                            <span className="material-symbols-rounded text-2xl">{ARCHETYPE_PROTOCOLS[calculatedArchetype]?.icon || 'sensors'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="max-w-md mx-auto space-y-6">
                                                        <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest leading-relaxed">
                                                            [ {ARCHETYPE_PROTOCOLS[calculatedArchetype]?.flavor} ]
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <button
                                                                onClick={() => setShowStats(true)}
                                                                className="py-4 border border-cyan-400/20 text-cyan-400 font-black text-[9px] uppercase tracking-[0.4em] hover:bg-cyan-400/10 transition-all font-exo cursor-pointer focus:outline-none"
                                                            >
                                                                Profile Insight
                                                            </button>
                                                            <button
                                                                onClick={handleOnboardingComplete}
                                                                disabled={loading}
                                                                className="py-4 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-black text-[9px] uppercase tracking-[0.6em] transition-all hover:scale-[1.02] focus:scale-[1.02] font-exo cursor-pointer focus:outline-none"
                                                            >
                                                                {loading ? 'INITIALIZING...' : 'ENTER SYSTEM'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div 
                                                    key="stats"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="space-y-6 py-2"
                                                >
                                                    <div className="relative size-48 md:size-64 mx-auto flex items-center justify-center">
                                                        {/* Tactical SVG Radar */}
                                                        <svg viewBox="0 0 100 100" className="size-full overflow-visible">
                                                            <defs>
                                                                <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                                                                    <stop offset="100%" stopColor="#0066ff" stopOpacity="0.4" />
                                                                </linearGradient>
                                                            </defs>
                                                            {/* Grid Lines */}
                                                            {[0.2, 0.4, 0.6, 0.8, 1].map((r) => {
                                                                const pts = [0, 60, 120, 180, 240, 300].map(a => {
                                                                    const rad = (a * Math.PI) / 180;
                                                                    return `${50 + 50*r * Math.cos(rad)},${50 + 50*r * Math.sin(rad)}`;
                                                                }).join(' ');
                                                                return <polygon key={r} points={pts} fill="none" stroke="white" strokeWidth="0.1" strokeOpacity="0.1" />;
                                                            })}
                                                            {/* Axis */}
                                                            {[0, 60, 120, 180, 240, 300].map(a => {
                                                                const rad = (a * Math.PI) / 180;
                                                                return <line key={a} x1="50" y1="50" x2={50 + 50*Math.cos(rad)} y2={50 + 50*Math.sin(rad)} stroke="white" strokeWidth="0.1" strokeOpacity="0.2" />;
                                                            })}
                                                            {/* Data Area */}
                                                            {(() => {
                                                                const s = calculateScores(quizAnswers);
                                                                const max = 100; // New scale is percentage based
                                                                const labels = ['STR', 'DEX', 'END', 'INT', 'WIS', 'CHA'];
                                                                const keys = ['str', 'dex', 'end', 'int', 'wis', 'cha'];
                                                                const valPoints = keys.map((k, i) => {
                                                                    const r = (Math.min(s[k] || 1, max) / max) * 50;
                                                                    const rad = (i * 60 * Math.PI) / 180;
                                                                    return `${50 + r * Math.cos(rad)},${50 + r * Math.sin(rad)}`;
                                                                }).join(' ');
                                                                return (
                                                                    <>
                                                                        <polygon points={valPoints} fill="url(#radarGrad)" stroke="#22d3ee" strokeWidth="1" className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                                                                        {keys.map((k, i) => {
                                                                            const rad = (i * 60 * Math.PI) / 180;
                                                                            const x = 50 + 60 * Math.cos(rad);
                                                                            const y = 50 + 60 * Math.sin(rad);
                                                                            return (
                                                                                <text key={k} x={x} y={y} fill="white" fontSize="4" textAnchor="middle" className="font-mono opacity-60 uppercase">
                                                                                    {labels[i]}
                                                                                </text>
                                                                            );
                                                                        })}
                                                                    </>
                                                                );
                                                            })()}
                                                        </svg>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowStats(false)}
                                                        className="px-12 py-3 border border-white/10 text-white/40 font-black text-[9px] uppercase tracking-[0.4em] hover:text-white transition-all font-exo cursor-pointer focus:outline-none"
                                                    >
                                                        Go Back
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </SystemWindow>
                            )}
                        </div>
                    )}
                </AnimatePresence>

                {/* AR Grid Decoration */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-grid -z-20" />
            </div>
        </div>
    );
};

export default OnboardingModal;
