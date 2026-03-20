import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useAuthStore from "../store/useAuthStore";
import ScrollCanvas from "../components/landing/ScrollCanvas";

gsap.registerPlugin(ScrollTrigger);

const SCENES = [
  {
    id: "awakening",
    headline: "What if this is already your",
    subheadline: "Second Chance?",
    narrative: "Temporal Sync Active // Protocol Fragment 01",
  },
  {
    id: "nexus",
    headline: "The Final",
    subheadline: "Frequency.",
    narrative: "Elite Operational Nexus // Protocol Fragment 02",
  }
];

export default function Landing() {
  const { user } = useAuthStore();
  const mainRef = useRef(null);
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
    window.addEventListener("scroll", updateNav);
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
          scrub: 1.5, // Smooth scrubbing
          onUpdate: (self) => setProgress(self.progress),
        }
      });

      // Scene 1: Awakening (Text Fade Out)
      tl.to(".scene-awakening", {
        opacity: 0,
        y: -100,
        duration: 0.5,
        ease: "power2.inOut"
      }, 0.2);

      // Scene 2: Detailed Reveal (Individual Fragments)
      // This is where we'll add technical details later
      
      // Scene 3: Nexus (Text Fade In)
      tl.fromTo(".scene-nexus", 
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        0.8
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Glow Cursor Logic
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={mainRef} className="relative bg-black text-titanium-white min-h-screen overflow-x-hidden selection:bg-electric-blue/30 scroll-smooth font-display">
      
      {/* Dynamic Cursor Background */}
      <div 
        className="fixed pointer-events-none z-[9999] size-[600px] rounded-full blur-[150px] opacity-10 bg-electric-blue transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
        style={{ top: mousePosition.y, left: mousePosition.x }}
      />

      {/* Disappearing Header - Invisible Background */}
      <motion.nav 
        initial={{ y: 0 }}
        animate={{ y: navVisible ? 0 : -150 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-[100] px-8 py-4 flex justify-between items-center transition-all duration-500"
      >
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="size-8 rounded-lg bg-electric-blue flex items-center justify-center transition-transform group-hover:scale-110">
            <Zap className="text-white size-5 fill-current" />
          </div>
          <span className="font-bold text-lg tracking-tighter uppercase italic">Produs</span>
        </div>

        <div className="hidden lg:flex gap-10 items-center text-[10px] uppercase font-black tracking-[0.2em] text-muted-slate">
          <a href="#experience" className="hover:text-white transition-colors">Experience</a>
          <a href="#nexus" className="hover:text-white transition-colors">Nexus</a>
          <Link to="/auth" className="hover:text-white transition-colors">Access</Link>
        </div>

        <Link to={user ? "/dashboard" : "/auth"} className="px-10 py-3 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-110 hover:bg-white/10 active:scale-95 flex items-center justify-center gap-3 whitespace-nowrap">
          Launch <ChevronRight size={16} />
        </Link>
      </motion.nav>

      {/* Persistent Static Launch Button (Shows when Nav is hidden) */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ 
          opacity: !navVisible ? 1 : 0, 
          y: !navVisible ? 0 : 50,
          pointerEvents: !navVisible ? "auto" : "none"
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[101]"
      >
        <Link to={user ? "/dashboard" : "/auth"} className="px-10 py-3 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-110 hover:bg-white/10 active:scale-95 flex items-center justify-center gap-3 whitespace-nowrap">
            Launch <ChevronRight size={16} />
        </Link>
      </motion.div>

      {/* MAIN CINEMATIC SCENE CONTAINER */}
      <div ref={containerRef} className="relative h-[800vh]">
        
        {/* Sticky Background - The Cinematic Scrub */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
            <ScrollCanvas progress={progress} />
            
            {/* Grain/Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            
            {/* Minimal Dark Masking */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        </div>

        {/* Cinematic Scenes Content */}
        <div className="relative z-10">
            
            {/* SCENE 1: THE AWAKENING */}
            <section className="h-screen flex items-center justify-center text-center px-6 pt-40 scene-awakening">
                <div className="max-w-7xl">
                    <span className="text-[10px] font-kalam uppercase tracking-[1em] text-white/30 mb-12 block">
                        {SCENES[0].narrative}
                    </span>
                    <h1 className="text-6xl md:text-[10rem] font-bangers leading-[0.85] tracking-tight uppercase mb-16 text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                        {SCENES[0].headline} <br />
                        <span className="text-white/20 italic">{SCENES[0].subheadline}</span>
                    </h1>
                    <div className="flex flex-col items-center gap-8">
                        <div className="w-px h-32 bg-gradient-to-b from-white/40 to-transparent" />
                        <span className="text-[9px] font-bebas uppercase tracking-[0.5em] text-white/20 animate-pulse">Scroll to Initiate</span>
                    </div>
                </div>
            </section>

            {/* SCENE 2 & 3: TRANSITION & DETAILS (Reserved for Technical Reveal) */}
            <section className="h-[500vh] relative pointer-events-none" />

            {/* SCENE 4: THE NEXUS */}
            <section className="h-screen flex flex-col items-center justify-center text-center px-6 scene-nexus">
                <span className="text-[10px] font-kalam uppercase tracking-[1em] text-white/30 mb-12 block">
                    {SCENES[1].narrative}
                </span>
                <h2 className="text-6xl md:text-[12rem] font-bangers uppercase tracking-tighter leading-[0.8] mb-20 italic">
                    {SCENES[1].headline} <br /> 
                    <span className="text-white/20">{SCENES[1].subheadline}</span>
                </h2>
                <Link to="/auth" className="group px-20 py-8 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] transition-all hover:scale-110 active:scale-95 border-2 border-white/10 hover:border-white/40 shadow-[0_30px_100px_rgba(255,255,255,0.05)] flex items-center gap-6">
                    Initialize System <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </Link>
            </section>

        </div>

      </div>

    </div>
  );
}
