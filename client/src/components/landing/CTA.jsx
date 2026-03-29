import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Footer from "./Footer";

export default function CTA({ user }) {
  return (
    <section className="fixed inset-0 flex flex-col items-center justify-between text-center px-6 scene-cta pointer-events-none opacity-0 z-30 bg-[#020202] transition-colors duration-1000">
      <div className="flex-grow flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
        <div className="w-px h-16 md:h-24 bg-gradient-to-b from-transparent via-white/10 to-transparent mb-8 md:mb-12"></div>
        
        <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] md:text-[12px] font-semibold uppercase tracking-[0.5em] md:tracking-[1.5em] text-white/60 mb-6 md:mb-8 block">
              Ready to Begin? // Final Step
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-thin uppercase tracking-[0.3em] md:tracking-[0.6em] text-white leading-[1.3] mb-12 md:mb-16 px-4 overflow-hidden">
              Take Control <br />
              <span className="text-white/10">With Us.</span>
            </h2>
            
            <Link to={user ? "/dashboard" : "/auth"} className="group flex flex-col items-center gap-4 md:gap-8 pointer-events-auto">
              <div className="size-14 md:size-16 rounded-full border border-white/10 group-hover:border-white flex items-center justify-center group-hover:scale-110 transition-all duration-700 bg-black shadow-[0_0_30px_rgba(255,255,255,0.02)] group-hover:shadow-[0_0_50px_rgba(0,0,0,0.1)]">
                <ChevronRight size={18} className="text-white group-hover:translate-x-1 transition-all md:w-5 md:h-5" />
              </div>
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.5em] md:tracking-[1.2em] text-white/80 group-hover:text-white transition-colors">Get Started Now</span>
            </Link>
        </div>
      </div>

      <div className="w-full pointer-events-auto">
        <Footer />
      </div>
    </section>
  );
}
