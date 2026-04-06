import React, { useState, useEffect, useRef, useContext } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import DashboardScrollIndicator from './dashboard/DashboardScrollIndicator';
import { Search, Bell, Users, User, Lock } from 'lucide-react';
import useSWR from 'swr';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import ProfileModal from './ui/ProfileModal';
import SettingsModal from './ui/SettingsModal';
import OnboardingModal from './ui/OnboardingModal';
import Avatar from './ui/Avatar';
import UserSearch from './ui/UserSearch';
import BugReportModal from './ui/BugReportModal';
import NotificationModal from './ui/NotificationModal';
import UserMenuModal from "./ui/UserMenuModal";
import LevelDisplay from './ui/LevelDisplay';
import DashboardHeader from './dashboard/DashboardHeader';
import { DashboardContext, FrozenRoute } from '../context/DashboardContext';

function Layout() {
    const { user, signOut } = useAuthStore();
    const [viewMode, setViewMode] = useState('personal'); // 'personal' | 'partner'
    const [protocolMode, setProtocolMode] = useState('reality'); // 'reality' | 'rpg'
    const mainRef = useRef(null);
    const { scrollYProgress } = useScroll({ container: mainRef });
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
    const navigate = useNavigate();
    const location = useLocation();
    const isOverview = location.pathname === '/dashboard';
    const isOnline = true; // navigator.onLine (Offline features removed)
    const profileRef = useRef(null);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [deferredPath, setDeferredPath] = useState(location.pathname);

    useEffect(() => {
        // Handle subtle navigation delay for premium feel
        const timeout = setTimeout(() => {
            setDeferredPath(location.pathname);
        }, 100);
        return () => clearTimeout(timeout);
    }, [location.pathname]);

    useEffect(() => {
        // Close mobile menu on route change
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    useEffect(() => {
        if (isUserMenuOpen || isSettingsModalOpen) {
            setIsMobileMenuOpen(false);
        }
    }, [isUserMenuOpen, isSettingsModalOpen]);

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isBugModalOpen, setIsBugModalOpen] = useState(false);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const isNeuralSyncDismissed = useAuthStore((state) => state.isNeuralSyncDismissed);

    // Fetch notifications
    const { data: notifications = [] } = useSWR('/notifications', (url) => api.get(url).then(res => res.data), {
        refreshInterval: 30000
    });
    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (user && !user.onboardingCompleted) {
            setIsOnboardingOpen(true);
        }
    }, [user]);


    const handleSignOut = async () => {
        setIsUserMenuOpen(false);
        await signOut();
        navigate('/auth');
    };

    const navItems = [
        { name: 'Overview', path: '/dashboard', icon: 'dashboard' },
        { name: 'Habits', path: '/dashboard/habits', icon: 'check_circle' },
        { name: 'Planner', path: '/dashboard/planner', icon: 'event' },
        { name: 'Finance', path: '/dashboard/finance', icon: 'payments' },
        { name: 'Health', path: '/dashboard/health', icon: 'monitor_heart' },
        { name: 'Journal', path: '/dashboard/journal', icon: 'book' },
    ];

    const handleNavigate = (progress, behavior = 'smooth') => {
        if (!mainRef.current) return;
        const scrollHeight = mainRef.current.scrollHeight - mainRef.current.clientHeight;
        mainRef.current.scrollTo({
            top: progress * scrollHeight,
            behavior: behavior
        });
    };

    return (
        <DashboardContext.Provider value={{ 
            setIsSearchModalOpen, 
            setIsNotificationModalOpen, 
            unreadCount, 
            viewMode, 
            setViewMode, 
            protocolMode, 
            setProtocolMode 
        }}>
            <div
            className="bg-transparent font-display text-[#111111] dark:text-slate-100 h-screen flex flex-row overflow-hidden"
            >
                {/* Mobile Top Bar */}
                <div className={`md:hidden fixed top-0 left-0 right-0 h-16 flex items-center px-4 z-[135] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md transition-all duration-300 border-b border-black/[0.03] dark:border-white/[0.03] ${isMobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                    <div
                        className="flex items-center gap-3 group cursor-pointer relative"
                        onClick={() => navigate('/dashboard')}
                    >
                        <img 
                            src="/produs-logo.png" 
                            alt="Produs" 
                            className={`size-7 object-contain transition-all duration-500 ${isMobileMenuOpen ? 'scale-110' : ''}`} 
                        />
                        <span className="font-black text-[10px] uppercase tracking-[0.6em] text-black dark:text-white">
                            Produs
                        </span>
                    </div>

                    {/* Tactical Tools Right */}
                    <div className="ml-auto flex items-center gap-2">
                        {/* 1. Partner Toggle */}
                        <button
                            onClick={() => setViewMode(viewMode === 'personal' ? 'partner' : 'personal')}
                            className="size-9 glass-panel rounded-xl flex items-center justify-center relative bg-black/5 dark:bg-white/5 active:scale-95 transition-all"
                        >
                            {viewMode === 'personal' ? <User size={14} className="text-slate-500" /> : <Users size={14} className="text-cyan-500" />}
                            {!user?.partner && (
                                <Lock size={8} className="absolute bottom-1.5 right-1.5 text-slate-400" />
                            )}
                        </button>

                        {/* 2. Search Icon (Overview Only) */}
                        {isOverview && (
                            <button
                                onClick={() => setIsSearchModalOpen(true)}
                                className="size-9 glass-panel rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/5 active:scale-95 transition-all"
                            >
                                <Search size={14} className="text-slate-500" />
                            </button>
                        )}

                        {/* 3. Notification Hub */}
                        <button
                            onClick={() => setIsNotificationModalOpen(true)}
                            className="size-9 glass-panel rounded-xl flex items-center justify-center relative bg-black/5 dark:bg-white/5 active:scale-95 transition-all"
                        >
                            <Bell size={14} className="text-slate-500" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 size-2 bg-rose-500 rounded-full ring-2 ring-rose-500/20 animate-pulse" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Sub-Header Row 2 Removed */}

                {/* Sidebar Backdrop Mobile */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xl z-[140]"
                        />
                    )}
                </AnimatePresence>

                {/* Main Side Navigation */}
                <aside
                    className={`
                        fixed md:relative z-[150] h-full flex flex-col transition-all duration-[600ms] ease-[0.16,1,0.3,1]
                        ${isMobileMenuOpen ? 'translate-x-0 w-[75vw]' : '-translate-x-full md:translate-x-0'}
                        ${!isMobileMenuOpen ? (deferredPath === '/dashboard' ? 'md:w-72' : 'md:w-20') : ''}
                        ${isMobileMenuOpen ? 'bg-white/[0.99] dark:bg-black/[0.99] backdrop-blur-3xl shadow-[40px_0_80px_rgba(0,0,0,0.3)]' : ''}
                    `}
                >
                    {/* 1. Sidebar Header: Logo */}
                    <div className="h-24 flex items-center px-6 shrink-0">
                        <div className="flex items-center gap-5 group cursor-pointer relative" onClick={() => isMobileMenuOpen ? setIsMobileMenuOpen(false) : navigate('/dashboard')}>
                            <img 
                                src="/produs-logo.png" 
                                alt="Produs" 
                                className={`size-8 object-contain transition-all duration-500 group-hover:scale-110 ${isMobileMenuOpen ? 'scale-110' : ''}`} 
                            />
                            <div className={`flex items-center overflow-hidden transition-all duration-500 ease-in-out
                                ${(deferredPath === '/dashboard' || isMobileMenuOpen) ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden md:flex'}
                            `}>
                                <span className="font-black text-[11px] uppercase tracking-[0.8em] leading-none text-black dark:text-white">Produs</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Primary Navigation */}
                    <div className="flex-1 px-4 py-8">
                        <div className="flex flex-col gap-1.5">
                            {navItems.map((item, idx) => {
                                const isOverview = deferredPath === '/dashboard';
                                const isActive = deferredPath === item.path || (item.path === '/dashboard' && deferredPath === '/dashboard');
                                
                                return (
                                    <motion.button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className={`relative group/nav flex items-center rounded-2xl transition-all duration-300
                                            ${isActive ? 'bg-black/[0.04] dark:bg-white/[0.06]' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}
                                            ${isMobileMenuOpen ? 'h-16 w-full px-4' : 'h-12'}
                                            ${(!isOverview && !isMobileMenuOpen) ? 'w-12' : 'w-full'}
                                        `}
                                    >
                                        {/* Active Indicator Line */}
                                        {!isMobileMenuOpen && (
                                            <div className={`absolute left-0 top-[calc(50%-12px)] w-[2px] transition-colors duration-500 bg-slate-200 dark:bg-white/10
                                                ${idx === navItems.length - 1 ? 'bg-gradient-to-b !from-current !to-transparent opacity-40' : ''}
                                            `} />
                                        )}

                                        {/* Icon Node */}
                                        <div className="relative flex items-center w-full h-full">
                                            <div className={`absolute flex items-center justify-center size-[18px] z-50 transition-all duration-500 ${isMobileMenuOpen ? 'left-[36px]' : 'left-[31px]'}`}>
                                                <div className={`absolute inset-[-8px] rounded-full transition-all duration-500
                                                    ${isActive ? 'bg-electric-blue/20 ring-1 ring-electric-blue/30 scale-110 shadow-[0_0_15px_rgba(0,183,255,0.2)]' : 'bg-electric-blue/0 group-hover/nav:bg-electric-blue/10'}
                                                `} />
                                                <span className={`material-symbols-outlined transition-all duration-500 relative z-10
                                                    ${isMobileMenuOpen ? 'text-[24px]' : 'text-[19px]'}
                                                    ${isActive ? 'text-electric-blue scale-110' : 'text-slate-400 group-hover/nav:text-electric-blue group-hover/nav:scale-110'}
                                                `}>
                                                    {item.icon}
                                                </span>
                                            </div>

                                            {/* Labels */}
                                            <div className={`flex items-center absolute pointer-events-none transition-all duration-[400ms] ease-[0.16,1,0.3,1] z-50
                                                ${(isOverview || isMobileMenuOpen)
                                                    ? `left-0 relative ${isMobileMenuOpen ? 'pl-20' : 'pl-14 md:pl-16'} opacity-100 translate-x-0 w-max`
                                                    : 'hidden md:flex left-[60px] bg-black dark:bg-white px-3.5 py-2.5 rounded shadow-xl opacity-0 -translate-x-2 group-hover/nav:opacity-100 group-hover/nav:translate-x-0 w-max border border-white/10 dark:border-black/10'}
                                            `}>
                                                <div className={`flex items-center ${(isOverview || isMobileMenuOpen) ? 'gap-4' : 'gap-0'}`}>
                                                <div className={`h-px bg-electric-blue transition-all duration-300 ${(isOverview && !isMobileMenuOpen) ? 'w-4' : 'w-0 hidden'}`} />
                                                    <span className={`font-black uppercase tracking-[0.4em] whitespace-nowrap transition-all duration-300 mt-[1px]
                                                        ${isMobileMenuOpen ? 'text-[11px]' : 'text-[10px]'}
                                                        ${(isOverview || isMobileMenuOpen)
                                                            ? (isActive ? 'text-black dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover/nav:text-black dark:group-hover:text-white')
                                                            : 'text-white dark:text-black'}
                                                    `}>
                                                        {item.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Sidebar Footer: System Actions & Identity HUD */}
                    <div className={`mt-auto p-4 md:p-6 flex flex-col items-start gap-4 transition-all duration-[600ms] 
                        ${(isOverview || isMobileMenuOpen) ? 'pl-[20px]' : 'pl-[16px]'}
                    `}>

                        {/* Unified Level HUD: Persistent Icon + Conditional Progress Bar */}
                        {user?.level > 0 && (
                            <div className="flex items-center gap-4 w-full h-10">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsStatsModalOpen(true)}
                                    className="size-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/[0.05] dark:border-white/10 flex flex-col items-center justify-center gap-0.5 transition-all hover:bg-electric-blue/10 hover:border-electric-blue/30 group/lvl shrink-0"
                                >
                                    <span className="text-[7px] font-black text-black/30 dark:text-white/30 group-hover/lvl:text-electric-blue/60 uppercase tracking-tighter italic leading-none">LVL</span>
                                    <span className="text-sm font-black text-black dark:text-white group-hover/lvl:text-electric-blue leading-none">{user?.level || 1}</span>
                                </motion.button>

                                <AnimatePresence>
                                    {(deferredPath === '/dashboard' || isMobileMenuOpen) && (
                                        <motion.div 
                                            key="prog-bar"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className={`${isMobileMenuOpen ? 'flex' : 'hidden md:flex'} flex-1 min-w-0`}
                                        >
                                            <LevelDisplay 
                                                level={user?.level} 
                                                exp={user?.exp} 
                                                totalRequired={user?.totalRequired}
                                                nextLevelExp={user?.nextLevelExp}
                                                className="w-full" 
                                                onClick={() => setIsStatsModalOpen(true)}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Profile & Name Identity */}
                        <div className="relative flex items-center gap-4 group" ref={profileRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(true)}
                                className="size-10 rounded-full ring-2 ring-electric-blue/10 hover:ring-electric-blue/40 overflow-hidden transition-all active:scale-95 bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0 relative"
                            >
                                {user?.avatar?.url ? (
                                    <img src={user.avatar.url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs font-bold">{user?.name?.charAt(0)}</span>
                                )}
                            </button>

                            <AnimatePresence mode="wait">
                                {(deferredPath === '/dashboard' || isMobileMenuOpen) && (
                                    <motion.div 
                                        key="profile-greeting"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                        className={`${isMobileMenuOpen ? 'flex' : 'hidden md:flex'} flex-col whitespace-nowrap overflow-hidden`}
                                    >
                                        <div className="flex flex-col">
                                            <p className="text-[10px] font-black text-black dark:text-white leading-none uppercase tracking-[0.2em]">{user?.username ? `@${user.username}` : user?.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {user?.username && <span className="text-[8px] font-bold text-electric-blue uppercase">{user.name}</span>}
                                                {user?.rpg?.archetype?.stage && (
                                                    <span className="text-[8px] font-medium text-black/30 dark:text-white/30 uppercase tracking-tighter italic">
                                                        // {user.rpg.archetype.stage}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                </aside>

                {/* Main Application Interface */}
                <div className={`flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-[400ms] ease-[0.16,1,0.3,1]
                    ${isMobileMenuOpen ? 'blur-md' : 'blur-0'}
                `}>
                    {/* Desktop Persistent Header with Cinematic Fade */}
                    <div className="hidden md:block absolute top-0 left-0 right-0 z-40 h-40 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-[var(--background)]/95 to-transparent backdrop-blur-xl [mask-image:linear-gradient(to_bottom,black_20%,transparent),linear-gradient(to_right,transparent,black_10%,black_75%,transparent)] [-webkit-mask-composite:source-in] [mask-composite:intersect]" />
                        <div className="relative pl-8 lg:pl-12 pr-24 lg:pr-32 pt-8 pb-4 pointer-events-auto">
                            <DashboardHeader viewMode={viewMode} setViewMode={setViewMode} user={user} />
                        </div>
                    </div>

                    <div 
                        ref={mainRef}
                        className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar flex flex-col relative md:pt-24 mt-16 md:mt-0"
                    >
                        <AnimatePresence mode="wait">
                            <motion.main 
                                key={location.pathname}
                                initial={{ x: "100%", opacity: 1 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: "-10%", opacity: 0, scale: 0.96, filter: "blur(12px)" }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="flex-1 flex justify-start pb-32 md:pb-12 px-4 md:pl-8 md:pr-24 lg:pl-12 lg:pr-32 w-full"
                            >
                                <FrozenRoute context={{ setIsSearchModalOpen, setIsNotificationModalOpen, unreadCount, viewMode, setViewMode, protocolMode, setProtocolMode }} />
                            </motion.main>
                        </AnimatePresence>
                    </div>
                </div>

                <AnimatePresence>
                    {isSearchModalOpen && (
                        <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[10vw] px-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSearchModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} className="relative w-full max-w-lg bg-white dark:bg-[#121212] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-black/[0.08] dark:border-white/10 overflow-hidden flex flex-col max-h-[80vh] ar-corners">
                                <div className="flex items-center justify-between p-4 border-b border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02]">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] ml-4 text-black/40 dark:text-white/40">Database Search</h4>
                                    <button onClick={() => setIsSearchModalOpen(false)} className="size-8 flex items-center justify-center rounded-full text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"><span className="material-symbols-outlined text-[20px]">close</span></button>
                                </div>
                                <div className="p-4 flex-1 overflow-y-auto">
                                    <UserSearch onSelect={() => setIsSearchModalOpen(false)} />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {isProfileModalOpen && (
                    <ProfileModal 
                        username={user?.username} 
                        onClose={() => setIsProfileModalOpen(false)} 
                    />
                )}
                
                <UserMenuModal
                    isOpen={isUserMenuOpen}
                    onClose={() => setIsUserMenuOpen(false)}
                    user={user}
                    unreadCount={unreadCount}
                    onOpenSettings={() => setIsSettingsModalOpen(true)}
                    onOpenNotifications={() => setIsNotificationModalOpen(true)}
                    onOpenBugReport={() => setIsBugModalOpen(true)}
                    onSignOut={handleSignOut}
                />

                {isSettingsModalOpen && (
                    <SettingsModal 
                        isOpen={isSettingsModalOpen} 
                        onClose={() => setIsSettingsModalOpen(false)} 
                    />
                )}
                
                {isBugModalOpen && (
                    <BugReportModal 
                        isOpen={isBugModalOpen} 
                        onClose={() => setIsBugModalOpen(false)} 
                        user={user} 
                    />
                )}

                {isNotificationModalOpen && (
                    <NotificationModal 
                        isOpen={isNotificationModalOpen} 
                        onClose={() => setIsNotificationModalOpen(false)} 
                        user={user}
                    />
                )}
                
                <AnimatePresence>
                    {isStatsModalOpen && (
                        <StatsModal 
                            isOpen={isStatsModalOpen} 
                            onClose={() => setIsStatsModalOpen(false)} 
                            user={user}
                        />
                    )}
                </AnimatePresence>
                
                {isOnboardingOpen && (
                    <OnboardingModal 
                        isOpen={isOnboardingOpen} 
                        onClose={() => setIsOnboardingOpen(false)} 
                    />
                )}

                {/* Neural Sync Modal Removed */}

                {/* Global Cinematic Scroll HUD */}
                <DashboardScrollIndicator 
                    progress={scrollYProgress}
                    onNavigate={handleNavigate}
                />
            </div>
        </DashboardContext.Provider>
    );
}

export default Layout;
