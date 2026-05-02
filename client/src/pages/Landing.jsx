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
  Heart,
  Menu,
  X
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
import HudButtons from "../components/ui/HudButtons";
import WorkspaceSidebar from "../components/ui/WorkspaceSidebar";
import LandingHeader from "../components/landing/LandingHeader";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
ScrollTrigger.config({ ignoreMobileResize: true });

const SCENES_FEATURES = [
  { id: "analytics", title: "ANALYTICS", label: "01 // SYSTEM METRICS", icon: "activity", description: "Real-time performance tracking and behavioral mapping for peak efficiency." },
  { id: "feed", title: "VITALITY", label: "02 // VITALITY NEXUS", icon: "favorite", description: "Intelligent health data synchronization to maintain your physical edge." },
  { id: "habits", title: "HABITS", label: "03 // CONSISTENCY ENGINE", icon: "cached", description: "Neural habit loops designed to automate your path to mastery." },
  { id: "planner", title: "STRATEGY", label: "04 // STRATEGIC NODE", icon: "event", description: "Dynamic daily planning that adapts to your unique cognitive flow." },
  { id: "finance", title: "CAPITAL", label: "05 // CAPITAL FLOW", icon: "trending_up", description: "Complete financial overview with real-time asset and liability monitoring." },
  { id: "journal", title: "CLARITY", label: "06 // MENTAL CLARITY", icon: "psychology", description: "Unrestricted mental logging to offload and organize your internal thoughts." },
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

const GlitchTitle = ({ progress, threshold, original, target }) => {
  const [displayText, setDisplayText] = React.useState(original);
  const [isGlitched, setIsGlitched] = React.useState(false);
  
  const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  React.useEffect(() => {
    if (progress > threshold && !isGlitched) {
      setIsGlitched(true);
      let count = 0;
      const interval = setInterval(() => {
        setDisplayText(prev => 
          target.split('').map((c, i) => Math.random() > 0.5 ? chars[Math.floor(Math.random() * chars.length)] : target[i]).join('')
        );
        count++;
        if (count > 5) {
          clearInterval(interval);
          setDisplayText(target);
        }
      }, 50);
    } else if (progress <= threshold && isGlitched) {
      setIsGlitched(false);
      setDisplayText(original);
    }
  }, [progress, threshold, original, target, isGlitched]);

  return <span>{displayText}</span>;
};

export default function Landing() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { startLoading } = useLoadingStore();
  const isMobile = useMobile();
  
  const handleStart = () => {
    startLoading();
    setTimeout(() => {
      navigate(user ? "/dashboard" : "/auth");
    }, 1000); 
  };

  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const landingTabs = [
    { id: "hub", label: "HUB", icon: "home", path: "/" },
    { id: "about", label: "ABOUT", icon: "info", path: "/manual" },
    { id: "classes", label: "CLASSES", icon: "school", path: "/classes" },
    { id: "patches", label: "PATCHES", icon: "history", path: "/updates" }
  ];

  const [activeLandingTab, setActiveLandingTab] = useState("hub");

  const handleLandingTabClick = (id) => {
    const tab = landingTabs.find(t => t.id === id);
    if (tab && tab.path) {
      navigate(tab.path);
    }
  };

  useEffect(() => {
    const checkLoader = () => {
      const loader = document.getElementById('initial-loader');
      if (!loader || loader.classList.contains('fade-out')) {
        setTimeout(() => setIsLoaded(true), 500);
      } else {
        setTimeout(checkLoader, 200);
      }
    };
    checkLoader();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const ctx = gsap.context(() => {
      // Entrance Animation (Non-scroll)
      gsap.from(".hero-sidebar", { 
        opacity: 0, 
        x: -40, 
        duration: 1.2, 
        delay: 0.5, 
        ease: "power3.out" 
      });

      // TIMELINE CALIBRATION
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

      // 01: INTRO SEQUENCE (0-10)
      tl.to(".scene-awakening", { opacity: 1, duration: 2 }, 0);
      tl.to(".hero-sidebar", { opacity: 1, x: 0, duration: 1 }, 0);
      tl.to(".parallax-line-2", { opacity: 0, y: -80, duration: 3 }, 5);
      tl.to(".parallax-line-3", { opacity: 0, y: -120, duration: 3 }, 5);
      tl.to(".text-let-it-pass", { opacity: 0, y: -160, duration: 3 }, 5);
      tl.to(".hero-footer", { opacity: 0, y: 50, duration: 3 }, 5);
      tl.to(".hero-sidebar", { opacity: 0, y: 50, pointerEvents: "none", duration: 3 }, 5);
      tl.to(".scene-awakening", { opacity: 0, pointerEvents: "none", duration: 2 }, 10);
      tl.to(".hero-video", { opacity: 0, duration: 4 }, 18);

      // 02: REALITY PHASE (10-22)
      tl.fromTo(".scene-reality", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 3 }, 10);
      tl.to(".scene-reality", { opacity: 0, y: -20, duration: 4 }, 18);

      // 03: MOCKUP INTERFACE (22-40)
      tl.to(".scene-mockups", { opacity: 1, duration: 3 }, 22);
      tl.fromTo(".mockup-desktop", { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 5, ease: "power2.out" }, 24);
      tl.fromTo(".mockup-mobile", { y: 150, opacity: 0 }, { y: 0, opacity: 1, duration: 5, ease: "power2.out" }, 26);
      tl.to(".scene-mockups", { opacity: 0, y: -50, duration: 4, ease: "power2.in" }, 36);

      // 04: CORE CAPABILITIES (40-55)
      tl.to(".features-video", { opacity: 1, duration: 5 }, 40);
      tl.fromTo(".detail-features", { opacity: 0, y: 50, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 6, ease: "power2.out" }, 42);
      tl.to(".detail-features", { opacity: 0, y: -50, scale: 1.05, duration: 4, ease: "power2.in" }, 50);

      // 05: THE PILLARS (55-75)
      tl.to(".quadrant-intellectual", { opacity: 1, y: 0, duration: 4 }, 55);
      tl.to(".quadrant-physical", { opacity: 1, y: 0, duration: 4 }, 58);
      tl.to(".quadrant-financial", { opacity: 1, y: 0, duration: 4 }, 61);
      tl.to(".quadrant-spiritual", { opacity: 1, y: 0, duration: 4 }, 64);
      tl.to(".scene-quadrants", { opacity: 0, duration: 4 }, 71);
      tl.to(".features-video", { opacity: 0, duration: 4 }, 71);

      // 06: SOCIAL PROOF (75-92)
      tl.fromTo(".scene-testimonials", { opacity: 0 }, { opacity: 1, duration: 4, ease: "power2.out" }, 75);
      tl.fromTo(".testimonials-header", { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 4, ease: "power2.out" }, 75);
      tl.fromTo(".testimonial-panel-1", { opacity: 0, x: -300, rotate: -15 }, { opacity: 1, x: 0, rotate: 0, duration: 4, ease: "power3.out" }, 77);
      tl.fromTo(".testimonial-panel-2", { opacity: 0, y: 300, rotate: 10 }, { opacity: 1, y: 0, rotate: 0, duration: 4, ease: "power3.out" }, 79);
      tl.fromTo(".testimonial-panel-3", { opacity: 0, x: 300, rotate: 15 }, { opacity: 1, x: 0, rotate: 0, duration: 4, ease: "power3.out" }, 81);
      tl.to(".scene-testimonials", { opacity: 0, scale: 1.2, duration: 4 }, 88);
      
      // 07: FINAL PROTOCOL (92-100)
      tl.to(".scene-cta", { opacity: 1, pointerEvents: "auto", duration: 4 }, 92);
      tl.to(".scene-cta", { pointerEvents: "auto", duration: 0.1 }, 98);
    }, containerRef);
    return () => ctx.revert();
  }, [isLoaded]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

    refreshTimeoutRef.current = setTimeout(() => {
        if (!isUnmounted && typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }, 1000);

    return () => {
      isUnmounted = true;
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      document.documentElement.classList.remove("no-scrollbar");
      gsap.ticker.remove(tickerRAF);
      lenis.off('scroll', updateScrollTrigger);
      ScrollTrigger.clearScrollMemory();
      ScrollTrigger.getAll().forEach(t => t.kill(true));
      ScrollTrigger.killAll(); 
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
          <>
            <LandingHeader activeTab={activeLandingTab} />

            <div
              id="landing-sidebar"
              className="hidden md:block fixed left-6 md:left-12 top-[50%] -translate-y-1/2 z-[100] pointer-events-auto hero-sidebar opacity-100 translate-x-0 transition-transform duration-1000"
            >
              <WorkspaceSidebar 
                tabs={landingTabs}
                activeTab={activeLandingTab}
                setActiveTab={handleLandingTabClick}
                namespace="Landing"
              />
            </div>
          </>
        )}
      </AnimatePresence>

      <div className="pin-background w-full h-screen overflow-hidden relative bg-black md:p-12 lg:p-24 transition-colors duration-1000 z-0">
        <div className="w-full h-full relative overflow-hidden bg-black z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover md:object-contain hero-video absolute inset-0" style={{ filter: "contrast(1.05) brightness(1.1)", objectPosition: isMobile ? '75% center' : 'center' }}>
            <source src="/Hero.mp4" type="video/mp4" />
          </video>
          <video autoPlay loop muted playsInline className="w-full h-full object-cover md:object-contain features-video absolute inset-0 opacity-0" style={{ filter: "contrast(1.1) brightness(1)", objectPosition: isMobile ? '75% center' : 'center' }}>
            <source src="/Features.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60 pointer-events-none" />
        <div className="absolute -left-[20%] top-1/3 size-[100vw] bg-electric-blue/5 blur-[250px] rounded-full pointer-events-none" />
        <div className="absolute -right-[20%] bottom-1/3 size-[80vw] bg-white/[0.02] blur-[200px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-20 -mt-[100vh]">
        {isLoaded && <Hero />}
        <div className="scene-reality fixed inset-0 flex items-center justify-end md:justify-center px-10 md:px-24 pointer-events-none opacity-0">
          <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-24 items-end md:items-center max-w-7xl w-full md:-translate-x-4 lg:-translate-x-6">
            <div className="text-right md:-translate-x-[2px]">
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
        <div className="scene-mockups fixed inset-0 flex items-center justify-center z-30 pointer-events-none opacity-0">
          <div className="relative w-full max-w-7xl px-6 md:px-12 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <div className="mockup-desktop relative w-full md:w-[70%] aspect-[1911/883] bg-black rounded-xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <img src="/desktopmock.png" alt="Desktop Interface" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div className="mockup-mobile relative w-[40%] md:w-[18%] aspect-[361/601] bg-[#0a0a0a] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border-[4px] md:border-[6px] border-white/5 shadow-2xl">
              <img src="/mobilemock.png" alt="Mobile Interface" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        <div className="scene-quadrants fixed inset-0 z-30 pointer-events-none p-12 md:p-24 overflow-hidden">
          <div className="quadrant-intellectual absolute top-[15%] md:top-[20%] right-[10%] md:left-[15%] md:right-auto opacity-0 text-right md:text-left max-w-[200px] md:max-w-xs">
            <h3 className="text-white text-lg md:text-3xl font-black uppercase tracking-tighter mb-2 md:mb-4">
              <GlitchTitle progress={progress} threshold={0.68} original="Intellectual" target="STORIES" />
            </h3>
            <p className="text-white/40 text-[10px] md:text-sm font-light tracking-wide leading-relaxed">Strategic planning, Deep Work focus sessions, and unrestricted mental logging.</p>
          </div>
          <div className="quadrant-physical absolute top-[35%] md:top-[20%] right-[10%] md:right-[15%] opacity-0 text-right max-w-[200px] md:max-w-xs">
            <h3 className="text-white text-lg md:text-3xl font-black uppercase tracking-tighter mb-2 md:mb-4">
              <GlitchTitle progress={progress} threshold={0.68} original="Physical" target="LEVELLING" />
            </h3>
            <p className="text-white/40 text-[10px] md:text-sm font-light tracking-wide leading-relaxed">Real-time vitality tracking and automated habit loops for peak energy maintenance.</p>
          </div>
          <div className="quadrant-financial absolute top-[55%] md:bottom-[20%] right-[10%] md:left-[15%] md:right-auto md:top-auto opacity-0 text-right md:text-left max-w-[200px] md:max-w-xs">
            <h3 className="text-white text-lg md:text-3xl font-black uppercase tracking-tighter mb-2 md:mb-4">
              <GlitchTitle progress={progress} threshold={0.68} original="Financial" target="SURVIVAL" />
            </h3>
            <p className="text-white/40 text-[10px] md:text-sm font-light tracking-wide leading-relaxed">Full-spectrum capital management, asset tracking, and resource allocation.</p>
          </div>
          <div className="quadrant-spiritual absolute top-[75%] md:bottom-[20%] right-[10%] md:right-[15%] md:top-auto opacity-0 text-right max-w-[200px] md:max-w-xs">
            <h3 className="text-white text-lg md:text-3xl font-black uppercase tracking-tighter mb-2 md:mb-4">
              <GlitchTitle progress={progress} threshold={0.68} original="Spiritual" target="COMPETITION" />
            </h3>
            <p className="text-white/40 text-[10px] md:text-sm font-light tracking-wide leading-relaxed">Mindset reflection, gratitude rituals, and alignment through intentionality.</p>
          </div>
        </div>
        <Features />
        <Testimonials testimonials={TESTIMONIALS} />
        <CTA user={user} />
      </div>

      <AnimatePresence>
        {isLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {!isMobile && <ScrollIndicator progress={progress} onNavigate={handleNavigate} />}
            <HudButtons variant="landing" onRpgClick={handleStart} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
