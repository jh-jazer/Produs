import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  Activity, 
  Zap, 
  Orbit, 
  Layers 
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import useAuthStore from "../store/useAuthStore";
import ScrollCanvas from "../components/landing/ScrollCanvas";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const SCENES_FEATURES = [
  { id: "flux", title: "UNIFIED FLUX", label: "01 // SYSTEM ANALYSIS", icon: Activity },
  { id: "rituals", title: "PRECISION RITUALS", label: "02 // RITUAL MAP", icon: Zap },
  { id: "capital", title: "WEALTH INDEX", label: "03 // CAPITAL FLOW", icon: Orbit },
  { id: "operations", title: "OPERATIONAL PLAN", label: "04 // STRATEGIC NODE", icon: Layers },
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

      // Scene 1: Initial Reveal (2% - 12%)
      tl.to(".scene-awakening", { opacity: 1, duration: 10 }, 2);

      // Scene 1: Multi-Layer Awakening Exit (12% - 22%)
      tl.to(".parallax-line-1", { y: -100, opacity: 0, duration: 10 }, 12);
      tl.to(".parallax-line-2", { y: -180, opacity: 0, duration: 10 }, 14);
      tl.to(".parallax-line-3", { y: -260, opacity: 0, duration: 10, scale: 1.1 }, 16);

      // Text: "will you let it pass" (18% - 24%)
      tl.fromTo(".text-let-it-pass", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 4 }, 18);
      tl.to(".text-let-it-pass", { opacity: 0, y: -50, duration: 4 }, 24);

      // Text: "or take back control" (26% - 32%)
      tl.fromTo(".text-take-control", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 4 }, 26);
      tl.to(".text-take-control", { opacity: 0, y: -50, duration: 4 }, 32);

      // Text: "Let me help you" (34% - 40%)  -- After reverse starts (reverse starts at 30% according to progress map)
      tl.fromTo(".text-let-me-help", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 4 }, 34);
      tl.to(".text-let-me-help", { opacity: 0, y: -50, duration: 4 }, 40);

      tl.to(".scene-dimmer", { opacity: 0, duration: 20 }, 32);
      tl.to(".scene-awakening", { opacity: 0, duration: 5 }, 45);

      // Scene 2: Tech Detail Nodes (HUD Fragments 50% - 95%)
      SCENES_FEATURES.forEach((feature, idx) => {
          const start = 50 + (idx * 12); // Spread out for impact
          const nodeClass = `.detail-${feature.id}`;
          
          tl.fromTo(nodeClass, 
            { opacity: 0, scale: 0.8, y: 150 },
            { opacity: 1, scale: 1, y: 0, duration: 8, ease: "power2.out" },
            start
          );

          tl.to(`${nodeClass} .hud-icon`, { y: -40, duration: 8 }, start + 2);
          tl.to(`${nodeClass} .hud-title`, { y: -80, duration: 8 }, start + 3);
          
          tl.to(nodeClass, 
            { opacity: 0, scale: 1.2, y: -150, duration: 6, ease: "power2.in" },
            start + 8
          );
      });

      // Scene 3: Nexus (98% - 100%)
      tl.fromTo(".scene-nexus", 
        { opacity: 0, y: 300, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 10, ease: "power2.out" },
        98
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
  // 0-30% scroll = Sequence 1
  const mappedProgress = Math.min(1, progress / 0.3);

  // Section 2 Background Color Logic
  const section2BgOpacity = progress > 0.45 ? Math.min(1, (progress - 0.45) / 0.1) : 0;

  useEffect(() => {
    document.documentElement.classList.add("no-scrollbar");

    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tickerRAF = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerRAF);
    gsap.ticker.lagSmoothing(0);

    return () => {
      document.documentElement.classList.remove("no-scrollbar");
      lenis.destroy();
      gsap.ticker.remove(tickerRAF);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative bg-black text-white selection:bg-electric-blue/30 font-sans h-[600vh]">

      {/* Dynamic Cursor Background */}
      <div
        className="fixed pointer-events-none z-[9999] size-[600px] rounded-full blur-[150px] opacity-[0.07] bg-electric-blue transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
        style={{ top: mousePosition.y, left: mousePosition.x }}
      />

      {/* LUXURY NAV BAR */}
      <motion.nav
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: navVisible ? 0 : -150, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 w-full z-[100] px-4 md:px-12 py-6 md:py-10 flex justify-between items-center pointer-events-none"
      >
        <div className="flex items-center gap-3 md:gap-4 group cursor-pointer pointer-events-auto" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="size-4 md:size-6 bg-white flex items-center justify-center transition-all group-hover:bg-electric-blue rotate-45 group-hover:rotate-0" />
          <span className="font-thin text-[10px] md:text-xs uppercase tracking-[0.5em] md:tracking-[0.8em] text-white/50 group-hover:text-white transition-colors hidden sm:inline-block">Produs</span>
        </div>

        <div className="hidden lg:flex gap-16 items-center text-[9px] uppercase font-thin tracking-[0.5em] text-white/30 pointer-events-auto">
          <a href="#" className="hover:text-white transition-all hover:tracking-[0.8em]">Arch</a>
          <a href="#" className="hover:text-white transition-all hover:tracking-[0.8em]">Sync</a>
          <Link to="/auth" className="hover:text-white transition-all hover:tracking-[0.8em] border-l border-white/10 pl-16">Entry</Link>
        </div>

        <Link to={user ? "/dashboard" : "/auth"} className="pointer-events-auto group flex items-center gap-3 md:gap-6">
          <span className="font-thin text-[8px] md:text-[9px] uppercase tracking-[0.2em] md:tracking-[0.5em] text-white/40 group-hover:text-white transition-colors text-right max-w-[100px] md:max-w-none">Access Interface</span>
          <div className="size-8 md:size-10 shrink-0 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white transition-all">
            <ChevronRight size={14} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </motion.nav>

      {/* Pinned Background - The Cinematic Scrub */}
      <div className="pin-background w-full h-screen overflow-hidden relative">
        <ScrollCanvas progress={mappedProgress} />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-90 pointer-events-none" />
        <div className="absolute -left-[20%] top-1/3 size-[100vw] bg-electric-blue/5 blur-[250px] rounded-full pointer-events-none" />
        <div className="absolute -right-[20%] bottom-1/3 size-[80vw] bg-white/[0.02] blur-[200px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-black/60 opacity-100 scene-dimmer z-10 pointer-events-none" />

        {/* Section 2 solid background overlay that fades in */}
        <div
          className="absolute inset-0 bg-[#050505] z-15 pointer-events-none"
          style={{ opacity: section2BgOpacity }}
        />
      </div>

      {/* Cinematic Scenes Content */}
      <div className="relative z-20 -mt-[100vh]">

        {/* SCENE 1: THE AWAKENING - Expert Parallax Structure */}
        <section className="fixed inset-0 flex items-center justify-center text-center px-6 pt-20 scene-awakening pointer-events-none opacity-0 z-20 perspective-1000">
          <div className="max-w-5xl relative flex items-center justify-center min-h-[50vh]">
            <h1 className="absolute text-2xl sm:text-3xl md:text-4xl font-thin uppercase text-white/90 drop-shadow-glow">
              <span className="parallax-line-1 block tracking-[0.5em] md:tracking-[1.5em] -mr-[0.5em] md:-mr-[1.5em]">What if</span>
              <span className="parallax-line-2 text-white/30 block mt-8 tracking-[0.3em] md:tracking-[1.2em] -mr-[0.3em] md:-mr-[1.2em]">this is already your</span>
              <span className="parallax-line-3 text-white block mt-4 tracking-[0.5em] md:tracking-[1.5em] -mr-[0.5em] md:-mr-[1.5em]">Second Chance?</span>
            </h1>

            <div className="absolute text-2xl sm:text-3xl md:text-4xl font-thin uppercase text-white/90 drop-shadow-glow text-let-it-pass opacity-0">
              <span className="block tracking-[0.5em] md:tracking-[1.5em] -mr-[0.5em] md:-mr-[1.5em]">will you let it pass</span>
            </div>

            <div className="absolute text-2xl sm:text-3xl md:text-4xl font-thin uppercase text-white/90 drop-shadow-glow text-take-control opacity-0">
              <span className="block tracking-[0.5em] md:tracking-[1.5em] -mr-[0.5em] md:-mr-[1.5em]">or take back control</span>
            </div>

            <div className="absolute text-2xl sm:text-3xl md:text-4xl font-thin uppercase text-white/90 drop-shadow-glow text-let-me-help opacity-0">
              <span className="block tracking-[0.5em] md:tracking-[1.5em] -mr-[0.5em] md:-mr-[1.5em]">Let me help you</span>
            </div>

            <div className="absolute bottom-[-150px] flex flex-col items-center gap-12">
              <div className="w-px h-40 bg-gradient-to-b from-white/20 to-transparent" />
              <span className="text-[8px] font-thin uppercase tracking-[0.5em] md:tracking-[1em] text-white/20 animate-pulse">Initiate Calibration</span>
            </div>
          </div>
        </section>

          {/* SCENE 2: DETAIL FRAGMENTS - Multi-Layer Visuals */}
          <div className="h-[400vh] relative flex flex-col items-center justify-center">
            {SCENES_FEATURES.map((feature, idx) => (
              <div 
                key={feature.id} 
                className={`detail-${feature.id} fixed inset-0 flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-16 pointer-events-none opacity-0 z-30 perspective-1000 px-6 md:px-16 max-w-7xl mx-auto w-full`}
              >
                {/* Text / Info Side */}
                <div className={`text-center relative p-6 md:p-12 bg-white/[0.01] border border-white/[0.03] rounded-3xl backdrop-blur-md overflow-hidden w-full lg:w-1/2 mx-4 md:mx-0 flex flex-col items-center order-2 ${idx % 2 === 0 ? 'lg:order-1 lg:text-left lg:items-start' : 'lg:order-2 lg:text-right lg:items-end'}`}>
                  <div className={`hud-icon size-16 md:size-20 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center mb-8 md:mb-12 shadow-[0_0_50px_rgba(255,255,255,0.05)]`}>
                    <feature.icon className="text-white/80 w-6 h-6 md:w-9 md:h-9" strokeWidth={1} />
                  </div>
                  <div className={`hud-title w-full flex flex-col items-center ${idx % 2 === 0 ? 'lg:items-start' : 'lg:items-end'}`}>
                    <span className="text-[8px] md:text-[10px] font-thin text-white/30 block mb-4 md:mb-6 uppercase tracking-[0.5em] md:tracking-[1.8em]">
                      Fragment: {feature.label}
                    </span>
                    <h2 className={`text-xl sm:text-2xl md:text-5xl font-thin text-white uppercase tracking-[0.5em] md:tracking-[1em] mb-8 md:mb-12 drop-shadow-glow ml-[0.5em] ${idx % 2 === 0 ? 'lg:ml-0' : 'lg:mr-[-1em] lg:ml-0'}`}>
                      {feature.title}
                    </h2>
                    <div className={`w-24 md:w-32 h-px bg-gradient-to-r ${idx % 2 === 0 ? 'from-transparent via-white/15 to-transparent lg:from-white/15 lg:via-white/5 lg:to-transparent' : 'from-transparent via-white/15 to-transparent lg:from-transparent lg:via-white/5 lg:to-white/15'}`} />
                  </div>
                  
                  {/* Subtle AR Decoration */}
                  <div className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 border-t border-l border-white/10" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 border-b border-r border-white/10" />
                </div>

                {/* Visual Mockups Side */}
                <div className={`w-full lg:w-1/2 relative flex items-center justify-center h-[30vh] lg:h-auto order-1 ${idx % 2 === 0 ? 'lg:order-2 lg:justify-end' : 'lg:order-1 lg:justify-start'}`}>
                  {/* Desktop Mockup */}
                  <div className="relative w-full max-w-[400px] aspect-[16/10] bg-[#0a0a0a] rounded-t-xl rounded-b-md border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transform rotate-y-[-5deg] rotate-x-[5deg]">
                    <div className="h-4 w-full bg-white/5 border-b border-white/10 flex items-center px-2 gap-1 shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-[#111] to-black p-4 flex flex-col gap-2 relative overflow-hidden">
                       <div className="w-full h-8 bg-white/5 rounded" />
                       <div className="flex gap-2 w-full h-full">
                         <div className="w-1/3 h-full bg-white/5 rounded" />
                         <div className="w-2/3 h-full bg-white/5 rounded flex flex-col gap-2">
                           <div className="w-full h-1/2 bg-white/5 rounded" />
                           <div className="w-full h-1/2 bg-white/5 rounded" />
                         </div>
                       </div>
                       <div className="absolute inset-0 bg-electric-blue/10 mix-blend-overlay" />
                    </div>
                  </div>

                  {/* Mobile Mockup Overlay */}
                  <div className="absolute -bottom-8 md:-bottom-12 -right-4 md:-right-8 lg:left-0 lg:-bottom-16 w-[120px] md:w-[150px] aspect-[9/19] bg-[#0a0a0a] rounded-[2rem] border-4 border-[#222] shadow-[0_20px_40px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden transform rotate-y-[10deg] rotate-z-[-5deg]">
                    <div className="w-1/2 h-4 bg-[#222] mx-auto rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2 z-10" />
                    <div className="flex-1 bg-gradient-to-b from-[#111] to-black pt-8 px-3 pb-3 flex flex-col gap-2 relative">
                       <div className="w-full h-12 bg-white/5 rounded-lg" />
                       <div className="w-full h-12 bg-white/5 rounded-lg" />
                       <div className="w-full h-12 bg-white/5 rounded-lg" />
                       <div className="w-full flex-1 bg-white/5 rounded-lg" />
                       <div className="absolute inset-0 bg-electric-blue/10 mix-blend-overlay" />
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

        {/* SCENE 3: THE NEXUS */}
        <section className="h-screen flex flex-col items-center justify-center text-center px-6 scene-nexus sticky bottom-0">
          <span className="text-[8px] md:text-[9px] font-thin uppercase tracking-[0.5em] md:tracking-[1.5em] text-white/20 mb-12 md:mb-20 block">
            Operational Nexus // Fragment Final
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-6xl font-thin uppercase tracking-[0.3em] md:tracking-[0.8em] text-white leading-[1.5] mb-20 md:mb-28">
            The Final <br />
            <span className="text-white/10">Frequency.</span>
          </h2>
          <Link to="/auth" className="group flex flex-col items-center gap-6 md:gap-10">
            <div className="size-16 md:size-20 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white group-hover:scale-110 transition-all duration-700 bg-black">
              <ChevronRight size={20} className="text-white group-hover:translate-x-1 transition-all md:w-6 md:h-6" />
            </div>
            <span className="text-[8px] font-thin uppercase tracking-[0.5em] md:tracking-[1.5em] text-white/40 group-hover:text-white transition-colors">Initialize System</span>
          </Link>
        </section>

      </div>
    </div>
  );
}
