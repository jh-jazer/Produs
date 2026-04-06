import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import Logo from '../components/brand/Logo';

function SignUp() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const setCredentials = useAuthStore((state) => state.setCredentials);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const { data } = await api.post('/auth/register', {
                name: `${firstName} ${lastName}`.trim(),
                email,
                password
            });
            setCredentials(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        window.location.href = import.meta.env.VITE_API_URL
            ? `${import.meta.env.VITE_API_URL}/api/auth/google`
            : '/api/auth/google';
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#121212] overflow-hidden">

            {/* Background */}
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

            {/* Modal Card */}
            <div className="relative z-10 w-full max-w-[520px] bg-white dark:bg-[#121212] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/10 dark:border-white/10 backdrop-blur-sm overflow-hidden">
                <div className="px-6 py-8 sm:px-12 sm:py-12">

                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2.5 mb-10">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg ring-1 ring-slate-900/10 dark:ring-white/10 bg-white dark:bg-white/5 p-1.5 flex items-center justify-center">
                            <Logo glow={false} className="w-full h-full" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">Produs</span>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">Create an account</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Start tracking your habits today</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    {/* Google Button First */}
                    <button onClick={handleGoogleSignIn} type="button" className="w-full py-2.5 mb-5 bg-white dark:bg-[#000000]/50 border-2 border-slate-100 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-[#000000] hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-none transition-all flex items-center justify-center gap-2.5 group">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center mb-5">
                        <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">or</span>
                        <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5 group">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">First Name</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">person</span>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        placeholder="Alex"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#000000]/30 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 focus:border-slate-900 dark:focus:border-white transition-all placeholder-slate-400/70"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5 group">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">Last Name</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">badge</span>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        placeholder="Doe"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#000000]/30 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 focus:border-slate-900 dark:focus:border-white transition-all placeholder-slate-400/70"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5 group">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">mail</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="alex@example.com"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#000000]/30 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 focus:border-slate-900 dark:focus:border-white transition-all placeholder-slate-400/70"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 group">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">Password</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">lock</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#000000]/30 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 focus:border-slate-900 dark:focus:border-white transition-all placeholder-slate-400/70"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full text-center mt-2 py-2.5 bg-[#121212] dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-black tracking-wide hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-8 sm:px-12 py-5 bg-slate-50 dark:bg-[#000000]/30 border-t border-slate-100 dark:border-white/10 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Already have an account? <Link to="/signin" className="text-slate-900 dark:text-white font-black hover:underline hover:text-primary transition-colors ml-1">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
