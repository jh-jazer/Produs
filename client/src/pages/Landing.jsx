import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Zap, 
  Target, 
  BarChart3, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  Cpu,
  Download
} from "lucide-react";
import useAuthStore from "../store/useAuthStore";

const fadeInUp = {
  initial: { y: 20, opacity: 0, filter: "blur(10px)" },
  animate: { y: 0, opacity: 1, filter: "blur(0px)" },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Landing() {
  const { user } = useAuthStore();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-deep-space text-titanium-white font-display overflow-x-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-40 z-0" />
      
      {/* Radial Gradient Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,102,255,0.05)_0%,transparent_50%)] pointer-events-none z-0" />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-10 py-5 backdrop-blur-md border-b border-white/10 bg-deep-space/60">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-electric-blue flex items-center justify-center shadow-[0_0_15px_rgba(0,102,255,0.5)]">
              <Zap className="text-white size-5 fill-current" />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase">Produs</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-slate">
            <a href="#features" className="hover:text-titanium-white transition-colors">System</a>
            <a href="#vision" className="hover:text-titanium-white transition-colors">Vision</a>
            <a href="#intelligence" className="hover:text-titanium-white transition-colors">Intelligence</a>
          </div>

          <div className="flex items-center gap-4">
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick} 
                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-titanium-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors backdrop-blur-sm border border-white/10"
              >
                <Download size={16} /> Install App
              </button>
            )}

            <Link to={user ? "/dashboard" : "/auth"} className="bg-electric-blue hover:bg-[#0052cc] text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_20px_rgba(0,102,255,0.3)] hover:scale-105 active:scale-95">
              Launch Console
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto text-center z-10">
        <motion.div 
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-electric-blue/30 bg-electric-blue/10 text-electric-blue text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <Cpu size={12} /> Version 1.0 — Evolution of Productivity
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl font-semibold leading-[0.9] tracking-tighter mb-8 max-w-5xl mx-auto">
            From Noise to <br />
            <span className="text-electric-blue bg-gradient-to-r from-electric-blue to-dark-amethyst bg-clip-text text-transparent italic">Knowledge.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-slate max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Engineered for high-performance humans. Your habits, finances, and deep thoughts integrated into a single, precise cockpit.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
            <Link to={user ? "/dashboard" : "/auth"} className="px-10 py-4 bg-electric-blue text-white rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(0,102,255,0.4)] hover:bg-[#0052cc] hover:-translate-y-1">
              {user ? "Resume Session" : "Begin Selection"} <ArrowRight size={18} />
            </Link>
            {deferredPrompt ? (
              <button onClick={handleInstallClick} className="px-10 py-4 flex items-center justify-center gap-2 border border-white/10 hover:border-white/30 text-titanium-white rounded-full font-bold transition-all backdrop-blur-sm">
                <Download size={18} /> Install Web App
              </button>
            ) : (
              <button className="px-10 py-4 border border-white/10 hover:border-white/30 text-titanium-white rounded-full font-bold transition-all backdrop-blur-sm">
                Watch System Overview
              </button>
            )}
          </motion.div>

          {/* Hero Image Container */}
          <motion.div 
            variants={fadeInUp}
            className="relative max-w-6xl mx-auto rounded-[32px] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,102,255,0.1)] group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-deep-space via-transparent to-transparent z-10" />
            <img 
              src="/produs_hero_intelligence_aesthetic.png" 
              alt="Produs High-Performance Dashboard" 
              className="w-full h-auto object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* BENTO GRID FEATURES */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight">The Core Protocol</h2>
          <p className="text-muted-slate">A unified architecture for personal evolution.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
          {/* Main Feature - Bento 1 */}
          <motion.div 
            whileHover={{ y: -5, borderColor: "rgba(255,255,255,0.3)" }}
            className="md:col-span-8 bg-obsidian border border-white/10 rounded-[2rem] p-8 lg:p-12 relative overflow-hidden group transition-all"
          >
            <div className="relative z-10 max-w-md">
              <div className="size-12 rounded-2xl bg-electric-blue/20 flex items-center justify-center border border-electric-blue/30 mb-6 group-hover:bg-electric-blue/40 transition-colors">
                <Target className="text-electric-blue" />
              </div>
              <h3 className="text-3xl font-semibold mb-4 leading-tight">Master your daily flow state.</h3>
              <p className="text-muted-slate text-lg">Integrated habit tracking with signal-driven metrics. Real-time feedback on your performance consistency.</p>
            </div>
            {/* Visual element placeholder or small chart */}
            <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-l from-electric-blue/10 to-transparent pointer-events-none" />
          </motion.div>

          {/* Side Feature - Bento 2 */}
          <motion.div 
            whileHover={{ y: -5, borderColor: "rgba(255,255,255,0.3)" }}
            className="md:col-span-4 bg-obsidian border border-white/10 rounded-[2rem] p-8 transition-all flex flex-col"
          >
            <div className="size-12 rounded-2xl bg-neon-emerald/20 flex items-center justify-center border border-neon-emerald/30 mb-6">
              <BarChart3 className="text-neon-emerald" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 italic leading-tight">Quantified Finances.</h3>
            <p className="text-muted-slate text-sm flex-grow">Track wealth velocity and spending entropy with precise data visualizations.</p>
          </motion.div>

          {/* Small Feature - Bento 3 */}
          <motion.div 
            whileHover={{ y: -5, borderColor: "rgba(255,255,255,0.3)" }}
            className="md:col-span-4 bg-obsidian border border-white/10 rounded-[2rem] p-8 transition-all"
          >
            <div className="size-12 rounded-2xl bg-dark-amethyst/20 flex items-center justify-center border border-dark-amethyst/30 mb-6">
              <BookOpen className="text-dark-amethyst" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 leading-tight italic">Deep Journaling.</h3>
            <p className="text-muted-slate text-sm">A minimalist sanctuary for your thoughts. Capture the noise, extract the knowledge.</p>
          </motion.div>

          {/* Wide Feature - Bento 4 */}
          <motion.div 
            whileHover={{ y: -5, borderColor: "rgba(255,255,255,0.3)" }}
            className="md:col-span-8 bg-[#080808] border border-white/10 rounded-[2rem] p-8 lg:p-12 transition-all relative overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="size-12 rounded-2xl bg-signal-orange/20 flex items-center justify-center border border-signal-orange/30 mb-6">
                  <ShieldCheck className="text-signal-orange" />
                </div>
                <h3 className="text-3xl font-semibold mb-4 leading-tight tracking-tight">Built on Privacy.</h3>
                <p className="text-muted-slate text-lg font-light">Your system is your sanctuary. End-to-end reliability for your most sensitive progress data.</p>
              </div>
              <div className="flex justify-center">
                <Globe className="text-white/10 size-40 animate-pulse" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FINAL PROTOCOL */}
      <section className="py-40 px-6 max-w-4xl mx-auto text-center z-10 relative">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5 }}
           className="p-12 lg:p-20 rounded-[3rem] border border-electric-blue/20 bg-[radial-gradient(circle_at_50%_0%,rgba(0,102,255,0.15)_0%,transparent_70%)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-20 bg-electric-blue rounded-full shadow-[0_0_20px_rgba(0,102,255,1)]" />
          
          <h2 className="text-4xl md:text-6xl font-semibold mb-8 leading-tight">Ready to enter the <br /> cockpit?</h2>
          <p className="text-muted-slate mb-12 text-lg font-light">Join the elite few who treat their productivity as a high-performance system.</p>
          
          <Link to={user ? "/dashboard" : "/auth"} className="inline-flex items-center gap-2 px-12 py-5 bg-titanium-white text-deep-space rounded-full font-black hover:scale-105 active:scale-95 transition-all shadow-[0_10px_40px_rgba(255,255,255,0.2)]">
            {user ? "Return to Console" : "Initialize System"} <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 bg-deep-space relative z-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <Zap className="text-electric-blue size-5 fill-current" />
            <span className="font-bold tracking-tighter uppercase">Produs</span>
          </div>
          <div className="flex gap-8 text-[10px] uppercase font-black tracking-widest text-muted-slate">
            <a href="#" className="hover:text-titanium-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-titanium-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-titanium-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-titanium-white transition-colors">Status: Operational</a>
          </div>
          <p className="text-[10px] text-muted-slate font-mono">© 2026 PRODUS PROTOCOL. ALL RIGHTS EXECUTED.</p>
        </div>
      </footer>
    </div>
  );
}