import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useAuthStore from "../store/useAuthStore";
import ScrollCanvas from "../components/landing/ScrollCanvas";

gsap.registerPlugin(ScrollTrigger);

const SCENES_FEATURES = [
  { id: "flux", title: "UNIFIED FLUX", label: "01 // SYSTEM ANALYSIS", x: -10, y: 5 },
  { id: "rituals", title: "PRECISION RITUALS", label: "02 // RITUAL MAP", x: 10, y: -5 },
  { id: "capital", title: "WEALTH INDEX", label: "03 // CAPITAL FLOW", x: -5, y: -10 },
  { id: "operations", title: "OPERATIONAL PLAN", label: "04 // STRATEGIC NODE", x: 5, y: 10 },
];

export default function Landing() {
  const { user } = useAuthStore();
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  // Navbar Visibility Logic
  const [navVisible, setNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const updateNav = () => {
      const currentScrollY = window.scrollY;
      setNavVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", updateNav, { passive: true });
    return () => window.removeEventListener("scroll", updateNav);
  }, [lastScrollY]);

  // GSAP Scrollytelling Timeline
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 2,
          pin: ".pin-background",
          pinSpacing: false,
          onUpdate: (self) => setProgress(self.progress),
        }
      });

      // Scene 1: Awakening (Text Reveal - Starts AFTER the 30% flatline scrub)
      tl.fromTo(".scene-awakening", 
        { opacity: 0, y: 100, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "expo.out" },
        0.35
      );
      tl.to(".scene-awakening", {
        opacity: 0,
        y: -150,
        scale: 1.05,
        duration: 0.8,
        ease: "expo.in"
      }, 0.5);

      // Scene 2: Tech Detail Nodes (0.55 - 0.9)
      SCENES_FEATURES.forEach((feature, idx) => {
          const start = 0.58 + (idx * 0.08); 
          tl.fromTo(`.detail-${feature.id}`, 
            { opacity: 0, scale: 0.9, y: 100 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "expo.out" },
            start
          );
          tl.to(`.detail-${feature.id}`, 
            { opacity: 0, scale: 1.1, y: -100, duration: 0.8, ease: "expo.in" },
            start + 0.06
          );
      });

      // Scene 3: Nexus (0.95 - 1.0)
      tl.fromTo(".scene-nexus", 
        { opacity: 0, y: 200, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: "expo.out" },
        0.95
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Glow Cursor Logic
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Cinematic Progress Mapping
  // 0-30% scroll = Sequence 1 (Flatline)
  // 30-100% scroll = Sequence 2 (Awakened)
  const mappedProgress = progress <= 0.3 
    ? (progress / 0.3) * 0.5 
    : 0.5 + ((progress - 0.3) / 0.7) * 0.5;

  return (
    <div ref={containerRef} className="relative bg-black text-white selection:bg-electric-blue/30 font-sans h-[2000vh]">
      
      {/* Dynamic Cursor Background */}
      <div 
        className="fixed pointer-events-none z-[9999] size-[600px] rounded-full blur-[150px] opacity-[0.07] bg-electric-blue transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
        style={{ top: mousePosition.y, left: mousePosition.x }}
      />

      {/* LUXURY NAV BAR (Reveals after flatline) */}
      <motion.nav 
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: (navVisible && progress > 0.3) ? 0 : -150, opacity: progress > 0.3 ? 1 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 w-full z-[100] px-12 py-10 flex justify-between items-center pointer-events-none"
      >
        <div className="flex items-center gap-4 group cursor-pointer pointer-events-auto" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="size-6 bg-white flex items-center justify-center transition-all group-hover:bg-electric-blue rotate-45 group-hover:rotate-0" />
          <span className="font-thin text-xs uppercase tracking-[0.8em] text-white/50 group-hover:text-white transition-colors">Produs</span>
        </div>

        <div className="hidden lg:flex gap-16 items-center text-[9px] uppercase font-thin tracking-[0.5em] text-white/30 pointer-events-auto">
          <a href="#" className="hover:text-white transition-all hover:tracking-[0.8em]">Arch</a>
          <a href="#" className="hover:text-white transition-all hover:tracking-[0.8em]">Sync</a>
          <Link to="/auth" className="hover:text-white transition-all hover:tracking-[0.8em] border-l border-white/10 pl-16">Entry</Link>
        </div>

        <Link to={user ? "/dashboard" : "/auth"} className="pointer-events-auto group flex items-center gap-6">
           <span className="font-thin text-[9px] uppercase tracking-[0.5em] text-white/40 group-hover:text-white transition-colors">Access Interface</span>
           <div className="size-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white transition-all">
             <ChevronRight size={14} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
           </div>
        </Link>
      </motion.nav>

      {/* Pinned Background - The Cinematic Scrub */}
      <div className="pin-background w-full h-screen overflow-hidden">
          <ScrollCanvas progress={mappedProgress} />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-90" />
          <div className="absolute -left-[20%] top-1/3 size-[100vw] bg-electric-blue/5 blur-[250px] rounded-full" />
          <div className="absolute -right-[20%] bottom-1/3 size-[80vw] bg-white/[0.02] blur-[200px] rounded-full" />
      </div>

      {/* Cinematic Scenes Content */}
      <div className="relative z-20 -mt-[100vh]">
          
          {/* SCENE 1: THE AWAKENING */}
          <section className="h-screen flex items-center justify-center text-center px-6 scene-awakening pointer-events-none sticky top-0">
              <div className="max-w-7xl">
                  <span className="text-[9px] font-thin uppercase tracking-[1.5em] text-white/20 mb-20 block">
                     Temporal Sync Active // Operational Fragment
                  </span>
                  <h1 className="text-4xl md:text-7xl font-thin tracking-[1em] uppercase mb-24 text-white/90 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                      What if <br />
                      <span className="text-white/10 block mt-8">this is already your</span> <br />
                      <span className="text-white">Second Chance?</span>
                  </h1>
                  <div className="flex flex-col items-center gap-12">
                      <div className="w-px h-40 bg-gradient-to-b from-white/20 to-transparent" />
                      <span className="text-[8px] font-thin uppercase tracking-[1em] text-white/10 animate-pulse">Initiate Calibration</span>
                  </div>
              </div>
          </section>

          {/* SCENE 2: DETAIL FRAGMENTS */}
          <div className="h-[900vh] relative flex flex-col items-center justify-center">
              {SCENES_FEATURES.map((feature) => (
                  <div 
                      key={feature.id} 
                      className={`detail-${feature.id} fixed inset-0 flex items-center justify-center pointer-events-none opacity-0`}
                  >
                      <div className="text-center relative">
                          <span className="text-[8px] font-thin text-white/20 block mb-10 uppercase tracking-[1.2em]">
                              {feature.label}
                          </span>
                          <h2 className="text-3xl md:text-6xl font-thin text-white uppercase tracking-[1.2em] mb-12 drop-shadow-glow">
                              {feature.title}
                          </h2>
                          <div className="w-12 h-px bg-white/10 mx-auto" />
                      </div>
                  </div>
              ))}
          </div>

          {/* SCENE 4: THE NEXUS */}
          <section className="h-screen flex flex-col items-center justify-center text-center px-6 scene-nexus sticky bottom-0">
              <span className="text-[9px] font-thin uppercase tracking-[1.5em] text-white/20 mb-20 block">
                  Operational Nexus // Fragment Final
              </span>
              <h2 className="text-4xl md:text-8xl font-thin uppercase tracking-[0.8em] text-white leading-[1.5] mb-28">
                  The Final <br /> 
                  <span className="text-white/10">Frequency.</span>
              </h2>
              <Link to="/auth" className="group flex flex-col items-center gap-10">
                  <div className="size-20 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white group-hover:scale-110 transition-all duration-700 bg-black">
                      <ChevronRight size={24} className="text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <span className="text-[8px] font-thin uppercase tracking-[1.5em] text-white/40 group-hover:text-white transition-colors">Initialize System</span>
              </Link>
          </section>

      </div>
    </div>
  );
}
