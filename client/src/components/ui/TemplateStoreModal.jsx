import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ChippedBorder from './ChippedBorder';

// 5 Curated schedule templates matching Produs challenges & seasonal rituals
const CURATED_PROTOCOLS = [
    {
        id: 'deep-work',
        name: '🚀 DEEP WORK SPRINT',
        description: 'Centered around two deep cognitive focus blocks paired with strategic rest intervals and a hard shutdown ritual.',
        accent: 'border-blue-500/20 text-blue-400 bg-blue-950/10',
        badge: 'PRIMARY BLUE',
        activities: [
            { title: 'DEEP WORK BLOCK I', startTime: '09:00', endTime: '11:00' },
            { title: 'COGNITIVE REST & RECHARGE', startTime: '11:00', endTime: '11:30' },
            { title: 'DEEP WORK BLOCK II', startTime: '11:30', endTime: '13:00' },
            { title: 'NUTRITIONAL RESET (LUNCH)', startTime: '13:00', endTime: '14:00' },
            { title: 'COLLABORATIVE FLOW SESSION', startTime: '14:00', endTime: '15:30' },
            { title: 'INBOX ZERO ROUTINE', startTime: '15:30', endTime: '16:30' },
            { title: 'SHUTDOWN PROTOCOL', startTime: '17:00', endTime: '17:30' }
        ]
    },
    {
        id: 'pomodoro-engine',
        name: '⏳ POMODORO MASTER',
        description: 'Maximize daily output via five high-density 50-minute focus periods separated by 10-minute neural resets.',
        accent: 'border-white/20 text-white bg-white/5',
        badge: 'HIGH-CONTRAST',
        activities: [
            { title: 'FOCUS INTERVAL I (TOP GOAL)', startTime: '09:00', endTime: '09:50' },
            { title: 'COGNITIVE RESET', startTime: '09:50', endTime: '10:00' },
            { title: 'FOCUS INTERVAL II (CORE COMPILATION)', startTime: '10:00', endTime: '10:50' },
            { title: 'COGNITIVE RESET', startTime: '10:50', endTime: '11:00' },
            { title: 'FOCUS INTERVAL III (COMMUNICATION)', startTime: '11:00', endTime: '11:50' },
            { title: 'COGNITIVE RESET', startTime: '11:50', endTime: '12:00' },
            { title: 'MID-DAY PAUSE & MEAL', startTime: '12:00', endTime: '13:00' },
            { title: 'FOCUS INTERVAL IV (POLISHING)', startTime: '13:00', endTime: '13:50' },
            { title: 'COGNITIVE RESET', startTime: '13:50', endTime: '14:00' },
            { title: 'FOCUS INTERVAL V (ADMIN & AUDIT)', startTime: '14:00', endTime: '14:50' },
            { title: 'SHUTDOWN SEQUENCE', startTime: '14:50', endTime: '15:00' }
        ]
    },
    {
        id: 'analog-morning',
        name: '🌱 ANALOG MORNING',
        description: 'Enforces screen-free productivity blocks for the first half of the day to protect creative cognitive energy.',
        accent: 'border-amber-500/20 text-amber-400 bg-amber-950/10',
        badge: 'ANALOG FIRST',
        activities: [
            { title: 'NO-SCREEN MORNING RITUAL', startTime: '07:00', endTime: '08:00' },
            { title: 'STRATEGIC PLANNING & STRATEGY', startTime: '08:00', endTime: '08:30' },
            { title: 'CORE CREATIVE PRODUCTION BLOCK', startTime: '08:30', endTime: '10:30' },
            { title: 'ANALOG WALK & OUTDOOR LIGHT', startTime: '10:30', endTime: '11:00' },
            { title: 'HIGH-LEVERAGE COLLABORATION', startTime: '11:00', endTime: '12:30' }
        ]
    },
    {
        id: 'digital-declutter',
        name: '🧹 SPRING DIGITAL DECLUTTER',
        description: 'Aligns with March spring cleaning, focusing on folder reorganization, app audit, and junk decluttering.',
        accent: 'border-emerald-500/20 text-emerald-400 bg-emerald-950/10',
        badge: 'MARCH SPECIAL',
        activities: [
            { title: 'DIGITAL FOLDER REORGANIZATION', startTime: '09:00', endTime: '10:00' },
            { title: 'APP AUDIT & UNUSED REMOVAL', startTime: '10:00', endTime: '11:00' },
            { title: 'INBOX CLEANING & UNSUBSCRIBES', startTime: '11:00', endTime: '12:00' },
            { title: 'REFRESH & PAUSE BLOCK', startTime: '12:00', endTime: '13:00' },
            { title: 'MONITORED WORK ROOM ACTION', startTime: '13:00', endTime: '15:00' }
        ]
    },
    {
        id: 'ultimate-performance',
        name: '🔥 ULTIMATE PERFORMANCE ENGINE',
        description: 'Engineered for optimal peak momentum, matching high-intensity goals, inbox bookkeeping, and live flow rooms.',
        accent: 'border-rose-500/20 text-rose-400 bg-rose-950/10',
        badge: 'MAX FORCE',
        activities: [
            { title: 'TOP 3 GOALS PRIORITY PREP', startTime: '08:00', endTime: '09:00' },
            { title: 'CORE WORK: GOAL TARGET 1', startTime: '09:00', endTime: '11:00' },
            { title: 'COMMUNICATION & LEDGER CLEARING', startTime: '11:00', endTime: '12:00' },
            { title: 'LIVE WORKROOM FLOW INTAKE', startTime: '13:00', endTime: '15:00' },
            { title: 'ADMINISTRATIVE METRIC SYNC', startTime: '16:00', endTime: '17:00' },
            { title: 'TOMORROW RITUAL SHUTDOWN', startTime: '17:00', endTime: '17:30' }
        ]
    }
];

const TemplateStoreModal = ({ isOpen, onClose, onApply }) => {
    const [activeTab, setActiveTab] = useState('curated'); // 'curated' | 'custom'
    const [selectedTemplate, setSelectedTemplate] = useState(CURATED_PROTOCOLS[0]);
    const [customTemplates, setCustomTemplates] = useState([]);
    const [isDeploying, setIsDeploying] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('produs_custom_schedule_templates');
        if (stored) {
            try {
                setCustomTemplates(JSON.parse(stored));
            } catch (e) {
                console.error(e);
            }
        }
    }, [isOpen]);

    const handleApply = async () => {
        if (!selectedTemplate) return;
        setIsDeploying(true);
        await onApply(selectedTemplate.activities);
        setIsDeploying(false);
        onClose();
    };

    const handleDeleteCustom = (id) => {
        const updated = customTemplates.filter(t => t.id !== id);
        setCustomTemplates(updated);
        localStorage.setItem('produs_custom_schedule_templates', JSON.stringify(updated));
        if (selectedTemplate?.id === id) {
            setSelectedTemplate(updated[0] || CURATED_PROTOCOLS[0]);
        }
    };

    if (!isOpen) return null;

    const activeList = activeTab === 'curated' ? CURATED_PROTOCOLS : customTemplates;

    return createPortal(
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/85 backdrop-blur-md"
                        />
                        
                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-10 w-full max-w-4xl bg-white dark:bg-[#080808] p-6 md:p-8 rounded-sm group overflow-hidden border border-black dark:border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] max-h-[90vh] flex flex-col"
                        >
                            <ChippedBorder opacity={0.4} />

                            <div className="relative z-10 flex flex-col h-full overflow-hidden">
                                
                                {/* Header */}
                                <div className="flex justify-between items-center mb-6 shrink-0">
                                    <div className="flex flex-col">
                                        <p className="text-[12px] md:text-[14px] font-black leading-relaxed tracking-[0.25em] text-black dark:text-white uppercase">
                                            SCHEDULE TEMPLATES STORE
                                        </p>
                                        <span className="text-[8px] font-mono uppercase text-black/40 dark:text-white/40 tracking-widest mt-0.5">
                                            SELECT AND DEPLOY HIGH-DENSITY WORKFLOW PROTOCOLS
                                        </span>
                                    </div>
                                    <button onClick={onClose} className="text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-black/10 dark:border-white/10 mb-6 shrink-0">
                                    <button 
                                        onClick={() => {
                                            setActiveTab('curated');
                                            setSelectedTemplate(CURATED_PROTOCOLS[0]);
                                        }}
                                        className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                                            activeTab === 'curated' 
                                                ? 'text-black dark:text-white border-b-2 border-black dark:border-white' 
                                                : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'
                                        }`}
                                    >
                                        CURATED PROTOCOLS
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setActiveTab('custom');
                                            setSelectedTemplate(customTemplates[0] || null);
                                        }}
                                        className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                                            activeTab === 'custom' 
                                                ? 'text-black dark:text-white border-b-2 border-black dark:border-white' 
                                                : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'
                                        }`}
                                    >
                                        MY PROTOCOLS ({customTemplates.length})
                                    </button>
                                </div>

                                {/* Grid Panel */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden min-h-0">
                                    
                                    {/* Left Panel: Templates List */}
                                    <div className="md:col-span-5 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                        {activeList.length > 0 ? (
                                            activeList.map((tpl) => (
                                                <div
                                                    key={tpl.id}
                                                    onClick={() => setSelectedTemplate(tpl)}
                                                    className={`p-4 border rounded-sm cursor-pointer transition-all ${
                                                        selectedTemplate?.id === tpl.id
                                                            ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                                                            : 'border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 bg-black/[0.01] dark:bg-white/[0.005]'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start gap-2">
                                                        <span className="text-[11px] font-black uppercase tracking-wider text-black dark:text-white">
                                                            {tpl.name}
                                                        </span>
                                                        {activeTab === 'custom' && (
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteCustom(tpl.id);
                                                                }}
                                                                className="text-black/40 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 transition-colors shrink-0"
                                                                title="Delete Template"
                                                            >
                                                                <span className="material-symbols-outlined text-[14px]">delete</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-[9px] text-black/50 dark:text-white/40 leading-snug tracking-wide mt-1 line-clamp-2">
                                                        {tpl.description}
                                                    </p>
                                                    <div className="mt-3 flex items-center justify-between">
                                                        <span className="text-[8px] font-mono text-black/30 dark:text-white/30">
                                                            {tpl.activities.length} OPERATIONS
                                                        </span>
                                                        {tpl.badge && (
                                                            <span className="text-[7px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60">
                                                                {tpl.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-black/10 dark:border-white/10 rounded-sm text-center h-[200px]">
                                                <span className="text-[9px] font-mono opacity-35 uppercase tracking-widest">
                                                    NO PROTOCOLS SAVED
                                                </span>
                                                <span className="text-[8px] font-mono opacity-20 uppercase tracking-widest mt-1">
                                                    Use "SAVE AS TEMPLATE" inside schedule panel to archive routines.
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Panel: Template Preview */}
                                    <div className="md:col-span-7 border border-black/10 dark:border-white/10 rounded-sm bg-black/[0.02] dark:bg-white/[0.01] p-5 flex flex-col overflow-hidden">
                                        {selectedTemplate ? (
                                            <>
                                                <div className="mb-4 shrink-0 border-b border-black/5 dark:border-white/5 pb-3">
                                                    <span className="text-[12px] font-black uppercase tracking-widest text-black dark:text-white">
                                                        {selectedTemplate.name}
                                                    </span>
                                                    <p className="text-[10px] text-black/60 dark:text-white/60 leading-normal tracking-wide mt-1.5">
                                                        {selectedTemplate.description}
                                                    </p>
                                                </div>

                                                {/* Timeline preview list */}
                                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 mb-6">
                                                    {selectedTemplate.activities.map((act, i) => (
                                                        <div 
                                                            key={i} 
                                                            className="flex items-center justify-between p-3 border border-black/5 dark:border-white/5 bg-white dark:bg-[#0c0c0c] rounded-sm"
                                                        >
                                                            <span className="text-[10.5px] font-black uppercase tracking-wider text-black dark:text-white truncate max-w-[280px]">
                                                                {act.title}
                                                            </span>
                                                            <span className="text-[9.5px] font-mono font-bold text-black/50 dark:text-white/50 tracking-wider">
                                                                {act.startTime} - {act.endTime}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Apply action button */}
                                                <button
                                                    onClick={handleApply}
                                                    disabled={isDeploying}
                                                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.4em] text-[9.5px] hover:bg-black/90 dark:hover:bg-white/90 transition-all active:scale-[0.98] rounded-sm shrink-0 flex items-center justify-center gap-2 relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-2 h-2 bg-white dark:bg-black rotate-45 translate-x-1 -translate-y-1" />
                                                    {isDeploying ? (
                                                        <>
                                                            <div className="size-2 bg-white dark:bg-black rounded-full animate-ping mr-2" />
                                                            DEPLOYING PROTOCOL...
                                                        </>
                                                    ) : (
                                                        'APPLY TEMPLATE ROUTINE'
                                                    )}
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
                                                <span className="material-symbols-outlined text-4xl mb-2">terminal</span>
                                                <span className="text-[9px] font-mono uppercase tracking-widest">
                                                    SELECT A PROTOCOL FROM LEFT FOR TIMELINE OVERVIEW
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>,
        document.body
    );
};

export default TemplateStoreModal;
