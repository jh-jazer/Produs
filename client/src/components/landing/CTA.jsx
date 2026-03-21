import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function CTA({ user }) {
  return (
    <section className="fixed inset-0 flex flex-col items-center justify-center text-center px-6 pb-40 scene-cta pointer-events-none opacity-0 z-30 bg-[#020202]">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent mb-16"></div>

        <span className="text-[8px] md:text-[9px] font-thin uppercase tracking-[0.5em] md:tracking-[1.5em] text-white/20 mb-8 md:mb-12 block">
          Operational Nexus // Final Sequence
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-6xl font-thin uppercase tracking-[0.3em] md:tracking-[0.6em] text-white leading-[1.3] mb-16 md:mb-24 px-4 overflow-hidden">
          Take Control <br />
          <span className="text-white/10">With Us.</span>
        </h2>
        
        <Link to={user ? "/dashboard" : "/auth"} className="group flex flex-col items-center gap-6 md:gap-10 pointer-events-auto">
          <div className="size-16 md:size-20 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white group-hover:scale-110 transition-all duration-700 bg-black shadow-[0_0_30px_rgba(255,255,255,0.02)] group-hover:shadow-[0_0_50px_rgba(255,255,255,0.1)]">
            <ChevronRight size={20} className="text-white group-hover:translate-x-1 transition-all md:w-6 md:h-6" />
          </div>
          <span className="text-[8px] font-thin uppercase tracking-[0.5em] md:tracking-[1.5em] text-white/40 group-hover:text-white transition-colors">Initialize System</span>
        </Link>
      </div>
    </section>
  );
}
