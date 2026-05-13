import React from 'react';

const RealityScene = () => {
  return (
    <div className="scene-reality fixed inset-0 flex items-center justify-end md:justify-center px-10 md:px-24 pointer-events-none opacity-0">
      <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-40 lg:gap-64 items-end md:items-center max-w-7xl w-full md:-translate-x-4 lg:-translate-x-6">
        <div className="text-right md:-translate-x-[2px]">
          <h2 className="font-black tracking-tight uppercase leading-[0.85] flex flex-col items-end">
            <span className="text-6xl md:text-8xl text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}>HELP YOUR</span>
            <span className="text-6xl md:text-8xl text-white">HERO</span>
          </h2>
        </div>
        <div className="text-right md:text-left md:pl-12">
          <p className="text-white/40 text-xs md:text-lg font-light tracking-[0.3em] uppercase leading-relaxed max-w-[240px] md:max-w-sm">
            WHILE ON YOUR SIDE OF <span className="text-white/80">REALITY</span> <br /> WITH OUR SYSTEM
          </p>
        </div>
      </div>
    </div>
  );
};

export default RealityScene;
