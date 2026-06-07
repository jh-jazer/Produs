import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useSWR from 'swr';
import api from '../services/api';
import { Link2, Droplet, MessageSquare, Send, Play } from 'lucide-react';
import { soundManager } from '../services/sound';
import MessagingModal from '../components/ui/MessagingModal';
import GamesModal from '../components/ui/GamesModal';
import HomeSkeleton from '../components/ui/HomeSkeleton';
import IdentityCard from '../components/ui/IdentityCard';
import LptLeaderboardModal from '../components/ui/LptLeaderboardModal';
import useMobile from '../hooks/useMobile';

const Link = () => {
    const navigate = useNavigate();
    const { user, syncUser } = useAuthStore();
    const { isIdPulledDown, setIsIdPulledDown } = useOutletContext();
    const isLinked = !!user?.partner;

    const fetcher = url => api.get(url).then(res => res.data);
    const { data: partner, mutate: mutatePartner } = useSWR(user?.partner ? '/auth/partner' : null, fetcher);

    const [watering, setWatering] = useState(false);
    const [droplets, setDroplets] = useState([]);
    const [isMessagingOpen, setIsMessagingOpen] = useState(false);
    const [isGamesOpen, setIsGamesOpen] = useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

    const { data: leaderboard } = useSWR('/rpg/leaderboard/lpt', fetcher);

    // Identity card flipping states
    const [isFlipped, setIsFlipped] = useState(false);
    const [isIdMenuOpen, setIsIdMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Page initialization
    const [isInitializing, setIsInitializing] = useState(true);
    const isMobile = useMobile();

    useEffect(() => {
        if (user && user.username) {
            const timer = setTimeout(() => {
                setIsInitializing(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user]);


    // If they are not linked, redirect them back to dashboard (safety fallback)
    useEffect(() => {
        if (!isLinked) {
            navigate('/dashboard');
        }
    }, [isLinked, navigate]);

    if (!isLinked) return null;

    const treeStage = user?.rpg?.linkTree?.stage || 0;
    const waterLevel = user?.rpg?.linkTree?.water || 0;
    const pointsSpent = user?.rpg?.linkTree?.pointsSpent || 0;

    const STAGE_NAMES = ["Seed", "Sprout", "Sapling", "Tree", "Blooming Tree", "Golden Tree"];
    const STAGE_EMOJIS = ["🌱", "🌿", "🪴", "🌳", "🌸", "🌟"];

    const handleWaterTree = async () => {
        if (watering || (user?.rpg?.linkPoints || 0) < 10) return;
        setWatering(true);
        soundManager.play('click');

        // Trigger visual droplets animation
        const newDroplets = Array.from({ length: 6 }).map((_, i) => ({
            id: Date.now() + i,
            x: Math.random() * 40 - 20,
            y: Math.random() * 30 - 15
        }));
        setDroplets(newDroplets);

        try {
            const res = await api.post('/rpg/water-tree');
            if (res.data && res.data.rpg) {
                syncUser(res.data.rpg);
                soundManager.play('ding');
            }
        } catch (error) {
            console.error('Failed to water tree:', error);
            alert(error.response?.data?.message || 'Watering failed');
        } finally {
            setWatering(false);
            setTimeout(() => setDroplets([]), 1200);
        }
    };

    const renderTreeSVG = () => {
        switch (treeStage) {
            case 0:
                return (
                    <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-28 md:h-28 text-slate-800 dark:text-slate-200">
                        <path d="M 20 80 Q 50 75 80 80" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-30" />
                        <circle cx="50" cy="79" r="4" fill="#eab308" className="animate-pulse" />
                    </svg>
                );
            case 1:
                return (
                    <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-28 md:h-28 text-slate-800 dark:text-slate-200">
                        <path d="M 20 80 Q 50 75 80 80" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-30" />
                        <path d="M 50 80 Q 48 65 52 55" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" />
                        <path d="M 52 55 Q 60 50 64 53 Q 62 58 52 55" fill="#10b981" />
                        <path d="M 52 55 Q 40 48 36 52 Q 40 57 52 55" fill="#10b981" />
                    </svg>
                );
            case 2:
                return (
                    <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-28 md:h-28 text-slate-800 dark:text-slate-200">
                        <path d="M 20 80 Q 50 75 80 80" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-30" />
                        <path d="M 50 80 Q 47 60 50 40" stroke="#10b981" strokeWidth="4" fill="none" strokeLinecap="round" />
                        <path d="M 49 60 Q 38 52 35 45 Q 42 45 49 60" fill="#059669" />
                        <path d="M 50 50 Q 62 42 65 35 Q 58 35 50 50" fill="#059669" />
                        <path d="M 50 40 Q 50 25 54 22 Q 54 32 50 40" fill="#10b981" />
                    </svg>
                );
            case 3:
                return (
                    <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-28 md:h-28 text-slate-800 dark:text-slate-200">
                        <path d="M 46 80 L 48 50 L 52 50 L 54 80 Z" fill="currentColor" className="opacity-30" />
                        <path d="M 48 55 Q 38 45 35 38" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-30" />
                        <path d="M 52 55 Q 62 45 65 38" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-30" />
                        <circle cx="50" cy="35" r="16" fill="#10b981" className="opacity-90" />
                        <circle cx="38" cy="42" r="12" fill="#059669" className="opacity-95" />
                        <circle cx="62" cy="42" r="12" fill="#059669" className="opacity-95" />
                    </svg>
                );
            case 4:
                return (
                    <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-28 md:h-28 text-slate-800 dark:text-slate-200">
                        <path d="M 46 80 L 48 50 L 52 50 L 54 80 Z" fill="currentColor" className="opacity-30" />
                        <circle cx="50" cy="35" r="18" fill="#ec4899" className="opacity-90" />
                        <circle cx="36" cy="40" r="14" fill="#f472b6" className="opacity-90" />
                        <circle cx="64" cy="40" r="14" fill="#f472b6" className="opacity-90" />
                        <circle cx="48" cy="28" r="2.5" fill="#fff" />
                        <circle cx="58" cy="36" r="2.5" fill="#fff" />
                        <circle cx="38" cy="44" r="2.5" fill="#fff" />
                    </svg>
                );
            case 5:
            default:
                return (
                    <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-28 md:h-28 text-slate-800 dark:text-slate-200">
                        <path d="M 46 80 L 48 50 L 52 50 L 54 80 Z" fill="currentColor" className="opacity-30" />
                        <circle cx="50" cy="35" r="20" fill="#eab308" className="opacity-90" />
                        <circle cx="34" cy="38" r="15" fill="#facc15" className="opacity-90" />
                        <circle cx="66" cy="38" r="15" fill="#facc15" className="opacity-90" />
                        <path d="M 50 15 L 52 20 L 57 20 L 53 23 L 55 28 L 50 25 L 45 28 L 47 23 L 43 20 L 48 20 Z" fill="#fff" className="animate-pulse" />
                    </svg>
                );
        }
    };

    return (
        <div className="w-full bg-transparent text-foreground font-sans">
            <AnimatePresence mode="wait">
                {isInitializing ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-6 pt-0 md:pl-8 md:pr-12 md:py-6 h-[calc(100dvh-6rem)] md:h-auto md:min-h-screen overflow-hidden md:overflow-visible"
                    >
                        <HomeSkeleton variant="link" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="link-reality"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-6 pt-0 md:pl-8 md:pr-12 md:py-6 h-[calc(100dvh-6rem)] md:h-auto md:min-h-screen overflow-hidden md:overflow-visible"
                    >
                        {/* Reality Dashboard Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-32 md:gap-8 w-full h-full md:h-auto mb-0 md:mb-24">

                            {/* Column 1-5: Integrated Swinging ID Assembly */}
                            <div className="md:col-span-5 relative h-full md:min-h-[82vh] w-full flex flex-col items-center justify-center mb-0 snap-start snap-always">
                                <div className="absolute inset-0 flex flex-col items-center">
                                    
                                    {/* Link Hub dashboard content */}
                                    {!isIdPulledDown && (
                                        <motion.div
                                            initial={{ opacity: 0, filter: 'blur(10px)', x: -20 }}
                                            animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
                                            exit={{ opacity: 0, filter: 'blur(10px)', x: -20 }}
                                            transition={{ duration: 0.6, delay: 0.3 }}
                                            className="absolute top-[7%] bottom-2 md:bottom-auto md:top-[0.5%] left-6 md:left-12 right-6 md:right-12 flex flex-col items-start pointer-events-none text-left"
                                        >
                                            <div className="relative top-20 md:top-0">
                                                <h3 className="welcome-title-text font-black tracking-tighter text-black dark:text-white uppercase mt-8 md:mt-[4.5vh]">
                                                    LINK
                                                    <br />
                                                    ESTABLISHED
                                                    <br />
                                                    {user?.username?.split('#')[0] || 'Operator'} ⇄ {partner?.username?.split('#')[0] || 'Partner'}
                                                </h3>
                                                <p className="text-[10px] md:text-sm font-mono uppercase tracking-[0.2em] text-black dark:text-white/40 mt-1 md:mt-2">
                                                    LINKED SINCE {(() => {
                                                        const dateSrc = partner?.createdAt || user?.createdAt;
                                                        if (!dateSrc) return 'SECURE';
                                                        try {
                                                            const date = new Date(dateSrc);
                                                            return date.toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: '2-digit',
                                                                year: 'numeric'
                                                            }).toUpperCase();
                                                        } catch (e) {
                                                            return 'SECURE';
                                                        }
                                                    })()}
                                                </p>
                                            </div>

                                            {/* Spacer 1 to center controls on mobile */}
                                            <div className="flex-1 md:hidden" />

                                            {/* Messaging / Games Stacked Buttons */}
                                            <div className="flex flex-col md:flex-row gap-3 mt-2 md:mt-[4vh] pointer-events-auto">
                                                {/* MESSAGES Button */}
                                                <motion.button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        soundManager.play('click');
                                                        setIsMessagingOpen(true);
                                                    }}
                                                    animate={{
                                                        scale: [1, 1.02, 1],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                    }}
                                                    whileHover={{ scale: 1.04 }}
                                                    whileTap={{ scale: 0.96 }}
                                                    className="w-[55vw] max-w-[240px] md:w-auto relative group overflow-hidden"
                                                >
                                                    {/* Outer glow pulse ring */}
                                                    <motion.span
                                                        className="absolute inset-0 rounded-sm bg-black/10 dark:bg-white/20"
                                                        animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0, 0.6] }}
                                                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                                    />

                                                    {/* Button body */}
                                                    <span className="relative w-full flex items-center justify-center md:justify-start gap-3 px-8 md:px-8 h-[8vh] min-h-[44px] bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.15)] dark:shadow-[0_0_30px_rgba(255,255,255,0.15)] group-hover:shadow-[0_0_45px_rgba(0,0,0,0.25)] dark:group-hover:shadow-[0_0_45px_rgba(255,255,255,0.25)] transition-shadow duration-300">
                                                        <MessageSquare className="size-3.5 text-current" />
                                                        MESSAGES
                                                        {/* Shimmer sweep */}
                                                        <motion.span
                                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
                                                            animate={{ x: ['-100%', '200%'] }}
                                                            transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                                                        />
                                                    </span>
                                                </motion.button>

                                                {/* PLAY GAMES Button */}
                                                <motion.button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        soundManager.play('click');
                                                        setIsGamesOpen(true);
                                                    }}
                                                    animate={{
                                                        scale: [1, 1.02, 1],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                        delay: 0.2
                                                    }}
                                                    whileHover={{ scale: 1.04 }}
                                                    whileTap={{ scale: 0.96 }}
                                                    className="w-[55vw] max-w-[240px] md:w-auto relative group overflow-hidden"
                                                >
                                                    {/* Outer glow pulse ring */}
                                                    <motion.span
                                                        className="absolute inset-0 rounded-sm bg-black/10 dark:bg-white/20"
                                                        animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0, 0.6] }}
                                                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                                                    />

                                                    {/* Button body */}
                                                    <span className="relative w-full flex items-center justify-center md:justify-start gap-3 px-8 md:px-8 h-[8vh] min-h-[44px] bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.15)] dark:shadow-[0_0_30px_rgba(255,255,255,0.15)] group-hover:shadow-[0_0_45px_rgba(0,0,0,0.25)] dark:group-hover:shadow-[0_0_45px_rgba(255,255,255,0.25)] transition-shadow duration-300">
                                                        <Play className="size-3.5 fill-current text-current" />
                                                        PLAY GAMES
                                                        {/* Shimmer sweep */}
                                                        <motion.span
                                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
                                                            animate={{ x: ['-100%', '200%'] }}
                                                            transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
                                                        />
                                                    </span>
                                                </motion.button>
                                            </div>

                                            {/* Spacer 2 to center controls on mobile */}
                                            <div className="flex-1 md:hidden" />

                                            {/* Priorities/Tree Section Heading */}
                                            <div className="mt-0 md:mt-[9vh] flex flex-col gap-1 items-start -translate-y-8 md:translate-y-0">
                                                <div className="text-2xl md:text-4xl font-black uppercase tracking-[0.25em] text-black dark:text-white leading-none">
                                                    CONNECTION TREE
                                                </div>
                                                <div className="text-[10px] md:text-xs font-mono uppercase tracking-[0.25em] text-black dark:text-white/50">
                                                    {STAGE_NAMES[treeStage].toUpperCase()} — STAGE {treeStage + 1}/6
                                                </div>
                                            </div>
                                                {/* Premium Connection Tree layout card at bottom */}
                                                <div className="w-[85vw] md:w-full md:flex-none md:max-w-[1060px] h-64 md:h-96 rounded-3xl border-2 border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] backdrop-blur-md p-8 md:p-12 flex flex-row items-center justify-between shadow-md transition-all duration-500 mt-3 -translate-y-8 md:translate-y-0 pointer-events-auto gap-4 md:gap-6 relative overflow-hidden scale-105">
                                                    {/* Left side: Tree SVG Display & Progress Bar */}
                                                    <div className="relative w-[70%] flex flex-col justify-between gap-4 border-r border-black/5 dark:border-white/5 pr-4 md:pr-6 h-full">
                                                        <div className="relative flex items-center justify-center p-2">
                                                            {renderTreeSVG()}
    
                                                            {/* Droplets flying animation */}
                                                            <AnimatePresence>
                                                                {droplets.map((drop) => (
                                                                    <motion.div
                                                                        key={drop.id}
                                                                        initial={{ opacity: 1, scale: 1.5, x: 0, y: 30 }}
                                                                        animate={{ 
                                                                            opacity: [1, 1, 0], 
                                                                            scale: [1.2, 0.8, 0.4], 
                                                                            x: drop.x, 
                                                                            y: -30 + drop.y 
                                                                        }}
                                                                        exit={{ opacity: 0 }}
                                                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                                                        className="absolute w-2 h-2.5 rounded-full bg-blue-500"
                                                                        style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
                                                                    />
                                                                ))}
                                                            </AnimatePresence>
                                                        </div>
    
                                                        {/* Progress Bar & Stage Info */}
                                                        <div className="w-full flex flex-col gap-1.5">
                                                            <div className="flex justify-between items-center text-[10px] md:text-xs font-mono text-slate-400">
                                                                <span className="font-black text-black dark:text-white uppercase tracking-wider text-[9px] md:text-xs">
                                                                    PROGRESS
                                                                </span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${waterLevel}%` }}
                                                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                                                    className="h-full bg-blue-500 rounded-full"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
    
                                                    {/* Right side: Stats & Controls */}
                                                    <div className="w-[30%] flex flex-col justify-center gap-4 pl-4 md:pl-6">
                                                        {/* Water icon button */}
                                                        <motion.button
                                                            whileHover={{ scale: 1.08 }}
                                                            whileTap={{ scale: 0.92 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleWaterTree();
                                                            }}
                                                            disabled={watering || (user?.rpg?.linkPoints || 0) < 10 || (treeStage === 5 && waterLevel === 100)}
                                                            className="size-14 md:size-16 rounded-full border-2 border-black/10 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center shadow-md transition-all disabled:opacity-30 pointer-events-auto mx-auto"
                                                            title={treeStage === 5 && waterLevel === 100 ? 'Max growth reached' : 'Water Tree (-10 LPT)'}
                                                        >
                                                            <Droplet className="size-6 text-blue-500 fill-blue-500/20" />
                                                        </motion.button>
                                                        <span className="text-[10px] font-mono font-black text-black dark:text-white uppercase tracking-widest text-center">-10 LPT</span>
    
                                                        {/* Total Spent indicator */}
                                                        <div className="text-center text-[8px] md:text-[9.5px] font-mono text-slate-400 uppercase tracking-widest leading-normal mt-auto pt-2">
                                                            Total Spent:<br />{pointsSpent} LPT
                                                        </div>
                                                    </div>
                                                </div>
                                        </motion.div>
                                    )}

                                    {/* Desktop HUD: LPT Ranking Info Card */}
                                    {!isIdPulledDown && (
                                        <div className="hidden lg:flex flex-col gap-4 absolute right-14 top-0 w-72 pointer-events-auto">
                                            {/* LPT Ranking Card */}
                                            <div 
                                                onClick={() => {
                                                    soundManager.play('click');
                                                    setIsLeaderboardOpen(true);
                                                }}
                                                className="relative border border-black/10 dark:border-white/10 rounded-sm p-4 flex flex-col gap-2 transition-all duration-300 overflow-hidden select-none cursor-pointer bg-transparent hover:bg-black/5 dark:hover:bg-white/[0.03] hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.05)] active:scale-[0.98]"
                                            >
                                                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                                    <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
                                                    <span className="text-[8px] font-mono tracking-widest text-black dark:text-white/30 uppercase">
                                                        LIVE
                                                    </span>
                                                </div>

                                                <span className="text-[8px] font-mono font-black uppercase tracking-[0.25em] text-black dark:text-white/40">LPT LEADERBOARD</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-2xl text-blue-500">leaderboard</span>
                                                    <div className="flex flex-col text-left">
                                                        <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white leading-tight">
                                                            CURRENT RANK: {(() => {
                                                                if (!leaderboard) return '...';
                                                                const myIndex = leaderboard.findIndex(l => l._id === user?._id);
                                                                return myIndex !== -1 ? `#${myIndex + 1}` : 'N/A';
                                                            })()}
                                                        </h4>
                                                        <p className="text-[9px] font-mono text-black dark:text-white/40 uppercase tracking-widest mt-0.5">
                                                            {user?.rpg?.linkPoints || 0} LPT AVAILABLE
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Partner Streak Card */}
                                            <div 
                                                className="relative border border-black/10 dark:border-white/10 rounded-sm p-4 flex flex-col gap-2 transition-all duration-300 overflow-hidden select-none bg-transparent hover:bg-black/5 dark:hover:bg-white/[0.03] hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.05)] group/reward"
                                            >
                                                {/* Pulsing indicator corner */}
                                                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                                    <span className="size-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                                                    <span className="text-[8px] font-mono tracking-widest text-black dark:text-white/30 uppercase">
                                                        SYNCED
                                                    </span>
                                                </div>

                                                <span className="text-[8px] font-mono font-black uppercase tracking-[0.25em] text-black dark:text-white/40">PARTNER MILESTONE</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-2xl text-orange-500 transition-transform group-hover/reward:scale-110 duration-300">local_fire_department</span>
                                                    <div className="flex flex-col text-left">
                                                        <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white leading-tight flex items-center gap-1.5">
                                                            <span>{partner?.username?.split('#')[0]?.toUpperCase() || 'PARTNER'}'S STREAK</span>
                                                            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm bg-orange-500/10 text-orange-500 text-[9px] font-black tracking-normal uppercase">
                                                                <span>{partner?.rpg?.loginStreak || 1}</span>
                                                                <span className="material-symbols-outlined text-[10px] animate-pulse">local_fire_department</span>
                                                            </div>
                                                        </h4>
                                                        <p className="text-[9px] font-mono text-black dark:text-white/40 uppercase tracking-widest mt-0.5">
                                                            DAILY SYNC ACTIVE
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Sash Cord Pull Handle for sliding Partner ID */}
                                    {(!isIdPulledDown || !isMobile) && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -50 }}
                                            transition={{ type: "spring", stiffness: 150, damping: 18 }}
                                            className="absolute top-0 md:-mt-6 right-16 md:right-0 z-40 flex flex-col items-center cursor-pointer pointer-events-auto"
                                            onClick={() => setIsIdPulledDown(!isIdPulledDown)}
                                        >
                                            {/* Anchor Mount */}
                                            <div className="w-4 h-1.5 bg-black dark:bg-white/80 rounded-t-sm shadow-[0_0_8px_rgba(0,0,0,0.4)] dark:shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                                            {/* Cord + Ring */}
                                            <motion.div
                                                className="flex flex-col items-center origin-top"
                                                animate={{ rotateZ: [0, 2, -1.5, 1, 0] }}
                                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
                                            >
                                                <div className="w-[2px] h-[180px] bg-gradient-to-b from-black/80 via-black/50 to-black/20 dark:from-white/80 dark:via-white/50 dark:to-white/20" />
                                                <motion.div 
                                                    whileHover={{ scale: 1.15, y: 3 }}
                                                    whileTap={{ scale: 0.95, y: 15 }}
                                                    className="size-9 rounded-full border-2 border-black/60 dark:border-white/60 bg-white/90 dark:bg-black/90 backdrop-blur-md flex items-center justify-center shadow-lg shadow-black/20 dark:shadow-black/40 group relative"
                                                >
                                                    <div className="size-3.5 rounded-full bg-black dark:bg-white animate-pulse shadow-[0_0_12px_rgba(0,0,0,0.8)] dark:shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
                                                    <span className="absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8.5px] font-mono font-black uppercase tracking-[0.25em] text-black/50 dark:text-white/50 group-hover:text-black dark:group-hover:text-white transition-all duration-300 select-none">
                                                        {isIdPulledDown ? "RETRACT ID" : "PARTNER ID"}
                                                    </span>
                                                </motion.div>
                                            </motion.div>
                                        </motion.div>
                                    )}

                                    {/* Pulled down Partner ID Card */}
                                    <motion.div 
                                        initial={{ y: -600, opacity: 0 }}
                                        animate={{ 
                                            y: isIdPulledDown ? 0 : -600, 
                                            opacity: isIdPulledDown ? 1 : 0 
                                        }}
                                        transition={{ 
                                            type: "spring", 
                                            stiffness: isIdPulledDown ? 120 : 200, 
                                            damping: isIdPulledDown ? 14 : 28,
                                            mass: isIdPulledDown ? 1.2 : 1
                                        }}
                                        style={{ 
                                            transformOrigin: "top center",
                                            pointerEvents: isIdPulledDown ? 'auto' : 'none'
                                        }}
                                        className="absolute top-0 md:-mt-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center"
                                    >
                                        <div 
                                            className="flex flex-col items-center cursor-pointer group/retract relative"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsIdPulledDown(false);
                                            }}
                                            title="RETRACT ID"
                                        >
                                            <div className="w-4 h-1 bg-black dark:bg-white z-[60] shadow-[0_0_15px_rgba(0,0,0,0.5)] dark:shadow-[0_0_15px_rgba(255,255,255,0.5)] shrink-0 group-hover/retract:bg-black dark:group-hover/retract:bg-white group-hover/retract:scale-x-125 transition-all" />
                                            <div className="w-[12px] h-[15vh] md:h-20 bg-black dark:bg-white opacity-80 shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] shrink-0 z-50 group-hover/retract:bg-black dark:group-hover/retract:bg-white group-hover/retract:opacity-100 transition-all origin-top" />
                                            <span className="absolute -top-6 whitespace-nowrap bg-black/90 text-white text-[7px] font-mono font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-sm border border-white/10 opacity-0 group-hover/retract:opacity-100 transition-opacity pointer-events-none">
                                                RETRACT ID
                                            </span>
                                        </div>

                                        <div className="relative -mt-4">
                                            <IdentityCard
                                                user={partner || user?.partner}
                                                isOwnProfile={false}
                                                isEditing={isEditing}
                                                setIsEditing={setIsEditing}
                                                isFlipped={isFlipped}
                                                setIsFlipped={setIsFlipped}
                                                isIdMenuOpen={isIdMenuOpen}
                                                setIsIdMenuOpen={setIsIdMenuOpen}
                                                currentUser={user}
                                                isConnected={true}
                                                onClose={() => setIsIdPulledDown(false)}
                                            />
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile HUD Leaderboard Tab */}
            {isMobile && !isIdPulledDown && (
                <div className="fixed top-[35vh] right-0 z-[100] flex flex-col items-end gap-4 pointer-events-none">
                    <motion.div
                        onClick={() => {
                            soundManager.play('click');
                            setIsLeaderboardOpen(true);
                        }}
                        animate={{ width: '96px' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="h-[8vh] flex flex-col items-center justify-center pointer-events-auto bg-blue-500/10 border-y-2 border-l-2 border-blue-500 text-blue-500 rounded-l-md font-black shadow-[0_0_20px_rgba(59,130,246,0.15)] cursor-pointer select-none active:scale-95"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] pl-1 text-current">
                            RANK {(() => {
                                if (!leaderboard) return '...';
                                const myIndex = leaderboard.findIndex(l => l._id === user?._id);
                                return myIndex !== -1 ? `#${myIndex + 1}` : 'N/A';
                            })()}
                        </span>
                        <span className="text-[7px] font-mono opacity-60 tracking-[0.1em] pl-1 mt-0.5 uppercase text-current">
                            LPT RANK
                        </span>
                    </motion.div>
                </div>
            )}

            {/* Link Hub Modals */}
            <MessagingModal
                isOpen={isMessagingOpen}
                onClose={() => setIsMessagingOpen(false)}
                partner={partner}
            />
            <GamesModal
                isOpen={isGamesOpen}
                onClose={() => setIsGamesOpen(false)}
            />
            <LptLeaderboardModal
                isOpen={isLeaderboardOpen}
                onClose={() => setIsLeaderboardOpen(false)}
                currentUser={user}
            />
        </div>
    );
};

export default Link;


