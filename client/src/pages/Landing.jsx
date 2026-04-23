import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Activity, 
  Zap, 
  Orbit, 
  Brain,
  TrendingUp,
  Calendar,
  Heart
} from "lucide-react";
import Logo from "../components/brand/Logo";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import useAuthStore from "../store/useAuthStore";
import useLoadingStore from "../store/useLoadingStore";
import { useNavigate } from "react-router-dom";
import ScrollCanvas from "../components/landing/ScrollCanvas";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Testimonials from "../components/landing/Testimonials";
import CTA from "../components/landing/CTA";
import ScrollIndicator from "../components/landing/ScrollIndicator";
// removed LandingSplashScreen import

import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
ScrollTrigger.config({ ignoreMobileResize: true });

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
  const navigate = useNavigate();
  const { startLoading } = useLoadingStore();
  
  const handleStart = () => {
    startLoading();
    // Navigate shortly after loader starts for a smooth transition
    setTimeout(() => {
      navigate(user ? "/dashboard" : "/auth");
    }, 1000); 
  };

  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  // 1. GSAP Scrollytelling Timeline
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

      tl.to(".scene-awakening", { opacity: 1, duration: 3 }, 0);
      tl.to(".parallax-line-1", { y: -30, opacity: 0, duration: 2 }, 5);
      tl.to(".parallax-line-2", { y: -50, opacity: 0, duration: 2 }, 5.5);
      tl.to(".parallax-line-3", { y: -70, opacity: 0, duration: 2, scale: 1.02 }, 6);
      tl.fromTo(".text-let-it-pass", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 2 }, 9);
      tl.to(".text-let-it-pass", { opacity: 0, y: -20, duration: 2 }, 13);
      tl.fromTo(".text-take-control", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 2 }, 15);
      tl.to(".text-take-control", { opacity: 0, y: -20, duration: 2 }, 19);
      tl.fromTo(".text-let-me-help", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 2 }, 21);
      tl.to(".text-let-me-help", { opacity: 0, y: -20, duration: 2 }, 25);
      tl.to(".scene-dimmer", { opacity: 0, duration: 5 }, 28);
      tl.to(".scene-awakening", { opacity: 0, duration: 2 }, 32);

      SCENES_FEATURES.forEach((feature, idx) => {
          const start = 30 + (idx * 10);
          const nodeClass = `.detail-${feature.id}`;
          tl.fromTo(nodeClass, { opacity: 0, scale: 0.8, y: 150 }, { opacity: 1, scale: 1, y: 0, duration: 8, ease: "power2.out" }, start);
          tl.to(`${nodeClass} .hud-icon`, { y: -40, duration: 8 }, start + 2);
          tl.to(`${nodeClass} .hud-title`, { y: -80, duration: 8 }, start + 3);
          tl.to(nodeClass, { opacity: 0, scale: 1.2, y: -150, duration: 6, ease: "power2.in" }, start + 8);
      });

      tl.fromTo(".scene-testimonials", { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 6, ease: "power2.out" }, 90);
      tl.to(".scene-testimonials", { opacity: 0, y: -50, duration: 2 }, 96);
      tl.fromTo(".scene-cta", { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 3, ease: "power2.out" }, 97);
      tl.to(".scene-cta", { pointerEvents: "auto", duration: 0.1 }, 97.5);
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // 2. Glow Cursor Logic
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 3. Lenis Scrolling Initialization
  const mappedProgress = Math.min(1, progress / 0.3);
  const section2BgOpacity = progress > 0.2 ? Math.min(1, (progress - 0.2) / 0.1) : 0;

  const handleNavigate = (targetProgress) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const target = targetProgress * scrollHeight;
    if (window.lenis) window.lenis.scrollTo(target, { immediate: true });
    else window.scrollTo(0, target);
  };

  const refreshTimeoutRef = useRef(null);

  useEffect(() => {
    let isUnmounted = false;
    document.documentElement.classList.add("no-scrollbar");
    
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    window.lenis = lenis;
    lenis.start();

    const updateScrollTrigger = () => {
      if (!isUnmounted) ScrollTrigger.update();
    };
    lenis.on('scroll', updateScrollTrigger);
    
    const tickerRAF = (time) => {
      if (!isUnmounted) lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerRAF);
    gsap.ticker.lagSmoothing(0);

    // Initial refresh to sync positions
    refreshTimeoutRef.current = setTimeout(() => {
        if (!isUnmounted && typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }, 1000);

    return () => {
      isUnmounted = true;
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      document.documentElement.classList.remove("no-scrollbar");
      
      // Stop ticker and scroll processing IMMEDIATELY
      gsap.ticker.remove(tickerRAF);
      lenis.off('scroll', updateScrollTrigger);
      
      // Clear GSAP's internal refresh/scroll memory
      ScrollTrigger.clearScrollMemory();
      
      // Kill all ScrollTrigger instances
      ScrollTrigger.getAll().forEach(t => t.kill(true));
      
      // Force kill everything to prevent post-mortem refreshes or 100vh measurement removals
      ScrollTrigger.killAll(); 
      
      // Destroy lenis
      lenis.destroy();
      window.lenis = null;
    };
  }, []);

  return (
    <div ref={containerRef} className="relative bg-black text-white selection:bg-electric-blue/30 font-sans h-[1200vh]">
      <div
        className="fixed pointer-events-none z-[9999] size-[600px] rounded-full blur-[150px] transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.07] bg-electric-blue"
        style={{ top: mousePosition.y, left: mousePosition.x }}
      />

      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 3.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 w-full z-[100] px-4 md:px-12 py-6 md:py-10 flex justify-between items-center pointer-events-none"
      >
        <div className="flex items-center gap-3 md:gap-4 group cursor-pointer pointer-events-auto">
          <span className="font-black text-[11px] uppercase tracking-[0.8em] leading-none text-white mt-1">Produs</span>
        </div>

        <div onClick={handleStart} className="pointer-events-auto group flex items-center gap-3 md:gap-6 cursor-pointer">
          <span className="font-normal text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.5em] text-white/80 group-hover:text-current transition-colors text-right max-w-[100px] md:max-w-none">
            {user ? "START" : "SIGN IN"}
          </span>
          <div className="size-8 md:size-10 shrink-0 rounded-full border border-white/30 flex items-center justify-center group-hover:border-current transition-all">
            <ChevronRight size={14} className="text-white/80 group-hover:text-current group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </motion.nav>

      <div className="pin-background w-full h-screen overflow-hidden relative">
        <ScrollCanvas progress={mappedProgress} />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-90 pointer-events-none" />
        <div className="absolute -left-[20%] top-1/3 size-[100vw] bg-electric-blue/5 blur-[250px] rounded-full pointer-events-none" />
        <div className="absolute -right-[20%] bottom-1/3 size-[80vw] bg-white/[0.02] blur-[200px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[#000000] z-10 pointer-events-none" style={{ opacity: section2BgOpacity }} />
      </div>

      <div className="relative z-20 -mt-[100vh]">
        <Hero />
        <Features features={SCENES_FEATURES} />
        <Testimonials testimonials={TESTIMONIALS} />
        <CTA user={user} />
      </div>

      <ScrollIndicator progress={progress} onNavigate={handleNavigate} />
    </div>
  );
}
