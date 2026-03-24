import React from "react";
import { motion } from "framer-motion";

export default function Testimonials({ testimonials }) {
  return (
    <section className="fixed inset-0 flex flex-col items-center justify-center text-center px-6 pt-32 pb-12 scene-testimonials pointer-events-none opacity-0 z-30 bg-[#020202] transition-colors duration-1000">
      <div className="max-w-6xl w-full mx-auto flex flex-col items-center">
        <div className="mb-12 w-full">
          <span className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.5em] md:tracking-[1.5em] text-white/70 mb-12 block">
            Global User Reviews // Testimonials
          </span>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-6 md:gap-10 w-full perspective-2000 pb-8 no-scrollbar">
            {testimonials.map((testimonial, idx) => (
              <motion.div 
                key={testimonial.id}
                initial={{ opacity: 0, y: 50, rotateX: 20 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: idx * 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`w-[85vw] shrink-0 snap-center md:w-auto md:shrink group relative bg-[#080808] border border-white/10 hover:border-white/20 p-8 md:p-10 rounded-3xl flex flex-col items-start text-left backdrop-blur-xl overflow-hidden transition-all duration-700 hover:-translate-y-2 pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}
              >
                {/* Abstract Data Header */}
                <div className="w-full flex justify-between items-start mb-10">
                  <div className="flex flex-col gap-1">
                    <div className={`w-12 h-[2px] bg-white/30`} />
                    <span className={`text-[9px] text-white/80 uppercase tracking-[0.3em] font-bold`}>Verification_{testimonial.id}</span>
                  </div>
                  <div className={`size-2 rounded-full ${testimonial.accent === 'electric-blue' ? 'bg-electric-blue shadow-[0_0_10px_rgba(0,183,255,0.8)]' : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'} animate-pulse`} />
                </div>

                {/* Content */}
                <div className="relative mb-12">
                  <span className={`absolute -top-6 -left-2 text-4xl font-serif text-white/10 opacity-50`}>"</span>
                  <p className={`text-sm md:text-[15px] font-extralight text-white/50 leading-relaxed italic tracking-wide`}>
                    {testimonial.content}
                  </p>
                </div>

                {/* Stats Panel - Terminal Aesthetic */}
                <div className={`w-full mt-auto pt-8 border-t border-white/[0.1] flex flex-col gap-4`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] text-white/60 uppercase tracking-[0.4em] font-bold`}>User_Stats</span>
                    <span className={`text-[11px] text-white/90 font-mono tracking-tighter font-bold`}>{testimonial.stats}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <span className={`block text-[12px] font-normal text-white/90 tracking-[0.1em] uppercase`}>Subject_{testimonial.id}</span>
                     <span className={`block text-[9px] text-white/50 tracking-[0.4em] uppercase font-light`}>{testimonial.role}</span>
                  </div>
                </div>

                {/* Hover Glow Effects */}
                <div className={`absolute -bottom-20 -right-20 size-40 blur-[80px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-1000 ${testimonial.accent === 'electric-blue' ? 'bg-electric-blue' : 'bg-white'}`} />
                
                {/* Scanning Line Animation */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`w-full h-[1px] bg-white/10 absolute top-0 left-0 animate-scan-line`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
