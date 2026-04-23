import React from "react";

export default function Features({ features }) {
  return (
    <div className="h-[600vh] relative flex flex-col items-center justify-center">
      {features.map((feature, idx) => (
        <div 
          key={feature.id} 
          className={`detail-${feature.id} fixed inset-0 flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-16 pointer-events-none opacity-0 z-30 perspective-1000 px-6 md:px-16 max-w-7xl mx-auto w-full`}
        >
          {/* Text / Info Side */}
          <div className={`text-center relative p-4 md:p-12 bg-[#000000] border border-white/10 rounded-3xl backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden w-[90%] lg:w-1/2 mx-auto md:mx-0 flex flex-col items-center order-2 ${idx % 2 === 0 ? 'lg:order-1 lg:text-left lg:items-start' : 'lg:order-2 lg:text-right lg:items-end'} max-h-[50vh] lg:max-h-none overflow-y-auto transition-all duration-1000`}>
            <div className={`hud-icon size-16 md:size-20 rounded-2xl bg-white/[0.04] border-white/[0.1] flex items-center justify-center mb-8 md:mb-12 shadow-[0_0_50px_rgba(0,0,0,0.05)]`}>
              <feature.icon className={`text-white/80 w-6 h-6 md:w-9 md:h-9`} strokeWidth={1} />
            </div>
            <div className={`hud-title w-full flex flex-col items-center ${idx % 2 === 0 ? 'lg:items-start' : 'lg:items-end'}`}>
              <span className={`text-[10px] md:text-[11px] font-medium text-white/80 block mb-4 md:mb-6 uppercase tracking-[0.3em] md:tracking-[0.6em]`}>
                Feature: {feature.label}
              </span>
              <h2 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-thin text-white uppercase tracking-[0.2em] md:tracking-[0.4em] mb-6 md:mb-12 drop-shadow-glow w-full leading-tight break-words`}>
                {feature.title}
              </h2>
              <div className={`w-24 md:w-32 h-px bg-gradient-to-r ${idx % 2 === 0 ? 'from-transparent via-white/15 to-transparent lg:from-white/15 lg:via-white/5 lg:to-transparent' : 'from-transparent via-white/15 to-transparent lg:from-transparent lg:via-white/5 lg:to-white/15'}`} />
            </div>
            
            {/* Subtle AR Decoration */}
            <div className={`absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 border-t border-l border-white/10`} />
            <div className={`absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 border-b border-r border-white/10`} />
          </div>
          
          {/* Visual Mockups Side */}
          <div className={`w-full lg:w-1/2 relative flex items-center justify-center h-[30vh] lg:h-auto order-1 ${idx % 2 === 0 ? 'lg:order-2 lg:justify-end' : 'lg:order-1 lg:justify-start'}`}>
            {/* Desktop Mockup */}
            <div className={`relative w-full max-w-[400px] aspect-[16/10] bg-[#000000] border-white/10 rounded-t-xl rounded-b-md border shadow-[0_0_40px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden [transform:rotateY(-5deg)_rotateX(5deg)] transition-colors duration-1000`}>
              <div className={`h-4 w-full bg-white/5 border-white/10 border-b flex items-center px-2 gap-1 shrink-0`}>
                <div className={`w-1.5 h-1.5 rounded-full bg-white/20`} />
                <div className={`w-1.5 h-1.5 rounded-full bg-white/20`} />
                <div className={`w-1.5 h-1.5 rounded-full bg-white/20`} />
              </div>
              <div className={`flex-1 bg-gradient-to-br from-[#000000] to-black p-4 flex flex-col gap-2 relative overflow-hidden transition-colors duration-1000`}>
                 <div className={`w-full h-8 bg-white/5 rounded`} />
                 <div className="flex gap-2 w-full h-full">
                   <div className={`w-1/3 h-full bg-white/5 rounded`} />
                   <div className="w-2/3 h-full flex flex-col gap-2">
                     <div className={`w-full h-1/2 bg-white/5 rounded`} />
                     <div className={`w-full h-1/2 bg-white/5 rounded`} />
                   </div>
                 </div>
                 <div className="absolute inset-0 bg-electric-blue/10 mix-blend-overlay" />
              </div>
            </div>

            {/* Mobile Mockup Overlay */}
            <div className={`absolute -bottom-8 md:-bottom-12 -right-4 md:-right-8 lg:left-0 lg:-bottom-16 w-[120px] md:w-[150px] aspect-[9/19] bg-[#000000] border-[#222] rounded-[2rem] border-4 shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden [transform:rotateY(10deg)_rotateZ(-5deg)] transition-colors duration-1000`}>
              <div className={`w-1/2 h-4 bg-[#222] mx-auto rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2 z-10`} />
              <div className={`flex-1 bg-gradient-to-b from-[#000000] to-black pt-8 px-3 pb-3 flex flex-col gap-2 relative transition-colors duration-1000`}>
                 <div className={`w-full h-12 bg-white/5 rounded-lg`} />
                 <div className={`w-full h-12 bg-white/5 rounded-lg`} />
                 <div className={`w-full h-12 bg-white/5 rounded-lg`} />
                 <div className={`w-full flex-1 bg-white/5 rounded-lg`} />
                 <div className="absolute inset-0 bg-electric-blue/10 mix-blend-overlay" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
