import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import useMobile from "../hooks/useMobile";

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
  { id: "analytics", title: "ANALYTICS", label: "01 // SYSTEM METRICS", icon: Activity, description: "Real-time performance tracking and behavioral mapping for peak efficiency." },
  { id: "feed", title: "VITALITY", label: "02 // VITALITY NEXUS", icon: Heart, description: "Intelligent health data synchronization to maintain your physical edge." },
  { id: "habits", title: "HABITS", label: "03 // CONSISTENCY ENGINE", icon: Orbit, description: "Neural habit loops designed to automate your path to mastery." },
  { id: "planner", title: "STRATEGY", label: "04 // STRATEGIC NODE", icon: Calendar, description: "Dynamic daily planning that adapts to your unique cognitive flow." },
  { id: "finance", title: "CAPITAL", label: "05 // CAPITAL FLOW", icon: TrendingUp, description: "Complete financial overview with real-time asset and liability monitoring." },
  { id: "journal", title: "CLARITY", label: "06 // MENTAL CLARITY", icon: Brain, description: "Unrestricted mental logging to offload and organize your internal thoughts." },
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
  const isMobile = useMobile();
  
  const handleStart = () => {
    startLoading();
    // Navigate shortly after loader starts for a smooth transition
    setTimeout(() => {
      navigate(user ? "/dashboard" : "/auth");
    }, 1000); 
  };

  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  // 0. Wait for initial-loader to be removed from the view
  useEffect(() => {
    const checkLoader = () => {
      const loader = document.getElementById('initial-loader');
      if (!loader || loader.classList.contains('fade-out')) {
        // Wait a small buffer for the fade-out transition to clear
        setTimeout(() => setIsLoaded(true), 500);
      } else {
        setTimeout(checkLoader, 200);
      }
    };
    checkLoader();
  }, []);

  // 1. GSAP Scrollytelling Timeline - Wait for isLoaded to ensure DOM is stable
  useEffect(() => {
    if (!isLoaded) return;

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
      tl.to(".parallax-line-2", { opacity: 0, y: -80, duration: 4 }, 6);
      tl.to(".parallax-line-3", { opacity: 0, y: -120, duration: 4 }, 7);
      tl.to(".text-let-it-pass", { opacity: 0, y: -160, duration: 4 }, 8);
      tl.to(".hero-footer", { opacity: 0, y: 50, duration: 4 }, 8);
      tl.to(".scene-dimmer", { opacity: 0, duration: 5 }, 28);
      tl.to(".scene-awakening", { opacity: 0, pointerEvents: "none", duration: 2 }, 12);

      // Transitional Scene: Reality (at 15%)
      tl.fromTo(".scene-reality", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 4 }, 15);
      tl.to(".scene-reality", { opacity: 0, y: -20, duration: 4 }, 25);

      // Cross-fade background videos
      tl.to(".hero-video", { opacity: 0, duration: 5 }, 28);
      tl.to(".features-video", { opacity: 1, duration: 5 }, 28);
      // Second Hero (Features) Reveal
      tl.fromTo(".detail-features", { opacity: 0, y: 50, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 6, ease: "power2.out" }, 35);
      tl.to(".detail-features", { opacity: 0, y: -50, scale: 1.05, duration: 4, ease: "power2.in" }, 45);

      // Quadrant Features Sequence
      tl.to(".quadrant-intellectual", { opacity: 1, y: 0, duration: 4 }, 55);
      tl.to(".quadrant-spiritual", { opacity: 1, y: 0, duration: 4 }, 57);
      tl.to(".quadrant-financial", { opacity: 1, y: 0, duration: 4 }, 59);
      tl.to(".quadrant-physical", { opacity: 1, y: 0, duration: 4 }, 61);

      // Fade out all quadrants and the background video
      tl.to(".scene-quadrants", { opacity: 0, duration: 4 }, 66);
      tl.to(".features-video", { opacity: 0, duration: 4 }, 66);

      // Gamified System Reveal
      tl.fromTo(".scene-gamified", { opacity: 0 }, { opacity: 1, duration: 4, ease: "power2.out" }, 69);
      // Parallax stagger for header
      tl.fromTo(".gamified-header", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 4, ease: "power2.out" }, 69);
      // Parallax stagger for rows
      tl.fromTo(".gamified-row-1", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 3, ease: "power2.out" }, 69.5);
      tl.fromTo(".gamified-row-2", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 3, ease: "power2.out" }, 70.5);
      tl.fromTo(".gamified-row-3", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 3, ease: "power2.out" }, 71.5);
      tl.fromTo(".gamified-row-4", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 3, ease: "power2.out" }, 72.5);
      tl.to(".scene-gamified", { opacity: 0, y: -50, scale: 1.1, duration: 4, ease: "power2.in" }, 78);

      // Testimonials Reveal (Horizontal Row)
      tl.fromTo(".scene-testimonials", { opacity: 0 }, { opacity: 1, duration: 4, ease: "power2.out" }, 84);
      
      // Header: from Top
      tl.fromTo(".testimonials-header", { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 4, ease: "power2.out" }, 84);

      // Panel 1: from Left
      tl.fromTo(".testimonial-panel-1", { opacity: 0, x: -300, rotate: -15 }, { opacity: 1, x: 0, rotate: 0, duration: 4, ease: "power3.out" }, 84.5);
      
      // Panel 2: from Bottom
      tl.fromTo(".testimonial-panel-2", { opacity: 0, y: 300, rotate: 10 }, { opacity: 1, y: 0, rotate: 0, duration: 4, ease: "power3.out" }, 85.5);
      
      // Panel 3: from Right
      tl.fromTo(".testimonial-panel-3", { opacity: 0, x: 300, rotate: 15 }, { opacity: 1, x: 0, rotate: 0, duration: 4, ease: "power3.out" }, 86.5);

      tl.to(".scene-testimonials", { opacity: 0, scale: 1.2, duration: 3 }, 93);

      
      // CTA Reveal
      tl.to(".scene-cta", { opacity: 1, pointerEvents: "auto", duration: 4 }, 95);
      tl.to(".scene-cta", { pointerEvents: "auto", duration: 0.1 }, 97.5);
    }, containerRef);
    return () => ctx.revert();
  }, [isLoaded]);

  // 2. Glow Cursor Logic
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 3. Lenis Scrolling Initialization


  const handleNavigate = (targetProgress) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const target = targetProgress * scrollHeight;
    if (window.lenis) window.lenis.scrollTo(target, { immediate: true });
    else window.scrollTo(0, target);
  };

  const refreshTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isLoaded) return;
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
  }, [isLoaded]);

  return (
    <div ref={containerRef} className="relative bg-black text-white selection:bg-electric-blue/30 font-sans h-[1200vh]">
      <div
        className="fixed pointer-events-none z-[9999] size-[250px] rounded-full blur-[100px] transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.1] bg-electric-blue"
        style={{ top: mousePosition.y, left: mousePosition.x }}
      />

      <AnimatePresence>
        {isLoaded && (
          <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 w-full z-[100] px-4 md:px-12 py-6 md:py-10 flex justify-between items-center pointer-events-none"
          >
            <div className="flex items-center gap-3 md:gap-4 group cursor-pointer pointer-events-auto">
              <span className="font-black text-[11px] uppercase tracking-[0.8em] leading-none text-white mt-1">Produs</span>
            </div>

            <div onClick={handleStart} className="pointer-events-auto group flex items-center cursor-pointer relative">
                <div className="size-10 md:size-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white transition-all bg-white/[0.03] group-hover:bg-white/10">
                  <div className="ml-1 w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent group-hover:scale-110 transition-transform" />
                </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <div className="pin-background w-full h-screen overflow-hidden relative bg-black md:p-12 lg:p-24 transition-colors duration-1000 z-0">
        <div className="w-full h-full relative overflow-hidden bg-black z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover md:object-contain hero-video absolute inset-0"
            style={{ 
              filter: "contrast(1.05) brightness(1.1)",
              objectPosition: isMobile ? '75% center' : 'center'
            }}
          >
            <source src="/Hero.mp4" type="video/mp4" />
          </video>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover md:object-contain features-video absolute inset-0 opacity-0"
            style={{ 
              filter: "contrast(1.1) brightness(1)",
              objectPosition: isMobile ? '75% center' : 'center'
            }}
          >
            <source src="/Features.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60 pointer-events-none" />
        <div className="absolute -left-[20%] top-1/3 size-[100vw] bg-electric-blue/5 blur-[250px] rounded-full pointer-events-none" />
        <div className="absolute -right-[20%] bottom-1/3 size-[80vw] bg-white/[0.02] blur-[200px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-20 -mt-[100vh]">
        {isLoaded && <Hero />}
        
        {/* Transitional Scene at 15% scroll */}
        <div className="scene-reality fixed inset-0 flex items-center justify-end md:justify-center px-10 md:px-24 pointer-events-none opacity-0">
          <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-24 items-end md:items-center max-w-7xl w-full">
            <div className="text-right">
              <h2 className="font-black tracking-tight uppercase leading-[0.85] flex flex-col items-end">
                <span className="text-4xl md:text-6xl text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}>HELP YOUR</span>
                <span className="text-4xl md:text-6xl text-white">HERO</span>
              </h2>
            </div>
            <div className="text-right md:text-left md:pl-12">
              <p className="text-white/40 text-[10px] md:text-sm font-light tracking-[0.3em] uppercase leading-relaxed max-w-[240px] md:max-w-sm">
                WHILE ON YOUR SIDE OF <span className="text-white/80">REALITY</span> <br /> WITH OUR SYSTEM
              </p>
            </div>
          </div>
        </div>

        {/* Quadrant Features Scene */}
        <div className="scene-quadrants fixed inset-0 z-30 pointer-events-none p-12 md:p-24 overflow-hidden">
          {/* Top Left: Intellectual */}
          <div className="quadrant-intellectual absolute top-[15%] md:top-[20%] right-[10%] md:left-[15%] md:right-auto opacity-0 text-right md:text-left max-w-[200px] md:max-w-xs">
            <h3 className="text-white text-lg md:text-3xl font-black uppercase tracking-tighter mb-2 md:mb-4">Intellectual</h3>
            <p className="text-white/40 text-[10px] md:text-sm font-light tracking-wide leading-relaxed">
              Strategic planning, Deep Work focus sessions, and unrestricted mental logging.
            </p>
          </div>
          
          {/* Top Right: Physical */}
          <div className="quadrant-physical absolute top-[35%] md:top-[20%] right-[10%] md:right-[15%] opacity-0 text-right max-w-[200px] md:max-w-xs">
            <h3 className="text-white text-lg md:text-3xl font-black uppercase tracking-tighter mb-2 md:mb-4">Physical</h3>
            <p className="text-white/40 text-[10px] md:text-sm font-light tracking-wide leading-relaxed">
              Real-time vitality tracking and automated habit loops for peak energy maintenance.
            </p>
          </div>

          {/* Bottom Left: Financial */}
          <div className="quadrant-financial absolute top-[55%] md:bottom-[20%] right-[10%] md:left-[15%] md:right-auto md:top-auto opacity-0 text-right md:text-left max-w-[200px] md:max-w-xs">
            <h3 className="text-white text-lg md:text-3xl font-black uppercase tracking-tighter mb-2 md:mb-4">Financial</h3>
            <p className="text-white/40 text-[10px] md:text-sm font-light tracking-wide leading-relaxed">
              Full-spectrum capital management, asset tracking, and resource allocation.
            </p>
          </div>

          {/* Bottom Right: Spiritual */}
          <div className="quadrant-spiritual absolute top-[75%] md:bottom-[20%] right-[10%] md:right-[15%] md:top-auto opacity-0 text-right max-w-[200px] md:max-w-xs">
            <h3 className="text-white text-lg md:text-3xl font-black uppercase tracking-tighter mb-2 md:mb-4">Spiritual</h3>
            <p className="text-white/40 text-[10px] md:text-sm font-light tracking-wide leading-relaxed">
              Mindset reflection, gratitude rituals, and alignment through intentionality.
            </p>
          </div>
        </div>

        {/* Gamified System Scene */}
        <div className="scene-gamified fixed inset-0 flex items-center justify-end md:justify-center px-10 md:px-24 pointer-events-none opacity-0 z-30">
          <div className="max-w-7xl w-full flex flex-col md:grid md:grid-cols-2 gap-12 md:gap-16 items-end md:items-center">
            
            {/* Header */}
            <div className="gamified-header text-right md:-translate-x-12">
              <h2 className="font-black tracking-[0.4em] uppercase flex flex-col items-end gap-2 md:gap-4">
                <span className="text-xl md:text-4xl text-white inline-block skew-x-[-3deg]">
                  IMMERSIVE
                </span>
                <span className="text-xl md:text-4xl text-white inline-block md:translate-x-5 skew-x-[-3deg]">
                  STORY
                </span>
                <span className="text-xl md:text-4xl text-white inline-block md:translate-x-10 skew-x-[-3deg]">
                  DRIVEN
                </span>
                <span className="text-xl md:text-4xl text-white inline-block md:translate-x-16 skew-x-[-3deg]">
                  GAME
                </span>
              </h2>
            </div>

            {/* Rows */}
            <div className="flex flex-col items-end md:items-start w-full">
              {/* Row 1 */}
              <div className="gamified-row-1 w-full py-4 md:py-8 flex flex-col items-end md:items-start gap-2 md:gap-3">
                <span className="text-electric-blue font-mono text-[9px] md:text-xs tracking-widest uppercase">01 // STORIES</span>
                <p className="text-white/40 text-[10px] md:text-sm font-light tracking-wide leading-relaxed max-w-[280px] md:max-w-[400px] text-right md:text-left">
                  Unlock your personal narrative through progress.
                </p>
              </div>

              <div className="w-16 md:w-24 h-px bg-white/20" />

              {/* Row 2 */}
              <div className="gamified-row-2 w-full py-4 md:py-8 flex flex-col items-end md:items-start gap-2 md:gap-3">
                <span className="text-white/60 font-mono text-[9px] md:text-xs tracking-widest uppercase">02 // LEVELLING</span>
                <p className="text-white/40 text-[10px] md:text-sm font-light tracking-wide leading-relaxed max-w-[280px] md:max-w-[400px] text-right md:text-left">
                  Grow stronger through experience, unlock new tiers.
                </p>
              </div>

              <div className="w-16 md:w-24 h-px bg-white/20" />

              {/* Row 3 */}
              <div className="gamified-row-3 w-full py-4 md:py-8 flex flex-col items-end md:items-start gap-2 md:gap-3">
                <span className="text-white/60 font-mono text-[9px] md:text-xs tracking-widest uppercase">03 // SURVIVAL</span>
                <p className="text-white/40 text-[10px] md:text-sm font-light tracking-wide leading-relaxed max-w-[280px] md:max-w-[400px] text-right md:text-left">
                  Master the essentials and maintain your status.
                </p>
              </div>

              <div className="w-16 md:w-24 h-px bg-white/20" />

              {/* Row 4 */}
              <div className="gamified-row-4 w-full py-4 md:py-8 flex flex-col items-end md:items-start gap-2 md:gap-3">
                <span className="text-white/60 font-mono text-[9px] md:text-xs tracking-widest uppercase">04 // COMPETITIONS</span>
                <p className="text-white/40 text-[10px] md:text-sm font-light tracking-wide leading-relaxed max-w-[280px] md:max-w-[400px] text-right md:text-left">
                  Compete with yourself in global challenges.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Features />
        <Testimonials testimonials={TESTIMONIALS} />
        <CTA user={user} />
      </div>

      <ScrollIndicator progress={progress} onNavigate={handleNavigate} />
    </div>
  );
}
