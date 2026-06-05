import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, Zap, Shield, Target, Lock, X, CheckCircle2, Cpu } from 'lucide-react';
import { DashboardContext } from '../../context/DashboardContext';
import useAuthStore from '../../store/useAuthStore';
import ChippedBorder from './ChippedBorder';

const OperationModeModal = ({ isOpen, onClose }) => {
    const { 
        protocolMode, 
        setProtocolMode, 
        viewMode, 
        setViewMode 
    } = useContext(DashboardContext);
    const { user } = useAuthStore();

    if (!user) return null;

    const isIsekaiLocked = !user.rpg?.path && !user.rpg?.pendingQuestions?.length && user.guardianLevel > 0;

    const sections = [
        {
            id: 'protocol',
            title: 'Protocol Sync',
            icon: Cpu,
            options: [
                {
                    id: 'reality',
                    name: 'Productivity',
                    description: 'Focus on missions, habits, and tactical planning.',
                    icon: Target,
                    active: protocolMode === 'reality',
                    locked: false,
                    onClick: () => setProtocolMode('reality')
                },
                {
                    id: 'rpg',
                    name: 'RPG Mode',
                    description: 'Gamified interface with levels, XP, and stats.',
                    icon: Zap,
                    active: protocolMode === 'rpg',
                    locked: isIsekaiLocked,
                    onClick: () => !isIsekaiLocked && setProtocolMode('rpg')
                }
            ]
        },
        {
            id: 'view',
            title: 'Perspective',
            icon: Shield,
            options: [
                {
                    id: 'personal',
                    name: 'Personal',
                    description: 'Manage individual data and private objectives.',
                    icon: User,
                    active: viewMode === 'personal',
                    locked: false,
                    onClick: () => setViewMode('personal')
                },
                {
                    id: 'partner',
                    name: 'Partner',
                    description: 'Shared view with your linked operative.',
                    icon: Users,
                    active: viewMode === 'partner',
                    locked: !user.partner,
                    onClick: () => setViewMode('partner')
                }
            ]
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-lg bg-white dark:bg-[#080808] p-8 md:p-10 rounded-sm overflow-hidden border border-black dark:border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]"
                    >
                        <ChippedBorder opacity={0.3} />
                        
                        {/* Header */}
                        <div className="relative z-10 mb-8 flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-[14px] md:text-[16px] font-black uppercase tracking-[0.4em] text-black dark:text-white leading-none italic">
                                    Operation_Sync
                                </h3>
                                <p className="text-[9px] font-mono uppercase tracking-widest text-black/40 dark:text-white/40">
                                    Configure System Parameters
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-8 flex items-center justify-center rounded-sm bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-all active:scale-90"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 space-y-10">
                            {sections.map(section => (
                                <div key={section.id} className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full opacity-40" />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 dark:text-white/40 leading-none">
                                            {section.title}
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {section.options.map(option => (
                                            <button
                                                key={option.id}
                                                onClick={option.onClick}
                                                disabled={option.locked}
                                                className={`group relative p-5 rounded-sm border transition-all duration-300 text-left flex flex-col gap-3 overflow-hidden
                                                    ${option.active 
                                                        ? 'bg-black dark:bg-white border-black dark:border-white shadow-xl shadow-black/10 dark:shadow-white/5' 
                                                        : option.locked
                                                            ? 'bg-black/5 dark:bg-white/[0.02] border-black/5 dark:border-white/5 opacity-30 cursor-not-allowed'
                                                            : 'bg-transparent border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white/40'}`}
                                            >
                                                {/* Active Indicator Bar */}
                                                {option.active && (
                                                    <div className="absolute top-0 right-0 w-8 h-8 bg-white dark:bg-black rotate-45 translate-x-4 -translate-y-4" />
                                                )}

                                                <div className={`flex items-center justify-between transition-colors
                                                    ${option.active ? 'text-white dark:text-black' : 'text-black dark:text-white'}`}>
                                                    <div className={`size-8 rounded-sm flex items-center justify-center border transition-all
                                                        ${option.active 
                                                            ? 'bg-white/10 border-white/20 dark:bg-black/10 dark:border-black/20' 
                                                            : 'bg-black/5 border-black/10 dark:bg-white/5 dark:border-white/10 group-hover:scale-110'}`}
                                                    >
                                                        {option.locked ? <Lock size={14} /> : <option.icon size={16} />}
                                                    </div>
                                                    {option.active && <CheckCircle2 size={12} />}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <span className={`text-[11px] font-black tracking-[0.2em] uppercase italic transition-colors block
                                                        ${option.active ? 'text-white dark:text-black' : 'text-black dark:text-white'}`}>
                                                        {option.name}
                                                    </span>
                                                    <p className={`text-[8px] font-bold leading-relaxed uppercase tracking-wider transition-colors
                                                        ${option.active ? 'text-white/60 dark:text-black/60' : 'text-black/40 dark:text-white/40'}`}>
                                                        {option.description}
                                                    </p>
                                                </div>

                                                {option.locked && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
                                                        <Lock size={12} className="text-black/40 dark:text-white/40" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Actions */}
                        <div className="relative z-10 mt-12 flex flex-col gap-4">
                            <button
                                onClick={onClose}
                                className="w-full py-5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.5em] hover:opacity-90 active:scale-[0.98] transition-all shadow-2xl relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-white dark:bg-black rotate-45 translate-x-1.5 -translate-y-1.5" />
                                SYNC_PARAMETERS
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 text-[9px] font-black uppercase tracking-[0.4em] text-black/20 dark:text-white/20 hover:text-black dark:hover:text-white transition-all"
                            >
                                ABORT_OPERATION
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OperationModeModal;
