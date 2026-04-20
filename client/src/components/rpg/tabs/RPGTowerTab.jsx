import React from 'react';
import { motion } from 'framer-motion';

const SCHEDULE = [
    { start: 3, end: 5 },
    { start: 15, end: 17 },
];

const LEADERBOARD = [
    { rank: 1,  name: 'ZENITH_ALPHA',  score: 9820, floor: '15' },
    { rank: 2,  name: 'VOID_WALKER',   score: 9450, floor: '14' },
    { rank: 3,  name: 'CYBER_PUNK',    score: 9120, floor: '13' },
    { rank: 4,  name: 'DATA_GHOST',    score: 8850, floor: '12' },
    { rank: 5,  name: 'NEURAL_LINK',   score: 8520, floor: '11' },
    { rank: 6,  name: 'BIT_CRUSHER',   score: 8210, floor: '10' },
    { rank: 7,  name: 'PROXY_WAR',     score: 7950, floor: '09' },
    { rank: 8,  name: 'SILENT_WOLF',   score: 7640, floor: '08' },
    { rank: 9,  name: 'NEON_KNIGHT',   score: 7320, floor: '07' },
    { rank: 10, name: 'ROUTER_PUNK',   score: 6980, floor: '06' },
    { rank: 11, name: 'SHADOW_EDGE',   score: 6540, floor: '05' },
    { rank: 12, name: 'GLITCH_KING',   score: 6120, floor: '04' },
    { rank: 13, name: 'LOGIC_BOMB',    score: 5890, floor: '03' },
    { rank: 14, name: 'PIXEL_MAGE',    score: 5430, floor: '02' },
    { rank: 15, name: 'BACKDOOR_BOT',  score: 5100, floor: '01' },
];

const RPGTowerTab = ({ user }) => {
    const now           = new Date();
    const utcHour       = now.getUTCHours();
    const activeSlot    = SCHEDULE.find(s => utcHour >= s.start && utcHour < s.end);
    const isTournamentActive = !!activeSlot;
    const nextSession   = SCHEDULE.find(s => s.start > utcHour) || SCHEDULE[0];
    const hoursUntil    = nextSession.start > utcHour
        ? nextSession.start - utcHour
        : (24 - utcHour) + nextSession.start;

    return (
        <div className="absolute inset-0 flex items-center justify-center z-20 p-6 md:p-10" key="tower-inner">
            <div className="w-full max-w-6xl h-full flex flex-col md:flex-row gap-8 lg:gap-12 items-stretch overflow-hidden">

                {/* 1. Status Column */}
                <div className="w-full md:w-80 flex flex-col gap-4 md:gap-6 order-first md:order-last shrink-0">
                    {isTournamentActive ? (
                        <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-amber-500/10 border border-amber-500/30 space-y-4 md:space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3">
                                <div className="size-2 bg-amber-500 rounded-full animate-ping" />
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em]">Event_Protocol_Active</span>
                                <h3 className="text-xl md:text-2xl font-black text-white italic tracking-tighter uppercase text-center">Tournament_Phase_01</h3>
                                <div className="text-[9px] text-amber-500 font-bold px-4 py-1.5 bg-amber-500/20 rounded-full border border-amber-500/30 animate-pulse">
                                    SESSION ENDS IN {activeSlot.end - utcHour}H
                                </div>
                            </div>
                            <div className="space-y-3 pt-4 border-t border-amber-500/10">
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                                    <span>Global_Pool</span>
                                    <span className="text-white">125,400 XP</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-white/[0.02] border border-white/10 space-y-6">
                            <div className="flex flex-col items-center gap-4">
                                <div className="size-16 rounded-full border border-white/10 p-1 flex items-center justify-center">
                                    <div className="size-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500">
                                        <span className="text-[10px] font-black">ZZZ</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg md:text-xl font-black text-white/50 uppercase italic tracking-tighter">Next_Session_IN {hoursUntil}H</h3>
                                </div>
                            </div>
                            <div className="space-y-2 pt-4 border-t border-white/5">
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-600">
                                    <span>Your_Standing</span>
                                    <span className="text-white">#12,492</span>
                                </div>
                                <span className="block text-[7px] text-slate-700 uppercase tracking-widest font-black text-center mt-2">ASCENSION UNAVAILABLE</span>
                            </div>
                        </div>
                    )}

                    {/* Seasonal/Lore Card - Hidden on Mobile */}
                    <div className="hidden md:flex p-6 rounded-[2rem] border border-dashed border-white/10 flex-col items-center justify-center text-center space-y-3 bg-white/[0.01]">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global_Session_Windows</span>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-white/40 font-bold tracking-widest">S1: 03:00 - 05:00 UTC</span>
                            <span className="text-[10px] text-white/40 font-bold tracking-widest">S2: 15:00 - 17:00 UTC</span>
                        </div>
                    </div>
                </div>

                {/* 2. The Literal Tower (Rankings) */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden min-h-0">
                    <div className="space-y-1 mb-2 hidden md:block">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Ascension_Log</span>
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Sector_Pinnacle_Tower</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 md:pr-6 custom-scrollbar relative">
                        {/* Vertical Ascension Line */}
                        <div className="absolute left-[27px] md:left-[31px] top-11 md:top-12 bottom-11 md:bottom-12 w-px bg-gradient-to-b from-amber-500 via-white/5 to-white/5 z-0" />

                        <div className="space-y-4 md:space-y-6 relative z-10 py-4">
                            {LEADERBOARD.map((player, idx) => (
                                <motion.div
                                    key={player.name}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    whileHover={{ x: 8 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: idx * 0.05 }}
                                    className="flex items-center gap-3 md:gap-6 group cursor-pointer"
                                >
                                    {/* Floor Marker */}
                                    <div className={`relative size-14 md:size-16 shrink-0 flex items-center justify-center font-mono transition-transform group-hover:scale-110 ${idx === 0 ? 'text-amber-500 opacity-100' : 'text-slate-600 opacity-60'}`}>
                                        <div className={`absolute inset-[15%] border rotate-45 transition-colors ${idx === 0 ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/10 bg-white/5 group-hover:border-white/30'}`} />
                                        <div className="relative flex flex-col items-center">
                                            <span className="text-[6px] md:text-[7px] font-black uppercase tracking-tighter">LVL</span>
                                            <span className="text-sm md:text-md font-black tracking-tighter">{player.floor}</span>
                                        </div>
                                    </div>

                                    {/* Floor Content */}
                                    <div className={`flex-1 flex items-center justify-between p-3 md:p-5 rounded-xl md:rounded-2xl border transition-all ${
                                        idx === 0
                                            ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                                            : 'bg-white/[0.03] border-white/5 group-hover:border-white/20 group-hover:bg-white/[0.05]'
                                    }`}>
                                        <div className="flex flex-col text-left">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] md:text-[11px] font-black uppercase tracking-widest ${idx === 0 ? 'text-amber-500' : 'text-white'}`}>{player.name}</span>
                                                {idx === 0 && <span className="text-[6px] md:text-[7px] px-1 md:px-1.5 py-0.5 bg-amber-500 text-black font-black uppercase rounded">Top_Apex</span>}
                                            </div>
                                            <span className="text-[7px] md:text-[8px] text-slate-500 uppercase font-black tracking-widest mt-0.5">Sync_Verified</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`text-[13px] md:text-[15px] font-black tabular-nums ${idx === 0 ? 'text-amber-500' : 'text-white'}`}>{player.score}</span>
                                            <span className="text-[7px] md:text-[8px] text-slate-500 font-black uppercase tracking-tighter">Sync_PTS</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RPGTowerTab;
