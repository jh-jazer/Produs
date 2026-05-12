import React from "react";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

const Hero = ({ config }) => {
  const title = config?.title || "PRODUS";
  const description = config?.description || "A high-performance interface for managing the four pillars of human mastery.";

  return (
    <section className="fixed inset-0 flex flex-col items-end md:items-center justify-center text-right md:text-center px-10 md:px-6 scene-awakening z-20 pointer-events-none">
      <div className="max-w-6xl w-full relative flex flex-col items-end md:items-center">
        
        {/* Hero Title - Kinetic Typography */}
        <div className="relative mb-6 md:mb-12">
          <h1 className="font-black tracking-[-0.05em] leading-[0.8] uppercase flex flex-col items-end md:items-center">
           
            <motion.span 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-[100px] text-transparent parallax-line-3 inline-block"
              style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}
            >
              {title}
            </motion.span>
          </h1>
          
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="text-let-it-pass max-w-xs md:max-w-2xl text-white/40 text-[10px] md:text-base font-light tracking-[0.15em] leading-relaxed uppercase mb-8 md:mb-16"
        >
          {description}
        </motion.p>

      </div>

      {/* Footer Details */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.3, y: 0 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="absolute bottom-12 w-full px-12 flex justify-between items-end hero-footer"
      >
        <div className="flex flex-col gap-3 items-start">
          <span className="text-[9px] tracking-[0.3em] font-mono uppercase">produs_main_v2.0.1</span>
        </div>
      </motion.div>
    </section>
  );
};

export default React.memo(Hero);
