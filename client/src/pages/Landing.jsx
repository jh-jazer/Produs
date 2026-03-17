import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Target,
  BarChart3,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Globe,
  Download,
  Calendar,
  Activity,
  Layers
} from "lucide-react";
import { DesktopMock, MobileMock } from "../components/landing/Mocks";
import { InteractiveBento } from "../components/landing/InteractiveBento";
import { BootSequence } from "../components/landing/BootSequence";
import { ReactiveGrid } from "../components/landing/ReactiveGrid";
import { MagneticButton } from "../components/landing/MagneticButton";

const fadeInUp = {
  initial: { y: 40, opacity: 0, filter: "blur(10px)" },
  whileInView: { y: 0, opacity: 1, filter: "blur(0px)" },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  viewport: { once: true, margin: "-100px" }
};

const itemReveal = {
  initial: { y: 30, opacity: 0, filter: "blur(8px)" },
  whileInView: { y: 0, opacity: 1, filter: "blur(0px)" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
};

export default function Landing() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [booting, setBooting] = useState(true);

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
    <>
      <AnimatePresence>
        {booting && <BootSequence onComplete={() => setBooting(false)} />}
      </AnimatePresence>

      <div className={`min-h-screen bg-deep-space text-titanium-white font-display overflow-x-hidden ${booting ? 'h-screen overflow-hidden' : ''}`}>
        <ReactiveGrid />

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
              <a href="#features" className="hover:text-titanium-white transition-colors">Protocol</a>
              <a href="#vision" className="hover:text-titanium-white transition-colors">Vision</a>
              <a href="#intelligence" className="hover:text-titanium-white transition-colors">Intelligence</a>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="hidden sm:flex items-center gap-2 text-sm font-semibold text-titanium-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors backdrop-blur-sm border border-white/10"
                >
                  <Download size={16} /> Install App
                </button>
              )}
              <Link to="/auth" className="hidden sm:block text-sm font-semibold hover:text-electric-blue transition-colors">
                Sign In
              </Link>
              <Link to="/auth">
                <div className="bg-electric-blue hover:bg-[#0052cc] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-[0_0_20px_rgba(0,102,255,0.3)] hover:scale-105 active:scale-95">
                    Launch Console
                </div>
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto text-center z-10">
          <motion.div
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={itemReveal} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-electric-blue/30 bg-electric-blue/10 text-electric-blue text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <Cpu size={12} /> System Status: Operational — Ver 1.0
            </motion.div>

            <motion.h1 variants={itemReveal} className="text-5xl sm:text-6xl md:text-8xl font-semibold leading-[0.9] tracking-tighter mb-8 max-w-5xl mx-auto">
              From Noise to <br />
              <span className="text-electric-blue bg-gradient-to-r from-electric-blue to-dark-amethyst bg-clip-text text-transparent italic">Knowledge.</span>
            </motion.h1>

            <motion.p variants={itemReveal} className="text-lg md:text-xl text-muted-slate max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              The single source of truth for your evolution. A unified cockpit for high-performance humans.
            </motion.p>

            <motion.div variants={itemReveal} className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-32">
              <MagneticButton>
                  <Link to="/auth" className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-electric-blue text-white rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(0,102,255,0.4)] hover:bg-[#0052cc]">
                    Initialize System <ArrowRight size={18} />
                  </Link>
              </MagneticButton>
              <button className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 border border-white/10 hover:border-white/30 text-titanium-white rounded-full font-bold transition-all backdrop-blur-sm">
                 View Protocol
              </button>
            </motion.div>

            {/* 3D MOCKS INTEGRATION */}
            <div className="relative max-w-6xl mx-auto mt-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <motion.div variants={itemReveal} className="lg:col-span-8">
                      <DesktopMock>
                          <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center p-8">
                              <div className="w-full h-full rounded-xl border border-white/10 bg-deep-space overflow-hidden flex flex-col">
                                  <div className="h-10 border-b border-white/5 flex items-center px-4 gap-4 bg-obsidian">
                                      <Zap className="text-electric-blue size-4" />
                                      <div className="w-20 h-2 rounded bg-white/10" />
                                      <div className="w-20 h-2 rounded bg-white/5" />
                                  </div>
                                  <div className="flex-1 p-6 grid grid-cols-12 gap-6">
                                      <div className="col-span-4 space-y-4 text-left">
                                          <div className="h-32 rounded-2xl bg-white/5 p-4 flex flex-col justify-between">
                                              <div className="w-12 h-2 rounded bg-neon-emerald/20" />
                                              <div className="w-full h-12 flex items-end gap-1">
                                                  {[30, 60, 45, 80, 50, 90, 70].map((h, i) => (
                                                      <motion.div
                                                        key={i}
                                                        initial={{ height: 0 }}
                                                        whileInView={{ height: `${h}%` }}
                                                        className="flex-1 bg-neon-emerald/30 rounded-t-sm"
                                                      />
                                                  ))}
                                              </div>
                                          </div>
                                          <div className="h-40 rounded-2xl bg-white/5 p-4 space-y-3">
                                              <div className="w-20 h-2 rounded bg-white/10" />
                                              <div className="w-full h-2 rounded bg-white/5" />
                                              <div className="w-3/4 h-2 rounded bg-white/5" />
                                              <div className="w-full h-16 rounded-xl bg-white/5" />
                                          </div>
                                      </div>
                                      <div className="col-span-8 space-y-4">
                                          <div className="h-12 rounded-xl bg-white/5 flex items-center px-4 justify-between">
                                              <div className="w-32 h-3 rounded bg-white/10" />
                                              <div className="size-6 rounded-full bg-electric-blue/20" />
                                          </div>
                                          <div className="h-[232px] rounded-2xl bg-white/5 p-6 flex flex-col gap-4">
                                              {[1, 2, 3, 4].map(i => (
                                                  <div key={i} className="flex items-center gap-4">
                                                      <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                          <div className="size-3 rounded-full bg-electric-blue/40" />
                                                      </div>
                                                      <div className="flex-1 space-y-2 text-left">
                                                          <div className="w-1/3 h-2 rounded bg-white/10" />
                                                          <div className="w-full h-1.5 rounded bg-white/5" />
                                                      </div>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </DesktopMock>
                  </motion.div>
                  <motion.div variants={itemReveal} className="lg:col-span-4 flex justify-center">
                      <MobileMock>
                          <div className="w-full h-full bg-deep-space p-6 flex flex-col gap-4">
                              <div className="flex items-center justify-between mt-4">
                                  <div className="size-10 rounded-full bg-white/10" />
                                  <div className="w-24 h-4 rounded bg-white/5" />
                                  <Zap className="text-electric-blue size-5" />
                              </div>
                              <div className="h-32 rounded-3xl bg-white/5 w-full mt-4 flex items-end p-4">
                                  <div className="flex gap-1 w-full items-end h-full">
                                      {[40, 70, 50, 90, 60, 80, 95].map((h, i) => (
                                          <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            whileInView={{ height: `${h}%` }}
                                            className="flex-1 bg-electric-blue/40 rounded-t-sm"
                                          />
                                      ))}
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                  <div className="aspect-square rounded-2xl bg-white/5 flex flex-col items-center justify-center gap-2">
                                      <Target className="text-neon-emerald size-6" />
                                      <span className="text-[10px] font-bold uppercase text-muted-slate">Habits</span>
                                  </div>
                                  <div className="aspect-square rounded-2xl bg-white/5 flex flex-col items-center justify-center gap-2">
                                      <BarChart3 className="text-signal-orange size-6" />
                                      <span className="text-[10px] font-bold uppercase text-muted-slate">Finance</span>
                                  </div>
                              </div>
                              <div className="flex-1 rounded-3xl bg-white/5 mt-2 overflow-hidden">
                                  <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                      <div className="w-20 h-3 rounded bg-white/10" />
                                      <div className="size-4 rounded-full bg-white/5" />
                                  </div>
                                  <div className="p-4 space-y-3 text-left">
                                      <div className="w-full h-2 rounded bg-white/5" />
                                      <div className="w-3/4 h-2 rounded bg-white/5" />
                                  </div>
                              </div>
                          </div>
                      </MobileMock>
                  </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* BENTO GRID FEATURES */}
        <section id="features" className="py-24 md:py-40 px-6 max-w-7xl mx-auto z-10 relative">
          <motion.div
              {...fadeInUp}
              className="text-center mb-16 md:mb-24"
          >
            <h2 className="text-4xl md:text-6xl font-semibold mb-6 tracking-tight">The Unified Protocol</h2>
            <p className="text-muted-slate text-lg max-w-2xl mx-auto">Five core modules integrated into a single high-performance interface. No context switching, just pure output.</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* Productive Feed - Large */}
            <motion.div variants={itemReveal} className="md:col-span-8 h-full">
              <InteractiveBento
                title="Productive Feed"
                description="A real-time stream of your growth. Every habit completed, every goal reached, and every insight captured, visualized in a unified timeline."
                icon={Activity}
                accentColor="blue"
              >
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map(i => (
                        <motion.div
                            key={i}
                            whileInView={{ x: [20, 0], opacity: [0, 1] }}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5"
                        >
                            <div className="size-2 rounded-full bg-electric-blue" />
                            <div className="flex-1 h-2 rounded bg-white/10" />
                            <div className="w-12 h-2 rounded bg-white/5" />
                        </motion.div>
                    ))}
                </div>
              </InteractiveBento>
            </motion.div>

            {/* Habits - Small */}
            <motion.div variants={itemReveal} className="md:col-span-4 h-full">
              <InteractiveBento
                title="Habit Tracking"
                description="Signal-driven consistency. Track your daily rituals with precision and watch your success rate climb."
                icon={Target}
                accentColor="emerald"
              >
                 <div className="grid grid-cols-7 gap-1 h-20">
                    {Array.from({ length: 21 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className={`rounded-[2px] ${i % 3 === 0 ? 'bg-neon-emerald shadow-[0_0_8px_rgba(0,255,136,0.5)]' : 'bg-white/5'}`}
                        />
                    ))}
                 </div>
              </InteractiveBento>
            </motion.div>

            {/* Planner - Small */}
            <motion.div variants={itemReveal} className="md:col-span-4 h-full">
              <InteractiveBento
                title="Strategic Planning"
                description="Architect your day. High-level goals meet granular execution with our integrated calendar and priority system."
                icon={Calendar}
                accentColor="white"
              >
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="size-4 rounded-sm border border-white/20" />
                        <div className="w-full h-2 rounded bg-white/10" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-4 rounded-sm border border-electric-blue bg-electric-blue/20" />
                        <div className="w-3/4 h-2 rounded bg-white/10" />
                    </div>
                </div>
              </InteractiveBento>
            </motion.div>

            {/* Finance - Large */}
            <motion.div variants={itemReveal} className="md:col-span-8 h-full">
              <InteractiveBento
                title="Finance Tracking"
                description="Quantified wealth. Track spending entropy, wealth velocity, and savings progress with professional-grade data visualizations."
                icon={BarChart3}
                accentColor="orange"
              >
                <div className="flex items-end gap-2 h-32 pt-4">
                    {[30, 45, 35, 60, 55, 80, 70, 90, 85, 100].map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            whileInView={{ height: `${h}%` }}
                            transition={{ duration: 1, delay: i * 0.05 }}
                            className="flex-1 bg-signal-orange/40 rounded-t-lg transition-all hover:bg-signal-orange"
                        />
                    ))}
                </div>
              </InteractiveBento>
            </motion.div>

            {/* Journal - Full Width */}
            <motion.div variants={itemReveal} className="md:col-span-12 h-full">
              <InteractiveBento
                title="Deep Journaling"
                description="Capture the noise, extract the knowledge. A minimalist sanctuary for your thoughts, designed for clarity and reflection."
                icon={BookOpen}
                accentColor="amethyst"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                         <div key={i} className="space-y-4 text-left">
                            <div className="h-4 w-1/2 bg-white/10 rounded" />
                            <div className="h-20 w-full bg-white/5 rounded-2xl" />
                        </div>
                    ))}
                </div>
              </InteractiveBento>
            </motion.div>
          </motion.div>
        </section>

        {/* VISION SECTION */}
        <section id="vision" className="py-24 md:py-40 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-electric-blue/5 pointer-events-none" />
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
              <motion.div {...fadeInUp}>
                  <h2 className="text-4xl md:text-6xl font-semibold mb-8 tracking-tight italic">Built for the <br /> 1% of Performers.</h2>
                  <p className="text-muted-slate text-xl leading-relaxed mb-10">
                      Produs isn't just another productivity app. It's a philosophy of intentional living, engineered for those who demand more from their time and mind.
                  </p>
                  <ul className="space-y-6">
                      {[
                          "End-to-end data encryption",
                          "Real-time cross-device synchronization",
                          "Customizable bento-box architecture",
                          "High-fidelity data visualizations"
                      ].map((item, i) => (
                          <li key={i} className="flex items-center gap-4 text-titanium-white font-medium">
                              <div className="size-2 rounded-full bg-electric-blue shadow-[0_0_10px_rgba(0,102,255,1)]" />
                              {item}
                          </li>
                      ))}
                  </ul>
              </motion.div>
              <motion.div
                  {...fadeInUp}
                  className="relative max-w-xl mx-auto lg:max-w-none"
              >
                  <div className="absolute -inset-4 bg-electric-blue/20 blur-3xl rounded-full opacity-30 animate-pulse" />
                  <div className="relative aspect-square rounded-[2.5rem] md:rounded-[3rem] bg-obsidian border border-white/10 flex items-center justify-center p-8 md:p-12 overflow-hidden">
                      <Layers className="text-electric-blue size-32 md:size-40 opacity-20 absolute" />
                      <Globe className="text-white size-48 md:size-64 animate-[spin_20s_linear_infinite] opacity-10" />
                      <div className="text-center z-10">
                          <div className="text-6xl md:text-8xl font-black text-electric-blue mb-4 tracking-tighter">99%</div>
                          <div className="text-muted-slate uppercase tracking-[0.3em] font-black text-sm">Noise Reduction</div>
                      </div>
                  </div>
              </motion.div>
          </div>
        </section>

        {/* FINAL PROTOCOL */}
        <section className="py-24 md:py-40 px-6 max-w-4xl mx-auto text-center z-10 relative">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
             className="p-10 md:p-20 rounded-[2.5rem] md:rounded-[3rem] border border-electric-blue/20 bg-[radial-gradient(circle_at_50%_0%,rgba(0,102,255,0.15)_0%,transparent_70%)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-20 bg-electric-blue rounded-full shadow-[0_0_20px_rgba(0,102,255,1)]" />

            <h2 className="text-4xl md:text-6xl font-semibold mb-8 leading-tight">Ready to enter the <br /> cockpit?</h2>
            <p className="text-muted-slate mb-12 text-lg font-light">Join the elite few who treat their productivity as a high-performance system.</p>

            <div className="flex justify-center">
                <MagneticButton>
                    <Link to="/auth" className="inline-flex items-center gap-2 px-12 py-5 bg-titanium-white text-deep-space rounded-full font-black hover:scale-105 transition-all shadow-[0_10px_40px_rgba(255,255,255,0.2)]">
                        Initialize System <ArrowRight size={20} />
                    </Link>
                </MagneticButton>
            </div>
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
    </>
  );
}
