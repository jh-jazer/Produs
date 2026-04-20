import React, { useState } from 'react';
import { Box, ChevronDown, ChevronUp } from 'lucide-react';

const LOGS = [
    { color: 'text-white/90',   prefix: 'text-emerald-500', tag: '[SYS]', msg: 'Warning: Bio-signature unstable. Energy levels dropping. Suggest returning to base.' },
    { color: 'text-emerald-400', prefix: 'text-emerald-500', tag: '[SYS]', msg: 'Cyber-Hound sniffing out sector 7 path markers... Status: clear.' },
    { color: 'text-white/90',   prefix: 'text-cyan-500',    tag: '[SYS]', msg: 'Sentinel drone engaging hostile anomaly at Sector 4... Target vaporized.' },
    { color: 'text-amber-400',  prefix: 'text-amber-500',   tag: '[SYS]', msg: 'Unidentified artifact located. Proceed with caution. Generating recovery logs.' },
    { color: 'text-white/40',   prefix: 'text-slate-600',   tag: '[SYS]', msg: 'Sector 6 sweep completed. No entities found. Deep space scans normalized.' },
    { color: 'text-pink-400',   prefix: 'text-pink-500',    tag: '[SYS]', msg: 'Memory fragment acquired. Integrating into cerebral database.' },
    { color: 'text-white/40',   prefix: 'text-slate-600',   tag: '[SYS]', msg: 'Comm-link re-established. Signal strength 84%.' },
    { color: 'text-amber-400',  prefix: 'text-amber-500',   tag: '[SYS]', msg: 'Local anomaly shifting. Gravity distortion detected nearby.' },
    { color: 'text-white/90',   prefix: 'text-cyan-500',    tag: '[SYS]', msg: 'Automated sub-routine execution success. Shield re-calibrated.' },
    { color: 'text-emerald-400', prefix: 'text-emerald-500', tag: '[SYS]', msg: 'Vitals nominal. System integrity at 100%.' },
    { color: 'text-white/40',   prefix: 'text-slate-600',   tag: '[SYS]', msg: 'Background process: Defragmentation complete. System ready.' },
    { color: 'text-white/40',   prefix: 'text-slate-600',   tag: '[SYS]', msg: 'Initializing deep space radar ping... connecting to relay towers...' },
];

const RPGRoamTab = ({ user }) => {
    const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);
    const [roamTerminalTab, setRoamTerminalTab] = useState('logs');

    return (
        <div className="absolute inset-0 flex flex-col items-center z-20 p-4 md:p-8 pb-2 md:pb-8 overflow-y-auto md:overflow-hidden" key="roam-inner">
            <div className="w-full max-w-5xl h-full min-h-0 md:min-h-[600px] flex flex-col gap-4 md:gap-8 relative mx-auto">

                {/* RADAR MODULE */}
                <div className={`flex flex-col relative transition-all duration-500 ease-in-out shrink-0 ${isTerminalExpanded ? 'h-32 opacity-30 pointer-events-none' : 'flex-1 min-h-[200px] md:min-h-[300px]'}`}>
                    <div className="absolute top-0 left-2 md:top-2 md:left-4 z-10 flex items-center gap-3">
                        <div className="size-2.5 md:size-3 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                        <span className="text-[9px] md:text-[10px] font-black text-cyan-500 uppercase tracking-widest font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">SECTOR_SCAN_ACTIVE</span>
                    </div>

                    <div className="flex-1 flex items-center justify-center relative p-2 md:p-4 pb-4 md:pb-10 md:pt-10">
                        <div className="relative w-full h-auto max-w-[260px] md:max-w-[420px] aspect-square rounded-full border border-cyan-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.1)] overflow-hidden bg-cyan-900/10 transition-all duration-500 hover:border-cyan-400/50 hover:shadow-[0_0_80px_rgba(6,182,212,0.2)]">
                            {/* Concentric rings */}
                            <div className="absolute inset-[15%] rounded-full border border-cyan-500/20" />
                            <div className="absolute inset-[30%] rounded-full border border-cyan-500/20" />
                            <div className="absolute inset-[45%] rounded-full border border-cyan-500/20 hidden md:block" />

                            {/* Crosshairs */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-full h-px bg-cyan-500/30" />
                                <div className="absolute h-full w-px bg-cyan-500/30" />
                            </div>

                            {/* Sweeping Scanner */}
                            <div className="absolute inset-0 origin-center animate-[spin_4s_linear_infinite] pointer-events-none">
                                <div className="w-1/2 h-full absolute top-0 left-1/2 origin-left bg-gradient-to-r from-cyan-400/0 to-cyan-400/40 border-r-2 border-cyan-400" />
                            </div>

                            {/* Blips */}
                            <div className="absolute top-[25%] left-[33%] size-2 md:size-3 bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-[ping_4s_ease-out_infinite]" style={{ animationDelay: '1s' }} />
                            <div className="absolute bottom-[30%] right-[25%] size-2 md:size-3 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-[ping_4s_ease-out_infinite]" style={{ animationDelay: '2.5s' }} />
                        </div>
                    </div>
                </div>

                {/* ENCOUNTERS TERMINAL */}
                <div className={`w-full border-t border-cyan-500/30 pt-4 md:pt-6 font-mono relative overflow-hidden flex flex-col z-20 shrink-0 transition-all duration-500 ease-in-out px-2 md:px-0 mt-4 ${isTerminalExpanded ? 'flex-1 min-h-[300px]' : 'h-56 md:h-64'}`}>

                    {/* TERMINAL TABS */}
                    <div className="flex items-center justify-between w-full mb-4 pb-2 border-b border-white/10 shrink-0 relative z-10 gap-2">
                        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto custom-scrollbar no-scrollbar-on-mobile w-full">
                            {[
                                { id: 'logs',    label: 'Logs',     activeColor: 'border-cyan-500'    },
                                { id: 'loot',    label: 'Loot',     activeColor: 'border-amber-500'   },
                                { id: 'company', label: 'Company',  activeColor: 'border-emerald-500' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setRoamTerminalTab(tab.id)}
                                    className={`text-[9px] sm:text-[11px] uppercase font-black tracking-widest pb-1 border-b-2 transition-all whitespace-nowrap ${
                                        roamTerminalTab === tab.id
                                            ? `text-white ${tab.activeColor}`
                                            : 'text-slate-500 border-transparent hover:text-white/70 hover:border-white/20'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                            {roamTerminalTab === 'logs' && (
                                <span className="text-[7px] text-cyan-500 uppercase tracking-widest font-black bg-cyan-500/10 px-1.5 py-[1px] rounded border border-cyan-500/20 shrink-0 animate-pulse hidden sm:inline-block">LIVE</span>
                            )}
                        </div>

                        <div className="flex items-center shrink-0 pl-2 ml-1">
                            <button
                                onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
                                className="p-1.5 border border-white/10 hover:border-cyan-500 rounded-lg transition-all text-white hover:text-cyan-400 bg-white/5 active:scale-95 flex items-center justify-center shrink-0"
                            >
                                {isTerminalExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="flex-1 overflow-auto custom-scrollbar relative z-10 w-full h-full">

                        {/* LOGS TAB */}
                        {roamTerminalTab === 'logs' && (
                            <div className="flex flex-col-reverse space-y-3 space-y-reverse pr-2 text-[10px] md:text-sm leading-relaxed min-h-max pb-8 pt-4">
                                {LOGS.map((log, i) => (
                                    <div key={i} className={log.color}>
                                        <span className={`${log.prefix} font-black mr-3`}>{log.tag}</span>
                                        {log.msg}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* LOOT TAB */}
                        {roamTerminalTab === 'loot' && (
                            <div className="flex flex-col items-center justify-center h-full opacity-50 py-6 md:py-10">
                                <div className="size-10 md:size-12 rounded-full border border-white/10 flex items-center justify-center mb-3 bg-white/5">
                                    <Box size={20} className="text-slate-500" />
                                </div>
                                <span className="text-[9px] md:text-[11px] font-black tracking-widest text-slate-500 uppercase">NO LOOT DETECTED IN SECTOR YET</span>
                            </div>
                        )}

                        {/* COMPANY TAB */}
                        {roamTerminalTab === 'company' && (
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-12 pt-4 pb-6">
                                {/* COMPANION SLOT */}
                                <div className="group flex flex-col md:flex-row items-center gap-3 md:gap-5 flex-shrink-0">
                                    <div className="size-16 md:size-20 glass-panel rounded-2xl border border-cyan-500/30 bg-black/40 flex items-center justify-center hover:border-cyan-400 transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden group-hover:scale-105 group-hover:bg-cyan-900/20">
                                        <span className="text-2xl md:text-3xl drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">🤖</span>
                                        <div className="absolute top-1 right-1 md:top-2 md:right-2 size-1.5 md:size-2 rounded-full bg-cyan-500 animate-pulse" />
                                        <div className="absolute top-0 left-0 size-2 border-t border-l border-cyan-500/50" />
                                        <div className="absolute bottom-0 right-0 size-2 border-b border-r border-cyan-500/50" />
                                    </div>
                                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                                        <span className="text-[6px] md:text-[8px] font-black text-cyan-500 uppercase tracking-[0.3em] font-mono">Companion</span>
                                        <span className="text-[10px] md:text-[14px] font-black text-white uppercase tracking-widest mt-1">Sentinel</span>
                                        <span className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">LVL. 12</span>
                                    </div>
                                </div>

                                {/* PET SLOT */}
                                <div className="group flex flex-col md:flex-row items-center gap-3 md:gap-5 flex-shrink-0">
                                    <div className="size-16 md:size-20 glass-panel rounded-2xl border border-emerald-500/30 bg-black/40 flex items-center justify-center hover:border-emerald-400 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden group-hover:scale-105 group-hover:bg-emerald-900/20">
                                        <span className="text-2xl md:text-3xl drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">🐺</span>
                                        <div className="absolute top-1 right-1 md:top-2 md:right-2 size-1.5 md:size-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <div className="absolute top-0 left-0 size-2 border-t border-l border-emerald-500/50" />
                                        <div className="absolute bottom-0 right-0 size-2 border-b border-r border-emerald-500/50" />
                                    </div>
                                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                                        <span className="text-[6px] md:text-[8px] font-black text-emerald-500 uppercase tracking-[0.3em] font-mono">Pet</span>
                                        <span className="text-[10px] md:text-[14px] font-black text-white uppercase tracking-widest mt-1">C_Hound</span>
                                        <span className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">LVL. 08</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RPGRoamTab;
