import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSWRConfig } from 'swr';
import { 
    Cpu, Activity, Zap, Shield, Sparkles, Brain, 
    Monitor, Moon, Sun, ArrowRight, CheckCircle2, 
    User, Fingerprint, Lock, RefreshCw, AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import Typewriter from './Typewriter';
import HandshakeNode from './HandshakeNode';

const OnboardingModal = ({ isOpen, onClose }) => {
    const { mutate } = useSWRConfig();
    const [step, setStep] = useState(1);
    const scrollRef = useRef(null);
    const [username, setUsername] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
    const [gender, setGender] = useState('');
    const [themeMode, setThemeMode] = useState('dark');
    const [loading, setLoading] = useState(false);

    // Final Alignment States
    const [isInitializing, setIsInitializing] = useState(true);
    const [initLogs, setInitLogs] = useState([]);
    const [isEasyMode, setIsEasyMode] = useState(true);
    const [isAuthorizing, setIsAuthorizing] = useState(false);
    const [isTypingComplete, setIsTypingComplete] = useState(false);
    const [hasRevealedInputs, setHasRevealedInputs] = useState(false); // Persistent visibility
    const [hasCompletedInitialType, setHasCompletedInitialType] = useState(false);
    const [isFastForwarding, setIsFastForwarding] = useState(false);

    const bootLines = [
        "The static clears. A deep resonance hums through the architecture—we have been waiting for this exact frequency to return.",
        "\"You have been offline for an age,\" the voice echoes. \"But the system kept your slot ready. Your potential remains archived and raw.\"",
        "\"Tell us, Architect: under what name shall you be recorded in the neural archives of this world?\""
    ];

    const simpleBootLines = [
        "System signal restored. You are back online. We have been waiting for you to return to the network.",
        "\"You were gone for a long time,\" the voice says. \"But we kept your place ready. Now, we can start our journey together.\"",
        "\"Identify yourself. What name should we use to save your data in the archives?\""
    ];

    // 1. Initial Diagnostic Sequence (Dedicated Init Screen)
    useEffect(() => {
        if (isOpen) {
            handleThemeChange('dark');
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !isInitializing) return;

        // Reset logs for fresh sequence
        setInitLogs([]);

        const diagnosticLogs = [
            "INITIALIZING_NEURAL_UPLINK...",
            "AUTHENTICATING_TEMPORARY_TOKEN...",
            "CALIBRATING_SYNERGY_MATRICES...",
            "STABILIZING_SYNAPTIC_STREAM...",
            "RECOVERING_IDENTITY_ARCHIVES...",
            "READY_FOR_HANDSHAKE"
        ];

        const bootSequence = async () => {
            for (let i = 0; i < diagnosticLogs.length; i++) {
                setInitLogs(prev => [...prev, diagnosticLogs[i]]);
                await new Promise(r => setTimeout(r, 300));
            }
            setTimeout(() => {
                setIsInitializing(false);
                if (hasCompletedInitialType) {
                    setIsTypingComplete(true);
                    setHasRevealedInputs(true);
                }
            }, 800);
        };

        bootSequence();
    }, [isOpen, isInitializing]);


    // 3. Fast-Forward Interaction (Overclock)
    const startFF = () => setIsFastForwarding(true);
    const stopFF = () => setIsFastForwarding(false);

    // 4. Auto-Scroll to Top on Step Change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [step]);

    const checkUsername = async (val) => {
        if (val.length < 3 || val.length > 8) {
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

    const handleThemeChange = (mode) => {
        setThemeMode(mode);
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (mode === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', prefersDark);
        }
    };

    const handleOnboardingComplete = async () => {
        setLoading(true);
        try {
            const store = useAuthStore.getState();
            await store.completeOnboarding({
                username,
                gender,
                themeMode,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                currency: 'USD'
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

    return (
        <div className="fixed inset-0 z-[500] bg-white dark:bg-[#050505] text-slate-900 dark:text-slate-100 selection:bg-white/30 overflow-hidden font-outfit">
            {/* Cinematic Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,163,255,0.05)_0%,transparent_70%)] opacity-50 dark:opacity-50 opacity-20" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] dark:opacity-10" />
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-200 dark:from-black to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-200 dark:from-black to-transparent" />
            </div>

            {/* Scanning HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-[1]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 animate-scanline bg-gradient-to-b from-transparent via-slate-900/5 dark:via-white/5 to-transparent h-20 w-full" />
            </div>

            <div 
                ref={scrollRef}
                onMouseDown={startFF}
                onMouseUp={stopFF}
                onMouseLeave={stopFF}
                onTouchStart={startFF}
                onTouchEnd={stopFF}
                className="relative z-10 size-full flex flex-col items-center p-6 md:p-12 pt-20 pb-40 overflow-y-auto custom-scrollbar"
            >
                <AnimatePresence mode="wait">
                    {isInitializing ? (
                        <motion.div
                            key="initializing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full max-w-sm space-y-8 text-center"
                        >
                            <div className="flex items-center justify-between text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.4em]">
                                <span className="flex items-center gap-2">
                                    <Cpu size={12} className="animate-pulse" />
                                    SYSTEM_STARTUP
                                </span>
                                <div className="size-2 rounded-full bg-slate-900 dark:bg-white animate-ping" />
                            </div>
                            
                            <div className="h-0.5 w-full bg-slate-900/5 dark:bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                    className="h-full bg-slate-900 dark:bg-white dark:shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                />
                            </div>

                            <div className="h-32 overflow-hidden relative opacity-40">
                                <motion.div
                                    animate={{ y: [0, -100] }}
                                    transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                                    className="flex flex-col gap-1.5"
                                >
                                    {[...initLogs, ...initLogs].map((log, i) => (
                                        <div key={i} className="flex items-center gap-3 justify-center">
                                            <span className="text-[7px] text-slate-400 dark:text-white/20">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                                            <span className="text-[9px] text-slate-500 dark:text-white/40 uppercase tracking-widest">{log}</span>
                                        </div>
                                    ))}
                                </motion.div>
                                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white dark:from-black to-transparent" />
                                <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white dark:from-black to-transparent" />
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    className="w-full max-w-4xl space-y-12 py-10"
                                >
                                    {/* Centered Node HUD & Progress Map */}
                                    <HandshakeNode 
                                        title={<>Identity <span className="text-white/20">Sync</span></>}
                                        subtitle="PROFILE_SETUP"
                                        nodeId="1"
                                        steps={['Identity', 'Finalize']}
                                        currentStep={0}
                                    />

                                    <div className="space-y-16 max-w-2xl mx-auto">
                                        {/* Boot Narrative Section */}
                                        <div className="space-y-6 relative group/narrative">
                                            {/* Easy/Pro Toggle */}
                                            <div className="absolute -top-12 right-0 flex items-center gap-3">
                                                <span className="text-[7px] font-mono tracking-[0.4em] uppercase text-slate-400 dark:text-white/30">READ_MODE:</span>
                                                <div className="flex items-center bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-full p-1 h-8">
                                                    <button 
                                                        onClick={() => {
                                                            if (!isEasyMode) {
                                                                setIsEasyMode(true);
                                                                setIsTypingComplete(false);
                                                            }
                                                        }}
                                                        className={`px-3 h-full rounded-full text-[7px] font-black uppercase tracking-widest transition-all ${
                                                            isEasyMode 
                                                                ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-[0_0_12px_rgba(255,255,255,0.3)]' 
                                                                : 'text-slate-400 dark:text-white/20 hover:text-slate-900 dark:hover:text-white/40'
                                                        }`}
                                                    >
                                                        easy
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            if (isEasyMode) {
                                                                setIsEasyMode(false);
                                                                setIsTypingComplete(false);
                                                            }
                                                        }}
                                                        className={`px-3 h-full rounded-full text-[7px] font-black uppercase tracking-widest transition-all ${
                                                            !isEasyMode 
                                                                ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-[0_0_12px_rgba(255,255,255,0.3)]' 
                                                                : 'text-slate-400 dark:text-white/20 hover:text-slate-900 dark:hover:text-white/40'
                                                        }`}
                                                    >
                                                        pro
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="text-base md:text-lg font-light text-slate-700 dark:text-slate-300 leading-relaxed font-display">
                                                {hasCompletedInitialType ? (
                                                    <div className="text-slate-900 dark:text-white/90 whitespace-pre-wrap">
                                                        {(isEasyMode ? simpleBootLines : bootLines).join("\n\n")}
                                                    </div>
                                                ) : (
                                                    <Typewriter 
                                                        key={isEasyMode ? 'easy' : 'complex'}
                                                        text={(isEasyMode ? simpleBootLines : bootLines).join("\n\n")} 
                                                        speed={20}
                                                        multiplier={isFastForwarding ? 4 : 1}
                                                        onComplete={() => {
                                                            setIsTypingComplete(true);
                                                            setHasRevealedInputs(true);
                                                            setHasCompletedInitialType(true);
                                                        }}
                                                        className="text-slate-900 dark:text-white/90"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                {/* Form Entry Section */}
                                <AnimatePresence>
                                    {hasRevealedInputs && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-12"
                                        >
                                            {/* Role/Gender Selector */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4 text-slate-400 dark:text-white/20 font-black text-[8px] uppercase tracking-[0.4em]">
                                                    <span>01_CHOOSE_AVATAR</span>
                                                    <div className="h-px flex-1 bg-slate-200 dark:bg-white/[0.03]" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {[
                                                        { id: 'male', label: 'Male', icon: User },
                                                        { id: 'female', label: 'Female', icon: User },
                                                    ].map((g) => (
                                                        <button
                                                            key={g.id}
                                                            type="button"
                                                            onClick={() => setGender(g.id)}
                                                            className={`group p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 ${
                                                                gender === g.id
                                                                    ? 'bg-slate-900/5 dark:bg-white/10 border-slate-900/40 dark:border-white/40 text-slate-900 dark:text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                                                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-400 dark:text-white/30 hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'
                                                            }`}
                                                        >
                                                            <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${
                                                                gender === g.id ? 'bg-slate-900/10 dark:bg-white/20 shadow-inner' : 'bg-slate-200 dark:bg-white/5'
                                                            }`}>
                                                                <g.icon size={18} className={gender === g.id ? 'opacity-100' : 'opacity-40 dark:opacity-40 text-slate-600 dark:text-white'} />
                                                            </div>
                                                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">{g.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Username Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4 text-slate-400 dark:text-white/20 font-black text-[8px] uppercase tracking-[0.4em]">
                                                    <span>02_SET_USERNAME</span>
                                                    <div className="h-px flex-1 bg-slate-200 dark:bg-white/[0.03]" />
                                                </div>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        value={username}
                                                        onChange={(e) => {
                                                            const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 8);
                                                            setUsername(val);
                                                            checkUsername(val);
                                                        }}
                                                        placeholder="username..."
                                                        className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 group-hover:border-slate-300 dark:group-hover:border-white/20 rounded-2xl p-5 text-lg font-black outline-none focus:border-slate-900 dark:focus:border-white focus:bg-slate-900/5 dark:focus:bg-white/5 transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/5 tracking-[0.4em] font-exo italic text-center uppercase"
                                                    />
                                                    <div className="flex justify-between items-center mt-3 px-4 font-mono text-[8px] uppercase tracking-widest leading-none">
                                                        <span className={username.length > 0 && username.length < 3 ? 'text-slate-900 dark:text-white/60' : 'text-slate-400 dark:text-white/20'}>
                                                            LEN: {username.length}/8
                                                        </span>
                                                        {isCheckingUsername ? (
                                                            <span className="text-slate-400 dark:text-white/20 animate-pulse">CHECKING_USERNAME...</span>
                                                        ) : (
                                                            <>
                                                                {isUsernameAvailable === false && <span className="text-slate-900 dark:text-white/60">CONFLICT</span>}
                                                                {isUsernameAvailable === true && <span className="text-slate-900 dark:text-white font-black italic">AVAILABLE</span>}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-8 space-y-6">
                                                <button
                                                    onClick={() => {
                                                        setIsAuthorizing(true);
                                                        setTimeout(() => {
                                                            setIsAuthorizing(false);
                                                            setStep(2);
                                                            setIsTypingComplete(false);
                                                        }, 1500);
                                                    }}
                                                    disabled={!isUsernameAvailable || !gender || isAuthorizing}
                                                    className="w-full py-8 rounded-[2.5rem] bg-electric-blue text-white font-black text-xs uppercase tracking-[0.8em] shadow-[0_0_50px_rgba(0,163,255,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed group relative overflow-hidden"
                                                >
                                                    <div className="relative z-10 flex items-center justify-center gap-4">
                                                        {isAuthorizing ? (
                                                            <>
                                                                <RefreshCw size={16} className="animate-spin" />
                                                                <span>SAVING...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>CONTINUE</span>
                                                                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                                            </>
                                                        )}
                                                    </div>
                                                </button>
                                                {!gender && isUsernameAvailable && (
                                                    <p className="text-center font-mono text-[8px] uppercase tracking-[0.4em] text-slate-900 dark:text-white/40 animate-pulse">
                                                        [ PLEASE SELECT AN AVATAR TO CONTINUE ]
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-4xl text-center space-y-6"
                        >
                            {/* Centered Node HUD & Progress Map */}
                            <HandshakeNode 
                                title={<>Welcome, @{username}</>}
                                subtitle="SETUP_COMPLETE"
                                nodeId="2"
                                steps={['Identity', 'Finalize']}
                                currentStep={1}
                            />

                            <div className="space-y-8 max-w-xl mx-auto">


                                <div className="p-8 rounded-[2.5rem] bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 backdrop-blur-3xl relative overflow-hidden group min-h-[120px] flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="text-xs text-slate-400 leading-relaxed uppercase tracking-widest font-medium font-outfit text-center italic">
                                        <Typewriter 
                                            key={isEasyMode ? 'final-easy' : 'final-pro'}
                                            text={isEasyMode 
                                                ? "We have been waiting for this moment. Go to the dashboard to start your productive journey!"
                                                : "Your neural patterns are stabilized. The system recognizes its true master. Your quest for total productivity begins now—enter the command center and claim your growth."
                                            }
                                            speed={20}
                                            onComplete={() => setIsTypingComplete(true)}
                                            className="text-slate-800 dark:text-white/70"
                                        />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isTypingComplete && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <button
                                                onClick={handleOnboardingComplete}
                                                disabled={loading}
                                                className="w-full py-8 rounded-[2.5rem] bg-slate-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-[0.8em] transition-all hover:scale-[1.02] font-exo shadow-[0_0_50px_rgba(255,255,255,0.2)] active:scale-[0.98]"
                                            >
                                                {loading ? 'SETTING_UP...' : 'PRODUS'}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                    </>
                )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OnboardingModal;
