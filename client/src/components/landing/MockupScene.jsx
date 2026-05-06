import React from 'react';

const MockupScene = () => {
  return (
    <div className="scene-mockups fixed inset-0 flex items-center justify-center z-30 pointer-events-none opacity-0">
      <div className="relative w-full max-w-7xl px-6 md:px-12 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
        <div className="mockup-desktop relative w-full md:w-[70%] aspect-[1911/883] bg-black rounded-xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <img src="/desktopmock.png" alt="Desktop Interface" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        <div className="mockup-mobile relative w-[40%] md:w-[18%] aspect-[361/601] bg-[#0a0a0a] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border-[4px] md:border-[6px] border-white/5 shadow-2xl">
          <img src="/mobilemock.png" alt="Mobile Interface" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default MockupScene;
