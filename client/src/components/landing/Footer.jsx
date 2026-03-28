import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-12 md:py-20 border-t border-white/5 bg-black/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 md:gap-4 mb-12 group cursor-default">
          <div className="size-4 md:size-5 bg-white flex items-center justify-center transition-all group-hover:bg-electric-blue rotate-45 group-hover:rotate-0" />
          <span className="font-normal text-[10px] md:text-xs uppercase tracking-[0.5em] md:tracking-[0.8em] text-white/80">Produs</span>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center text-[10px] uppercase font-normal tracking-[0.4em] md:tracking-[0.6em] text-white/50 mb-12">
          <Link to="/manual" className="hover:text-white transition-all hover:tracking-[0.8em]">System</Link>
          <Link to="/classes" className="hover:text-white transition-all hover:tracking-[0.8em]">Classes</Link>
          <Link to="/updates" className="hover:text-white transition-all hover:tracking-[0.8em]">Patch Notes</Link>
        </div>

        {/* Copyright Notice */}
        <div className="text-[9px] uppercase tracking-[0.3em] text-white/20">
          © {currentYear} PRODUS. All Rights Reserved. // Intelligence Aesthetic
        </div>
      </div>
    </footer>
  );
}
