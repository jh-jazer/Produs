import React from "react";
import { Link } from "react-router-dom";
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
    <section className="fixed inset-0 flex flex-col items-center justify-center text-center px-6 scene-cta pointer-events-none opacity-0 z-30 bg-black overflow-hidden">
      {/* Background Kinetic Text */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
        <h1 className="text-[20vw] font-black tracking-tighter uppercase leading-none" 
            style={{ WebkitTextStroke: "1px white", color: "transparent" }}>
          ACCESS
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        
        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white mb-12 leading-tight">
          FIND YOUR <br />
          <span className="text-white/20">POTENTIAL.</span>
        </h2>

        <Link 
          to={user ? "/dashboard" : "/auth"} 
          onClick={handleAction}
          className="group relative flex flex-col items-center pointer-events-auto"
        >
          <div className="size-12 md:size-14 rounded-full border border-white/20 group-hover:border-electric-blue/50 flex items-center justify-center group-hover:scale-110 transition-all duration-700 bg-white/5 backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-electric-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="ml-0.5 w-0 h-0 border-t-[5px] border-t-transparent border-l-[9px] border-l-white border-b-[5px] border-b-transparent relative z-10 group-hover:scale-110 transition-transform" />
          </div>
        </Link>
      </div>

      <div className="absolute bottom-0 w-full p-8 md:p-12 pointer-events-auto opacity-40 hover:opacity-100 transition-opacity duration-700">
        <Footer compact={true} />
      </div>
    </section>
  );
}
