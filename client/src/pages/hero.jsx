import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import RPGImmersiveOverlay from '../components/rpg/RPGImmersiveOverlay';
import AwakeningOverlay from '../components/dashboard/AwakeningOverlay';
import { DashboardContext } from '../context/DashboardContext';

const HeroPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const setNeuralSyncDismissed = useAuthStore((state) => state.setNeuralSyncDismissed);
    const { activeRpgTab, setActiveRpgTab } = useContext(DashboardContext);

    const isUnawakened = !user?.rpg?.path;

    const handleInitiateAwakening = async () => {
        setNeuralSyncDismissed(false);
        navigate('/dashboard/neural-sync');
    };

    return (
        <div className="w-full bg-transparent text-foreground font-sans">
            <AnimatePresence mode="wait">
                {isUnawakened ? (
                    <motion.div
                        key="awakening"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="flex-1 h-full flex items-center justify-center px-4 overflow-hidden py-20"
                    >
                        <AwakeningOverlay
                            onAwaken={handleInitiateAwakening}
                            onBackToReality={() => navigate('/dashboard')}
                            isLoading={false}
                            hasStarted={user?.rpg?.completedAnswers?.length > 0}
                            userId={user?._id}
                        />
                    </motion.div>
                ) : (
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
                )}
            </AnimatePresence>
        </div>
    );
};

export default HeroPage;
