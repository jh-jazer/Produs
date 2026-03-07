import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Landing() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 flex flex-col">
            {/* Header */}
            <header className="px-6 lg:px-10 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg overflow-hidden bg-white shadow-sm ring-1 ring-slate-900/10">
                        <img src="/produs-logo.png" alt="Produs Logo" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Produs</h2>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/auth" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Log In</Link>
                    <Link to="/auth" className="text-sm font-bold bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">Get Started</Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-black tracking-widest uppercase mb-6">
                        The Ultimate Productivity Hub
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
                        Master your habits.<br />
                        <span className="text-primary">Design your life.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                        Produs connects your habits, tasks, finances, and journal into one beautiful dashboard. Stop juggling apps and start achieving your goals.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/auth" className="w-full sm:w-auto px-8 py-4 bg-primary text-white text-base font-black rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1">
                            Start for free
                        </Link>
                        <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            Explore Features
                        </a>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

export default Landing;
