import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSWRConfig } from 'swr';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import SystemWindow from './SystemWindow';

const OnboardingModal = ({ isOpen, onClose }) => {
    const { mutate } = useSWRConfig();
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
    const [themeMode, setThemeMode] = useState('system');
    const [loading, setLoading] = useState(false);
    
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

    useEffect(() => {
        if (!isOpen) return;
        
        let timer;
        if (isBooting) {
            timer = setInterval(() => {
                setBootTextIndex(prev => {
                    if (prev < bootLines.length - 1) return prev + 1;
                    clearInterval(timer);
                    return prev;
                });
            }, 2000); 
        }
        return () => clearInterval(timer);
    }, [isOpen, isBooting]);

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
                                        className="text-2xl md:text-3xl font-black text-white italic tracking-tighter font-exo shadow-cyan-500/20 drop-shadow-lg"
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
                                                autoFocus
                                                placeholder="IDENT_REQUIRED"
                                                className="w-full bg-transparent border-b-2 border-cyan-400/30 px-0 py-4 text-xl font-black outline-none focus:border-cyan-400 transition-all text-cyan-400 placeholder:text-cyan-400/10 tracking-[0.4em] font-mono text-center uppercase"
                                            />
                                            <div className="flex flex-col items-center gap-4">
                                                <button
                                                    onClick={() => { 
                                                        setIsAuthorizing(true);
                                                        setTimeout(() => {
                                                            setIsAuthorizing(false);
                                                            setIsBooting(false); 
                                                            setStep(2); 
                                                        }, 1200);
                                                    }}
                                                    disabled={!isUsernameAvailable || isCheckingUsername || isAuthorizing}
                                                    className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-600 disabled:from-neutral-800 disabled:to-neutral-900 text-white font-black uppercase tracking-[1em] text-[10px] hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] font-exo"
                                                >
                                                    {isAuthorizing ? 'Authorizing...' : 'Enter'}
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
                <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-grid z-10" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black overflow-y-auto bg-grid font-outfit">
            <div className="w-full max-w-6xl h-full flex flex-col items-center justify-center p-8 md:p-12 relative">
                <AnimatePresence mode="wait">
                    {step === 2 && (
                        <div key="step2" className="w-full flex justify-center">
                            <SystemWindow 
                                title="VISUAL_CALIBRATION"
                                subtitle="INTERFACE PREFERENCE"
                                status="USER_CONFIG"
                                className="max-w-xl text-center"
                            >
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { id: 'light', name: 'Light', icon: 'light_mode' },
                                            { id: 'dark', name: 'Dark', icon: 'dark_mode' },
                                            { id: 'system', name: 'System', icon: 'settings_brightness' }
                                        ].map(mode => (
                                            <button
                                                key={mode.id}
                                                onClick={() => handleThemeChange(mode.id)}
                                                className={`p-6 border-2 flex flex-col items-center gap-4 transition-all ${
                                                    themeMode === mode.id
                                                        ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                                                        : "border-white/10 hover:border-white/20 bg-white/5"
                                                }`}
                                            >
                                                <span className={`material-symbols-outlined text-3xl ${themeMode === mode.id ? 'text-cyan-400' : 'text-white/40'}`}>
                                                    {mode.icon}
                                                </span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${themeMode === mode.id ? 'text-white' : 'text-white/40'}`}>
                                                    {mode.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => { setIsBooting(true); setStep(1); }}
                                            className="px-8 py-4 border border-white/10 text-white/40 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all font-exo"
                                        >
                                            RE_IDENTIFY
                                        </button>
                                        <button 
                                            onClick={() => setStep(3)}
                                            className="flex-1 py-4 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-black text-[10px] uppercase tracking-[0.4em] hover:scale-[1.02] transition-all font-exo"
                                        >
                                            CALIBRATE
                                        </button>
                                    </div>
                                </div>
                            </SystemWindow>
                        </div>
                    )}

                    {step === 3 && (
                        <div key="step3" className="w-full flex justify-center">
                            <SystemWindow 
                                title="PROTOCOL_INITIATED"
                                subtitle="FINALIZING NEURAL SYNC"
                                status="READY"
                                className="max-w-xl text-center"
                            >
                                <div className="space-y-8 py-4">
                                    <div className="size-24 mx-auto bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center rounded-full animate-pulse">
                                        <span className="material-symbols-outlined text-cyan-400 text-5xl">verified_user</span>
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black text-white italic tracking-tighter font-exo uppercase">WELCOME, @{username}</h2>
                                        <p className="text-[10px] font-mono text-cyan-400/60 uppercase tracking-[0.3em]">
                                            STATUS: [ SHUT-IN ] // ARCHETYPE: [ UNKNOWN ]
                                        </p>
                                    </div>

                                    <p className="text-xs text-neutral-400 leading-relaxed uppercase tracking-widest max-w-sm mx-auto font-medium">
                                        To reveal your true identity and awaken your core potential, proceed to the dashboard and trigger the Awakening Protocol.
                                    </p>

                                    <button
                                        onClick={handleOnboardingComplete}
                                        disabled={loading}
                                        className="w-full py-5 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-black text-xs uppercase tracking-[0.8em] transition-all hover:scale-[1.02] font-exo shadow-[0_0_40px_rgba(34,211,238,0.3)]"
                                    >
                                        {loading ? 'INITIALIZING...' : 'INITIALIZE_SYSTEM'}
                                    </button>
                                </div>
                            </SystemWindow>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OnboardingModal;
