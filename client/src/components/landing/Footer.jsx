import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="w-full py-4 border-t border-white/5 bg-black/50 backdrop-blur-sm transition-all">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Original Logo & Name */}
        <div className="flex items-center gap-3 group cursor-default">
          <img 
            src="/produs-logo.png" 
            alt="Produs" 
            className="size-4 md:size-5 object-contain transition-all group-hover:scale-110" 
          />
          <span className="font-normal text-[10px] uppercase tracking-[0.5em] text-white/80">
            Produs
          </span>
          <span className="hidden sm:inline text-white/10 ml-2">//</span>
          <span className="hidden sm:inline font-mono text-[9px] tracking-widest text-white/30 uppercase">
            {time.toLocaleTimeString([], { hour12: false })}
          </span>
        </div>

        {/* Center: Original Navigation Links Style (Dynamic Hiding) */}
        <nav className="flex items-center gap-8 text-[9px] uppercase font-normal tracking-[0.4em] text-white/50">
          {location.pathname !== "/manual" && (
            <Link to="/manual" className="hover:text-white transition-all hover:tracking-[0.6em]">System</Link>
          )}
          {location.pathname !== "/classes" && (
            <Link to="/classes" className="hover:text-white transition-all hover:tracking-[0.6em]">Classes</Link>
          )}
          {location.pathname !== "/updates" && (
            <Link to="/updates" className="hover:text-white transition-all hover:tracking-[0.6em]">Patch Notes</Link>
          )}
        </nav>

        {/* Right: Original Copyright Style */}
        <div className="text-[8px] uppercase tracking-[0.3em] text-white/20">
          © {currentYear} PRODUS. All Rights Reserved.
        </div>
        
      </div>
    </footer>
  );
}