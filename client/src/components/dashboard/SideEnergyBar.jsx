import React, { useState, useEffect, useRef, useContext } from "react";
import { useLocation } from "react-router-dom";
import { motion, useMotionValue, useMotionValueEvent, useSpring } from "framer-motion";
import { Cpu, Handshake, User, Zap } from "lucide-react";
import { DashboardContext } from "../../context/DashboardContext";
import useAuthStore from "../../store/useAuthStore";

const EnergyTimer = ({ current, max, lastUpdated, level }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        if (current >= max) {
            setTimeLeft("FULL");
            return;
        }

        const recoveryMinutes = 20 * (1 - ((level || 0) * 0.005));
        const recoveryMs = Math.max(recoveryMinutes, 1) * 60 * 1000;
        
        const updateTimer = () => {
            const now = new Date();
            const lastUpdateDate = new Date(lastUpdated || now);
            const elapsedMs = now - lastUpdateDate;
            
            const msUntilNext = recoveryMs - (elapsedMs % recoveryMs);
            const pointsNeeded = Math.ceil(max - current);
            const totalMsToFull = (pointsNeeded - 1) * recoveryMs + msUntilNext;

            const totalSeconds = Math.floor(totalMsToFull / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;

            setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [current, max, lastUpdated, level]);

    return <span>{timeLeft}</span>;
};

export default function SideEnergyBar() {
  const { protocolMode, setProtocolMode, viewMode, setViewMode } = useContext(DashboardContext);
  const { user } = useAuthStore();
  const location = useLocation();
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const rawProgress = useMotionValue(0);

  const isHome = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  // Energy Data
  const energyCurrent = user?.rpg?.energy?.current ?? (10 + (user?.level || 0));
  const energyMax = user?.rpg?.energy?.max ?? (10 + (user?.level || 0));
  const energyPercentage = Math.min((energyCurrent / energyMax) * 100, 100);

  // --- Scroll Logic ---
  const getActiveContainer = () => {
    const modalContainers = Array.from(document.querySelectorAll('.fixed .custom-scrollbar, .fixed [class*="overflow-y-auto"]'));
    const visibleModalContainers = modalContainers.filter(el => el.clientHeight > 0 && el.scrollHeight > el.clientHeight);
    if (visibleModalContainers.length > 0) return visibleModalContainers[visibleModalContainers.length - 1]; 
    return Array.from(document.querySelectorAll('.custom-scrollbar')).find(el => !el.closest('.fixed'));
  };

  useEffect(() => {
    const updateProgress = (target) => {
       const maxScroll = target.scrollHeight - target.clientHeight;
       rawProgress.set(maxScroll <= 0 ? 0 : target.scrollTop / maxScroll);
    };

    const handleScroll = (e) => {
       const active = getActiveContainer();
       if (active && (e.target === active || active.contains(e.target))) updateProgress(active);
    };
    
    document.addEventListener('scroll', handleScroll, true);
    const observer = new MutationObserver(() => {
        const active = getActiveContainer();
        if (active) updateProgress(active);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
       document.removeEventListener('scroll', handleScroll, true);
       observer.disconnect();
    };
  }, [rawProgress]);

  useMotionValueEvent(rawProgress, "change", (latest) => {
    setScrollPercentage(Math.round(latest * 100));
  });

  const calculateProgress = (clientY) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const newProgress = Math.min(1, Math.max(0, relativeY / rect.height));
    const active = getActiveContainer();
    if (active) {
        const maxScroll = active.scrollHeight - active.clientHeight;
        active.scrollTo({ top: newProgress * maxScroll, behavior: isDragging ? 'auto' : 'smooth' });
        rawProgress.set(newProgress);
    }
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => calculateProgress(e.clientY || e.touches?.[0].clientY);
    const handleEnd = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging]);

  return (
    <div className="fixed right-6 md:right-12 top-1/2 -translate-y-1/2 z-[100] hidden lg:flex flex-col items-center gap-8 pointer-events-none select-none">
      
      {/* Tactical Mode Toggles - Only visible on Home */}
      {isHome && (
        <div className="flex flex-col items-center gap-1.5 p-1 bg-black/40 backdrop-blur-xl rounded-2xl pointer-events-auto border border-white/10">
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const next = protocolMode === 'rpg' ? 'reality' : 'rpg';
                  setProtocolMode(next);
                  if (next === 'rpg') setViewMode('personal');
                }}
                className={`flex items-center size-10 justify-center transition-all duration-300 rounded-xl relative group/toggle
                    ${protocolMode === 'rpg' 
                        ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                        : 'bg-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                `}
            >
                <Cpu size={14} className={protocolMode === 'rpg' ? 'animate-pulse' : ''} />
                <div className="absolute right-full mr-4 px-3 py-1.5 bg-black border border-white/10 rounded-lg opacity-0 group-hover/toggle:opacity-100 transition-opacity pointer-events-none hidden md:block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap">RPG_MODE</span>
                </div>
            </motion.button>

            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const next = viewMode === 'partner' ? 'personal' : 'partner';
                  setViewMode(next);
                  if (next === 'partner') setProtocolMode('reality');
                }}
                className={`flex items-center size-10 justify-center transition-all duration-300 rounded-xl relative group/toggle
                    ${viewMode === 'partner' 
                        ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                        : 'bg-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                `}
            >
                {viewMode === 'partner' ? <Handshake size={14} /> : <User size={14} />}
                <div className="absolute right-full mr-4 px-3 py-1.5 bg-black border border-white/10 rounded-lg opacity-0 group-hover/toggle:opacity-100 transition-opacity pointer-events-none hidden md:block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap">SYNC_LINK</span>
                </div>
            </motion.button>
        </div>
      )}

      {/* Main Functional Area */}
      <div className="flex flex-col items-center gap-3">
        {/* Header (Status or Percentage) */}
        <div className="flex flex-col items-center gap-1 min-h-[14px]">
          {protocolMode === 'rpg' ? (
            <span className="text-[11px] font-mono font-black uppercase tracking-tighter text-emerald-500">
              {energyCurrent >= energyMax ? "FULL" : <EnergyTimer current={energyCurrent} max={energyMax} lastUpdated={user?.rpg?.energy?.lastUpdated} level={user?.level} />}
            </span>
          ) : (
            <span className="text-[11px] font-mono font-black uppercase tracking-tighter text-white opacity-40">
              {scrollPercentage.toString().padStart(3, '0')}
            </span>
          )}
        </div>

        {/* Vertical Track Area */}
        <div className="relative flex flex-col items-center py-2 h-48 md:h-64 pointer-events-auto">
          {/* Hit Zone (Only for Scroll) */}
          {protocolMode !== 'rpg' && (
            <div 
                ref={trackRef}
                onMouseDown={() => setIsDragging(true)}
                onTouchStart={() => setIsDragging(true)}
                className="absolute inset-y-0 -left-4 -right-4 z-20 cursor-pointer"
            />
          )}

          {/* Vertical Bar */}
          <div className={`relative transition-all duration-500 ${protocolMode === 'rpg' ? 'w-1.5 ring-2 ring-cyan-500/20' : 'w-[1px]'} h-full bg-white/10 overflow-hidden rounded-full`}>
            {protocolMode === 'rpg' ? (
                <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${energyPercentage}%` }}
                    className={`absolute bottom-0 left-0 w-full shadow-[0_0_20px_rgba(6,182,212,0.8)] ${
                        energyCurrent >= energyMax ? "bg-gradient-to-t from-emerald-600 via-emerald-400 to-white" : "bg-gradient-to-t from-cyan-600 via-cyan-400 to-white"
                    }`}
                />
            ) : (
                <motion.div 
                    className="absolute top-0 left-0 w-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                    animate={{ height: `${scrollPercentage}%` }}
                />
            )}

            {/* Segments removed for cleaner side panel aesthetic */}
          </div>

          {/* Scroll Thumb (Reality Only) */}
          {protocolMode !== 'rpg' && (
             <motion.div 
                className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none"
                style={{ top: `calc(${scrollPercentage}% + 8px)`, y: "-50%" }}
             >
                <div className={`size-2 bg-white rounded-full shadow-[0_0_10px_white] transition-transform ${isDragging ? 'scale-150' : ''}`} />
             </motion.div>
          )}

          {/* Bottom Readout (RPG Only) */}
          {protocolMode === 'rpg' && (
            <div className="mt-4 flex flex-col items-center">
                <span className="text-[10px] font-mono font-black text-white/50 tracking-tighter">
                    {Math.floor(energyCurrent)} / {energyMax}
                </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="flex flex-col gap-2 opacity-30">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`size-1 rounded-full ${i === 0 && protocolMode === 'rpg' ? 'bg-cyan-500 shadow-[0_0_10px_cyan]' : 'bg-white/20'}`} />
        ))}
      </div>
    </div>
  );
}
