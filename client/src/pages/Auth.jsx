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
                className="relative z-10 w-full max-w-[900px] h-[85vh] max-h-[700px] bg-[#080808]/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row"
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
                            className="w-full max-w-[320px] mx-auto md:mx-0"
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
                                    disabled={isLoading}
                                    type="submit" 
                                    className="w-full bg-white text-black py-3.5 rounded-xl font-black text-xs uppercase tracking-[0.4em] hover:bg-primary hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(255,255,255,0.05)] disabled:opacity-50 mt-2 flex items-center justify-center gap-3"
                                >
                                    {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
                                    <ArrowRight size={14} />
                                </button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-4">
                                <button 
                                    onClick={() => window.location.href = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/auth/google` : '/api/auth/google'} 
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
        </div>
    );
}

export default Auth;
