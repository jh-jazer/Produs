import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Shield, Sparkles, TrendingUp, Brain, Crosshair,
  Heart, Coins, Zap, Dumbbell, Clock, Activity, Target, Network, BookOpen
} from 'lucide-react';

export default function Classes() {
  const stats = [
    { name: "Strength", desc: "Physical power, training, health. Fed by Habit & Health Tracker.", icon: Dumbbell },
    { name: "Dexterity", desc: "Speed, precision, execution. Fed by Habit Tracker & Daily Planner.", icon: Target },
    { name: "Endurance", desc: "Consistency, resilience. Grows purely by maintaining streaks.", icon: Activity },
    { name: "Intelligence", desc: "Knowledge, reasoning. Fed by Habit Tracker & Journal.", icon: Brain },
    { name: "Wisdom", desc: "Judgement, reflection. Fed by Habit Tracker, Journal & Finance Tracker.", icon: BookOpen },
    { name: "Charisma", desc: "Presence, loyalty. Fed by Habit & Link Feature (Requires a partner).", icon: Network }
  ];

  const archetypes = [
    {
      title: "Blade Dancer",
      stats: "STR 90 / DEX 95",
      desc: "Moves faster than thought. The body is the weapon, the world is the obstacle.",
      icon: Zap,
      tiers: ["Street Brawler", "Blade Dancer", "Phantom Edge", "Death's Silhouette", "The Undying Blade"]
    },
    {
      title: "Sentinel",
      stats: "STR 85 / END 95",
      desc: "Cannot be broken. Has been tested by everything and is still standing.",
      icon: Shield,
      tiers: ["The Stubborn", "Sentinel", "Iron Bulwark", "The Immovable", "Eternal Fortress"]
    },
    {
      title: "Alchemist",
      stats: "INT 95 / WIS 85",
      desc: "Turns nothing into something. Every problem is just an unsolved equation.",
      icon: Sparkles,
      tiers: ["Tinkerer", "Alchemist", "Formula Breaker", "Grand Synthesist", "Architect of Truth"]
    },
    {
      title: "Architect",
      stats: "INT 92 / DEX 88",
      desc: "Sees the entire battlefield before the first move. Precision over power.",
      icon: TrendingUp,
      tiers: ["Draftsman", "Architect", "System Lord", "World Builder", "The Eternal Planner"]
    },
    {
      title: "Oracle",
      stats: "WIS 98 / END 80",
      desc: "Operates on a frequency others cannot tune into. Already knows the outcome.",
      icon: Brain,
      tiers: ["Dreamer", "Oracle", "The Farsighted", "Keeper of Inevitable Truths", "The One Who Already Knew"]
    },
    {
      title: "Commander",
      stats: "CHA 92 / STR 78",
      desc: "No single stat is maxed. Every stat is strong. People follow because they have earned it.",
      icon: Crosshair,
      tiers: ["Squad Leader", "Commander", "Warlord", "Iron Sovereign", "The Undefeated King"]
    },
    {
      title: "Bard",
      stats: "CHA 95 / INT 82",
      desc: "Words are spells. The right sentence can end a war before it starts.",
      icon: Network,
      tiers: ["Storyteller", "Bard", "Silver Tongue", "Voice of Legends", "The Word That Moves Worlds"]
    },
    {
      title: "Shadow Monk",
      stats: "WIS 95 / DEX 82",
      desc: "Has conquered the only enemy that truly matters — the self. Needs no one's approval.",
      icon: Target,
      tiers: ["Introvert", "Shadow Monk", "The Unseen", "Void Walker", "He Who Needs No Witness"]
    },
    {
      title: "Druid",
      stats: "WIS 90 / END 88",
      desc: "Reads the world like a living system. Nothing in the environment is noise.",
      icon: Heart,
      tiers: ["Wanderer", "Druid", "Pattern Seer", "Voice of the Wild", "The Living Codex"]
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
            <p className="text-white/50 text-sm md:text-base leading-relaxed font-light mx-auto max-w-2xl">
              This is a real-life RPG levelling system. Your stats are built through productive habits. Your stats determine your archetype, evolving through 5 tiers from the Unawakened to Legend.
            </p>
          </section>

          {/* Core Stats Overview */}
          <section className="space-y-12">
            <h2 className="text-2xl md:text-4xl font-thin uppercase tracking-[0.3em] text-center">
              The 6 <span className="text-white/30">Core Stats</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="p-6 border border-white/10 bg-[#050505] rounded-xl flex items-start gap-4 hover:border-white/30 transition-all">
                  <stat.icon className="size-6 text-electric-blue shrink-0 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] mb-2">{stat.name}</h3>
                    <p className="text-white/50 text-xs leading-relaxed font-light">{stat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Archetypes Grid */}
          <section className="space-y-12 border-t border-white/10 pt-24">
            <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl md:text-4xl font-thin uppercase tracking-[0.3em]">
                The 9 <span className="text-white/30">Archetypes</span>
              </h2>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-electric-blue">
                Unlocked at Level 5
              </p>
              <p className="text-white/50 text-xs leading-relaxed font-light mt-4">
                At Level 5, the system assigns the archetype whose dominant stats match yours. Archetypes evolve dynamically through 5 tiers as you level up.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {archetypes.map((arch, idx) => (
                <div key={idx} className="p-8 border border-white/10 bg-[#020202] rounded-xl hover:border-electric-blue/50 transition-all group flex flex-col h-full relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                     <arch.icon className="size-32" />
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-thin uppercase tracking-[0.2em] mb-2 text-white">{arch.title}</h3>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-electric-blue font-medium">{arch.stats}</span>
                  </div>

                  <p className="text-white/60 text-xs leading-relaxed font-light flex-grow mb-8">
                    {arch.desc}
                  </p>

                  <div className="mt-auto pt-6 border-t border-white/5">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 block mb-4">Evolution Path</span>
                    <ul className="space-y-2">
                      {arch.tiers.map((tier, tIdx) => (
                        <li key={tIdx} className="text-[10px] font-mono text-white/50 flex items-center gap-2">
                          <span className="text-electric-blue/50">T{tIdx+1}</span> {tier}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Level Progression */}
          <section className="border-t border-white/10 pt-24 space-y-12">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-4xl font-thin uppercase tracking-[0.3em]">
                Level <span className="text-white/30">Progression</span>
              </h2>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-electric-blue">
                The Journey to Level 20
              </p>
            </div>

            <div className="p-8 border border-white/10 bg-[#050505] overflow-x-auto rounded-xl">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.2em] text-white/40 border-b border-white/10">
                    <th className="pb-4 font-normal">Level</th>
                    <th className="pb-4 font-normal">Phase / Tier</th>
                    <th className="pb-4 font-normal">Title (Unawakened)</th>
                    <th className="pb-4 font-normal text-right">Total XP Required</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-mono text-white/70">
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4">1-4</td>
                    <td className="py-4">Unawakened</td>
                    <td className="py-4">Shut-in to Emerging</td>
                    <td className="py-4 text-right">0 - 850</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 text-electric-blue">5-7</td>
                    <td className="py-4 text-electric-blue">Awakened (Tier 1)</td>
                    <td className="py-4 text-electric-blue">Archetype Assigned</td>
                    <td className="py-4 text-right text-electric-blue">1,850+</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4">8-10</td>
                    <td className="py-4">Archetype Tier 2</td>
                    <td className="py-4">—</td>
                    <td className="py-4 text-right">10,350+</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4">11-13</td>
                    <td className="py-4">Archetype Tier 3</td>
                    <td className="py-4">—</td>
                    <td className="py-4 text-right">33,350+</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4">14-16</td>
                    <td className="py-4">Archetype Tier 4</td>
                    <td className="py-4">—</td>
                    <td className="py-4 text-right">85,350+</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-4 text-white font-bold">17-20</td>
                    <td className="py-4 text-white font-bold">Archetype Tier 5</td>
                    <td className="py-4 text-white font-bold">Mythical Status</td>
                    <td className="py-4 text-right text-white font-bold">193,350 - 412,350</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-white/40 text-[10px] leading-relaxed font-light text-center max-w-3xl mx-auto">
              XP is earned through daily habits, tracking, and streaks. Each stat has a soft daily cap to prevent exploitation.
              Streaks apply multipliers to XP earned (up to 2x for 100+ days). Level 20 requires over 3.5 years of perfect consistency.
            </p>
          </section>

        </motion.div>
      </main>
    </div>
  );
}
