import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Play } from 'lucide-react';
import useMobile from '../../hooks/useMobile';
import useAuthStore from '../../store/useAuthStore';
import useLoadingStore from '../../store/useLoadingStore';
import { useNavigate } from 'react-router-dom';

const LandingHeader = ({ activeTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMobile();
  const { user } = useAuthStore();
  const { startLoading } = useLoadingStore();
  const navigate = useNavigate();

  const landingTabs = [
    { id: "hub", label: "HUB", icon: "home", path: "/" },
    { id: "about", label: "ABOUT", icon: "info", path: "/manual" },
    { id: "classes", label: "CLASSES", icon: "school", path: "/classes" },
    { id: "patches", label: "PATCHES", icon: "history", path: "/updates" }
  ];

  const handleTabClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleStart = () => {
    startLoading();
    setTimeout(() => {
      navigate(user ? "/dashboard" : "/auth");
    }, 1000); 
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 w-full z-[100] px-6 md:px-12 py-8 md:py-12 flex justify-between items-center pointer-events-none"
      >
        <div className="flex items-center gap-2 md:gap-4 group cursor-pointer pointer-events-auto">
          {isMobile && (
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
            >
              <Menu size={20} />
            </button>
          )}
          <span className="font-black text-[14px] uppercase tracking-[0.8em] leading-none text-white">Produs</span>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl md:hidden flex flex-col p-8 pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="font-black text-[14px] uppercase tracking-[0.8em] text-white">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white/60">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col gap-6">
              {landingTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.path)}
                  className={`flex items-center gap-6 p-4 rounded-xl border transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white text-black border-white' 
                      : 'bg-white/5 text-white/60 border-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                  <span className="font-black text-sm uppercase tracking-[0.3em]">{tab.label}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-auto pt-12 border-t border-white/10">
              <button 
                onClick={handleStart}
                className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.4em] rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-3"
              >
                <Play size={20} fill="currentColor" />
                Play
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingHeader;
