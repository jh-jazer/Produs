import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import useConnectivityStore from '../store/useConnectivityStore';
import SyncService from '../services/SyncService';

export const DashboardContext = React.createContext();

// Compact header pill showing sync status + connectivity (Icon only)
function SyncStatusPill({ isOnline, userId, isOverview, isMobile }) {
    const [syncInfo, setSyncInfo] = React.useState(() => SyncService.getSyncStatus());

    React.useEffect(() => {
        const unsub = SyncService.subscribe(setSyncInfo);
        return unsub;
    }, []);

    const handleForceSync = () => {
        if (userId) SyncService.syncAll(userId);
    };

    const statusColor = !isOnline
        ? 'text-signal-orange bg-signal-orange/10 border-signal-orange/20'
        : syncInfo.syncStatus === 'error'
            ? 'text-rose-500 bg-rose-500/10 border-rose-500/20'
            : syncInfo.syncStatus === 'syncing'
                ? 'text-electric-blue bg-electric-blue/10 border-electric-blue/20'
                : 'text-black/50 dark:text-white/40 bg-black/[0.04] dark:bg-white/[0.04] border-black/[0.07] dark:border-white/10';

    const statusIcon = !isOnline ? 'cloud_off'
        : syncInfo.syncStatus === 'error' ? 'sync_problem'
            : syncInfo.syncStatus === 'syncing' ? 'sync'
                : 'cloud_done';

    const statusText = !isOnline ? 'Offline'
        : syncInfo.syncStatus === 'syncing' ? 'Syncing'
            : 'Synced';

    const title = !isOnline ? 'Offline — changes will sync when reconnected'
        : syncInfo.syncStatus === 'syncing' ? 'Syncing…'
            : syncInfo.syncStatus === 'error' ? 'Sync failed — click to retry'
                : syncInfo.lastSyncedAt
                    ? `Synced at ${syncInfo.lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Click to sync';

    return (
        <button
            onClick={handleForceSync}
            title={title}
            className={`flex items-center gap-3 size-10 rounded-xl border transition-all duration-700 hover:opacity-80 active:scale-95 ${statusColor} 
                ${(isOverview && !isMobile) ? 'w-auto px-4' : 'w-10 px-0 justify-center'}
            `}
        >
            <motion.span
                animate={syncInfo.isSyncing ? { rotate: 360 } : { rotate: 0 }}
                transition={syncInfo.isSyncing ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
                className="material-symbols-outlined text-[18px]"
            >
                {statusIcon}
            </motion.span>
            
            {isOverview && !isMobile && (
                <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap animate-in fade-in duration-1000">
                    {statusText}
                </span>
            )}
        </button>
    );
}

function FrozenRoute({ context }) {
    const outlet = useOutlet();
    const [frozenOutlet] = useState(outlet);
    return (
        <div className="w-full flex justify-center">
            {frozenOutlet}
        </div>
    );
}

function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, syncUser, viewMode, setViewMode } = useAuthStore();
    const isOnline = useConnectivityStore(state => state.isOnline);
    const [deferredPath, setDeferredPath] = useState(location.pathname);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Delay architectural shifts (sidebar width/padding) 
        // until the old content has started fading out effectively (400ms)
        const timer = setTimeout(() => {
            setDeferredPath(location.pathname);
        }, 50);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    useEffect(() => {
        // Close mobile menu on route change
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isBugModalOpen, setIsBugModalOpen] = useState(false);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

    const profileRef = useRef(null);
    const { data: notifications = [] } = useSWR('/notifications');
    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        // Apply Dark Mode from settings
        if (user?.settings?.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Apply Theme from settings
        if (user?.settings?.theme) {
            const themes = [
                { id: 'classic', color: '#135bec' },
                { id: 'rose', color: '#ec4899' },
                { id: 'forest', color: '#10b981' },
                { id: 'amber', color: '#f59e0b' },
                { id: 'midnight', color: '#6366f1' },
            ];
            const theme = themes.find(t => t.id === user.settings.theme);
            if (theme) {
                document.documentElement.style.setProperty('--primary', theme.color);
                document.documentElement.setAttribute('data-theme', theme.id);
            }
        }
    }, [user?.settings?.darkMode, user?.settings?.theme]);

    useEffect(() => {
        const handleUserSelected = () => {
            setIsSearchModalOpen(false);
        };
        window.addEventListener('user-selected', handleUserSelected);
        return () => window.removeEventListener('user-selected', handleUserSelected);
    }, []);

    // Perform data synchronization for offline-first architecture
    useEffect(() => {
        if (user?._id && isOnline) {
            SyncService.syncAll(user._id);
        }
    }, [user?._id, isOnline]);


    useSWR('/auth/me', {
        refreshInterval: 15000,
        onSuccess: (data) => {
            if (JSON.stringify(data.incomingPartnerRequest) !== JSON.stringify(user?.incomingPartnerRequest) ||
                JSON.stringify(data.outgoingPartnerRequest) !== JSON.stringify(user?.outgoingPartnerRequest) ||
                data.partner?._id !== user?.partner?._id) {
                syncUser(data);
            }
        }
    });


    const handleSignOut = () => {
        logout();
        navigate('/auth');
    };

    const navItems = [
        { name: 'Overview', path: '/dashboard', icon: 'dashboard' },
        { name: 'Habits', path: '/dashboard/habits', icon: 'check_circle' },
        { name: 'Planner', path: '/dashboard/planner', icon: 'event' },
        { name: 'Finance', path: '/dashboard/finance', icon: 'payments' },
        { name: 'Journal', path: '/dashboard/journal', icon: 'book' },
    ];

    return (
        <div
            className="bg-[#f8f8f8] dark:bg-[#000000] dark:bg-grid bg-grid-light font-display text-[#111111] dark:text-slate-100 h-screen flex flex-row overflow-hidden"
        >
            {/* Mobile Top Bar */}
            <div className={`md:hidden fixed top-0 left-0 right-0 h-16 flex items-center px-6 z-[130] transition-all duration-300 ${isMobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                <div
                    className="flex items-center gap-4 group cursor-pointer relative"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <div className={`size-6 shrink-0 flex items-center justify-center bg-black dark:bg-white rotate-45 transition-all group-hover:bg-electric-blue ${isMobileMenuOpen ? 'rotate-0 scale-110 bg-electric-blue' : ''}`} />
                    <span className="font-bold text-[11px] uppercase tracking-[0.8em] text-black dark:text-white">
                        Produs
                    </span>
                </div>
            </div>

            {/* Mobile Backdrop Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Tactical System Sidebar */}
            <aside 
                className={`flex flex-col fixed md:absolute left-0 top-0 h-full transition-all duration-[400ms] ease-[0.16,1,0.3,1] z-[120]
                    ${isMobileMenuOpen ? 'translate-x-0 w-72 bg-[#f8f8f8]/90 dark:bg-[#050505]/90 backdrop-blur-xl border-r border-black/[0.08] dark:border-white/10' : '-translate-x-full md:translate-x-0'}
                    ${!isMobileMenuOpen && (deferredPath === '/dashboard'
                        ? 'md:w-72 md:bg-transparent md:border-none'
                        : 'md:w-20 md:bg-[#f8f8f8]/80 md:dark:bg-[#050505]/80 md:backdrop-blur-md md:border-r md:border-black/[0.08] md:dark:border-white/10')}
                `}
            >
                {/* 1. Sidebar Header: Brand Interface */}
                {/* Mobile Close Button */}
                {isMobileMenuOpen && (
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden absolute top-3 right-6 size-10 flex items-center justify-center rounded-full bg-black/[0.05] dark:bg-white/[0.05] text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-all z-10"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                )}
                <div className="pt-0 md:pt-10 flex flex-col gap-0 md:gap-8">
                    <div
                        className="h-16 flex items-center gap-4 group cursor-pointer relative px-6 md:px-0 md:pl-[28px]"
                        onClick={() => {
                            navigate('/dashboard');
                            setIsMobileMenuOpen(false);
                        }}
                    >
                        <div className={`size-6 shrink-0 flex items-center justify-center bg-black dark:bg-white rotate-45 transition-all group-hover:bg-electric-blue group-hover:rotate-0 ${isMobileMenuOpen ? 'rotate-0' : ''}`} />
                        
                        {/* Connecting Spine to Nav Items */}
                        <div className="absolute left-[35px] md:left-[39px] top-[48px] md:top-10 h-[24px] md:h-10 w-[2px] bg-slate-200 dark:bg-white/10 hidden md:block" />

                        <span className={`font-bold text-[11px] uppercase tracking-[0.8em] text-black dark:text-white transition-all duration-500 overflow-hidden whitespace-nowrap
                            ${(deferredPath === '/dashboard' || isMobileMenuOpen) ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
                        `}>
                            Produs
                        </span>
                    </div>

                    {/* 2. Sidebar Body: Dendritic Tree Navigation */}
                    <div className="relative flex flex-col py-4 mt-2 md:mt-0">
                        {navItems.map((item, idx) => {
                            const isActive = item.path === '/dashboard' 
                                ? location.pathname === '/dashboard' 
                                : location.pathname.startsWith(item.path);
                            const isOverview = deferredPath === '/dashboard' || isMobileMenuOpen;
                            
                            return (
                                <motion.button
                                    key={item.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + (idx * 0.05) }}
                                    onClick={() => {
                                        navigate(item.path);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="relative group/nav flex items-center h-16 pl-0 outline-none"
                                >
                                    {/* Spine Segments */}
                                    <div className={`absolute left-[39px] top-0 h-[calc(50%-12px)] w-[2px] transition-colors duration-500 bg-slate-200 dark:bg-white/10`} />
                                    <div className={`absolute left-[39px] bottom-0 h-[calc(50%-12px)] w-[2px] transition-colors duration-500 bg-slate-200 dark:bg-white/10
                                        ${idx === navItems.length - 1 ? 'bg-gradient-to-b !from-current !to-transparent opacity-40' : ''}
                                    `} />

                                    {/* Icon Node */}
                                    <div className="relative flex items-center w-full h-full">
                                        <div className="absolute left-[31px] flex items-center justify-center size-[18px] z-50">
                                            <div className={`absolute inset-[-8px] rounded-full transition-all duration-500 
                                                ${isActive ? 'bg-electric-blue/20 ring-1 ring-electric-blue/30 scale-110 shadow-[0_0_15px_rgba(0,183,255,0.2)]' : 'bg-electric-blue/0 group-hover/nav:bg-electric-blue/10'}
                                            `} />
                                            <span className={`material-symbols-outlined text-[19px] transition-all duration-500 relative z-10 
                                                ${isActive ? 'text-electric-blue scale-110' : 'text-slate-400 group-hover/nav:text-electric-blue group-hover/nav:scale-110'}
                                            `}>
                                                {item.icon}
                                            </span>
                                        </div>

                                        {/* Labels */}
                                        <div className={`flex items-center absolute left-0 w-max pointer-events-none transition-all duration-[400ms] ease-[0.16,1,0.3,1]
                                            ${isOverview ? 'relative pl-14 md:pl-16 opacity-100 translate-x-0' : 'pl-16 opacity-0 -translate-x-12 group-hover/nav:opacity-100 group-hover/nav:translate-x-[-10px] group-hover/nav:pl-14 group-hover/nav:pointer-events-auto'}
                                        `}>
                                            <div className="flex items-center gap-4">
                                                <div className={`h-px bg-electric-blue transition-all duration-300 ${isOverview ? 'w-4' : 'w-0 group-hover/nav:w-4'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-[0.4em] whitespace-nowrap transition-all duration-300
                                                    ${isActive ? 'text-black dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover/nav:text-black dark:group-hover:text-white'}
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

                {/* 3. Sidebar Footer: System Actions */}
                <div className="mt-auto p-4 md:p-6 flex flex-col items-start pl-[20px] gap-5 border-t border-black/[0.06] dark:border-white/10">
                    <SyncStatusPill isOnline={isOnline} userId={user?._id} isOverview={deferredPath === '/dashboard' || isMobileMenuOpen} isMobile={isMobileMenuOpen} />

                    <div className="relative flex items-center gap-4 group" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="size-10 rounded-full ring-2 ring-electric-blue/10 hover:ring-electric-blue/40 overflow-hidden transition-all active:scale-95 bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0"
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
                                    className="flex flex-col whitespace-nowrap"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-black/40 dark:text-white/40 leading-none">
                                        {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}
                                    </span>
                                    <span className="text-xs font-bold text-black dark:text-white mt-0.5">
                                        {user?.name?.split(' ')[0]}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <>
                                    {/* Mobile Centered Modal Backdrop */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setIsProfileOpen(false)}
                                        className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-[190]"
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, x: 10, scale: 0.95, y: 0 }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                            scale: 1,
                                            y: 0,
                                            left: (typeof window !== "undefined" && window.innerWidth < 768) ? "50%" : "100%",
                                            top: (typeof window !== "undefined" && window.innerWidth < 768) ? "50%" : "auto",
                                            bottom: (typeof window !== "undefined" && window.innerWidth < 768) ? "auto" : 0
                                        }}
                                        exit={{ opacity: 0, x: 10, scale: 0.95 }}
                                        className="fixed md:absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:top-auto md:left-full md:translate-x-0 md:translate-y-0 md:bottom-0 ml-0 md:ml-4 w-[90vw] md:w-56 bg-white dark:bg-[#121212] rounded-[32px] md:rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 p-4 md:p-2 z-[200] flex flex-col gap-1"
                                    >
                                    <div className="p-3 border-b border-black/[0.06] dark:border-white/[0.06] mb-1 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mb-1">Authenticated As</p>
                                            <p className="text-xs font-bold text-black dark:text-white">{user?.name}</p>
                                        </div>
                                        <button onClick={() => setIsProfileOpen(false)} className="md:hidden size-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white">
                                            <span className="material-symbols-outlined text-2xl">close</span>
                                        </button>
                                    </div>
                                    <button onClick={() => { setIsProfileOpen(false); navigate('/dashboard/profile'); }} className="w-full px-4 md:px-3 py-3 md:py-2 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-[16px] md:rounded-xl transition-all flex items-center gap-3">
                                        <span className="material-symbols-outlined text-lg">person</span> Profile
                                    </button>
                                    {user?.email === 'ernestodesabillejr@gmail.com' && (
                                        <button onClick={() => { setIsProfileOpen(false); navigate('/dashboard/admin'); }} className="w-full px-4 md:px-3 py-3 md:py-2 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-[16px] md:rounded-xl transition-all flex items-center gap-3">
                                            <span className="material-symbols-outlined text-lg">admin_panel_settings</span> Manage
                                        </button>
                                    )}
                                    <button onClick={() => { setIsProfileOpen(false); setIsNotificationModalOpen(true); }} className="w-full px-4 md:px-3 py-3 md:py-2 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-[16px] md:rounded-xl transition-all flex items-center gap-3 relative">
                                        <span className="material-symbols-outlined text-lg">notifications</span> Notifications
                                        {unreadCount > 0 && (
                                            <span className="absolute left-6 top-2 size-2 bg-primary rounded-full border border-white dark:border-[#121212]" />
                                        )}
                                    </button>
                                    <button onClick={() => { setIsProfileOpen(false); setIsSettingsModalOpen(true); }} className="w-full px-4 md:px-3 py-3 md:py-2 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-[16px] md:rounded-xl transition-all flex items-center gap-3">
                                        <span className="material-symbols-outlined text-lg">settings</span> Settings
                                    </button>
                                    <div className="h-px bg-black/[0.06] dark:bg-white/[0.06] my-1" />
                                    <button onClick={() => { setIsProfileOpen(false); setIsBugModalOpen(true); }} className="w-full px-4 md:px-3 py-3 md:py-2 text-left text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-[16px] md:rounded-xl transition-all flex items-center gap-3">
                                        <span className="material-symbols-outlined text-lg">bug_report</span> Bug Report
                                    </button>
                                    <button onClick={handleSignOut} className="w-full px-4 md:px-3 py-3 md:py-2 text-left text-[10px] font-bold uppercase tracking-widest text-signal-orange hover:bg-signal-orange/5 rounded-[16px] md:rounded-xl transition-all flex items-center gap-3">
                                        <span className="material-symbols-outlined text-lg">logout</span> Sign Out
                                    </button>
                                </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </aside>

            {/* Main Application Interface */}
            <div className={`flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-[400ms] ease-[0.16,1,0.3,1]
                ${deferredPath === '/dashboard' ? 'md:pl-0' : 'md:pl-20'}
                ${isMobileMenuOpen ? 'blur-md' : 'blur-0'}
            `}>

                <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar flex flex-col relative mt-16 md:mt-0">
                    <DashboardContext.Provider value={{ setIsSearchModalOpen }}>
                        <AnimatePresence mode="wait">
                            <motion.main 
                                key={location.pathname}
                                initial={{ x: "100%", opacity: 1 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: "-10%", opacity: 0, scale: 0.96, filter: "blur(12px)" }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="flex-1 flex justify-center pb-32 md:pb-12 px-4 md:px-6 lg:px-10 w-full"
                            >
                                <FrozenRoute context={{ setIsSearchModalOpen }} />
                            </motion.main>
                        </AnimatePresence>
                    </DashboardContext.Provider>
                </div>
            </div>

            {/* Notification Portal Removed */}

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
                />
            )}
            
            {isOnboardingOpen && (
                <OnboardingModal 
                    isOpen={isOnboardingOpen} 
                    onClose={() => setIsOnboardingOpen(false)} 
                />
            )}
        </div>
    );
}

export default Layout;
