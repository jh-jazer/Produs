import React from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="fixed inset-0 flex items-center justify-center text-center px-6 pt-20 scene-awakening pointer-events-none z-20 perspective-1000">
      <div className="max-w-5xl relative flex items-center justify-center min-h-[50vh]">
        <h1 className="absolute text-2xl sm:text-3xl md:text-4xl font-thin uppercase text-white/90 drop-shadow-glow">
          <span className="parallax-line-1 block tracking-[0.5em] md:tracking-[1.5em] -mr-[0.5em] md:-mr-[1.5em]">What if</span>
          <span className="parallax-line-2 text-white/30 block mt-8 tracking-[0.3em] md:tracking-[1.2em] -mr-[0.3em] md:-mr-[1.2em]">this is already your</span>
          <span className="parallax-line-3 text-white block mt-4 tracking-[0.5em] md:tracking-[1.5em] -mr-[0.5em] md:-mr-[1.5em]">Second Chance?</span>
        </h1>

        <div className="absolute text-2xl sm:text-3xl md:text-4xl font-thin uppercase text-white/90 drop-shadow-glow text-let-it-pass opacity-0">
          <span className="block tracking-[0.5em] md:tracking-[1.5em] -mr-[0.5em] md:-mr-[1.5em]">will you let it pass</span>
        </div>

        <div className="absolute text-2xl sm:text-3xl md:text-4xl font-thin uppercase text-white/90 drop-shadow-glow text-take-control opacity-0">
          <span className="block tracking-[0.5em] md:tracking-[1.5em] -mr-[0.5em] md:-mr-[1.5em]">or take back control</span>
        </div>

        <div className="absolute text-let-me-help opacity-0 pointer-events-auto">
          <Link 
            to="/auth" 
            className="block cursor-pointer pl-12 py-4 px-10 border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-[11px] md:text-xs tracking-[0.8em] md:tracking-[1em] font-bold uppercase transition-all hover:scale-105 active:scale-95 text-center text-white"
            style={{ marginLeft: '1em' }}
          >
            Start Now
          </Link>
        </div>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-8">
        <div className="w-px h-24 bg-gradient-to-b from-white/40 to-transparent" />
        <span className="text-[10px] font-medium uppercase tracking-[0.5em] md:tracking-[1em] text-white/40 animate-pulse">Scroll to Begin</span>
      </div>
    </section>
  );
}
