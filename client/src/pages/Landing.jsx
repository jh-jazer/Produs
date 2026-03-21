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

      // Before 30% mark: "will you let it pass"
      tl.to(".parallax-line-4", { opacity: 1, duration: 10 }, 14);

      // Scene 1: Multi-Layer Awakening Exit (before 30% sequence is fully done playing, they exit)
      // They exit around 24-27% to clear screen for the reverse logic.
      tl.to(".parallax-line-1", { y: -100, opacity: 0, duration: 10 }, 24);
      tl.to(".parallax-line-2", { y: -180, opacity: 0, duration: 10 }, 25);
      tl.to(".parallax-line-3", { y: -260, opacity: 0, duration: 10, scale: 1.1 }, 26);
      tl.to(".parallax-line-4", { y: -340, opacity: 0, duration: 10 }, 27);

      // After 30% mark (reverse sequence starts), "or take back control", "Let me help you"
      tl.to(".parallax-line-5", { opacity: 1, duration: 10 }, 31);
      tl.to(".parallax-line-6", { opacity: 1, duration: 10 }, 38);

      // Exit the second group before Scene 2 starts at 55%
      tl.to(".parallax-line-5", { y: -100, opacity: 0, duration: 10 }, 48);
      tl.to(".parallax-line-6", { y: -180, opacity: 0, duration: 10 }, 48);

      tl.to(".scene-dimmer", { opacity: 0, duration: 20 }, 32);

      // Scene 2: Tech Detail Nodes (HUD Fragments 55% - 95%)
      SCENES_FEATURES.forEach((feature, idx) => {
          const start = 55 + (idx * 10); // Spread out for impact
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
  // 0-30% scroll = Sequence 1 (Flatline)
  // 30-100% scroll = Sequence 2 (Awakened)
  const mappedProgress = progress <= 0.3
    ? (progress / 0.3) * 0.5
    : 0.5 + ((progress - 0.3) / 0.7) * 0.5;

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
      <div className="pin-background w-full h-screen overflow-hidden">
        <ScrollCanvas progress={mappedProgress} />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-90" />
        <div className="absolute -left-[20%] top-1/3 size-[100vw] bg-electric-blue/5 blur-[250px] rounded-full" />
        <div className="absolute -right-[20%] bottom-1/3 size-[80vw] bg-white/[0.02] blur-[200px] rounded-full" />
        <div className="absolute inset-0 bg-black/60 opacity-100 scene-dimmer z-10" />
      </div>

      {/* Cinematic Scenes Content */}
      <div className="relative z-20 -mt-[100vh]">

        {/* SCENE 1: THE AWAKENING - Expert Parallax Structure */}
        <section className="fixed inset-0 flex items-center justify-center text-center px-6 pt-20 scene-awakening pointer-events-none opacity-0 z-20 perspective-1000">
          <div className="max-w-5xl relative">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-thin uppercase mb-24 text-white/90 drop-shadow-glow relative">
              <span className="parallax-line-1 block tracking-[0.5em] md:tracking-[1.5em] -mr-[0.5em] md:-mr-[1.5em]">What if</span>
              <span className="parallax-line-2 text-white/30 block mt-8 tracking-[0.3em] md:tracking-[1.2em] -mr-[0.3em] md:-mr-[1.2em]">this is already your</span>
              <span className="parallax-line-3 text-white block mt-4 tracking-[0.5em] md:tracking-[1.5em] -mr-[0.5em] md:-mr-[1.5em]">Second Chance?</span>
              <span className="parallax-line-4 text-white/60 block mt-8 tracking-[0.3em] md:tracking-[1.2em] -mr-[0.3em] md:-mr-[1.2em] opacity-0">will you let it pass</span>
            </h1>

            {/* SECOND GROUP FOR REVERSE SEQUENCE */}
            <h1 className="absolute top-0 left-0 w-full text-2xl sm:text-3xl md:text-4xl font-thin uppercase mb-24 text-white/90 drop-shadow-glow pointer-events-none">
              <span className="parallax-line-5 text-white/30 block mt-8 tracking-[0.3em] md:tracking-[1.2em] -mr-[0.3em] md:-mr-[1.2em] opacity-0">or take back control</span>
              <span className="parallax-line-6 text-white block mt-4 tracking-[0.5em] md:tracking-[1.5em] -mr-[0.5em] md:-mr-[1.5em] opacity-0">Let me help you</span>
            </h1>

            <div className="flex flex-col items-center gap-12 mt-24">
              <div className="w-px h-40 bg-gradient-to-b from-white/20 to-transparent" />
              <span className="text-[8px] font-thin uppercase tracking-[0.5em] md:tracking-[1em] text-white/20 animate-pulse">Initiate Calibration</span>
            </div>
          </div>
        </section>

          {/* SCENE 2: DETAIL FRAGMENTS - Multi-Layer Visuals */}
          <div className="h-[400vh] relative flex flex-col items-center justify-center">
            {SCENES_FEATURES.map((feature) => (
              <div 
                key={feature.id} 
                className={`detail-${feature.id} fixed inset-0 flex items-center justify-center pointer-events-none opacity-0 z-30 perspective-1000`}
              >
                <div className="text-center relative p-6 md:p-12 bg-white/[0.01] border border-white/[0.03] rounded-3xl backdrop-blur-3xl overflow-hidden w-full max-w-sm md:max-w-none mx-4 md:mx-0">
                  <div className="hud-icon size-16 md:size-20 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center mx-auto mb-8 md:mb-12 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                    <feature.icon className="text-white/80 w-6 h-6 md:w-9 md:h-9" strokeWidth={1} />
                  </div>
                  <div className="hud-title">
                    <span className="text-[8px] md:text-[10px] font-thin text-white/30 block mb-4 md:mb-6 uppercase tracking-[0.5em] md:tracking-[1.8em]">
                      Fragment: {feature.label}
                    </span>
                    <h2 className="text-xl sm:text-2xl md:text-5xl font-thin text-white uppercase tracking-[0.5em] md:tracking-[2em] mb-8 md:mb-12 drop-shadow-glow ml-[0.5em] md:ml-[2em]">
                      {feature.title}
                    </h2>
                    <div className="w-24 md:w-32 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent mx-auto" />
                  </div>
                  
                  {/* Subtle AR Decoration */}
                  <div className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 border-t border-l border-white/10" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 border-b border-r border-white/10" />
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
