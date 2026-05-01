import React from "react";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

const Features = () => {
  return (
    <section className="detail-features fixed inset-0 flex flex-col items-end md:items-center justify-center text-right md:text-center px-10 md:px-6 z-20 pointer-events-none opacity-0">
      <div className="max-w-6xl w-full relative flex flex-col items-center">
        

        {/* Hero Title Duplicate Style */}
        <div className="relative mb-6 md:mb-12">
          <h1 className="font-black tracking-[-0.05em] leading-[0.8] uppercase flex flex-col items-end md:items-center">
            <span className="text-2xl md:text-[60px] text-white mb-2">
              WITH OUR
            </span>
            <span 
              className="text-5xl md:text-[140px] text-transparent inline-block"
              style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}
            >
              FEATURES
            </span>
          </h1>
        </div>


      </div>

      {/* UI Elements / Frame */}
      <div className="absolute bottom-12 w-full px-12 flex justify-between items-end opacity-30">
        <div className="flex flex-col gap-3 items-start">
          <Terminal size={18} className="text-electric-blue" />
          <span className="text-[9px] tracking-[0.3em] font-mono uppercase">capability_node_v1.0</span>
        </div>
      </div>
    </section>
  );
};

export default React.memo(Features);
