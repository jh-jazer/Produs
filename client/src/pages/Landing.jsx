import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  Activity, 
  Zap, 
  Orbit, 
  Layers,
  Brain,
  TrendingUp,
  Calendar,
  Heart
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import useAuthStore from "../store/useAuthStore";
import ScrollCanvas from "../components/landing/ScrollCanvas";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Testimonials from "../components/landing/Testimonials";
import CTA from "../components/landing/CTA";
import ScrollIndicator from "../components/landing/ScrollIndicator";
import Lenis from "lenis";

import { useAssetStore } from "../store/useAssetStore";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const SCENES_FEATURES = [
  { id: "analytics", title: "REAL TIME ANALYTICS", label: "01 // SYSTEM METRICS", icon: Activity },
  { id: "feed", title: "HEALTHY FEED", label: "02 // VITALITY NEXUS", icon: Heart },
  { id: "habits", title: "HABIT TRACKER", label: "03 // CONSISTENCY ENGINE", icon: Orbit },
  { id: "planner", title: "DAILY PLANNER", label: "04 // STRATEGIC NODE", icon: Calendar },
  { id: "finance", title: "FINANCIAL MANAGER", label: "05 // CAPITAL FLOW", icon: TrendingUp },
  { id: "journal", title: "JOURNAL LOGGER", icon: Brain, label: "06 // MENTAL CLARITY" },
];

const TESTIMONIALS = [
  {
    id: "094",
    role: "System Architect",
    content: "This isn't just another tracker. It feels like a terminal directly into my own potential. The UI forces me to focus on what matters, discarding the noise.",
    stats: "Efficiency Index: +42%",
    accent: "electric-blue"
  },
  {
    id: "112",
    role: "Creative Director",
    content: "A flawless interface. It syncs my habits, capital, and daily logs without friction. It truly is the second chance I needed to take back control of my routine.",
    stats: "Cognitive Load: -30%",
    accent: "white"
  },
  {
    id: "043",
    role: "Lead Engineer",
    content: "I was lost in endless productivity loops before. Produs acts as a central nexus. Dark, minimal, and unapologetically focused. It recalibrated my workflow.",
    stats: "Flow State: 4.8h/day",
    accent: "electric-blue"
  }
];

export default function Landing() {
  const { user } = useAuthStore();
  const { isHeroLoaded, heroLoadingProgress } = useAssetStore();
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const [isLightMode, setIsLightMode] = useState(false);
  const [minDelayMet, setMinDelayMet] = useState(false);

  const toggleTheme = (e) => {
    e.stopPropagation();
    setIsLightMode(!isLightMode);
  };

  // Splash Screen Lifecycle
  useEffect(() => {
    // Minimum 2 second timer to ensure opening animations look good
    const timer = setTimeout(() => {
        setMinDelayMet(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only dismiss splash when both the minimum delay and assets are fully loaded
    if (minDelayMet && isHeroLoaded) {
      const exitTimer = setTimeout(() => {
          setShowSplash(false);
          document.body.style.overflow = '';
      }, 500); // Soft fade-out delay
      return () => clearTimeout(exitTimer);
    } else {
      document.body.style.overflow = 'hidden';
    }
  }, [minDelayMet, isHeroLoaded]);

  // Navbar Visibility Logic (Always visible as requested)
  const [navVisible] = useState(true);

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

      // Scene 1: Initial Reveal (0% - 3%)
      tl.to(".scene-awakening", { opacity: 1, duration: 3 }, 0);

      // Scene 1: Multi-Layer Awakening Exit (5% - 7%)
      tl.to(".parallax-line-1", { y: -30, opacity: 0, duration: 2 }, 5);
      tl.to(".parallax-line-2", { y: -50, opacity: 0, duration: 2 }, 5.5);
      tl.to(".parallax-line-3", { y: -70, opacity: 0, duration: 2, scale: 1.02 }, 6);

      // Text: "will you let it pass" (9% - 13%)
      tl.fromTo(".text-let-it-pass", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 2 }, 9);
      tl.to(".text-let-it-pass", { opacity: 0, y: -20, duration: 2 }, 13);

      // Text: "or take back control" (15% - 19%)
      tl.fromTo(".text-take-control", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 2 }, 15);
      tl.to(".text-take-control", { opacity: 0, y: -20, duration: 2 }, 19);

      // Text: "Let me help you" (21% - 25%)
      tl.fromTo(".text-let-me-help", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 2 }, 21);
      tl.to(".text-let-me-help", { opacity: 0, y: -20, duration: 2 }, 25);

      tl.to(".scene-dimmer", { opacity: 0, duration: 5 }, 28);
      tl.to(".scene-awakening", { opacity: 0, duration: 2 }, 32);

      // Scene 2: Tech Detail Nodes (HUD Fragments 30% - 85%)
      SCENES_FEATURES.forEach((feature, idx) => {
          const start = 30 + (idx * 10); // Start at 30%, 10% spread
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

      // Scene 3: Testimonials (90% - 97%)
      tl.fromTo(".scene-testimonials", 
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 6, ease: "power2.out" },
        90
      );
      tl.to(".scene-testimonials", { opacity: 0, y: -50, duration: 2 }, 96);

      // Scene 4: Final CTA (97% - 100%)
      tl.fromTo(".scene-cta", 
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 3, ease: "power2.out" },
        97
      );
      tl.to(".scene-cta", { pointerEvents: "auto", duration: 0.1 }, 97.5);

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
  
  // Section 2 Background Color Logic (Black by 30%)
  const section2BgOpacity = progress > 0.2 ? Math.min(1, (progress - 0.2) / 0.1) : 0;

  const handleNavigate = (targetProgress) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const target = targetProgress * scrollHeight;
    if (window.lenis) {
      window.lenis.scrollTo(target, { immediate: true });
    } else {
      window.scrollTo(0, target);
    }
  };

  useEffect(() => {
    document.documentElement.classList.add("no-scrollbar");

    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    
    // Store lenis for navigation
    window.lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tickerRAF = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerRAF);
    gsap.ticker.lagSmoothing(0);

    return () => {
      document.documentElement.classList.remove("no-scrollbar");
      lenis.destroy();
      window.lenis = null;
      gsap.ticker.remove(tickerRAF);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative transition-colors duration-1000 ${isLightMode ? 'bg-[#f8f8f8] text-black' : 'bg-black text-white'} selection:bg-electric-blue/30 font-sans h-[1200vh]`}>

      {/* Splash Screen Overlay */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className={`fixed inset-0 z-[10000] ${isLightMode ? 'bg-[#f8f8f8]' : 'bg-black'} flex flex-col items-center justify-center pointer-events-auto transition-colors duration-1000`}
          >
            <div className="relative flex flex-col items-center">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="flex items-center justify-center relative mb-8"
              >
                <div className="absolute inset-0 bg-electric-blue/20 blur-xl rounded-full size-24 transform translate-y-2"></div>
                <div className={`size-20 ${isLightMode ? 'bg-black shadow-[0_0_40px_rgba(0,0,0,0.2)]' : 'bg-white shadow-[0_0_40px_rgba(255,255,255,0.8)]'} transform rotate-45 relative z-10 flex items-center justify-center border ${isLightMode ? 'border-black/40' : 'border-white/40'}`}>
                  <div className={`size-10 ${isLightMode ? 'bg-white shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]' : 'bg-black shadow-[inset_0_0_20px_rgba(255,255,255,0.5)]'} transform -rotate-45`} />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <h1 className={`text-xl md:text-2xl font-semibold tracking-[0.8em] ${isLightMode ? 'text-black' : 'text-white'} uppercase ml-[0.8em]`}>Produs</h1>
                <div className={`w-32 h-px bg-gradient-to-r ${isLightMode ? 'from-transparent via-black/60 to-transparent' : 'from-transparent via-white/60 to-transparent'}`}></div>
                <span className={`text-[12px] font-semibold uppercase tracking-[0.4em] ${isLightMode ? 'text-black/70' : 'text-white/70'} animate-pulse`}>Connecting to Network</span>
              </motion.div>
            </div>
            
            <div className="absolute bottom-12 w-full flex justify-center">
              <div className={`w-48 h-[2px] ${isLightMode ? 'bg-black/10' : 'bg-white/10'} rounded-full overflow-hidden`}>
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: `${heroLoadingProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`h-full ${isLightMode ? 'bg-black shadow-[0_0_10px_rgba(0,0,0,0.2)]' : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'}`}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Cursor Background */}
      <div
        className={`fixed pointer-events-none z-[9999] size-[600px] rounded-full blur-[150px] transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${isLightMode ? 'opacity-[0.1] bg-electric-blue' : 'opacity-[0.07] bg-electric-blue'}`}
        style={{ top: mousePosition.y, left: mousePosition.x }}
      />

      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 w-full z-[100] px-4 md:px-12 py-6 md:py-10 flex justify-between items-center pointer-events-none"
      >
        <div className="flex items-center gap-3 md:gap-4 group cursor-pointer pointer-events-auto" onClick={toggleTheme}>
          <div className={`size-4 md:size-6 ${isLightMode ? 'bg-black' : 'bg-white'} flex items-center justify-center transition-all group-hover:bg-electric-blue rotate-45 group-hover:rotate-0`} />
          <span className={`font-normal text-[11px] md:text-xs uppercase tracking-[0.5em] md:tracking-[0.8em] ${isLightMode ? 'text-black/80' : 'text-white/80'} group-hover:text-current transition-colors hidden sm:inline-block`}>Produs</span>
        </div>

        <div className={`hidden lg:flex gap-16 items-center text-[10px] uppercase font-normal tracking-[0.5em] ${isLightMode ? 'text-black/70' : 'text-white/70'} pointer-events-auto`}>
          <a href="#" className={`hover:text-current transition-all hover:tracking-[0.8em]`}>Arch</a>
          <a href="#" className={`hover:text-current transition-all hover:tracking-[0.8em]`}>Sync</a>
          <Link to="/auth" className={`hover:text-current transition-all hover:tracking-[0.8em] border-l ${isLightMode ? 'border-black/30' : 'border-white/30'} pl-16`}>Entry</Link>
        </div>

        <Link to={user ? "/dashboard" : "/auth"} className="pointer-events-auto group flex items-center gap-3 md:gap-6">
          <span className={`font-normal text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.5em] ${isLightMode ? 'text-black/80' : 'text-white/80'} group-hover:text-current transition-colors text-right max-w-[100px] md:max-w-none`}>Access Interface</span>
          <div className={`size-8 md:size-10 shrink-0 rounded-full border ${isLightMode ? 'border-black/30' : 'border-white/30'} flex items-center justify-center group-hover:border-current transition-all`}>
            <ChevronRight size={14} className={`${isLightMode ? 'text-black/80' : 'text-white/80'} group-hover:text-current group-hover:translate-x-1 transition-all`} />
          </div>
        </Link>
      </motion.nav>

      {/* Pinned Background - The Cinematic Scrub */}
      <div className="pin-background w-full h-screen overflow-hidden relative">
        <ScrollCanvas progress={mappedProgress} isLightMode={isLightMode} />
        <div className={`absolute inset-0 bg-gradient-to-b ${isLightMode ? 'from-white via-transparent to-white opacity-40' : 'from-black via-transparent to-black opacity-90'} pointer-events-none`} />
        <div className={`absolute -left-[20%] top-1/3 size-[100vw] ${isLightMode ? 'bg-electric-blue/10' : 'bg-electric-blue/5'} blur-[250px] rounded-full pointer-events-none`} />
        <div className={`absolute -right-[20%] bottom-1/3 size-[80vw] ${isLightMode ? 'bg-black/[0.02]' : 'bg-white/[0.02]'} blur-[200px] rounded-full pointer-events-none`} />
        {/* Section 2 solid background overlay that fades in */}
        <div 
          className={`absolute inset-0 ${isLightMode ? 'bg-[#f8f8f8]' : 'bg-[#050505]'} z-10 pointer-events-none`} 
          style={{ opacity: section2BgOpacity }}
        />
      </div>

      {/* Cinematic Scenes Content */}
      <div className="relative z-20 -mt-[100vh]">
        <Hero isLightMode={isLightMode} />
        <Features features={SCENES_FEATURES} isLightMode={isLightMode} />
        <Testimonials testimonials={TESTIMONIALS} isLightMode={isLightMode} />
        <CTA user={user} isLightMode={isLightMode} />
      </div>

      {/* Scroll Progress Indicator */}
      <ScrollIndicator progress={progress} onNavigate={handleNavigate} isLightMode={isLightMode} />
    </div>
  );
}
