import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useMobile from '../hooks/useMobile';
import { QRCodeSVG } from 'qrcode.react';

// Components
import RPGImmersiveOverlay from '../components/rpg/RPGImmersiveOverlay';
import AwakeningOverlay from '../components/dashboard/AwakeningOverlay';
import HabitChecklistHUD from '../components/dashboard/HabitChecklistHUD';
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';

const ChippedBorder = ({ opacity = 0.8 }) => (
  <div 
    className="absolute inset-[-2px] rounded-sm pointer-events-none z-0"
    style={{
      border: '4px solid currentColor',
      opacity,
      clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
    }}
  />
);

const MobileLogoText = ({ show, onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: show ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-10 left-6 z-[100] md:hidden ${show ? 'pointer-events-auto' : 'pointer-events-none'}`}
            onClick={onClick}
        >
            <div className="relative">
                <h1 className="text-[14px] font-black uppercase tracking-[0.8em] text-black dark:text-white font-sans">
                    PRODUS
                </h1>
            </div>
        </motion.div>
    );
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const setNeuralSyncDismissed = useAuthStore((state) => state.setNeuralSyncDismissed);
  const { 
    protocolMode, 
    setProtocolMode,
    activeRpgTab,
    setActiveRpgTab,
    setIsLandingModalOpen
  } = useOutletContext();
  
  const isMobile = useMobile();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  // Scroll tracking for the HUD indicator (Global Page Level)
  useEffect(() => {
    const container = document.querySelector('.custom-scrollbar');
    if (!container) return;
    const handleScroll = () => {
      setIsAtTop(container.scrollTop < 10);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user && user.username) {
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleInitiateAwakening = async () => {
    setNeuralSyncDismissed(false);
    navigate('/dashboard/neural-sync');
  };

  const generateCodenameHash = (str) => {
    if (!str) return 'UNKNOWN';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).toUpperCase().slice(0, 8);
  };

  const codenameHash = generateCodenameHash(user?.username || user?.name || 'OPERATIVE');

  useEffect(() => {
    if (isFlipped) {
      const timer = setTimeout(() => {
        setIsFlipped(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [isFlipped]);

  const isUnawakened = !user?.rpg?.path;
  const isLevel0Active = isUnawakened && protocolMode === 'rpg';

  return (
    <div className="w-full bg-transparent text-foreground font-sans">
      <AnimatePresence mode="wait">
        {isLevel0Active && !isInitializing ? (
          <motion.div
            key="awakening"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 h-full flex items-center justify-center px-4 overflow-hidden py-20"
          >
            <AwakeningOverlay 
              onAwaken={handleInitiateAwakening} 
              onBackToReality={() => setProtocolMode('reality')}
              isLoading={false}
              hasStarted={user?.rpg?.completedAnswers?.length > 0}
            />
          </motion.div>
        ) : protocolMode === 'rpg' && !isInitializing ? (
          <motion.div
            key="rpg-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <RPGImmersiveOverlay 
              user={user} 
              activeTab={activeRpgTab} 
              setActiveTab={setActiveRpgTab} 
            />
          </motion.div>
        ) : isInitializing ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8 pt-0 md:p-12"
          >
            <WorkspaceSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="reality"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 pt-0 md:p-12"
          >
            {isMobile && <MobileLogoText show={isAtTop} onClick={() => setIsLandingModalOpen(true)} />}
            {/* Reality Dashboard Layout */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full mb-[15vh] md:mb-32">
              
              {/* Column 1-2: Integrated Swinging ID Assembly */}
              <div className="md:col-span-2 relative h-[75vh] md:h-16 flex flex-col items-center mb-[12vh] md:mb-0">
                <div className="absolute inset-0 flex flex-col items-center">
                  <motion.div style={{ transformOrigin: "top center" }} className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
                    <div className="w-4 h-1 bg-white z-[60] shadow-[0_0_15px_rgba(255,255,255,0.5)] shrink-0" />
                    <div className="w-[12px] h-[15vh] md:h-5 bg-white opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.1)] shrink-0 z-50" />
                    <div className="relative -mt-4 perspective-[1000px] cursor-pointer pointer-events-auto" onClick={() => setIsFlipped(!isFlipped)}>
                      <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} style={{ transformStyle: "preserve-3d", originY: 0 }} className="relative w-[75vw] md:w-[286px] min-h-[60vh] md:min-h-[446px]">
                        {/* FRONT FACE */}
                        <div className="absolute inset-0 bg-[#121212] text-white p-8 rounded-sm shadow-[0_30px_80px_rgba(0,0,0,1)] flex flex-col justify-between items-center text-center overflow-hidden" style={{ backfaceVisibility: "hidden" }}>
                          <ChippedBorder opacity={1} />
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 size-8 bg-[#000000] rounded-full border-[7px] border-[#121212] z-20 flex items-center justify-center">
                             <div className="absolute inset-[-1px] rounded-full border-[0.5px] border-white/30" style={{ clipPath: 'polygon(0% 0%, 25% 5%, 50% 0%, 75% 5%, 100% 0%, 95% 25%, 100% 50%, 95% 75%, 100% 100%, 75% 95%, 50% 100%, 25% 95%, 0% 100%, 5% 75%, 0% 50%, 5% 25%)' }} />
                          </div>
                          <div className="flex flex-col gap-6 w-full items-center mt-4">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{user?.username?.split('#')[0].toUpperCase() || 'OPERATIVE'}_ID</span>
                              <span className="text-sm font-black tracking-tighter uppercase opacity-80">OP_HASH_{codenameHash}</span>
                            </div>
                            <div className="h-[1px] bg-white/10 w-full" />
                            <div className="flex flex-col items-center gap-6">
                              <div className="size-32 bg-black rounded-sm overflow-hidden border border-white/10 shrink-0 relative">
                                <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center"><span className="material-symbols-outlined text-white/10 text-6xl">person</span></div>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-1/2 w-full top-0 animate-scanline" />
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">AUTHORIZED</span>
                                <span className="text-xs font-bold uppercase tracking-tight">{user?.rpg?.archetype?.name || 'UNAWAKENED'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* BACK FACE */}
                        <div className="absolute inset-0 bg-[#0f0f0f] text-white p-8 rounded-sm shadow-[0_30px_80px_rgba(0,0,0,1)] flex flex-col justify-between items-center text-center overflow-hidden" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                          <ChippedBorder opacity={1} />
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 size-8 bg-[#000000] rounded-full border-[7px] border-[#0f0f0f] z-20 flex items-center justify-center">
                             <div className="absolute inset-[-1px] rounded-full border-[0.5px] border-white/20" style={{ clipPath: 'polygon(0% 0%, 25% 5%, 50% 0%, 75% 5%, 100% 0%, 95% 25%, 100% 50%, 95% 75%, 100% 100%, 75% 95%, 50% 100%, 25% 95%, 0% 100%, 5% 75%, 0% 50%, 5% 25%)' }} />
                          </div>
                          <div className="flex flex-col gap-8 w-full items-center mt-10">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">System Metadata</span>
                              <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Global_Unique_Identifier</span>
                            </div>
                            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-sm relative">
                              <QRCodeSVG value={user?._id || 'PRODUS_OPERATIVE'} size={140} bgColor={"transparent"} fgColor={"rgba(255, 255, 255, 0.8)"} level={"L"} />
                            </div>
                            <div className="flex flex-col items-center gap-2 w-full">
                              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10">Full Access Key</span>
                              <div className="w-full bg-white/[0.02] border border-white/5 p-3 rounded-sm font-mono text-[9px] break-all leading-relaxed opacity-60">{user?._id || 'SESSION_DATA_NOT_FOUND'}</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    <motion.div animate={{ opacity: isAtTop ? [0, 0.6, 0.3, 0.8, 0] : 0, y: isAtTop ? [0, 5, 0] : 0 }} transition={{ opacity: { duration: 3, repeat: Infinity, ease: "linear" }, y: { duration: 2, repeat: Infinity, ease: "easeInOut" } }} className="absolute -bottom-[35px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
                      <span className="text-[9px] font-black uppercase tracking-[0.5em] whitespace-nowrap">Scroll Down</span>
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Habit Checklist HUD Component */}
              <HabitChecklistHUD />
            </div>

            {/* Bottom Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-[1400px]">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-8 group relative bg-foreground/[0.03] rounded-sm p-8 overflow-hidden hover:bg-foreground/[0.05] transition-all">
                <ChippedBorder opacity={0.7} />
                <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-8 text-foreground/40">Vitality // SYNCHRONIZATION</h3>
                <div className="flex flex-col md:flex-row gap-12 items-end justify-between">
                  <div className="flex flex-col gap-4"><span className="text-6xl font-black tracking-tighter">98.4%</span><p className="text-white/40 text-xs font-light tracking-wide max-w-[200px]">Optimal cognitive state detected.</p></div>
                  <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '98%' }} className="h-full bg-white" /></div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="md:col-span-4 bg-foreground/5 rounded-sm p-8 flex flex-col justify-between hover:border-foreground/30 transition-all cursor-pointer group relative">
                <ChippedBorder opacity={0.7} />
                <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-6 text-foreground/40">Strategy // CURRENT</h3>
                <ul className="flex flex-col gap-4">
                  {['Finalize HUD Architecture', 'Neural Loop Integration'].map((t, i) => (
                    <li key={i} className="flex items-center gap-3"><div className="size-1.5 bg-white rounded-full" /><span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{t}</span></li>
                  ))}
                </ul>
                <div className="mt-12 flex justify-between items-center group-hover:translate-x-1 transition-transform">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">Open Strategic Node</span>
                  <span className="material-symbols-outlined text-sm">east</span>
                </div>
              </motion.div>
              <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                {[{ l: 'Capital', v: '$12,450.00' }, { l: 'Energy', v: '450kJ' }, { l: 'Focus', v: '4.8h' }].map((s, i) => (
                  <div key={i} className="bg-foreground/[0.02] rounded-sm p-6 flex flex-col gap-2 hover:bg-foreground/[0.04] transition-all relative">
                    <ChippedBorder opacity={0.5} /><span className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30">{s.l}</span><span className="text-2xl font-black tracking-tight">{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
