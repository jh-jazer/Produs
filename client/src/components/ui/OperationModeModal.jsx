import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, Zap, Shield, Target, Lock, X, CheckCircle2, Cpu } from 'lucide-react';
import { DashboardContext } from '../../context/DashboardContext';
import useAuthStore from '../../store/useAuthStore';

const OperationModeModal = ({ isOpen, onClose }) => {
    const { 
        protocolMode, 
        setProtocolMode, 
        viewMode, 
        setViewMode 
    } = useContext(DashboardContext);
    const { user } = useAuthStore();

    if (!user) return null;

    const isIsekaiLocked = !user.rpg?.path && !user.rpg?.pendingQuestions?.length && user.level > 0;
    const isPartnerLocked = !user.partner;

    const sections = [
        {
            id: 'protocol',
            title: 'Dashboard Mode',
            icon: Cpu,
            options: [
                {
                    id: 'reality',
                    name: 'Productivity',
                    description: 'Focus on tasks, habits, and planning.',
                    icon: Target,
                    active: protocolMode === 'reality',
                    locked: false,
                    onClick: () => setProtocolMode('reality')
                },
                {
                    id: 'rpg',
                    name: 'RPG Mode',
                    description: 'Gamified view with levels, XP, and stats.',
                    icon: Zap,
                    active: protocolMode === 'rpg',
                    locked: isIsekaiLocked,
                    onClick: () => !isIsekaiLocked && setProtocolMode('rpg')
                }
            ]
        },
        {
            id: 'view',
            title: 'View Perspective',
            icon: Shield,
            options: [
                {
                    id: 'personal',
                    name: 'Personal',
                    description: 'Manage your individual data and missions.',
                    icon: User,
                    active: viewMode === 'personal',
                    locked: false,
                    onClick: () => setViewMode('personal')
                },
                {
                    id: 'partner',
                    name: 'Partner',
                    description: 'Shared view with your connected partner.',
                    icon: Users,
                    active: viewMode === 'partner',
                    locked: false,
                    onClick: () => setViewMode('partner')
                }
            ]
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-[#0a0a0a] rounded-[2rem] md:rounded-[2.5rem] border border-black/10 dark:border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 md:p-8 border-b border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02] shrink-0">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Cpu size={20} className="md:size-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter italic font-exo text-slate-900 dark:text-white leading-none">Mode Settings</h3>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-9 md:size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <X size={18} className="md:size-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8 space-y-8 md:space-y-10 overflow-y-auto custom-scrollbar">
                            {sections.map(section => (
                                <div key={section.id} className="space-y-4">
                                    <div className="flex items-center gap-3 px-1 md:px-2">
                                        <section.icon size={14} className="text-primary" />
                                        <div className="flex flex-col">
                                            <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white leading-none">
                                                {section.title}
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                        {section.options.map(option => (
                                            <button
                                                key={option.id}
                                                onClick={option.onClick}
                                                disabled={option.locked}
                                                className={`group relative p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border transition-all duration-300 text-left flex items-start gap-3 md:gap-4
                                                    ${option.active 
                                                        ? 'bg-primary/5 border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]' 
                                                        : option.locked
                                                            ? 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 opacity-40 cursor-not-allowed'
                                                            : 'bg-white dark:bg-white/[0.03] border-slate-100 dark:border-white/10 hover:border-primary/50'}`}
                                            >
                                                <div className={`size-10 md:size-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500
                                                    ${option.active 
                                                        ? 'bg-primary text-white shadow-lg' 
                                                        : 'bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-white/10 group-hover:text-primary'}`}
                                                >
                                                    {option.locked ? <Lock size={18} /> : <option.icon size={20} />}
                                                </div>

                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-xs md:text-[13px] font-black tracking-widest font-exo italic transition-colors
                                                            ${option.active ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                                                            {option.name}
                                                        </span>
                                                        {option.active && <CheckCircle2 size={12} className="text-primary md:size-3.5" />}
                                                    </div>
                                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-wide">
                                                        {option.description}
                                                    </p>
                                                </div>

                                                {option.locked && (
                                                    <div className="absolute top-3 md:top-4 right-5 md:right-6 uppercase text-[7px] md:text-[8px] font-black tracking-widest text-slate-400 flex items-center gap-1.5">
                                                        <Lock size={7} className="md:size-2" /> Restricted
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-6 md:p-8 pt-0 flex shrink-0">
                            <button
                                onClick={onClose}
                                className="w-full md:w-auto md:ml-auto px-10 py-3.5 md:py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] hover:opacity-90 active:scale-95 transition-all shadow-lg"
                            >
                                Confirm Settings
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OperationModeModal;
