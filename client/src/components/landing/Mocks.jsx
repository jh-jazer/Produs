import React from 'react';
import { motion } from 'framer-motion';

export const DesktopMock = ({ children }) => {
  return (
    <div className="relative perspective-2000 group">
      <motion.div
        initial={{ rotateY: 20, rotateX: 10, scale: 0.9 }}
        whileInView={{ rotateY: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full aspect-video rounded-2xl bg-[#0a0a0a] border border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5),0_0_20px_rgba(0,102,255,0.1)] overflow-hidden"
      >
        {/* Screen Bezel */}
        <div className="absolute inset-2 rounded-lg bg-deep-space overflow-hidden border border-white/5">
          {children || (
            <div className="w-full h-full bg-[#050505] flex flex-col">
              <div className="h-8 border-b border-white/5 flex items-center px-4 gap-2">
                <div className="size-2 rounded-full bg-red-500/50" />
                <div className="size-2 rounded-full bg-yellow-500/50" />
                <div className="size-2 rounded-full bg-green-500/50" />
              </div>
              <div className="flex-1 p-4">
                <div className="w-full h-full rounded bg-white/5 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Reflection/Glow underneath */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-20 bg-electric-blue/20 blur-[100px] -z-10" />
    </div>
  );
};

export const MobileMock = ({ children }) => {
  return (
    <div className="relative perspective-2000 group">
      <motion.div
        initial={{ rotateY: -20, rotateX: 10, scale: 0.9 }}
        whileInView={{ rotateY: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 w-[280px] aspect-[9/19] rounded-[3rem] bg-[#0a0a0a] border-[8px] border-[#1a1a1a] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5),0_0_40px_rgba(0,102,255,0.1)] overflow-hidden"
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1a1a] rounded-b-2xl z-30 flex items-center justify-center">
            <div className="w-12 h-1 bg-white/10 rounded-full" />
        </div>

        {/* Screen */}
        <div className="absolute inset-0 bg-deep-space overflow-hidden">
          {children || (
             <div className="w-full h-full bg-[#050505] flex flex-col p-6 pt-12">
                <div className="w-full h-40 rounded-2xl bg-white/5 mb-4 animate-pulse" />
                <div className="w-2/3 h-4 rounded bg-white/5 mb-2" />
                <div className="w-full h-4 rounded bg-white/5 mb-2" />
                <div className="w-1/2 h-4 rounded bg-white/5 mb-8" />

                <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
                    <div className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
                </div>
             </div>
          )}
        </div>
      </motion.div>

      {/* Side Glow */}
      <div className="absolute inset-0 bg-electric-blue/5 blur-[60px] -z-10" />
    </div>
  );
};
