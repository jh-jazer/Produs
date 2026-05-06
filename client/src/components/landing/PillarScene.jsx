import React from 'react';
import GlitchTitle from './GlitchTitle';

const PillarScene = ({ progress, isMobile }) => {
  const threshold = 0.65;
  
  return (
    <div className="scene-quadrants fixed inset-0 z-30 pointer-events-none p-12 md:p-24 overflow-hidden">
      {/* Intellectual */}
      <div className="quadrant-intellectual absolute top-[15%] md:top-[20%] right-[10%] md:left-[15%] md:right-auto opacity-0 text-right md:text-left max-w-[200px] md:max-w-xs">
        <h3 className="text-white md:text-xl font-black uppercase tracking-tighter mb-2 md:mb-4" style={{ fontSize: isMobile ? '18px' : undefined }}>
          <GlitchTitle progress={progress} threshold={threshold} original="Intellectual" target="STORIES" />
        </h3>
        <p className="text-white/40 text-[10px] md:text-sm font-light tracking-wide leading-relaxed max-w-[180px] md:max-w-[300px]">
          <GlitchTitle progress={progress} threshold={threshold} original="Strategic planning, Deep Work focus sessions, and unrestricted mental logging." target="Every chapter written. Every mission logged. Your narrative, your rules." />
        </p>
      </div>

      {/* Physical */}
      <div className="quadrant-physical absolute top-[35%] md:top-[20%] right-[10%] md:right-[15%] opacity-0 text-right max-w-[200px] md:max-w-xs">
        <h3 className="text-white md:text-xl font-black uppercase tracking-tighter mb-2 md:mb-4" style={{ fontSize: isMobile ? '18px' : undefined }}>
          <GlitchTitle progress={progress} threshold={threshold} original="Physical" target="LEVELLING" />
        </h3>
        <p className="text-white/40 text-[10px] md:text-sm font-light tracking-wide leading-relaxed max-w-[180px] md:max-w-[300px]">
          <GlitchTitle progress={progress} threshold={threshold} original="Real-time vitality tracking and automated habit loops for peak energy maintenance." target="Your body is your base stat. Train it. Track it. Level it up." />
        </p>
      </div>

      {/* Financial */}
      <div className="quadrant-financial absolute top-[55%] md:bottom-[20%] right-[10%] md:left-[15%] md:right-auto md:top-auto opacity-0 text-right md:text-left max-w-[200px] md:max-w-xs">
        <h3 className="text-white md:text-xl font-black uppercase tracking-tighter mb-2 md:mb-4" style={{ fontSize: isMobile ? '18px' : undefined }}>
          <GlitchTitle progress={progress} threshold={threshold} original="Financial" target="SURVIVAL" />
        </h3>
        <p className="text-white/40 text-[10px] md:text-sm font-light tracking-wide leading-relaxed max-w-[180px] md:max-w-[300px]">
          <GlitchTitle progress={progress} threshold={threshold} original="Full-spectrum capital management, asset tracking, and resource allocation." target="Capital is oxygen. Monitor every flow. Survive the game." />
        </p>
      </div>

      {/* Spiritual */}
      <div className="quadrant-spiritual absolute top-[75%] md:bottom-[20%] right-[10%] md:right-[15%] md:top-auto opacity-0 text-right max-w-[200px] md:max-w-xs">
        <h3 className="text-white md:text-xl font-black uppercase tracking-tighter mb-2 md:mb-4" style={{ fontSize: isMobile ? '18px' : undefined }}>
          <GlitchTitle progress={progress} threshold={threshold} original="Spiritual" target="COMPETITION" />
        </h3>
        <p className="text-white/40 text-[10px] md:text-sm font-light tracking-wide leading-relaxed max-w-[180px] md:max-w-[300px]">
          <GlitchTitle progress={progress} threshold={threshold} original="Mindset reflection, gratitude rituals, and alignment through intentionality." target="The real competition is yesterday's version of you. Outpace it." />
        </p>
      </div>
    </div>
  );
};

export default PillarScene;
