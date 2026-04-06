import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Download, ChevronRight } from "lucide-react";
import Footer from "./Footer";
import usePWAInstall from "../../hooks/usePWAInstall";

export default function CTA({ user }) {
  const { installable, installApp } = usePWAInstall();

  const handleAction = (e) => {
    if (installable) {
      e.preventDefault();
      installApp();
    }
  };

  return (
    <section className="fixed inset-0 flex flex-col items-center justify-between text-center px-4 md:px-6 scene-cta pointer-events-none opacity-0 z-30 bg-[#020202] transition-colors duration-1000 overflow-hidden">
      <div className="flex-grow flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
        <span className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.5em] md:tracking-[1em] text-cyan-400/40 mb-4 block">
          Final Prototype // Phase 4
        </span>
        
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-thin uppercase tracking-[0.2em] md:tracking-[0.4em] text-white leading-[1.3] mb-8 md:mb-12 px-4 max-w-2xl">
          Take Control <br />
          <span className="text-white/20 italic font-outfit">Of Your Potential.</span>
        </h2>

        <Link 
          to={user ? "/dashboard" : "/auth"} 
          onClick={handleAction}
          className="group flex flex-col items-center gap-4 pointer-events-auto"
        >
          <div className="size-12 md:size-14 rounded-full border border-white/10 group-hover:border-white/40 flex items-center justify-center group-hover:scale-110 transition-all duration-700 bg-white/5 backdrop-blur-sm">
            {installable ? (
              <Download size={16} className="text-white group-hover:translate-x-0 transition-all" />
            ) : (
              <ChevronRight size={16} className="text-white group-hover:translate-x-1 transition-all" />
            )}
          </div>
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.8em] text-white/40 group-hover:text-cyan-400 transition-colors">
            {installable ? "Install App" : "Install App"}
          </span>
        </Link>
      </div>

      <div className="w-full pointer-events-auto shrink-0">
        <Footer compact={true} />
      </div>
    </section>
  );
}
