import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../brand/Logo";
import usePWAInstall from "../../hooks/usePWAInstall";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [time, setTime] = useState(new Date());
  const location = useLocation();
  const { installable, installApp } = usePWAInstall();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="relative z-10 w-full px-4 md:px-12 py-4 md:py-6 bg-black/80 backdrop-blur-md border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        
        {/* Left: Original Logo & Name */}
        <div className="flex items-center gap-3 group cursor-default">

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
          {installable && (
            <button 
              onClick={installApp}
              className="hover:text-white transition-all hover:tracking-[0.6em] cursor-pointer outline-none border-none bg-transparent p-0 text-[9px] uppercase font-normal tracking-[0.4em]"
            >
              Install App
            </button>
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