import React from 'react';
import { motion } from 'framer-motion';
import produsLogo from './produs-logo.png';

const Logo = ({ className = "size-12" }) => {
  return (
    <div className={`relative flex items-center justify-center bg-black rounded-sm overflow-hidden ${className}`}>
      <motion.img
        src={produsLogo}
        alt="Produs"
        className="w-[80%] h-[80%] relative z-10 object-contain"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
};

export default Logo;
