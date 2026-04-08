/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import produsLogo from './produs-logo.png';

const Logo = ({ className = "size-12", glow = true, color = "currentColor" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Dynamic Glow Layer */}
      {glow && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full pointer-events-none"
        />
      )}

      <motion.img
        src={produsLogo}
        alt="Produs"
        className="w-full h-full relative z-10 object-contain"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
};

export default Logo;
