import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, GitCommit, Rocket, Wrench } from 'lucide-react';
import Footer from '../components/landing/Footer';

export default function PatchNotes() {
  const updates = [
    {
      version: "v1.2.0",
      date: "Current Cycle",
      type: "Update",
      title: "Zen Archer Class Balancing",
      desc: "Recalibrated focus metrics for the Zen Archer. Introduced deep-work multipliers. Smoothed out the frontend authentication flows.",
      icon: GitCommit
    },
    {
      version: "v1.1.0",
      date: "Previous Cycle",
      type: "Expansion",
      title: "Capital Flow Module Integration",
      desc: "Added the financial tracker system allowing players to manage their gold and resources alongside their daily tasks.",
      icon: Rocket
    },
    {
      version: "v1.0.0",
      date: "Initial Launch",
      type: "Genesis",
      title: "System Initialization",
      desc: "Core architecture deployed. Habit tracking, daily planning, and the foundational RPG class system set live.",
      icon: Wrench
    }
  ];

  const roadmap = [
    {
      feature: "Multiplayer Guilds",
      status: "In Development",
      desc: "Form alliances. Share resources. Battle collective goals as a unified front."
    },
    {
      feature: "Mobile App Beta",
      status: "Planning Phase",
      desc: "Native iOS/Android application for seamless tracking on the move."
    },
    {
      feature: "Advanced Data Export",
      status: "Backlog",
      desc: "Full CSV/JSON data sovereignty export tools for the Ledger."
    }
  ];

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
          <span className="font-normal text-[11px] md:text-xs uppercase tracking-[0.8em] text-white">Changelog</span>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 pt-40 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-32"
        >
          {/* Header */}
          <section className="space-y-6 relative">
            <div className="absolute -right-[50%] top-0 size-[50vw] bg-electric-blue/5 blur-[150px] rounded-full pointer-events-none" />
            <h1 className="text-4xl md:text-6xl font-thin uppercase tracking-[0.3em] leading-tight">
              Patch <br/><span className="text-white/30">Notes</span>
            </h1>
            <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-2xl font-light">
              The continuous evolution of the Produs system. Tracking updates, recalibrations, and upcoming Expansion Packs.
            </p>
          </section>

          {/* Version History */}
          <section className="space-y-12">
            <h2 className="text-2xl md:text-4xl font-thin uppercase tracking-[0.3em]">
              Version <span className="text-white/30">History</span>
            </h2>
            <div className="relative border-l border-white/10 pl-8 ml-4 md:ml-8 space-y-16">
              {updates.map((update, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[45px] top-0 p-2 bg-black border border-white/20 rounded-full group-hover:border-electric-blue transition-colors">
                    <update.icon className="size-5 text-white/50 group-hover:text-electric-blue transition-colors" />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold font-mono text-white">{update.version}</span>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-[0.1em] text-electric-blue">
                        {update.type}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-white/30">{update.date}</span>
                  </div>
                  <h3 className="text-lg font-medium tracking-[0.1em] mb-3">{update.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed font-light">
                    {update.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Roadmap */}
          <section className="space-y-12 border-t border-white/10 pt-24">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-4xl font-thin uppercase tracking-[0.3em]">
                System <span className="text-white/30">Roadmap</span>
              </h2>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-electric-blue">
                Upcoming Expansion Packs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roadmap.map((item, idx) => (
                <div key={idx} className="p-6 border border-white/5 bg-[#050505] hover:border-white/20 transition-colors flex flex-col h-full">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 block">
                    Status: <span className="text-white/80">{item.status}</span>
                  </span>
                  <h4 className="text-sm font-semibold uppercase tracking-[0.1em] mb-4">{item.feature}</h4>
                  <p className="text-white/50 text-xs leading-relaxed font-light flex-grow">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
