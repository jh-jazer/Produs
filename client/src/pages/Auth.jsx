import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

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

    // Check for Google OAuth error in URL
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('error') === 'auth_failed') {
            setError('Google Authentication failed. Please try again or use email/password.');
        }
    }, [location]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null); // Clear error when user types
    };

    const handleSignIn = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            return setError("Please fill in all fields.");
        }

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
            setError(err.response?.data?.message || 'Login failed. Please try again.');
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="min-h-screen relative flex items-center justify-center p-4 bg-slate-900 overflow-hidden"
        >

            {/* Background blobs */}
            <div className="absolute inset-0">
                <div className="absolute top-[-30%] left-[-15%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-[-25%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/15 blur-[130px] animate-pulse [animation-delay:1s]"></div>
                <div className="absolute top-[30%] right-[15%] w-[350px] h-[350px] rounded-full bg-violet-500/10 blur-[100px] animate-pulse [animation-delay:2s]"></div>
            </div>

            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
            }}></div>

            {/* Modal Container */}
            <div className="relative z-10 w-full max-w-[760px] h-[600px] md:h-[520px] bg-white dark:bg-[#192233] rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.4)] overflow-hidden">

                {/* Forms Container */}
                <div className="relative w-full h-full flex">

                    {/* ====== Sign In Form (Always on left side) ====== */}
                    <div
                        className="absolute top-0 left-0 w-full md:w-1/2 h-full flex items-center justify-center px-6 py-8 sm:px-10 sm:py-10 transition-opacity duration-700 ease-in-out z-10 bg-white dark:bg-[#192233]"
                        style={{
                            opacity: isSignUp ? 0 : 1,
                            pointerEvents: isSignUp ? 'none' : 'auto',
                        }}
                    >
                        <div className="w-full max-w-[300px]">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg overflow-hidden shadow-md ring-1 ring-slate-900/10 bg-white">
                                    <img src="/produs-logo.png" alt="Produs" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">Produs</span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">Welcome back</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">Sign in to your account</p>

                            <button onClick={() => window.location.href = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/auth/google` : '/api/auth/google'} type="button" className="w-full py-2 mb-4 bg-white dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Google
                            </button>

                            <div className="flex items-center mb-4">
                                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                                <span className="mx-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider">or</span>
                                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                            </div>

                            {/* Error Message Display */}
                            {!isSignUp && error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                                    <p className="text-[11px] font-bold text-red-500">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSignIn} className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1 group">
                                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">Email</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[16px]">mail</span>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="alex@example.com" className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 focus:border-slate-900 dark:focus:border-white transition-all placeholder-slate-400/70" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 group">
                                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">Password</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[16px]">lock</span>
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 focus:border-slate-900 dark:focus:border-white transition-all placeholder-slate-400/70" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="checkbox" className="appearance-none w-3.5 h-3.5 rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-slate-900 dark:checked:bg-white checked:border-slate-900 dark:checked:border-white transition-colors cursor-pointer" />
                                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Remember me</span>
                                    </label>
                                    <a href="#" className="text-[11px] font-bold text-primary hover:underline">Forgot password?</a>
                                </div>
                                <button disabled={isLoading} type="submit" className="w-full mt-1 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-black hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </form>

                            <p className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-400 font-medium md:hidden">
                                No account? <button onClick={() => { setIsSignUp(true); setError(null); }} className="text-slate-900 dark:text-white font-black hover:underline">Sign up</button>
                            </p>
                        </div>
                    </div>

                    {/* ====== Sign Up Form (Always on right side) ====== */}
                    <div
                        className="absolute top-0 left-0 md:left-1/2 w-full md:w-1/2 h-full flex items-center justify-center px-6 py-8 sm:px-10 sm:py-10 transition-opacity duration-700 ease-in-out z-10 md:z-0 bg-white dark:bg-[#192233] md:bg-transparent"
                        style={{
                            opacity: isSignUp ? 1 : 0,
                            pointerEvents: isSignUp ? 'auto' : 'none',
                        }}
                    >
                        <div className="w-full max-w-[300px]">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg overflow-hidden shadow-md ring-1 ring-slate-900/10 bg-white">
                                    <img src="/produs-logo.png" alt="Produs" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">Produs</span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">Get started</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">Create your free account</p>

                            <button onClick={() => window.location.href = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/auth/google` : '/api/auth/google'} type="button" className="w-full py-2 mb-4 bg-white dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Google
                            </button>

                            <div className="flex items-center mb-4">
                                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                                <span className="mx-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider">or</span>
                                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                            </div>

                            {/* Error Message Display */}
                            {isSignUp && error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                                    <p className="text-[11px] font-bold text-red-500">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSignUp} className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1 group">
                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">First Name</label>
                                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Alex" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 focus:border-slate-900 dark:focus:border-white transition-all placeholder-slate-400/70" />
                                    </div>
                                    <div className="flex flex-col gap-1 group">
                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">Last Name</label>
                                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 focus:border-slate-900 dark:focus:border-white transition-all placeholder-slate-400/70" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 group">
                                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">Email</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[16px]">mail</span>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="alex@example.com" className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 focus:border-slate-900 dark:focus:border-white transition-all placeholder-slate-400/70" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 group">
                                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">Password</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[16px]">lock</span>
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 focus:border-slate-900 dark:focus:border-white transition-all placeholder-slate-400/70" />
                                    </div>
                                </div>
                                <button disabled={isLoading} type="submit" className="w-full mt-1 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-black hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>

                            <p className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-400 font-medium md:hidden">
                                Have an account? <button onClick={() => { setIsSignUp(false); setError(null); }} className="text-slate-900 dark:text-white font-black hover:underline">Sign in</button>
                            </p>
                        </div>
                    </div>

                    {/* ====== Sliding Overlay Panel ====== */}
                    <div
                        className="absolute top-0 w-1/2 h-full z-20 transition-transform duration-700 ease-in-out hidden md:block"
                        style={{
                            left: '50%',
                            transform: isSignUp ? 'translateX(-100%)' : 'translateX(0)',
                        }}
                    >
                        <div className="relative w-full h-full bg-slate-900 dark:bg-[#0c1220] overflow-hidden flex flex-col items-center justify-center p-10 text-center">
                            {/* Decorative blobs inside panel */}
                            <div className="absolute inset-0">
                                <div className="absolute top-[-30%] left-[-20%] w-[400px] h-[400px] rounded-full bg-primary/25 blur-[100px]"></div>
                                <div className="absolute bottom-[-20%] right-[-20%] w-[350px] h-[350px] rounded-full bg-blue-500/20 blur-[80px]"></div>
                                <div className="absolute top-[50%] left-[60%] w-[200px] h-[200px] rounded-full bg-violet-500/15 blur-[60px]"></div>
                            </div>

                            {/* Grid overlay */}
                            <div className="absolute inset-0 opacity-[0.04]" style={{
                                backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                                backgroundSize: '40px 40px'
                            }}></div>

                            <div className="relative z-10 flex flex-col items-center gap-6 max-w-[260px]">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-white">
                                    <img src="/produs-logo.png" alt="Produs" className="w-full h-full object-cover" />
                                </div>

                                <div>
                                    <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                                        {isSignUp ? 'Already with us?' : 'New here?'}
                                    </h2>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                        {isSignUp
                                            ? 'Sign in to access your habits, goals, and financial insights.'
                                            : 'Create an account and start building better habits today.'
                                        }
                                    </p>
                                </div>

                                <button
                                    onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                                    className="px-8 py-2.5 rounded-xl border-2 border-white/20 text-white text-sm font-black hover:bg-white hover:text-slate-900 transition-all duration-300 hover:scale-105 active:scale-95"
                                >
                                    {isSignUp ? 'Sign In' : 'Sign Up'}
                                </button>

                                {/* Stats */}
                                <div className="flex gap-6 mt-2">
                                    <div className="text-center">
                                        <p className="text-lg font-black text-white">12K+</p>
                                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Users</p>
                                    </div>
                                    <div className="w-px bg-slate-800"></div>
                                    <div className="text-center">
                                        <p className="text-lg font-black text-white">50M+</p>
                                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Habits</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default Auth;
