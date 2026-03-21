import React from "react";

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

        <div className="absolute text-2xl sm:text-3xl md:text-4xl font-thin uppercase text-white/90 drop-shadow-glow text-let-me-help opacity-0">
          <span className="block tracking-[0.5em] md:tracking-[1.5em] -mr-[0.5em] md:-mr-[1.5em]">Do this with us</span>
        </div>
        
        <div className="absolute bottom-[-150px] flex flex-col items-center gap-12">
          <div className="w-px h-40 bg-gradient-to-b from-white/20 to-transparent" />
          <span className="text-[8px] font-thin uppercase tracking-[0.5em] md:tracking-[1em] text-white/20 animate-pulse">Initiate Calibration</span>
        </div>
      </div>
    </section>
  );
}
