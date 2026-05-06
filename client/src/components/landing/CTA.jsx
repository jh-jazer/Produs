import React from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import usePWAInstall from "../../hooks/usePWAInstall";
import { Play } from "lucide-react";

export default function CTA({ user }) {
  const { installable, installApp } = usePWAInstall();

  const handleAction = (e) => {
    if (installable) {
      e.preventDefault();
      installApp();
    }
  };

  return (
    <section className="fixed inset-0 flex flex-col items-center justify-center text-center px-6 scene-cta pointer-events-none opacity-0 z-30 bg-black overflow-hidden">
      {/* Background Kinetic Text */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
        <h1 className="text-[20vw] font-black tracking-tighter uppercase leading-none" 
            style={{ WebkitTextStroke: "1px white", color: "transparent" }}>
          ACCESS
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        
        <h2 className="text-2xl md:text-6xl font-black uppercase tracking-tighter text-white mb-56 leading-tight">
          FIND YOUR <br />
          <span className="text-white/20">POTENTIAL.</span>
        </h2>

        <Link 
          to={user ? "/dashboard" : "/auth"} 
          onClick={handleAction}
          className="group relative flex flex-col items-center pointer-events-auto p-12"
        >
          <div className="relative size-20 md:size-24 flex items-center justify-center">
            {/* Pulsing Outer Glow */}
            <div className="absolute inset-0 rounded-full bg-white/10 blur-xl group-hover:bg-white/20 animate-pulse transition-all duration-700" />
            
            {/* Rotating Decorative Ring */}
            <div className="absolute inset-0 rounded-full border border-dashed border-white/5 group-hover:border-white/20 animate-[spin_10s_linear_infinite]" />
            
            {/* Main Button Body */}
            <div className="relative size-12 md:size-14 rounded-full bg-black border border-white/10 group-hover:border-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-500 overflow-hidden">
              {/* Inner Glass Layer */}
              <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-sm" />
              
              {/* Active Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <Play className="size-4 md:size-5 text-white fill-white group-hover:text-white transition-all duration-500 relative z-10 ml-0.5" />
            </div>

            {/* Orbiting Particles (Decorative) */}
            <div className="absolute -inset-2 rounded-full border border-white/5 group-hover:border-white/10 scale-90 group-hover:scale-110 transition-transform duration-1000" />
          </div>

        </Link>
      </div>

      <div className="absolute bottom-0 w-full px-8 md:px-12 pb-4 md:pb-6 pointer-events-auto opacity-40 hover:opacity-100 transition-opacity duration-700">
        <Footer compact={true} />
      </div>
    </section>
  );
}
