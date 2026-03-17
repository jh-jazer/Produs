import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const InteractiveBento = ({ children, className = "", title, description, icon: Icon, accentColor = "blue" }) => {
  const cardRef = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const accentColors = {
    blue: "text-electric-blue bg-electric-blue/20 border-electric-blue/30",
    emerald: "text-neon-emerald bg-neon-emerald/20 border-neon-emerald/30",
    amethyst: "text-dark-amethyst bg-dark-amethyst/20 border-dark-amethyst/30",
    orange: "text-signal-orange bg-signal-orange/20 border-signal-orange/30",
    white: "text-titanium-white bg-white/10 border-white/20"
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative group bg-obsidian border border-white/10 rounded-[2rem] p-8 lg:p-10 transition-colors hover:border-white/20 overflow-hidden ${className}`}
    >
      <div style={{ transform: "translateZ(50px)" }} className="relative z-10 flex flex-col h-full">
        <div className={`size-12 rounded-2xl flex items-center justify-center border mb-6 transition-all group-hover:scale-110 ${accentColors[accentColor]}`}>
          {Icon && <Icon size={24} />}
        </div>
        <h3 className="text-2xl font-semibold mb-3 leading-tight tracking-tight">{title}</h3>
        <p className="text-muted-slate text-sm mb-6 leading-relaxed group-hover:text-white/70 transition-colors">{description}</p>

        <div className="mt-auto opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            {children}
        </div>
      </div>

      {/* Background Parallax Element */}
      <motion.div
        style={{
            x: useTransform(mouseXSpring, [-0.5, 0.5], [15, -15]),
            y: useTransform(mouseYSpring, [-0.5, 0.5], [15, -15]),
            transformStyle: "preserve-3d",
        }}
        className="absolute inset-0 z-0 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[120%] bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
      </motion.div>
    </motion.div>
  );
};
