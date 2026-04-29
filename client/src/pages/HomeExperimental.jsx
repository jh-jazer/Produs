import React from 'react';
import { motion } from 'framer-motion';

export default function HomeExperimental() {
  return (
    <div className="w-full min-h-screen bg-transparent text-white p-8 md:p-12 font-sans overflow-y-auto">
      {/* Hanging ID Badge Section */}
      <div className="relative mb-[40rem] md:mb-48 h-32 flex flex-col items-center">
        {/* The Lace / Lanyard (Centered) */}
        <div className="absolute top-[-32px] flex gap-4 h-12">
          <div className="w-[1px] h-full bg-white/20" />
          <div className="w-[1px] h-full bg-white/20" />
        </div>
        
        {/* The ID Card */}
        <motion.div 
          initial={{ y: -20, opacity: 0, rotate: -2 }}
          animate={{ y: 0, opacity: 1, rotate: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15,
            delay: 0.2
          }}
          className="absolute top-4 bg-[#121212] text-white w-72 md:w-80 p-8 md:p-6 rounded-sm shadow-[0_30px_80px_rgba(0,0,0,0.9)] border-t-[8px] border-primary group min-h-[28rem] md:min-h-0 flex flex-col justify-between"
        >
          {/* Card Clip Hole */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 size-6 bg-black rounded-full border-[6px] border-[#121212]" />
          
          <div className="flex flex-col gap-5">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left gap-3 md:gap-0">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Operative ID</span>
                <span className="text-sm font-black tracking-tighter">#PX-7729-ALPHA</span>
              </div>
              <div className="size-10 bg-white/5 rounded-sm flex items-center justify-center border border-white/10 shrink-0">
                <span className="material-symbols-outlined text-xl opacity-40">fingerprint</span>
              </div>
            </div>

            <div className="h-[1px] bg-white/10 w-full" />

            <div className="flex flex-col items-center gap-4">
              <div className="size-20 md:size-14 bg-black rounded-sm overflow-hidden border border-white/10 shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white/10 text-4xl md:text-3xl">person</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">AUTHORIZED</span>
                <span className="text-xs font-bold uppercase tracking-tight">OPERATIVE_SESSION</span>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-3">
              <div className="h-[1px] bg-white/5 w-full md:hidden" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">ACTIVE_LINK</span>
                </div>
                <span className="text-[8px] font-mono opacity-40">SEC_LEVEL_04</span>
              </div>
            </div>
          </div>

          {/* Ghosted Branding */}
          <div className="absolute bottom-0 right-0 p-2 opacity-[0.02] pointer-events-none">
            <span className="text-[40px] font-black">PRODUS</span>
          </div>
        </motion.div>
      </div>

      {/* Experimental Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-[1400px]">
        
        {/* Vitality Nexus Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="md:col-span-8 group relative bg-white/[0.03] border border-white/[0.08] rounded-[2rem] p-8 overflow-hidden hover:bg-white/[0.05] transition-all duration-500"
        >
          <div className="relative z-10">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-8 text-white/40">Vitality // SYNCHRONIZATION</h3>
            <div className="flex flex-col md:flex-row gap-12 items-end justify-between">
              <div className="flex flex-col gap-4">
                <span className="text-6xl font-black tracking-tighter">98.4%</span>
                <p className="text-white/40 text-xs font-light tracking-wide max-w-[200px]">
                  Optimal cognitive state detected. Your neural loops are currently operating at peak efficiency.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 text-right">
                <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Efficiency Index</span>
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '98%' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-primary" 
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Abstract geometric background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        </motion.div>

        {/* Strategic Node Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="md:col-span-4 bg-white/5 border border-white/[0.1] rounded-[2rem] p-8 flex flex-col justify-between hover:border-primary/30 transition-all cursor-pointer group"
        >
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-6 text-white/40">Strategy // CURRENT</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-center gap-3">
                <div className="size-1.5 bg-primary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Finalize HUD Architecture</span>
              </li>
              <li className="flex items-center gap-3 opacity-40">
                <div className="size-1.5 bg-white rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Neural Loop Integration</span>
              </li>
              <li className="flex items-center gap-3 opacity-40">
                <div className="size-1.5 bg-white rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Capital Stream Sync</span>
              </li>
            </ul>
          </div>
          <div className="mt-12 flex justify-between items-center group-hover:translate-x-1 transition-transform">
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Open Strategic Node</span>
            <span className="material-symbols-outlined text-sm">east</span>
          </div>
        </motion.div>

        {/* Capital Flow Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { label: 'Capital', value: '$12,450.00', trend: '+12.5%' },
            { label: 'Energy', value: '450kJ', trend: 'Stable' },
            { label: 'Focus', value: '4.8h', trend: 'Record' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 flex flex-col gap-2 hover:bg-white/[0.04] transition-all">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">{stat.label}</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-black tracking-tight">{stat.value}</span>
                <span className="text-[9px] font-mono text-primary tracking-widest mb-1">{stat.trend}</span>
              </div>
            </div>
          ))}
        </motion.div>

      </div>

      {/* Decorative vertical lines */}
      <div className="fixed left-4 top-0 bottom-0 w-[1px] bg-white/[0.03] pointer-events-none" />
      <div className="fixed left-8 top-0 bottom-0 w-[1px] bg-white/[0.03] pointer-events-none" />
    </div>
  );
}
