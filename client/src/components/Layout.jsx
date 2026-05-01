import React, { useState, useEffect, useRef, useContext } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import SideEnergyBar from './dashboard/SideEnergyBar';
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
import CoreDisplay from './ui/CoreDisplay';
import EnergyDisplay from './ui/EnergyDisplay';
import DecisionModal from './ui/DecisionModal';
import ScrollIndicator from './landing/ScrollIndicator';
import HudButtons from './ui/HudButtons';

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
    const [isLandingModalOpen, setIsLandingModalOpen] = useState(false);
    const [mobileTabs, setMobileTabs] = useState(null); // { tabs, activeTab, setActiveTab }
    const [activeRpgTab, setActiveRpgTab] = useState('home');
    const isNeuralSyncDismissed = useAuthStore((state) => state.isNeuralSyncDismissed);

    // Fetch fresh profile from server — this is the authoritative source of truth.
    // We use it (not localStorage) to decide whether to show onboarding.
    const { data: freshUser } = useSWR(user ? '/auth/me' : null);
    const syncUser = useAuthStore((state) => state.syncUser);

    // Reset scroll position when mode changes
    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTop = 0;
        }
    }, [protocolMode]);

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

    const handleSignOut = () => {
        signOut();
        navigate('/auth');
    };

    const navItems = protocolMode === 'rpg' ? [
        { id: 'home', name: 'SYSTEM_CENTRAL', path: '/dashboard', icon: Cpu },
        { id: 'map', name: 'NEURAL_NETWORK', path: '/dashboard/rpg/map', icon: Zap },
        { id: 'inventory', name: 'CARGO_BAY', path: '/dashboard/rpg/inventory', icon: ShoppingBag },
    ] : [
        { id: 'overview', name: 'Home', path: '/dashboard', icon: Cpu },
        { id: 'intellectual', name: 'Intellectual', path: '/dashboard/intellectual', icon: Zap },
        { id: 'physical', name: 'Physical', path: '/dashboard/physical', icon: Zap },
        { id: 'spiritual', name: 'Spiritual', path: '/dashboard/spiritual', icon: Zap },
        { id: 'financial', name: 'Financial', path: '/dashboard/financial', icon: Zap },
    ];

    return (
        <DashboardContext.Provider value={{
            viewMode,
            setViewMode,
            protocolMode,
            setProtocolMode,
            activeRpgTab,
            setActiveRpgTab,
            setIsOperationModalOpen,
            mobileTabs,
            setMobileTabs
        }}>
            <div className="bg-transparent font-sans text-[#111111] dark:text-slate-100 h-[100dvh] flex flex-row overflow-hidden">
                {/* Mobile Top Bar */}
                <div className="hidden fixed top-0 left-0 right-0 h-20 flex items-center px-4 z-[135] bg-transparent transition-all duration-300 pointer-events-none">
                    <div className="flex items-center w-full pointer-events-auto">
                    
                    {/* Profile Avatar + LVL Badge (Left Side) */}
                    <button
                        className="relative flex items-center active:scale-95 transition-all mr-4 shrink-0 p-[1.5px]"
                        onClick={() => setIsUserMenuOpen(true)}
                    >
                        {/* Circular XP Progress Ring (Mobile Adaption) */}
                        {user?.level > 0 && (
                            <div className="absolute inset-0 size-full">
                                <svg className="size-full -rotate-90">
                                    <circle
                                        cx="18" cy="18" r="17"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.2"
                                        className="text-black/5 dark:text-white/10"
                                    />
                                    <motion.circle
                                        cx="18" cy="18" r="17"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeDasharray="106.81" // 2 * PI * 17
                                        initial={{ strokeDashoffset: 106.81 }}
                                        animate={{ 
                                            strokeDashoffset: 106.81 - (106.81 * Math.min(100, Math.max(0, (((user.exp || 0) - (user.totalRequired || 0)) / (user.nextLevelExp || 100)) * 100))) / 100 
                                        }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="text-primary drop-shadow-[0_0_3px_rgba(var(--primary-rgb),0.3)]"
                                    />
                                </svg>
                            </div>
                        )}

                        <div className="size-9 rounded-full overflow-hidden bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0 relative z-10">
                            {user?.avatar?.url ? (
                                <img src={user.avatar.url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[10px] font-black uppercase">{user?.name?.charAt(0)}</span>
                            )}
                        </div>
                        {user?.level > 0 && (
                            <div className="absolute -bottom-0.5 -right-0.5 bg-primary text-white text-[7px] font-black px-1.5 py-0.5 rounded-md shadow-lg border border-primary/20 scale-100 z-20">
                                {user.level}
                            </div>
                        )}
                    </button>

                    <div
                        className={`flex items-center gap-2.5 active:scale-95 transition-all cursor-pointer group ${isOverview ? 'opacity-100 flex' : 'opacity-0 pointer-events-none hidden md:flex'}`}
                        onClick={() => setIsLandingModalOpen(true)}
                    >
                        <span className="font-black text-[11px] uppercase tracking-[0.8em] leading-none text-slate-800 dark:text-white mt-1">
                            PRODUS
                        </span>
                    </div>

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



                    {/* XP Progress Line at the very bottom edge */}
                    {user?.level > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent overflow-hidden">
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
                    
                    {/* Integrated HUD Buttons for Mobile (Attached to top right) */}
                    <div className="absolute top-0 right-0 pt-2">
                        <HudButtons 
                            onRpgClick={() => setProtocolMode(prev => prev === 'rpg' ? 'reality' : 'rpg')}
                            onPartnerClick={() => setViewMode(prev => prev === 'personal' ? 'partner' : 'personal')}
                            isRpgActive={protocolMode === 'rpg'}
                            isPartnerActive={viewMode === 'partner'}
                        />
                    </div>
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
                        md:w-[18vw]
                    `}
                >
                    {/* 1. Sidebar Header */}
                    <div className="h-24 flex items-center px-2 shrink-0">
                        <div className="flex items-center gap-5 group cursor-pointer relative" onClick={() => setIsLandingModalOpen(true)}>
                            <div className="p-2 md:p-4 transition-all duration-[600ms] opacity-100 translate-y-0">
                                <span className="font-black text-[14px] uppercase tracking-[0.8em] leading-none text-black dark:text-white">Produs</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Primary Navigation */}
                    <div className="flex-1 px-2 pt-7 pb-8 overflow-visible min-h-0">
                        <div className="flex flex-col gap-1">
                            {navItems.map((item, idx) => {
                                const isOverview = location.pathname === '/dashboard';
                                const isActive = protocolMode === 'rpg' 
                                    ? activeRpgTab === item.id 
                                    : (location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard'));
                                
                                return (
                                    <motion.button
                                        key={item.id}
                                        onClick={() => {
                                            if (protocolMode === 'rpg') {
                                                if (location.pathname !== '/dashboard') navigate('/dashboard');
                                                setActiveRpgTab(item.id);
                                            } else {
                                                navigate(item.path);
                                            }
                                        }}
                                        className={`relative group/nav flex items-center rounded-2xl transition-all duration-300
                                            ${isMobileMenuOpen ? 'h-16 w-full px-4' : 'h-10 w-full'}
                                        `}
                                    >
                                        {!isMobileMenuOpen && (
                                            <div className={`absolute left-0 top-[calc(50%-12px)] w-[2px] transition-colors duration-500 bg-slate-200 dark:bg-white/10
                                                ${idx === navItems.length - 1 ? 'bg-gradient-to-b !from-current !to-transparent opacity-40' : ''}
                                            `} />
                                        )}

                                        <div className="relative flex items-center w-full h-full">

                                            <div className={`
                                                absolute transition-all duration-[600ms] ease-[0.16,1,0.3,1] z-20
                                                left-0 relative ${isMobileMenuOpen ? 'pl-20' : 'pl-6 md:pl-8'} opacity-100 translate-x-0 w-max
                                            `}>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-sans font-black uppercase tracking-[0.4em] whitespace-nowrap transition-all duration-300 mt-[1px]
                                                        ${isMobileMenuOpen ? 'text-[11px]' : 'text-[10px]'}
                                                        ${isActive 
                                                            ? 'text-black dark:text-white drop-shadow-[0_0_12px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]' 
                                                            : 'text-slate-500 group-hover/nav:text-black dark:group-hover/nav:text-white'}
                                                    `}>
                                                        {item.name}
                                                    </span>
                                                    {isActive && (
                                                        <motion.div 
                                                            layoutId="sidebarActiveIndicator"
                                                            className="size-1 rounded-full bg-black dark:bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Sidebar Footer: Identity HUD */}
                    <div className="mt-auto p-4 md:p-6 flex flex-col items-start gap-4 transition-all duration-[600ms] shrink-0 pl-[20px]">



                        {/* 2.5 Currency Display (Desktop) */}
                        <div className="mb-2 flex flex-col gap-3 transition-all duration-500">
                            <div 
                                className="flex flex-col items-start gap-1 cursor-pointer"
                                onClick={() => navigate('/dashboard/shop')}
                                title="Open Terminal Shop"
                            >
                                <EnergyDisplay 
                                    current={user?.rpg?.energy?.current ?? (10 + (user?.level || 0))} 
                                    max={10 + (user?.level || 0)} 
                                    variant="minimal" 
                                    className="scale-90 origin-left"
                                />
                                <CoreDisplay amount={user?.rpg?.cores || 0} className="sidebar-core-display" variant="minimal" />
                                <CoinDisplay amount={user?.rpg?.prodCoins || 0} className="sidebar-coin-display" variant="minimal" />
                            </div>
                        </div>

                        <div className="relative flex items-center gap-4 group" ref={profileRef}>
                            <div className="relative shrink-0 p-[2px]">
                                {/* Circular XP Progress Ring */}
                                {user?.level > 0 && (
                                    <div className="absolute inset-0 size-full">
                                        <svg className="size-full -rotate-90">
                                            <circle
                                                cx="20" cy="20" r="19"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                className="text-black/5 dark:text-white/10"
                                            />
                                            <motion.circle
                                                cx="20" cy="20" r="19"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeDasharray="119.38" // 2 * PI * 19
                                                initial={{ strokeDashoffset: 119.38 }}
                                                animate={{ 
                                                    strokeDashoffset: 119.38 - (119.38 * Math.min(100, Math.max(0, (((user.exp || 0) - (user.totalRequired || 0)) / (user.nextLevelExp || 100)) * 100))) / 100 
                                                }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="text-black dark:text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.3)]"
                                            />
                                        </svg>
                                    </div>
                                )}

                                <button
                                    onClick={() => setIsUserMenuOpen(true)}
                                    className="size-10 rounded-full overflow-hidden transition-all active:scale-95 bg-black/10 dark:bg-white/10 flex items-center justify-center relative group/avatar z-10"
                                >
                                    {user?.avatar?.url ? (
                                        <img src={user.avatar.url} alt="Profile" className="w-full h-full object-cover grayscale contrast-125" />
                                    ) : (
                                        <span className="text-xs font-bold">{user?.name?.charAt(0)}</span>
                                    )}
                                </button>

                                {user?.level > 0 && (
                                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-white text-black text-[7px] font-black px-1 py-0.5 rounded-md shadow-lg border border-black/10 scale-110 z-20 pointer-events-none">
                                        {user.level}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col whitespace-nowrap overflow-hidden max-w-[140px]">
                                <div className="flex flex-col gap-0 w-full">
                                    <p className="text-[10px] font-black text-black dark:text-white leading-none uppercase tracking-[0.2em]">
                                        @{(user.username || 'OPERATOR').split('#')[0].replace(/\d+/g, '')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Application Interface */}
                <div className={`flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-[400ms] ease-[0.16,1,0.3,1]`}>

                    <div 
                        ref={mainRef}
                        className={`flex-1 overflow-x-hidden ${protocolMode === 'rpg' ? 'overflow-y-hidden' : 'overflow-y-auto'} custom-scrollbar flex flex-col relative mt-0`}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.main 
                                key={location.pathname}
                                initial={{ x: "100%", opacity: 1 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: "-10%", opacity: 0, scale: 0.96, pointerEvents: 'none' }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className={`relative z-0 flex-1 flex flex-col ${protocolMode === 'rpg' ? 'justify-center pb-0 pt-0' : 'justify-start pb-32 md:pb-12 pt-0 md:pt-1'} px-0 md:pl-4 lg:pl-6 md:pr-8 lg:pr-12 w-full`}
                            >
                                <Outlet context={{ setIsSearchModalOpen, setIsNotificationModalOpen, unreadCount, viewMode, setViewMode, protocolMode, setProtocolMode, activeRpgTab, setActiveRpgTab }} />
                            </motion.main>
                        </AnimatePresence>
                    </div>
                </div>
                
                {/* Right Side HUD: Scroll Indicator & Protocol Toggle */}
                <aside className="hidden md:flex w-[4vw] flex-col items-center justify-between py-12 bg-white/50 dark:bg-black/50 backdrop-blur-sm relative shrink-0">
                    <div className="flex flex-col items-center gap-8 w-full h-full">
                        {/* Scroll Progress Placeholder (Space maintained) */}
                        {protocolMode === 'reality' && (
                            <div className="flex-1 w-full" />
                        )}
                    </div>
                </aside>

                {/* Mobile User Menu Trigger */}
                <div className="md:hidden fixed top-6 right-0 z-[101]">
                    <button 
                        onClick={() => setIsUserMenuOpen(true)}
                        className="pl-6 pr-0 py-2 text-white/60 hover:text-white transition-colors active:scale-90"
                    >
                        <span className="material-symbols-outlined text-4xl">more_vert</span>
                    </button>
                </div>

                {isOverview && (
                    <HudButtons 
                        onRpgClick={() => setProtocolMode(prev => prev === 'rpg' ? 'reality' : 'rpg')}
                        onPartnerClick={() => setViewMode(prev => prev === 'personal' ? 'partner' : 'personal')}
                        isRpgActive={protocolMode === 'rpg'}
                        isPartnerActive={viewMode === 'partner'}
                    />
                )}

                {/* HUD Overlay: Scroll Indicator (Reality Only) */}
                {protocolMode === 'reality' && (
                    <div className="hidden md:block">
                        <ScrollIndicator 
                            variant="dashboard" 
                            containerRef={mainRef} 
                        />
                    </div>
                )}

                <AnimatePresence>
                    {isSearchModalOpen && (
                        <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[10vw] px-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSearchModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} className="relative w-full max-w-lg bg-white dark:bg-[#000000] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-black/[0.08] dark:border-white/10 overflow-hidden flex flex-col max-h-[80vh] ar-corners">
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
                        onOpenBugReport={() => setIsBugModalOpen(true)}
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


                <DecisionModal
                    isOpen={isLandingModalOpen}
                    message="Terminate operative session and return to central hub protocol?"
                    confirmLabel="CONFIRM_EXIT"
                    cancelLabel="STAY_HERE"
                    onConfirm={() => {
                        setIsLandingModalOpen(false);
                        navigate('/');
                    }}
                    onCancel={() => setIsLandingModalOpen(false)}
                />

                <MobileBottomNav />
            </div>
        </DashboardContext.Provider>
    );
}

export default Layout;
