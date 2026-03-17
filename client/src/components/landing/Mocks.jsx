import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const DesktopMock = ({ children }) => {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const rotateX = useTransform(springY, [0, 1], ["5deg", "-5deg"]);
  const rotateY = useTransform(springX, [0, 1], ["-10deg", "10deg"]);

  const reflectX = useTransform(springX, [0, 1], ["-20%", "120%"]);
  const reflectY = useTransform(springY, [0, 1], ["-20%", "120%"]);

  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const handleMouseMove = (e) => {
    if (isTouchDevice) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative perspective-2000 group"
    >
      <motion.div
        initial={{ rotateY: 20, rotateX: 10, scale: 0.9, opacity: 0 }}
        whileInView={{ rotateY: 0, rotateX: 0, scale: 1, opacity: 1 }}
        style={{
            rotateX: isTouchDevice ? 0 : rotateX,
            rotateY: isTouchDevice ? 0 : rotateY,
            transformStyle: "preserve-3d",
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full aspect-video rounded-2xl bg-[#0a0a0a] border border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5),0_0_20px_rgba(0,102,255,0.1)] overflow-hidden"
      >
        {/* Specular Reflection */}
        <motion.div
            style={{
                left: reflectX,
                top: reflectY,
                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)",
            }}
            className="absolute size-[150%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        />

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

        {/* Subtle Scanlines */}
        <div className="absolute inset-0 scanlines opacity-[0.03] pointer-events-none" />
      </motion.div>

      {/* Reflection/Glow underneath */}
      <motion.div
        style={{
            x: useTransform(springX, [0, 1], [-20, 20]),
            y: useTransform(springY, [0, 1], [-10, 10]),
        }}
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-20 bg-electric-blue/20 blur-[100px] -z-10 group-hover:opacity-100 opacity-60 transition-opacity"
      />
    </div>
  );
};

export const MobileMock = ({ children }) => {
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    const rotateX = useTransform(springY, [0, 1], ["5deg", "-5deg"]);
    const rotateY = useTransform(springX, [0, 1], ["-10deg", "10deg"]);

    const reflectX = useTransform(springX, [0, 1], ["-20%", "120%"]);
    const reflectY = useTransform(springY, [0, 1], ["-20%", "120%"]);

    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const handleMouseMove = (e) => {
      if (isTouchDevice) return;
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    };

    const handleMouseLeave = () => {
      mouseX.set(0.5);
      mouseY.set(0.5);
    };

  return (
    <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative perspective-2000 group"
    >
      <motion.div
        initial={{ rotateY: -20, rotateX: 10, scale: 0.9, opacity: 0 }}
        whileInView={{ rotateY: 0, rotateX: 0, scale: 1, opacity: 1 }}
        style={{
            rotateX: isTouchDevice ? 0 : rotateX,
            rotateY: isTouchDevice ? 0 : rotateY,
            transformStyle: "preserve-3d",
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 w-[280px] aspect-[9/19] rounded-[3rem] bg-[#0a0a0a] border-[8px] border-[#1a1a1a] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5),0_0_40px_rgba(0,102,255,0.1)] overflow-hidden"
      >
        {/* Specular Reflection */}
        <motion.div
            style={{
                left: reflectX,
                top: reflectY,
                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)",
            }}
            className="absolute size-[150%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        />

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1a1a] rounded-b-2xl z-40 flex items-center justify-center">
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
        {/* Subtle Scanlines */}
        <div className="absolute inset-0 scanlines opacity-[0.03] pointer-events-none" />
      </motion.div>

      {/* Side Glow */}
      <motion.div
        style={{
            x: useTransform(springX, [0, 1], [-20, 20]),
            y: useTransform(springY, [0, 1], [-10, 10]),
        }}
        className="absolute inset-0 bg-electric-blue/10 blur-[80px] -z-10 group-hover:opacity-100 opacity-60 transition-opacity"
      />
    </div>
  );
};
