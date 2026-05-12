import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";
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
import RealityScene from "../components/landing/RealityScene";
import MockupScene from "../components/landing/MockupScene";
import PillarScene from "../components/landing/PillarScene";
import Features from "../components/landing/Features";
import Testimonials from "../components/landing/Testimonials";
import CTA from "../components/landing/CTA";
import ScrollIndicator from "../components/landing/ScrollIndicator";
import HudButtons from "../components/ui/HudButtons";
import WorkspaceSidebar from "../components/ui/WorkspaceSidebar";
import LandingHeader from "../components/landing/LandingHeader";
import Lenis from "lenis";


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



export default function Landing() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { startLoading } = useLoadingStore();
  const isMobile = useMobile();
  const { data: landingConfig } = useSWR('/landing-config');
  
  const handleStart = () => {
    startLoading();
    setTimeout(() => {
      navigate(user ? "/dashboard" : "/auth");
    }, 1000); 
  };

  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);
  const heroVideoRef = useRef(null);
  const featuresVideoRef = useRef(null);
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

    // Force video play for mobile/iOS
    const playVideos = () => {
      if (heroVideoRef.current) {
        heroVideoRef.current.play().catch((err) => {
          console.log("Hero video autoplay failed:", err);
        });
      }
      if (featuresVideoRef.current) {
        featuresVideoRef.current.play().catch((err) => {
          console.log("Features video autoplay failed:", err);
        });
      }
    };

    playVideos();

    // Interaction fallback for mobile autoplay policies
    const handleInteraction = () => {
      playVideos();
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('click', handleInteraction);

    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
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

      // 01: INTRO SEQUENCE (0-8)
      tl.to(".scene-awakening", { opacity: 1, duration: 2 }, 0);
      tl.to(".parallax-line-2", { opacity: 0, y: -80, duration: 3 }, 2);
      tl.to(".parallax-line-3", { opacity: 0, y: -120, duration: 3 }, 2);
      tl.to(".text-let-it-pass", { opacity: 0, y: 120, duration: 3 }, 2);
      tl.to(".hero-footer", { opacity: 0, y: 50, duration: 3 }, 2);
      tl.to(".scene-awakening", { opacity: 0, pointerEvents: "none", duration: 2 }, 8);

      // 02: REALITY PHASE (7-14)
      tl.fromTo(".scene-reality", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 4 }, 7);
      tl.to(".scene-reality", { opacity: 0, y: -20, duration: 3 }, 12);
      tl.to(".hero-video", { opacity: 0, duration: 3 }, 12);

      // 03: MOCKUP INTERFACE (14-26)
      tl.to(".scene-mockups", { opacity: 1, duration: 3 }, 14);
      tl.fromTo(".mockup-desktop", { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 3, ease: "power2.out" }, 15);
      tl.fromTo(".mockup-mobile", { y: 150, opacity: 0 }, { y: 0, opacity: 1, duration: 3, ease: "power2.out" }, 17);
      tl.to(".scene-mockups", { opacity: 0, y: -50, duration: 3, ease: "power2.in" }, 25);

      // 04: CORE CAPABILITIES (26-45)
      tl.to(".features-video", { opacity: 1, duration: 4 }, 26);
      tl.fromTo(".detail-features", { opacity: 0, y: 50, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 5, ease: "power2.out" }, 28);
      tl.to(".detail-features", { opacity: 0, y: -50, scale: 1.05, duration: 4, ease: "power2.in" }, 41);

      // 05: THE PILLARS (43-72)
      tl.to(".quadrant-intellectual", { opacity: 1, y: 0, duration: 4 }, 43);
      tl.to(".quadrant-physical", { opacity: 1, y: 0, duration: 4 }, 49);
      tl.to(".quadrant-financial", { opacity: 1, y: 0, duration: 4 }, 53);
      tl.to(".quadrant-spiritual", { opacity: 1, y: 0, duration: 4 }, 57);
      tl.to(".scene-quadrants", { opacity: 0, duration: 4 }, 70);
      tl.to(".features-video", { opacity: 0, duration: 4 }, 70);

      // 06: SOCIAL PROOF (72-92)
      tl.fromTo(".scene-testimonials", { opacity: 0 }, { opacity: 1, duration: 4, ease: "power2.out" }, 72);
      tl.fromTo(".testimonials-header", { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 4, ease: "power2.out" }, 72);
      
      if (isMobile) {
        // Mobile: Vertical "Scrolling Up" flow
        tl.fromTo(".testimonial-container", { y: 500 }, { y: -500, duration: 12, ease: "none" }, 72);
        tl.fromTo(".testimonial-panel-1", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 3 }, 74);
        tl.fromTo(".testimonial-panel-2", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 3 }, 77);
        tl.fromTo(".testimonial-panel-3", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 3 }, 80);
      } else {
        // Desktop: Kinetic panels from sides
        tl.fromTo(".testimonial-panel-1", { opacity: 0, x: -300, rotate: -15 }, { opacity: 1, x: 0, rotate: 0, duration: 5, ease: "power3.out" }, 74);
        tl.fromTo(".testimonial-panel-2", { opacity: 0, y: 300, rotate: 10 }, { opacity: 1, y: 0, rotate: 0, duration: 5, ease: "power3.out" }, 76);
        tl.fromTo(".testimonial-panel-3", { opacity: 0, x: 300, rotate: 15 }, { opacity: 1, x: 0, rotate: 0, duration: 5, ease: "power3.out" }, 78);
      }

      tl.to(".scene-testimonials", { opacity: 0, scale: isMobile ? 1 : 1.2, duration: 4 }, 90);

      // 07: FINAL PROTOCOL (92-100)
      tl.to(".scene-cta", { opacity: 1, pointerEvents: "auto", duration: 2 }, 92);
    }, containerRef);
    return () => {
      ctx.revert();
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
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



    return () => {
      isUnmounted = true;
      document.documentElement.classList.remove("no-scrollbar");
      gsap.ticker.remove(tickerRAF);
      lenis.off('scroll', updateScrollTrigger);
      lenis.destroy();
      window.lenis = null;
    };
  }, [isLoaded]);

  return (
    <div ref={containerRef} className="dark relative bg-black text-white selection:bg-electric-blue/30 font-sans h-[1200vh]">
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
          <video
            ref={heroVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover md:object-contain hero-video absolute inset-0"
            style={{ filter: "contrast(1.05) brightness(1.1)", objectPosition: isMobile ? '75% center' : 'center' }}
          >
            <source src="/Hero.mp4" type="video/mp4" />
          </video>
          <video
            ref={featuresVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover md:object-contain features-video absolute inset-0 opacity-0"
            style={{ filter: "contrast(1.1) brightness(1)", objectPosition: isMobile ? '75% center' : 'center' }}
          >
            <source src="/Features.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60 pointer-events-none" />
        <div className="absolute -left-[20%] top-1/3 size-[100vw] bg-electric-blue/5 blur-[250px] rounded-full pointer-events-none" />
        <div className="absolute -right-[20%] bottom-1/3 size-[80vw] bg-white/[0.02] blur-[200px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-20 -mt-[100vh]">
        {isLoaded && <Hero config={landingConfig?.hero} />}
        <RealityScene />
        <MockupScene config={landingConfig?.mockups} />
        <PillarScene progress={progress} isMobile={isMobile} />
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
