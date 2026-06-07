import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/brand/Logo';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { Cpu, Lock, Mail, User, Shield, Zap, ArrowRight, Fingerprint, Globe, Terminal as TerminalIcon } from 'lucide-react';

/**
 * PRODUS AUTH TERMINAL (v2.1)
 * ---------------------------------------------------------
 * Aesthetic: High-Density Tactical HUD / Monochromatic
 * Terminology: Standard (User-Friendly)
 * Layout: Viewport-Relative Scaling
 */

function Auth() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [agreedMarketing, setAgreedMarketing] = useState(false);
    const [termsModalContent, setTermsModalContent] = useState(null); // 'terms' | 'privacy' | null
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const setCredentials = useAuthStore((state) => state.setCredentials);

    // Check for Google OAuth error
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('error') === 'auth_failed') {
            setError('Authentication failed. Please try again or use email.');
        }
    }, [location]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) return setError("Please fill in all fields.");
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password,
            });
            setCredentials(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!agreedTerms) {
            return setError("You must agree to the terms and privacy policy to register.");
        }
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            return setError("Please fill in all fields.");
        }
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/auth/register', {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                password: formData.password,
            });
            setCredentials(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dark min-h-screen relative flex items-center justify-center p-6 bg-dark-mode-image overflow-hidden font-sans selection:bg-primary selection:text-white">
            
            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-white/[0.03] rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />
                <div className="absolute inset-0 bg-grid-light dark:bg-grid opacity-[0.05]" />
            </div>

            {/* Main Terminal Container */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[900px] h-auto md:h-[85vh] max-h-[700px] bg-[#080808]/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row"
            >
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 overflow-hidden z-50">
                    <motion.div 
                        animate={{ x: isSignUp ? '100%' : '0%' }}
                        className="w-1/2 h-full bg-primary shadow-[0_0_10px_var(--color-primary)]"
                    />
                </div>

                {/* Left Section: Interaction Hub */}
                <div className="w-full md:w-[55%] p-10 md:p-14 flex flex-col justify-center relative overflow-y-auto">
                    
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isSignUp ? 'signup' : 'signin'}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="w-full max-w-[320px] mx-auto"
                        >
                            {/* Branding */}
                            <div className="flex items-center mb-8 cursor-default">
                                <span className="text-sm font-black uppercase tracking-[0.5em] text-white/80">Produs</span>
                            </div>

                            <header className="mb-8">
                                <h1 className="font-black text-white mb-2 tracking-tighter" style={{ fontSize: 'var(--auth-title-size)' }}>
                                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                                </h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                                    {isSignUp ? 'Join the operative network' : 'Sign in to access your dashboard'}
                                </p>
                            </header>

                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mb-6 p-4 bg-rose-500/10 border-l-2 border-rose-500 text-rose-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-3"
                                >
                                    <Shield size={14} />
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="flex flex-col gap-4">
                                {isSignUp && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">First Name</label>
                                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Last Name</label>
                                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all" />
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-1.5 group">
                                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 group-focus-within:text-primary transition-colors">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@email.com" className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5 group">
                                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 group-focus-within:text-primary transition-colors">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all" />
                                    </div>
                                </div>

                                {isSignUp && (
                                    <div className="flex flex-col gap-3.5 my-2 text-left">
                                        {/* Terms Checkbox */}
                                        <label className="flex items-start gap-3.5 cursor-pointer group select-none">
                                            <div className="relative mt-0.5 shrink-0 flex items-center justify-center w-3.5 h-3.5">
                                                <input
                                                    type="checkbox"
                                                    checked={agreedTerms}
                                                    onChange={(e) => setAgreedTerms(e.target.checked)}
                                                    className="appearance-none w-3.5 h-3.5 rounded-sm border border-white/20 checked:bg-primary checked:border-primary transition-all cursor-pointer flex items-center justify-center bg-white/[0.03]"
                                                />
                                                {agreedTerms && (
                                                    <span className="material-symbols-outlined absolute inset-0 text-[10px] text-white flex items-center justify-center pointer-events-none font-bold">
                                                        check
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[9px] font-black text-white/50 group-hover:text-white/80 transition-colors tracking-wider leading-snug font-sans">
                                                I agree to the Produs{' '}
                                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTermsModalContent('terms'); }} className="underline text-primary hover:text-primary/80 font-black">terms</button>{' '}
                                                and{' '}
                                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTermsModalContent('privacy'); }} className="underline text-primary hover:text-primary/80 font-black">privacy policy</button>
                                            </span>
                                        </label>

                                        {/* Marketing Checkbox */}
                                        <label className="flex items-start gap-3.5 cursor-pointer group select-none">
                                            <div className="relative mt-0.5 shrink-0 flex items-center justify-center w-3.5 h-3.5">
                                                <input
                                                    type="checkbox"
                                                    checked={agreedMarketing}
                                                    onChange={(e) => setAgreedMarketing(e.target.checked)}
                                                    className="appearance-none w-3.5 h-3.5 rounded-sm border border-white/20 checked:bg-primary checked:border-primary transition-all cursor-pointer flex items-center justify-center bg-white/[0.03]"
                                                />
                                                {agreedMarketing && (
                                                    <span className="material-symbols-outlined absolute inset-0 text-[10px] text-white flex items-center justify-center pointer-events-none font-bold">
                                                        check
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[9px] font-black text-white/50 group-hover:text-white/80 transition-colors tracking-wider leading-snug font-sans">
                                                Send me occasional news & updates (optional)
                                            </span>
                                        </label>
                                    </div>
                                )}

                                {!isSignUp && (
                                    <div className="flex items-center justify-between px-1">
                                        <label className="flex items-center gap-2 cursor-pointer group/check">
                                            <input type="checkbox" className="appearance-none size-3 rounded-sm border border-white/20 checked:bg-primary checked:border-primary transition-all cursor-pointer" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30 group-hover/check:text-white/60 transition-colors">Remember Me</span>
                                        </label>
                                        <button type="button" className="text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:underline transition-all">Forgot Password?</button>
                                    </div>
                                )}

                                <button 
                                    disabled={isLoading || (isSignUp && !agreedTerms)}
                                    type="submit" 
                                    className="w-full bg-white text-black py-3.5 rounded-xl font-black text-xs uppercase tracking-[0.4em] hover:bg-primary hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(255,255,255,0.05)] disabled:opacity-50 mt-2 flex items-center justify-center gap-3"
                                >
                                    {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
                                    <ArrowRight size={14} />
                                </button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-4">
                                <button 
                                    onClick={() => setShowTermsModal(true)} 
                                    className="w-full bg-transparent border border-white/10 text-white/60 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                                >
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="size-3" alt="G" />
                                    Sign in with Google
                                </button>
                            </div>
                            
                            {/* Mobile Switcher */}
                            <p className="mt-6 text-center text-[10px] font-black text-white/20 uppercase tracking-widest md:hidden">
                                {isSignUp ? 'Already have an account?' : 'New here?'} 
                                <button onClick={() => setIsSignUp(!isSignUp)} className="text-white ml-2 underline underline-offset-4 decoration-primary/50">{isSignUp ? 'Sign In' : 'Sign Up'}</button>
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right Section: Visual Overlay */}
                <div className="hidden md:flex md:w-[45%] bg-white/[0.02] border-l border-white/5 relative flex-col items-center justify-center p-12 overflow-hidden group">
                    <div className="absolute inset-0 bg-scanline pointer-events-none opacity-[0.03]" />
                    
                    <div className="relative z-10 w-full flex flex-col items-center gap-10">
                        <div className="relative size-36 flex items-center justify-center">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border border-white/[0.05] rounded-full border-dashed"
                            />
                            <motion.div 
                                animate={{ rotate: -360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-4 border border-primary/20 rounded-full border-dashed"
                            />
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isSignUp ? 'shield' : 'shield-auth'}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 1.5, opacity: 0 }}
                                    className="relative z-20 text-white"
                                >
                                    {isSignUp ? <Fingerprint size={50} strokeWidth={1} className="text-primary" /> : <Shield size={50} strokeWidth={1} className="text-white" />}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="text-center">
                            <h2 className="font-black text-white mb-3 tracking-tighter" style={{ fontSize: 'var(--auth-title-size)' }}>
                                {isSignUp ? 'Already with us?' : 'New here?'}
                            </h2>
                            <p className="text-xs text-white/40 font-medium leading-relaxed max-w-[220px] mx-auto mb-10">
                                {isSignUp 
                                    ? 'Sign in to access your habits, goals, and insights.' 
                                    : 'Create an account and start building better habits today.'
                                }
                            </p>

                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="group relative px-8 py-3 overflow-hidden rounded-xl border border-white/10 hover:border-white/30 transition-all active:scale-95"
                            >
                                <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.4em] text-white group-hover:text-primary transition-colors">
                                    {isSignUp ? 'Sign In' : 'Sign Up'}
                                </span>
                                <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[0.16, 1, 0.3, 1]" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Terms Review Modal */}
            <AnimatePresence>
                {showTermsModal && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowTermsModal(false)}
                            className="absolute inset-0 bg-[#000000]/80 backdrop-blur-md"
                        />
                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative z-10 w-full max-w-[400px] bg-[#080808]/95 border border-white/10 rounded-[2.5rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.9)] flex flex-col items-center"
                        >
                            <h2 className="text-lg font-black text-white pb-8 mb-6 uppercase tracking-[0.2em] font-sans">
                                Review Terms
                            </h2>

                            <div className="w-full flex flex-col gap-4 mb-8 text-left">
                                {/* Terms Checkbox */}
                                <label className="flex items-start gap-4 cursor-pointer group select-none">
                                    <div className="relative mt-0.5 shrink-0 flex items-center justify-center w-[18px] h-[18px]">
                                        <input
                                            type="checkbox"
                                            checked={agreedTerms}
                                            onChange={(e) => setAgreedTerms(e.target.checked)}
                                            className="appearance-none w-[18px] h-[18px] rounded-md border-2 border-white/10 checked:bg-primary checked:border-primary transition-all cursor-pointer flex items-center justify-center bg-white/[0.03]"
                                        />
                                        {agreedTerms && (
                                            <span className="material-symbols-outlined absolute inset-0 text-[12px] text-white flex items-center justify-center pointer-events-none font-bold">
                                                check
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-black text-white/50 group-hover:text-white/80 transition-colors tracking-wider leading-normal font-sans">
                                        I agree to the Produs{' '}
                                        <button type="button" onClick={(e) => { e.stopPropagation(); setTermsModalContent('terms'); }} className="underline text-primary hover:text-primary/80 font-black">terms</button>{' '}
                                        and{' '}
                                        <button type="button" onClick={(e) => { e.stopPropagation(); setTermsModalContent('privacy'); }} className="underline text-primary hover:text-primary/80 font-black">privacy policy</button>
                                    </span>
                                </label>

                                {/* Marketing Checkbox */}
                                <label className="flex items-start gap-4 cursor-pointer group select-none">
                                    <div className="relative mt-0.5 shrink-0 flex items-center justify-center w-[18px] h-[18px]">
                                        <input
                                            type="checkbox"
                                            checked={agreedMarketing}
                                            onChange={(e) => setAgreedMarketing(e.target.checked)}
                                            className="appearance-none w-[18px] h-[18px] rounded-md border-2 border-white/10 checked:bg-primary checked:border-primary transition-all cursor-pointer flex items-center justify-center bg-white/[0.03]"
                                        />
                                        {agreedMarketing && (
                                            <span className="material-symbols-outlined absolute inset-0 text-[12px] text-white flex items-center justify-center pointer-events-none font-bold">
                                                check
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-black text-white/50 group-hover:text-white/80 transition-colors tracking-wider leading-normal font-sans">
                                        Send me occasional news & updates (optional)
                                    </span>
                                </label>
                            </div>

                            {/* Continue Button */}
                            <button
                                onClick={() => {
                                    if (agreedTerms) {
                                        window.location.href = import.meta.env.VITE_API_URL 
                                            ? `${import.meta.env.VITE_API_URL}/api/auth/google` 
                                            : '/api/auth/google';
                                    }
                                }}
                                disabled={!agreedTerms}
                                className="w-full py-3.5 bg-white disabled:bg-white/10 text-black disabled:text-white/20 rounded-xl font-black text-xs uppercase tracking-[0.4em] hover:bg-primary hover:text-white disabled:hover:bg-white/10 disabled:hover:text-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(255,255,255,0.05)] disabled:opacity-40 mb-6"
                            >
                                Continue
                            </button>

                            {/* Go Back */}
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">
                                Changed your mind?{' '}
                                <button
                                    onClick={() => setShowTermsModal(false)}
                                    className="text-primary hover:underline font-black"
                                >
                                    Go back
                                </button>
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Document Viewer Modal (Terms/Privacy) */}
            <AnimatePresence>
                {termsModalContent && (
                    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setTermsModalContent(null)}
                            className="absolute inset-0 bg-[#000000]/90 backdrop-blur-md"
                        />
                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative z-10 w-full max-w-[550px] max-h-[80vh] bg-[#0c0c0c] border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-[0_40px_100px_rgba(0,0,0,1)] flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.25em] font-sans">
                                    {termsModalContent === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                                </h3>
                                <button
                                    onClick={() => setTermsModalContent(null)}
                                    className="size-8 flex items-center justify-center rounded-full bg-white/5 border border-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar text-white/70 text-[10px] font-mono leading-relaxed space-y-6 text-left">
                                {termsModalContent === 'terms' ? (
                                    <>
                                        <section className="space-y-2">
                                            <h4 className="font-black text-white uppercase tracking-wider">1. Acceptance of Terms</h4>
                                            <p>Welcome to Produs. By accessing or using our client application, synchronizing data with our servers, establishing communication rooms, or creating an account, you ("User" or "Operator") agree to be bound by these Terms of Service. If you do not agree to these terms, you must not access or use the application.</p>
                                        </section>
                                        <section className="space-y-2">
                                            <h4 className="font-black text-white uppercase tracking-wider">2. Description of Service</h4>
                                            <p>Produs is a client-server productivity dashboard and gamified tracking interface incorporating Habit Matrices, Daily Planners, Financial Hubs, Write Hubs, and real-time collaboration layers ("Link Hub" & Live Focus Rooms). We reserve the right to modify, suspend, or discontinue any feature at any time without notice.</p>
                                        </section>
                                        <section className="space-y-2">
                                            <h4 className="font-black text-white uppercase tracking-wider">3. Registration & Security</h4>
                                            <p>You may register using your email or via third-party Google OAuth credentials. You are entirely responsible for safeguarding your authorization tokens, password credentials, and JWT sessions. You must immediately notify Produs of any unauthorized node access.</p>
                                        </section>
                                        <section className="space-y-2">
                                            <h4 className="font-black text-white uppercase tracking-wider">4. User Content & License</h4>
                                            <p>You retain full ownership of all data, text, planning items, journal entries, and financial records you log onto the platform ("User Content"). By submitting User Content, you grant Produs a worldwide, non-exclusive, royalty-free license to host, store, and transmit this content solely to deliver our services, including backend replication on MongoDB.</p>
                                        </section>
                                        <section className="space-y-2">
                                            <h4 className="font-black text-white uppercase tracking-wider">5. Partner Sync Protocol (Link Hub)</h4>
                                            <p>Activating a partner connection (the "Link Hub" or partner mode) enables two-way, real-time data sync. You explicitly authorize Produs to transmit your productivity logs, habits stats, focus hours, coin values, and custom messages to your linked partner. Either party may disconnect this link at any time, instantly halting telemetry sharing.</p>
                                        </section>
                                        <section className="space-y-2">
                                            <h4 className="font-black text-white uppercase tracking-wider">6. Acceptable Use & System Integrity</h4>
                                            <p>You agree not to reverse-engineer Express backend endpoints, inject malicious code, overload our database systems, scrape user data, or exploit WebSockets/socket.io sync protocols. We reserve the right to suspend or terminate accounts that violate system integrity.</p>
                                        </section>
                                        <section className="space-y-2">
                                            <h4 className="font-black text-white uppercase tracking-wider">7. Local Caching & PWAs</h4>
                                            <p>Produs utilizes Vite PWA caching, Workbox static assets offline-first caching, and browser LocalStorage. While offline capability is supported, Produs is not responsible for data conflicts arising from asynchronous client-server synchronization.</p>
                                        </section>
                                        <section className="space-y-2">
                                            <h4 className="font-black text-white uppercase tracking-wider">8. Disclaimer of Warranties & Limitation of Liability</h4>
                                            <p>The service is provided "AS IS" and "AS AVAILABLE". Produs disclaims all warranties of any kind. Under no circumstances shall Produs be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of habits records, planner notes, or financial logs.</p>
                                        </section>
                                    </>
                                ) : (
                                    <>
                                        <section className="space-y-2">
                                            <h4 className="font-black text-white uppercase tracking-wider">1. Information We Collect</h4>
                                            <p><strong>Account Registration Data:</strong> Email address, first/last names, and profile picture configuration supplied when registering or via Google OAuth.</p>
                                            <p><strong>Dashboard Data:</strong> Habit matrices, focus session times, task boards, transaction records, and journal entries stored in MongoDB.</p>
                                            <p><strong>Telemetry & Real-Time Data:</strong> WebSockets connection status, messaging logs with linked partners, and focus room activity metrics.</p>
                                            <p><strong>Technical Log Data:</strong> IP addresses, browser agents, local storage cookies, and application usage patterns collected via Posthog Analytics.</p>
                                        </section>
                                        <section className="space-y-2">
                                            <h4 className="font-black text-white uppercase tracking-wider">2. How We Use Information</h4>
                                            <p>We process your data to operate the core dashboard functionalities, maintain secure JWT authorization, sync logs across devices, calculate levels/coins, manage real-time messaging, and compile system analytics to improve performance.</p>
                                        </section>
                                        <section className="space-y-2">
                                            <h4 className="font-black text-white uppercase tracking-wider">3. Data Sharing & Disclosure</h4>
                                            <p>Your private data is never sold, leased, or distributed to third-party ad networks. Data sharing is limited to: (a) Your designated companion when partner mode is explicitly activated; (b) Direct database replication infrastructure (MongoDB Atlas); and (c) Performance monitoring services (Posthog).</p>
                                        </section>
                                        <section className="space-y-2">
                                            <h4 className="font-black text-white uppercase tracking-wider">4. Cookies and Browser Storage</h4>
                                            <p>We use session cookies and local storage tokens to persist your credentials and configuration (such as theme mode). Offline assets are cached using service workers (PWA specifications) for local performance. You may clear this data via browser controls at any time.</p>
                                        </section>
                                        <section className="space-y-2">
                                            <h4 className="font-black text-white uppercase tracking-wider">5. Data Deletion & Retention</h4>
                                            <p>We retain your logs as long as your account is active. Under CCPA/GDPR frameworks, you can execute a complete database teardown. Using the "Delete Account" control in the settings immediately and permanently drops your document records from MongoDB.</p>
                                        </section>
                                    </>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="pt-6 border-t border-white/5 mt-6 flex justify-end">
                                <button
                                    onClick={() => setTermsModalContent(null)}
                                    className="px-6 py-2.5 bg-white text-black hover:bg-primary hover:text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all"
                                >
                                    Understood
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Auth;
