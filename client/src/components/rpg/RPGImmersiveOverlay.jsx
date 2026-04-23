import React, { useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardContext } from '../../context/DashboardContext';
import useAuthStore from '../../store/useAuthStore';

import RPGHomeTab   from './tabs/RPGHomeTab';
import RPGItemsTab  from './tabs/RPGItemsTab';
import RPGSkillsTab from './tabs/RPGSkillsTab';
import RPGTowerTab  from './tabs/RPGTowerTab';
import RPGRoamTab   from './tabs/RPGRoamTab';

const RPGImmersiveOverlay = ({ activeTab, setActiveTab }) => {
    const { protocolMode } = useContext(DashboardContext);
    const { user }         = useAuthStore();

    // Scroll Lock Logic
    useEffect(() => {
        if (protocolMode === 'rpg') {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = 'unset'; };
        }
    }, [protocolMode]);

    if (protocolMode !== 'rpg') return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="relative w-full h-[80vh] md:h-[90vh] mt-2 md:mt-6 bg-black backdrop-blur-3xl rounded-[3rem] overflow-hidden flex items-center justify-center font-mono select-none shadow-2xl border border-white/10"
        >
            {/* 1. Background Layers */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-[0.03] bg-grid bg-[size:40px_40px]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-scanline" />
                <div className="absolute inset-0 bg-radial-vignette opacity-60" />
            </div>

            {/* 2. Dynamic HUD Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.02, y: -10 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 z-20"
                >
                    {activeTab === 'home'   && <RPGHomeTab   user={user} />}
                    {activeTab === 'items'  && <RPGItemsTab  user={user} />}
                    {activeTab === 'skills' && <RPGSkillsTab user={user} />}
                    {activeTab === 'tower'  && <RPGTowerTab  user={user} />}
                    {activeTab === 'roam'   && <RPGRoamTab   user={user} />}
                </motion.div>
            </AnimatePresence>

            {/* Structural corner markers - Home tab only */}
            {activeTab === 'home' && (
                <>
                    <div className="absolute top-8 left-8 size-8 border-t-2 border-l-2 border-white/10 hidden md:block" />
                    <div className="absolute top-8 right-8 size-8 border-t-2 border-r-2 border-white/10 hidden md:block" />
                    <div className="absolute bottom-8 left-8 size-8 border-b-2 border-l-2 border-white/10 hidden md:block" />
                    <div className="absolute bottom-8 right-8 size-8 border-b-2 border-r-2 border-white/10 hidden md:block" />
                </>
            )}
        </motion.div>
    );
};

export default RPGImmersiveOverlay;
