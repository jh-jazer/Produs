import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Database, Shield, Server, User } from 'lucide-react';
import Footer from '../components/landing/Footer';

export default function Manual() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-electric-blue/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-4 md:px-12 py-6 md:py-10 flex items-center bg-black/50 backdrop-blur-md">
        <Link to="/" className="group flex items-center gap-3 md:gap-4 cursor-pointer">
          <div className="size-8 md:size-10 rounded-full border border-white/30 flex items-center justify-center group-hover:border-current transition-all">
            <ChevronLeft size={14} className="text-white/80 group-hover:text-current group-hover:-translate-x-1 transition-all" />
          </div>
          <span className="font-normal text-[10px] uppercase tracking-[0.5em] text-white/80 group-hover:text-current transition-colors">Return</span>
        </Link>
        <div className="mx-auto absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="size-4 bg-electric-blue flex items-center justify-center rotate-45" />
          <span className="font-normal text-[11px] md:text-xs uppercase tracking-[0.8em] text-white">System Manual</span>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 pt-40 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-24"
        >
          {/* System Overview */}
          <section className="space-y-8 relative">
            <div className="absolute -left-[50%] top-0 size-[50vw] bg-electric-blue/5 blur-[150px] rounded-full pointer-events-none" />
            <h1 className="text-4xl md:text-6xl font-thin uppercase tracking-[0.3em] leading-tight">
              System <br/><span className="text-white/30">Overview</span>
            </h1>
            <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-2xl font-light">
              Produs isn't just a productivity tool; it is a central nexus for tracking your stats, treating your life as a high-stakes RPG. It is built to force focus, discarding the noise to help you maximize your potential.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              <div className="p-8 border border-white/10 bg-[#050505] rounded-xl hover:border-electric-blue/50 transition-colors group">
                <Database className="text-electric-blue mb-6 size-8 group-hover:scale-110 transition-transform" />
                <h3 className="text-xs font-semibold uppercase tracking-[0.3em] mb-4">The Mission</h3>
                <p className="text-white/50 text-sm leading-relaxed font-light">
                  A strict adherence to the "Local-First" philosophy. You own your data. Produs runs as an interface to your potential, but the sovereign authority over the information remains completely yours.
                </p>
              </div>
              <div className="p-8 border border-white/10 bg-[#050505] rounded-xl hover:border-electric-blue/50 transition-colors group">
                <User className="text-white mb-6 size-8 group-hover:scale-110 transition-transform" />
                <h3 className="text-xs font-semibold uppercase tracking-[0.3em] mb-4">The Creator</h3>
                <p className="text-white/50 text-sm leading-relaxed font-light">
                  Forged by JH, driven by a vision to blend high-contrast aesthetics with practical engineering. The goal: to create a system that recalibrates workflows without friction.
                </p>
              </div>
            </div>
          </section>

          {/* System Specs */}
          <section className="space-y-8 border-t border-white/10 pt-24">
            <h2 className="text-2xl md:text-4xl font-thin uppercase tracking-[0.3em]">
              System <span className="text-white/30">Specs</span>
            </h2>
            <div className="p-8 border border-white/10 bg-[#0a0a0a] rounded-xl flex items-start gap-6">
              <Server className="text-electric-blue shrink-0 size-8 mt-1" />
              <div>
                <p className="text-white/60 text-sm leading-relaxed font-light mb-6">
                  Engineered as a robust Client-Server Monorepo, the architecture is designed for speed, offline capabilities, and resilience. Built to impress those who understand the code behind the curtain.
                </p>
                <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
                  <span className="px-4 py-2 border border-white/10 rounded-full bg-black">React</span>
                  <span className="px-4 py-2 border border-white/10 rounded-full bg-black">Node.js</span>
                  <span className="px-4 py-2 border border-white/10 rounded-full bg-black">MongoDB</span>
                  <span className="px-4 py-2 border border-white/10 rounded-full bg-black">Zustand</span>
                  <span className="px-4 py-2 border border-white/10 rounded-full bg-black">Vite</span>
                </div>
              </div>
            </div>
          </section>

          {/* The Ledger */}
          <section className="space-y-12 border-t border-white/10 pt-24">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-4xl font-thin uppercase tracking-[0.3em]">
                The <span className="text-white/30">Ledger</span>
              </h2>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-electric-blue">
                Privacy & Data Sovereignty
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border border-white/5 bg-[#020202]">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/80 mb-3">Data Sovereignty</h4>
                <p className="text-white/40 text-xs leading-relaxed font-light">
                  Your data stays on your device. Local-first means true ownership. The system is yours.
                </p>
              </div>
              <div className="p-6 border border-white/5 bg-[#020202]">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/80 mb-3">Security Protocol</h4>
                <p className="text-white/40 text-xs leading-relaxed font-light">
                  Personal info is guarded. Secure authentication bridges are employed to ensure only you hold the keys.
                </p>
              </div>
              <div className="p-6 border border-white/5 bg-[#020202] border-l-electric-blue/50">
                <Shield className="text-electric-blue mb-4 size-6" />
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-white mb-2">No Tracking</h4>
                <p className="text-white/60 text-xs leading-relaxed font-light">
                  The System does not spy on the Player. Period. Zero telemetry, zero noise.
                </p>
              </div>
            </div>
          </section>

        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
