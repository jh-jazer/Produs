import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Plus, ArrowRight, Zap, Target, Brain, Award, X, Search } from 'lucide-react';
import api from '../../services/api';
import DashboardPanel from '../ui/DashboardPanel';
import DashboardModal from '../ui/DashboardModal';

const FeaturedGoals = ({ onHabitAdded }) => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joiningId, setJoiningId] = useState(null);
    const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const { data } = await api.get('/challenges');
            setChallenges(data);
        } catch (error) {
            console.error("Failed to fetch featured goals", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (challengeId) => {
        setJoiningId(challengeId);
        try {
            await api.post(`/challenges/${challengeId}/install`);
            
            // Mark as joined locally for immediate feedback
            setChallenges(prev => prev.map(c => 
                c.id === challengeId ? { ...c, isJoined: true } : c
            ));
            
            if (onHabitAdded) onHabitAdded();
            setIsDiscoveryOpen(false); // Close discovery upon successful installation
        } catch (error) {
            console.error("Failed to join challenge", error);
            alert(error.response?.data?.message || "Join failed. Link lost.");
        } finally {
            setJoiningId(null);
        }
    };

    const joinedChallenges = challenges.filter(c => c.isJoined);
    const unjoinedChallenges = challenges.filter(c => !c.isJoined);

    if (loading) return (
        <div className="w-full h-40 flex items-center justify-center">
            <div className="size-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="w-full">
            <DashboardPanel
                title="ACTIVE_CHALLENGES_"
                subtitle="Featured Goals"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                        {/* Display Joined Challenges (Max 2) */}
                        {joinedChallenges.slice(0, 2).map((challenge, index) => (
                            <motion.div
                                key={challenge.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group relative h-40 rounded-[2rem] overflow-hidden bg-white/5 border border-emerald-500/20 p-5 flex flex-col justify-between"
                            >
                                <div className="absolute inset-0 bg-grid-light dark:bg-grid opacity-[0.03] pointer-events-none" />
                                <div className={`absolute -top-10 -right-10 size-24 rounded-full blur-[40px] opacity-10 bg-emerald-500`} />
                                
                                <div className="relative z-10 space-y-2">
                                    <div className="size-8 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
                                       <span className="material-symbols-outlined text-lg">{challenge.icon}</span>
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider font-exo leading-tight">{challenge.name}</h3>
                                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-2">{challenge.description}</p>
                                </div>

                                <div className="flex items-center justify-between relative z-10">
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">ACTIVE_LINK</span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">Progression</span>
                                        <span className="text-[9px] font-black text-white uppercase font-mono italic">{challenge.progress}/{challenge.target}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Plus Slot (Show if < 2 joined) */}
                        {joinedChallenges.length < 2 && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => setIsDiscoveryOpen(true)}
                                className="h-40 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all flex flex-col items-center justify-center gap-3 group relative overflow-hidden"
                            >
                                <div className="size-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-sm">
                                    <Plus className="group-hover:rotate-90 transition-transform duration-500" />
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] group-hover:text-cyan-500 transition-colors">LINK_NEW_PROTOCOL_</p>
                                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest opacity-60">System Capacity Available</p>
                                </div>
                                
                                {/* Decoration */}
                                <div className="absolute -bottom-4 -right-4 size-16 border-2 border-cyan-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 translate-y-4" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </DashboardPanel>

            {/* Discovery Modal */}
            <DashboardModal
                isOpen={isDiscoveryOpen}
                onClose={() => setIsDiscoveryOpen(false)}
                title="SYSTEM_UPGRADE_GALLERY_"
                subtitle="New Potential Protocols"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {unjoinedChallenges.map((challenge, idx) => (
                        <motion.div
                            key={challenge.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-panel p-6 flex items-start gap-6 hover:border-cyan-500/40 transition-all group"
                        >
                            <div className={`size-14 shrink-0 rounded-2xl flex items-center justify-center bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 text-${challenge.color || 'slate'}-500 shadow-sm group-hover:scale-110 transition-transform`}>
                                <span className="material-symbols-outlined text-2xl">{challenge.icon}</span>
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-exo">{challenge.name}</h3>
                                        <span className="text-[8px] font-black text-cyan-500 uppercase font-mono italic">{challenge.category}</span>
                                    </div>
                                    <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">{challenge.description}</p>
                                </div>
                                <button
                                    onClick={() => handleJoin(challenge.id)}
                                    disabled={joiningId === challenge.id}
                                    className="w-full h-10 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-cyan-500 transition-colors shadow-lg shadow-black/20"
                                >
                                    {joiningId === challenge.id ? (
                                        <div className="size-3 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Plus size={12} />
                                            INSTALL_PROTOCOL_
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </DashboardModal>
        </div>
    );
};

export default FeaturedGoals;
