import React, { useState, useEffect, useRef, useContext } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import DashboardScrollIndicator from './dashboard/DashboardScrollIndicator';
import { Search, Handshake, User, Lock, Zap, Cpu, ShoppingBag } from 'lucide-react';
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
import Logo from './brand/Logo';
import MobileBottomNav from './ui/MobileBottomNav';
import MobileTabNav from './ui/MobileTabNav';
import UserMenuModal from "./ui/UserMenuModal";
import OperationModeModal from './ui/OperationModeModal';
import LevelDisplay from './ui/LevelDisplay';
import DashboardHeader from './dashboard/DashboardHeader';
import { DashboardContext } from '../context/DashboardContext';
import StatsModal from './ui/StatsModal';
import CoinDisplay from './ui/CoinDisplay';

function Layout() {
    const { user, signOut } = useAuthStore();
    const [viewMode, setViewMode] = useState('personal'); // 'personal' | 'partner'
    const [protocolMode, setProtocolMode] = useState('reality'); // 'reality' | 'rpg'
    const mainRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const isOverview = location.pathname === '/dashboard';
    const isAdminPage = location.pathname === '/dashboard/admin';
    const isOnline = true; // navigator.onLine (Offline features removed)
    const profileRef = useRef(null);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    const [isOperationModalOpen, setIsOperationModalOpen] = useState(false);
    const [mobileTabs, setMobileTabs] = useState(null); // { tabs, activeTab, setActiveTab }
    const isNeuralSyncDismissed = useAuthStore((state) => state.isNeuralSyncDismissed);

    // Fetch fresh profile from server — this is the authoritative source of truth.
    // We use it (not localStorage) to decide whether to show onboarding.
    const { data: freshUser } = useSWR(user ? '/auth/me' : null);
    const syncUser = useAuthStore((state) => state.syncUser);

    // Keyboard Shortcut for Mode Switching
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only trigger if not typing in an input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.isContentEditable) return;
            
            if (e.key.toLowerCase() === 'm') {
                setProtocolMode(prev => prev === 'rpg' ? 'reality' : 'rpg');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Sync fresh server data into the in-memory store whenever it arrives
    useEffect(() => {
        if (freshUser) syncUser(freshUser);
    }, [freshUser]);

    // Fetch notifications
    const { data: notifications = [] } = useSWR('/notifications', (url) => api.get(url).then(res => res.data), {
        refreshInterval: 30000
    });
    const unreadCount = notifications.filter(n => !n.read).length;

    // Only open onboarding once we have verified server data confirming it's incomplete.
    // This prevents false positives when freshUser hasn't loaded yet (localStorage has no onboardingCompleted).
    useEffect(() => {
        if (freshUser && !freshUser.username) {
            setIsOnboardingOpen(true);
        }
    }, [freshUser]);


    const handleSignOut = async () => {
        setIsUserMenuOpen(false);
        await signOut();
        navigate('/auth');
    };

    const navItems = [
        { name: 'Home', path: '/dashboard', icon: 'home' },
        { name: 'Intellectual', path: '/dashboard/intellectual', icon: 'psychology' },
        { name: 'Financial', path: '/dashboard/financial', icon: 'payments' },
        { name: 'Physical', path: '/dashboard/physical', icon: 'monitor_heart' },
        { name: 'Spiritual', path: '/dashboard/spiritual', icon: 'auto_awesome' },
    ];

    const currentNavItem = navItems.find(item => item.path === location.pathname);
    const pageTitle = (currentNavItem && !isOverview) ? currentNavItem.name : 'PRODUS';

    return (
        <DashboardContext.Provider value={{ 
            setIsSearchModalOpen, 
            setIsNotificationModalOpen, 
            unreadCount, 
            viewMode, 
            setViewMode, 
            protocolMode, 
            setProtocolMode,
            setIsOperationModalOpen,
            mobileTabs,
            setMobileTabs
        }}>
            <div
            className="bg-transparent font-display text-[#111111] dark:text-slate-100 h-[100dvh] flex flex-row overflow-hidden"
            >
                {/* Mobile Top Bar */}
                <div className="md:hidden fixed top-0 left-0 right-0 h-16 flex items-center px-4 z-[135] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md transition-all duration-300 border-b border-black/[0.03] dark:border-white/[0.03]">
                    {isOverview && (
                        <div
                            className="flex items-center gap-2 active:scale-95 transition-all"
                            onClick={() => navigate('/dashboard/shop')}
                        >
                            <CoinDisplay amount={user?.rpg?.prodCoins || 0} variant="minimal" className="scale-75 origin-left" />
                        </div>
                    )}

                    {/* Integrated Mobile Tabs (Sub-pillars only) */}
                    {!isOverview && mobileTabs && (
                        <div className="flex-1 flex justify-start pl-2">
                            <MobileTabNav 
                                variant="header"
                                tabs={mobileTabs.tabs}
                                activeTab={mobileTabs.activeTab}
                                setActiveTab={mobileTabs.setActiveTab}
                            />
                        </div>
                    )}

                    {/* Tactical Tools Right */}
                    <div className="ml-auto flex items-center gap-3">
                        {/* 1. Tactical Toggles (RPG & Link) */}
                        <div className="flex items-center gap-1.5 p-1 rounded-2xl">
                            {/* RPG Toggle - Dashboard Only */}
                            {isOverview && (
                                <button
                                    onClick={() => setProtocolMode(protocolMode === 'rpg' ? 'reality' : 'rpg')}
                                    className={`size-9 rounded-xl flex items-center justify-center relative transition-all active:scale-95 ${
                                        protocolMode === 'rpg' 
                                            ? 'bg-primary text-white' 
                                            : 'text-slate-500 bg-black/5 dark:bg-white/5'
                                    }`}
                                >
                                    <Cpu size={14} className={protocolMode === 'rpg' ? 'animate-pulse' : ''} />
                                </button>
                            )}

                            {/* Partner Link Toggle */}
                            {isOverview && (
                                <button
                                    onClick={() => setIsOperationModalOpen(true)}
                                    className="size-9 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/5 active:scale-95 transition-all text-slate-500"
                                >
                                    <Handshake size={14} />
                                </button>
                            )}

                            {/* Search Icon (Overview Only) */}
                            {isOverview && (
                                <button
                                    onClick={() => setIsSearchModalOpen(true)}
                                    className="size-9 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/5 active:scale-95 transition-all text-slate-500"
                                >
                                    <Search size={14} />
                                </button>
                            )}

                        </div>

                        {/* Profile Avatar + LVL Badge (Very Right) */}
                        <button
                            className="relative flex items-center active:scale-95 transition-all"
                            onClick={() => setIsUserMenuOpen(true)}
                        >
                            <div className="size-9 rounded-full ring-2 ring-primary/10 overflow-hidden bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0">
                                {user?.avatar?.url ? (
                                    <img src={user.avatar.url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] font-black uppercase">{user?.name?.charAt(0)}</span>
                                )}
                            </div>
                            {user?.level > 0 && (
                                <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[7px] font-black px-1.5 py-0.5 rounded-md shadow-lg border border-primary/20 scale-110">
                                    {user.level}
                                </div>
                            )}
                        </button>
                    </div>

                    {/* XP Progress Line at the very bottom edge */}
                    {user?.level > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-200 dark:bg-white/10 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ 
                                    width: `${Math.min(100, Math.max(0, (((user.exp || 0) - (user.totalRequired || 0)) / (user.nextLevelExp || 100)) * 100))}%` 
                                }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full bg-primary shadow-[0_0_8px_var(--primary-glow)]"
                            />
                        </div>
                    )}
                </div>

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
                        hidden md:flex relative z-[150] h-full flex-col transition-all duration-[600ms] ease-[0.16,1,0.3,1]
                        ${location.pathname === '/dashboard' ? 'md:w-72' : 'md:w-20'}
                    `}
                >
                    {/* 1. Sidebar Header: Logo */}
                    <div className="h-24 flex items-center px-6 shrink-0">
                        <div className="flex items-center gap-5 group cursor-pointer relative" onClick={() => isMobileMenuOpen ? setIsMobileMenuOpen(false) : navigate('/dashboard')}>
                            <Logo className="size-8" color="currentColor" glow={false} />

                            <div className={`flex items-center overflow-hidden transition-all duration-500 ease-in-out
                                ${(location.pathname === '/dashboard' || isMobileMenuOpen) ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden md:flex'}
                            `}>
                                <span className="font-black text-[11px] uppercase tracking-[0.8em] leading-none text-black dark:text-white">Produs</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Primary Navigation */}
                    <div className="flex-1 px-4 py-8 overflow-visible min-h-0">
                        <div className="flex flex-col gap-1.5">
                            {navItems.map((item, idx) => {
                                const isOverview = location.pathname === '/dashboard';
                                const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard');
                                
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
                                        {!isMobileMenuOpen && (
                                            <div className={`absolute left-0 top-[calc(50%-12px)] w-[2px] transition-colors duration-500 bg-slate-200 dark:bg-white/10
                                                ${idx === navItems.length - 1 ? 'bg-gradient-to-b !from-current !to-transparent opacity-40' : ''}
                                            `} />
                                        )}

                                        <div className="relative flex items-center w-full h-full">
                                            <div className={`absolute flex items-center justify-center size-[18px] z-50 transition-all duration-500 ${isMobileMenuOpen ? 'left-[36px]' : 'left-[31px]'}`}>
                                                <div className={`absolute inset-[-8px] rounded-full transition-all duration-500
                                                    ${isActive ? 'bg-primary/20 ring-1 ring-primary/30 scale-110 shadow-[0_0_15px_color-mix(in srgb, var(--primary), transparent)]' : 'bg-primary/0 group-hover/nav:bg-primary/10'}
                                                `} />
                                                <span className={`material-symbols-outlined transition-all duration-500 relative z-10
                                                    ${isMobileMenuOpen ? 'text-[24px]' : 'text-[19px]'}
                                                    ${isActive ? 'text-primary scale-110' : 'text-slate-400 group-hover/nav:text-primary group-hover/nav:scale-110'}
                                                `}>
                                                    {item.icon}
                                                </span>
                                            </div>

                                            <div className={`flex items-center absolute pointer-events-none transition-all duration-[400ms] ease-[0.16,1,0.3,1] z-50
                                                ${(location.pathname === '/dashboard' || isMobileMenuOpen)
                                                    ? `left-0 relative ${isMobileMenuOpen ? 'pl-20' : 'pl-14 md:pl-16'} opacity-100 translate-x-0 w-max`
                                                    : 'hidden md:flex left-[60px] bg-black dark:bg-white px-3.5 py-2.5 rounded shadow-xl opacity-0 -translate-x-2 group-hover/nav:opacity-100 group-hover/nav:translate-x-0 w-max border border-white/10 dark:border-black/10'}
                                            `}>
                                                <div className={`flex items-center ${(location.pathname === '/dashboard' || isMobileMenuOpen) ? 'gap-4' : 'gap-0'}`}>
                                                <div className={`h-px bg-primary transition-all duration-300 ${(location.pathname === '/dashboard' && !isMobileMenuOpen) ? 'w-4' : 'w-0 hidden'}`} />
                                                    <span className={`font-black uppercase tracking-[0.4em] whitespace-nowrap transition-all duration-300 mt-[1px]
                                                        ${isMobileMenuOpen ? 'text-[11px]' : 'text-[10px]'}
                                                        ${(location.pathname === '/dashboard' || isMobileMenuOpen)
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

                    {/* 3. Sidebar Footer: Identity HUD */}
                    <div className={`mt-auto p-4 md:p-6 flex flex-col items-start gap-4 transition-all duration-[600ms] shrink-0
                        ${(location.pathname === '/dashboard' || isMobileMenuOpen) ? 'pl-[20px]' : 'pl-[16px]'}
                    `}>



                        {/* 2.5 Currency Display (Desktop) */}
                        <div className={`mb-2 flex items-center gap-4 transition-all duration-500
                            ${(location.pathname === '/dashboard' || isMobileMenuOpen) ? 'opacity-100' : 'opacity-100'}
                        `}>
                            <div 
                                className="size-10 flex items-center justify-center cursor-pointer group/shop shrink-0"
                                onClick={() => navigate('/dashboard/shop')} // Store navigation
                                title="Open Terminal Shop"
                            >
                                {(location.pathname === '/dashboard' || isMobileMenuOpen) ? (
                                    <Logo className="size-5 text-black dark:text-white" color="currentColor" glow={false} />
                                ) : (
                                    <div className="relative">
                                        <ShoppingBag size={18} className="text-slate-400 group-hover/shop:text-primary transition-colors" />
                                        <div className="absolute -top-1 -right-1 size-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_var(--primary-glow)]" />
                                    </div>
                                )}
                            </div>
                            
                            <AnimatePresence>
                                {(location.pathname === '/dashboard' || isMobileMenuOpen) && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        className="flex flex-col cursor-pointer"
                                        onClick={() => navigate('/dashboard/shop')}
                                    >
                                        <CoinDisplay amount={user?.rpg?.prodCoins || 0} className="scale-90 origin-left sidebar-coin-display" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative flex items-center gap-4 group" ref={profileRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(true)}
                                className="size-10 rounded-full ring-2 ring-primary/10 hover:ring-primary/40 overflow-hidden transition-all active:scale-95 bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0 relative group/avatar"
                            >
                                {user?.avatar?.url ? (
                                    <img src={user.avatar.url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs font-bold">{user?.name?.charAt(0)}</span>
                                )}
                            </button>

                                <AnimatePresence mode="wait">
                                    {(location.pathname === '/dashboard' || isMobileMenuOpen) && (
                                        <motion.div 
                                            key="profile-greeting"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                            className={`${isMobileMenuOpen ? 'flex' : 'hidden md:flex'} flex-col whitespace-nowrap overflow-hidden max-w-[140px]`}
                                        >
                                            <div className="flex flex-col gap-0 w-full">
                                                {/* ROW 1: Username & XP Status */}
                                                <div className="flex items-end justify-between w-full pr-1">
                                                    <p className="text-[8px] font-black text-black dark:text-white leading-none uppercase tracking-[0.2em]">
                                                        @{user.username || 'OPERATOR'}
                                                    </p>
                                                    {user.level > 0 && (
                                                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] leading-none">
                                                            {user.exp - (user.totalRequired || 0)}/{user.nextLevelExp || 100}XP
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {/* ROW 2: Level & Progress Bar */}
                                                <div className="w-full">
                                                    {user?.level === 0 ? (
                                                        <span className="text-[8px] font-black text-rose-500 uppercase tracking-[0.3em] animate-pulse">SHUT-IN_STATUS</span>
                                                    ) : (
                                                        <LevelDisplay 
                                                            level={user?.level} 
                                                            exp={user?.exp} 
                                                            totalRequired={user?.totalRequired}
                                                            nextLevelExp={user?.nextLevelExp}
                                                            showXP={false}
                                                            className="w-full" 
                                                        />
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
                <div className={`flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-[400ms] ease-[0.16,1,0.3,1]`}>
                    {isOverview && !isAdminPage && (
                        <div className="hidden md:block absolute top-0 left-0 right-0 z-40 h-40 pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-[var(--background)]/95 to-transparent backdrop-blur-xl [mask-image:linear-gradient(to_bottom,black_20%,transparent),linear-gradient(to_right,transparent,black_10%,black_75%,transparent)] [-webkit-mask-composite:source-in] [mask-composite:intersect]" />
                            <div className="relative pl-8 lg:pl-12 pr-24 lg:pr-32 pt-8 pb-4 pointer-events-auto">
                                <DashboardHeader user={user} />
                            </div>
                        </div>
                    )}

                    <div 
                        ref={mainRef}
                        className={`flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar flex flex-col relative mt-16 md:mt-0 ${isOverview ? 'md:pt-24' : 'md:pt-0'}`}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.main 
                                key={location.pathname}
                                initial={{ x: "100%", opacity: 1 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: "-10%", opacity: 0, scale: 0.96, pointerEvents: 'none' }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className={`relative z-0 flex-1 flex justify-start pb-32 md:pb-12 px-0 md:pl-8 md:pr-24 lg:pl-12 lg:pr-32 w-full ${isOverview ? '' : 'pt-6 md:pt-0'}`}
                            >
                                <Outlet context={{ setIsSearchModalOpen, setIsNotificationModalOpen, unreadCount, viewMode, setViewMode, protocolMode, setProtocolMode }} />
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
                    onOpenStats={() => setIsStatsModalOpen(true)}
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
                
                {isStatsModalOpen && (
                    <StatsModal 
                        isOpen={isStatsModalOpen} 
                        onClose={() => setIsStatsModalOpen(false)} 
                        user={user}
                    />
                )}
                
                {isOnboardingOpen && (
                    <OnboardingModal 
                        isOpen={isOnboardingOpen} 
                        onClose={() => setIsOnboardingOpen(false)} 
                    />
                )}

                <OperationModeModal 
                    isOpen={isOperationModalOpen} 
                    onClose={() => setIsOperationModalOpen(false)} 
                />

                <DashboardScrollIndicator />
                <MobileBottomNav />
            </div>
        </DashboardContext.Provider>
    );
}

export default Layout;
