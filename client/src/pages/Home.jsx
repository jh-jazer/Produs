import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useRef } from 'react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import useMobile from '../hooks/useMobile';
import { QRCodeSVG } from 'qrcode.react';

// Components
import RPGImmersiveOverlay from '../components/rpg/RPGImmersiveOverlay';
import AwakeningOverlay from '../components/dashboard/AwakeningOverlay';
import PriorityHUD from '../components/dashboard/PriorityHUD';
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';
import Avatar from '../components/ui/Avatar';

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
        <h1 className="wordmark text-black dark:text-white">
          PRODUS
        </h1>
      </div>
    </motion.div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const { user, updateSettings } = useAuthStore();
  const setNeuralSyncDismissed = useAuthStore((state) => state.setNeuralSyncDismissed);
  const {
    protocolMode,
    setProtocolMode,
    activeRpgTab,
    setActiveRpgTab,
    setIsLandingModalOpen,
    setIsConnectionsModalOpen,
    setIsSearchModalOpen,
    setIsIdentityEditModalOpen,
    setIsQrModalOpen
  } = useOutletContext();

  const isMobile = useMobile();
  const fileInputRef = useRef(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isIdMenuOpen, setIsIdMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username?.split('#')[0] || '',
    bio: user?.bio || '',
    avatar: user?.avatar || {}
  });

  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username?.split('#')[0] || '',
        bio: user.bio || '',
        avatar: user.avatar || {}
      });
    }
  }, [user]);

  const handleSaveInline = async () => {
    try {
      await updateSettings({
        username: editData.username,
        bio: editData.bio,
        avatar: editData.avatar
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to sync identity", error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/auth/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditData(prev => ({ ...prev, avatar: data.url }));
    } catch (error) {
      console.error("Image upload failed", error);
    }
  };

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
              <div className="md:col-span-2 relative min-h-[90dvh] md:min-h-[unset] h-auto md:h-16 flex flex-col items-center justify-center mb-0 snap-start snap-always">
                <div className="absolute inset-0 flex flex-col items-center">
                  <motion.div style={{ transformOrigin: "top center" }} className="absolute top-0 md:mt-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
                    <div className="w-4 h-1 bg-white z-[60] shadow-[0_0_15px_rgba(255,255,255,0.5)] shrink-0" />
                    <div className="w-[12px] h-[15vh] md:h-5 bg-white opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.1)] shrink-0 z-50" />
                    <div className="relative -mt-4 perspective-[1000px] cursor-pointer pointer-events-auto" onClick={() => setIsFlipped(!isFlipped)}>
                      <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} style={{ transformStyle: "preserve-3d", originY: 0 }} className="relative w-[82vw] md:w-[286px] min-h-[70vh] md:min-h-[446px]">
                        {/* FRONT FACE */}
                        <div className="absolute inset-0 bg-gray-300 dark:bg-[#121212] text-black dark:text-white p-8 rounded-sm flex flex-col justify-between items-center text-center overflow-hidden" style={{ backfaceVisibility: "hidden" }}>
                          <ChippedBorder opacity={1} />
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 size-8 bg-black/10 dark:bg-[#000000] rounded-full border-[7px] border-white dark:border-[#121212] z-20 flex items-center justify-center">
                            <div className="absolute inset-[-1px] rounded-full border-[0.5px] border-black/30 dark:border-white/30" style={{ clipPath: 'polygon(0% 0%, 25% 5%, 50% 0%, 75% 5%, 100% 0%, 95% 25%, 100% 50%, 95% 75%, 100% 100%, 75% 95%, 50% 100%, 25% 95%, 0% 100%, 5% 75%, 0% 50%, 5% 25%)' }} />
                          </div>
                          <div className="flex flex-col gap-6 w-full items-center mt-4">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 dark:text-white/20">{(user?.rpg?.archetype?.name && user.rpg.archetype.name !== 'None' ? user.rpg.archetype.name.toUpperCase() : 'ROOKIE')}_ID</span>
                              <span className="text-sm font-black tracking-tighter uppercase opacity-80">OP_HASH_{codenameHash}</span>
                            </div>
                            <div className="h-[1px] bg-black/10 dark:bg-white/10 w-full" />
                            <div className="flex flex-col items-center gap-6">
                              <div
                                onClick={(e) => {
                                  if (isEditing) {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                  }
                                }}
                                className={`size-48 md:size-44 bg-black/5 dark:bg-black rounded-sm overflow-hidden border border-black/10 dark:border-white/10 shrink-0 relative transition-all ${isEditing ? 'ring-2 ring-primary cursor-pointer' : ''}`}
                              >
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  accept="image/*"
                                />
                                <div className="w-full h-full bg-white p-2 pb-6 shadow-xl relative">
                                  {/* Level Badge - Absolute Corner Overlay */}
                                  <div className="absolute top-0 left-0 px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black text-[9px] font-black uppercase tracking-widest z-30 shadow-lg">
                                    LVL_{user?.rpg?.level || 1}
                                  </div>
                                  <div className="size-full bg-black/5 overflow-hidden flex items-center justify-center relative">
                                    <Avatar config={editData.avatar} className="size-full" />
                                    {/* EXP Bar - Anchored to bottom of image */}
                                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/10 dark:bg-white/5 z-40 overflow-hidden border-t border-black/5 dark:border-white/5">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (user?.rpg?.exp || 0) / 10)}%` }}
                                        className="h-full bg-black dark:bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                                      />
                                    </div>
                                    {/* Texture Overlay */}
                                    <div className="absolute inset-0 bg-black/5 pointer-events-none mix-blend-overlay" />
                                  </div>
                                  <div className="absolute bottom-1.5 left-0 right-0 text-center">
                                    <span className="text-[6px] font-black opacity-20 uppercase tracking-widest font-mono">ID_VERIFIED</span>
                                  </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 dark:via-white/5 to-transparent h-1/2 w-full top-0 animate-scanline" />
                                {isEditing && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-white text-xl">upload</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-center gap-1 w-full px-4">
                                {isEditing ? (
                                  <div className="flex flex-col items-center gap-2 w-full">
                                    <div className="relative w-full">
                                      <input
                                        type="text"
                                        value={editData.username}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') }))}
                                        className="w-full bg-black/10 dark:bg-white/10 border-b border-primary/50 text-[10px] font-black text-center uppercase tracking-[0.3em] outline-none py-1"
                                        maxLength={8}
                                        autoFocus
                                      />
                                      <span className="absolute right-0 bottom-1 text-[8px] opacity-20 font-mono">#{user?.username?.split('#')[1]}</span>
                                    </div>
                                    <textarea
                                      value={editData.bio}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                                      className="w-full bg-black/10 dark:bg-white/10 border-b border-primary/50 text-[9px] font-mono italic text-center tracking-tight outline-none py-1 min-h-[40px] resize-none"
                                      maxLength={160}
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 dark:text-white/40">{user?.username?.split('#')[0].toUpperCase() || 'OPERATIVE'}</span>
                                    <span className="text-[9px] font-mono italic opacity-60 tracking-tight max-w-[200px] leading-tight">
                                      "{user?.bio || 'System_Access_Granted'}"
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* ID Action Menu (Kinetic Transformation) */}
                            <div className="absolute bottom-6 right-6 z-40 flex items-center gap-3">
                              {isEditing ? (
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}
                                    className="p-1 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-all hover:scale-125"
                                    title="ABORT_CHANGES"
                                  >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                  </button>
                                  <div className="w-[1px] h-3 bg-black/10 dark:bg-white/10" />
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleSaveInline(); }}
                                    className="p-1 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-all hover:scale-125"
                                    title="SYNC_CHANGES"
                                  >
                                    <span className="material-symbols-outlined text-sm">check</span>
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <AnimatePresence>
                                    {isIdMenuOpen && (
                                      <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex items-center gap-2 pr-2 border-r border-black/10 dark:border-white/10"
                                      >
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setIsIdMenuOpen(false); setIsEditing(true); }}
                                          className="p-1 transition-colors"
                                          title="EDIT_ID"
                                        >
                                          <span className="material-symbols-outlined text-[16px] text-black dark:text-white opacity-40 hover:opacity-100">edit</span>
                                        </button>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setIsIdMenuOpen(false); setIsSearchModalOpen(true); }}
                                          className="p-1 transition-colors"
                                          title="SEARCH_ID"
                                        >
                                          <span className="material-symbols-outlined text-[16px] text-black dark:text-white opacity-40 hover:opacity-100">search</span>
                                        </button>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setIsIdMenuOpen(false); setIsQrModalOpen(true); }}
                                          className="p-1 transition-colors"
                                          title="SCAN_ID"
                                        >
                                          <span className="material-symbols-outlined text-[16px] text-black dark:text-white opacity-40 hover:opacity-100">qr_code_scanner</span>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setIsIdMenuOpen(false);
                                            setIsConnectionsModalOpen(true);
                                          }}
                                          className="p-1 transition-colors"
                                          title="NETWORK_ID"
                                        >
                                          <span className="material-symbols-outlined text-[16px] text-black dark:text-white opacity-40 hover:opacity-100">group</span>
                                        </button>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsIdMenuOpen(!isIdMenuOpen);
                                    }}
                                    className={`p-2 transition-all group/menu`}
                                  >
                                    <motion.span
                                      animate={{ rotate: isIdMenuOpen ? -90 : 0 }}
                                      className={`material-symbols-outlined text-sm transition-opacity ${isIdMenuOpen ? 'text-black dark:text-white' : 'text-black dark:text-white opacity-40 dark:opacity-20 group-hover/menu:opacity-100'}`}
                                    >
                                      more_vert
                                    </motion.span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* BACK FACE */}
                        <div className="absolute inset-0 bg-gray-300 dark:bg-[#0f0f0f] text-black dark:text-white p-8 rounded-sm flex flex-col justify-between items-center text-center overflow-hidden" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                          <ChippedBorder opacity={1} />
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 size-8 bg-black/10 dark:bg-[#000000] rounded-full border-[7px] border-white dark:border-[#0f0f0f] z-20 flex items-center justify-center">
                            <div className="absolute inset-[-1px] rounded-full border-[0.5px] border-black/20 dark:border-white/20" style={{ clipPath: 'polygon(0% 0%, 25% 5%, 50% 0%, 75% 5%, 100% 0%, 95% 25%, 100% 50%, 95% 75%, 100% 100%, 75% 95%, 50% 100%, 25% 95%, 0% 100%, 5% 75%, 0% 50%, 5% 25%)' }} />
                          </div>
                          <div className="flex flex-col gap-8 w-full items-center mt-10">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 dark:text-white/20">System Metadata</span>
                              <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Global_Unique_Identifier</span>
                            </div>
                            <div className="p-5 md:p-4 bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-sm relative">
                              <QRCodeSVG value={user?._id || 'PRODUS_OPERATIVE'} size={160} md:size={140} bgColor={"transparent"} fgColor={document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'} level={"L"} />
                            </div>
                            <div className="flex flex-col items-center gap-2 w-full">
                              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black/10 dark:text-white/10">Full Access Key</span>
                              <div className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-3 rounded-sm font-mono text-[9px] break-all leading-relaxed opacity-60">{user?._id || 'SESSION_DATA_NOT_FOUND'}</div>
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

              {/* Priority HUD Component + Metrics Grid */}
              <div className="snap-start snap-always md:col-span-3 flex flex-col gap-8 py-10">
                <PriorityHUD />
                
                {/* Metrics Overlay - Now anchored to the first fold */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[{ l: 'Capital', v: '$12,450.00' }, { l: 'Energy', v: '450kJ' }, { l: 'Focus', v: '4.8h' }].map((s, i) => (
                    <div key={i} className="bg-foreground/[0.02] rounded-sm p-6 flex flex-col gap-2 hover:bg-foreground/[0.04] transition-all relative">
                      <ChippedBorder opacity={0.5} />
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30">{s.l}</span>
                      <span className="text-base font-black tracking-tight">{s.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Grid Layout - Remaining Sections */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-[1400px] snap-start snap-always min-h-[90dvh] flex flex-col justify-center py-20">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-8 group relative bg-foreground/[0.03] rounded-sm p-8 overflow-hidden hover:bg-foreground/[0.05] transition-all">
                <ChippedBorder opacity={0.7} />
                <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-8 text-foreground/40">Vitality // SYNCHRONIZATION</h3>
                <div className="flex flex-col md:flex-row gap-12 items-end justify-between">
                  <div className="flex flex-col gap-4"><span className="text-3xl font-black tracking-tighter">98.4%</span><p className="text-foreground/40 text-xs font-light tracking-wide max-w-[200px]">Optimal cognitive state detected.</p></div>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
