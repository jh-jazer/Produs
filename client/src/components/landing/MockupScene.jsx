import React from 'react';
import { motion } from 'framer-motion';

const MockupScene = ({ config }) => {
  const desktopImage = config?.desktopImage || "/desktopmock.png";
  const mobileImage = config?.mobileImage || "/mobilemock.png";
  const responsivenessText = config?.responsivenessText || "YOUR WORKFLOW, UNLEASHED. SYNCED ACROSS ALL DEVICES.";

  return (
    <div className="scene-mockups fixed inset-0 flex items-center justify-center z-30 pointer-events-none opacity-0">
      <div className="relative w-full max-w-7xl px-6 md:px-12 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
        {/* Desktop Mockup */}
        <div className="mockup-desktop relative w-full md:w-[70%] aspect-[1911/883] bg-black rounded-xl overflow-hidden border-[1.5px] md:border-[2px] border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <img src={desktopImage} alt="Desktop Interface" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Mobile Part (Mockup + Text Side-by-Side on Mobile too) */}
        <div className="flex flex-row items-center gap-6 md:gap-0 md:contents">
          <div className="mockup-mobile relative w-[35%] md:w-[18%] aspect-[5/9] bg-[#0a0a0a] rounded-xl md:rounded-2xl overflow-hidden border-[1.5px] md:border-[2px] border-white/20 shadow-2xl shrink-0">
            <img src={mobileImage} alt="Mobile Interface" className="w-full h-full object-cover" />
          </div>

          {/* Responsiveness Description */}
          <div className="md:absolute md:-bottom-24 left-1/2 md:-translate-x-1/2 text-left md:text-center max-w-[200px] md:max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col items-start md:items-center gap-2"
            >
              <p className="text-2xl md:text-6xl font-black text-white/60 tracking-tight md:tracking-tighter uppercase italic leading-[0.9]">
                {responsivenessText}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockupScene;
