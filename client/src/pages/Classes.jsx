import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Shield, Sparkles, TrendingUp, Brain, Crosshair, Heart, Coins } from 'lucide-react';

export default function Classes() {
  const archetypes = [
    {
      id: "titan",
      title: "The Titan",
      icon: Shield,
      stat: "Strength",
      desc: "For those who conquer physical goals, fitness, and heavy lifting.",
      accent: "text-white"
    },
    {
      id: "muse",
      title: "The Muse",
      icon: Sparkles,
      stat: "Charisma",
      desc: "Empowering artists, writers, and social connectors to weave their reality.",
      accent: "text-white"
    },
    {
      id: "mogul",
      title: "The Mogul",
      icon: TrendingUp,
      stat: "Resources",
      desc: "Focused on empire building, networking, and dominating the market.",
      accent: "text-white"
    },
    {
      id: "sage",
      title: "The Sage",
      icon: Brain,
      stat: "Intellect",
      desc: "For deep thinkers and learners. Levels up by completing deep-work sessions.",
      accent: "text-electric-blue"
    },
    {
      id: "zen",
      title: "Zen Archer",
      icon: Crosshair,
      stat: "Focus",
      desc: "Precision and mindfulness. Striking targets with absolute clarity and peace.",
      accent: "text-white"
    }
  ];

  const expansions = [
    {
      title: "Vitality Nexus",
      icon: Heart,
      desc: "The Health Guide expansion module. Track physical metrics to ensure the vessel can support the mind.",
    },
    {
      title: "Capital Flow",
      icon: Coins,
      desc: "The Financial Tracker expansion module. Monitor resources, manage debt, and allocate gold for the journey ahead.",
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
          <span className="font-normal text-[11px] md:text-xs uppercase tracking-[0.8em] text-white">The Classes</span>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 pt-40 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-32"
        >
          {/* Header */}
          <section className="text-center space-y-6 max-w-3xl mx-auto relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[60vw] bg-electric-blue/10 blur-[200px] rounded-full pointer-events-none" />
            <h1 className="text-4xl md:text-7xl font-thin uppercase tracking-[0.3em] leading-tight">
              Archetype <br/><span className="text-white/30">Selection</span>
            </h1>
            <p className="text-white/50 text-sm md:text-base leading-relaxed font-light mx-auto max-w-xl">
              Understand the mechanics of your existence. Each class defines a unique path to mastery, converting daily actions into systemic progress.
            </p>
          </section>

          {/* Archetypes Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {archetypes.map((arch, idx) => (
              <div key={idx} className="p-8 border border-white/10 bg-[#050505] rounded-xl hover:border-white/30 transition-all group flex flex-col h-full">
                <div className="flex justify-between items-start mb-12">
                  <div className={`p-4 rounded-full bg-[#0a0a0a] border border-white/5 group-hover:border-white/20 transition-colors`}>
                    <arch.icon className={`size-8 ${arch.accent} group-hover:scale-110 transition-transform`} />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-medium">Class 0{idx+1}</span>
                </div>

                <h3 className="text-xl font-thin uppercase tracking-[0.2em] mb-4">{arch.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed font-light flex-grow mb-8">
                  {arch.desc}
                </p>

                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Core Stat</span>
                  <span className={`text-xs uppercase tracking-[0.2em] font-medium ${arch.accent}`}>{arch.stat}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Expansion Modules */}
          <section className="border-t border-white/10 pt-24 space-y-12">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-4xl font-thin uppercase tracking-[0.3em]">
                Expansion <span className="text-white/30">Modules</span>
              </h2>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-electric-blue">
                Specialized Tools for the Player
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {expansions.map((exp, idx) => (
                <div key={idx} className="p-8 border border-white/10 bg-[#020202] flex items-start gap-6 group hover:border-electric-blue/30 transition-colors">
                  <exp.icon className="size-10 text-white/60 group-hover:text-electric-blue shrink-0 mt-1 transition-colors" />
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] mb-3">{exp.title}</h3>
                    <p className="text-white/50 text-xs leading-relaxed font-light">
                      {exp.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
