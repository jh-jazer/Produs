import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ARCHETYPE_QUIZ, calculateMasteryRank } from '../../constants/assessment';
import SystemWindow from '../ui/SystemWindow';
import api from '../../services/api';
import { useSWRConfig } from 'swr';
import useAuthStore from '../../store/useAuthStore';
import { Zap, Brain, Sparkles, ChevronRight } from 'lucide-react';

const NeuralSyncModal = ({ isOpen, onClose }) => {
    const { user, syncUser } = useAuthStore();
    const { mutate } = useSWRConfig();
    const [isSyncing, setIsSyncing] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [syncComplete, setSyncComplete] = useState(false);
    const [evolutionData, setEvolutionData] = useState(null);

    const pendingIds = user?.rpg?.pendingQuestions || [];

    useEffect(() => {
        if (pendingIds.length > 0 && !currentQuestion) {
            const nextIdx = pendingIds[0];
            const q = ARCHETYPE_QUIZ.find(item => item.id === nextIdx);
            setCurrentQuestion(q);
        }
    }, [pendingIds, currentQuestion]);

    const handleSync = async (value) => {
        setIsSyncing(true);
        try {
            const { data } = await api.post('/rpg/sync-neural', { 
                questionId: currentQuestion.id, 
                value 
            });
            
            setEvolutionData(data);
            setIsSyncing(false);
            setSyncComplete(true);
            
            // Wait a bit to show the "Success" state before moving to next or closing
            setTimeout(() => {
                if (data.pendingQuestions && data.pendingQuestions.length > 0) {
                    // Prepare next question if any
                    setSyncComplete(false);
                    setCurrentQuestion(null);
                } else {
                    onClose();
                }
                syncUser(data);
                mutate('/auth/me');
            }, 3000);

        } catch (error) {
            console.error('Neural Sync failed:', error);
            setIsSyncing(false);
        }
    };

    if (!isOpen || !currentQuestion) return null;

    return (
        <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 font-outfit">
            <div className="w-full max-w-2xl">
                <SystemWindow 
                    title="NEURAL_SYNC_AUTHORIZED" 
                    subtitle={`LEVEL ${user.level} SYNCHRONIZATION`}
                    status="UPLINK_ACTIVE"
                >
                    <AnimatePresence mode="wait">
                        {!syncComplete ? (
                            <motion.div
                                key="sync-question"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8 p-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]">
                                        <Brain size={24} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-accent uppercase tracking-[0.2em] font-mono mb-1">Incoming Signal</div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            Dimension: {currentQuestion.section}
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-tight uppercase font-exo">
                                    {currentQuestion.question}
                                </h3>

                                <div className="flex flex-col gap-3">
                                    {currentQuestion.options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            disabled={isSyncing}
                                            onClick={() => handleSync(opt.value)}
                                            className="p-5 rounded-[1.5rem] border-2 border-slate-200 dark:border-white/10 hover:border-accent hover:bg-accent/5 flex items-center justify-between group transition-all text-left disabled:opacity-50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="size-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center font-black group-hover:bg-accent group-hover:text-white transition-colors font-mono">
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white uppercase tracking-widest">{opt.text}</span>
                                            </div>
                                            <ChevronRight className="text-slate-300 dark:text-white/10 group-hover:text-accent group-hover:translate-x-1 transition-all" size={16} />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="sync-success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 text-center space-y-6"
                            >
                                <div className="size-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                    <Sparkles size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase font-exo">Sync_Successful</h2>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em] font-mono">NEURAL_MAPPING_STABILIZED</p>
                                </div>

                                {evolutionData?.newRank && (
                                    <div className="px-6 py-4 bg-accent/10 border border-accent/20 rounded-2xl flex flex-col items-center gap-2 max-w-xs mx-auto">
                                        <span className="text-[9px] font-black text-accent uppercase tracking-widest">Promotion Achieved</span>
                                        <span className="text-4xl font-black text-white font-exo italic">RANK {evolutionData.newRank}</span>
                                    </div>
                                )}

                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse">
                                    Initializing next synapse...
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </SystemWindow>
            </div>
        </div>
    );
};

export default NeuralSyncModal;
