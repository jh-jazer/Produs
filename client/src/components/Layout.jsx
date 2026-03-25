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
import UserMenuModal from "./ui/UserMenuModal";
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
            : 'All changes saved locally and synced';

    return (
        <button
            onClick={handleForceSync}
            title={title}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border transition-all active:scale-95 ${statusColor} ${!isOverview && !isMobile ? 'size-10 justify-center' : ''}`}
        >
            <span className={`material-symbols-outlined text-[18px] ${syncInfo.syncStatus === 'syncing' ? 'animate-spin' : ''}`}>
                {statusIcon}
            </span>
            {(isOverview || isMobile) && (
                <span className="text-[10px] font-black uppercase tracking-widest">{statusText}</span>
            )}
        </button>
    );
}

function FrozenRoute({ context }) {
    const outlet = useOutlet();
    const [frozenOutlet] = useState(outlet);
    return (
        <DashboardContext.Provider value={context}>
            {frozenOutlet}
        </DashboardContext.Provider>
    );
}

function Layout() {
    const { user, signOut } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const isOnline = useConnectivityStore((state) => state.isOnline);
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

    // Fetch notifications
    const { data: notifications = [] } = useSWR('/notifications', (url) => api.get(url).then(res => res.data), {
        refreshInterval: 30000
    });
    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (user && !user.onboardingCompleted) {
            setIsOnboardingOpen(true);
        } else {
            setIsOnboardingOpen(false);
        }
    }, [user?.onboardingCompleted]);

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
        { name: 'Journal', path: '/dashboard/journal', icon: 'book' },
    ];

    return (
        <div
            className="bg-[#f8f8f8] dark:bg-[#000000] dark:bg-grid bg-grid-light font-display text-[#111111] dark:text-slate-100 h-screen flex flex-row overflow-hidden"
        >
            {/* Mobile Top Bar */}
            <div className={`md:hidden fixed top-0 left-0 right-0 h-16 flex items-center px-6 z-[130] transition-all duration-300 ${isMobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                <div
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <div className="size-9 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg shadow-black/10 transition-transform active:scale-90 overflow-hidden">
                        {user?.avatar?.url ? (
                            <img src={user.avatar.url} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-xl">rocket_launch</span>
                        )}
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.4em] text-black dark:text-white group-active:opacity-40 transition-opacity">Produs</span>
                </div>
            </div>

            {/* Sidebar / Navigation (Universal) */}
            <aside
                className={`fixed inset-y-0 left-0 z-[150] w-72 md:w-20 md:hover:w-72 bg-white/80 dark:bg-black/60 backdrop-blur-2xl border-r border-black/[0.06] dark:border-white/10 flex flex-col transition-all duration-700 ease-[0.16,1,0.3,1] group/nav overflow-hidden
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                {/* 1. Sidebar Header: Identity */}
                <div className="p-4 md:p-6 flex flex-col gap-6">
                    <div
                        className={`flex items-center gap-4 transition-all duration-500 overflow-hidden
                            ${deferredPath === '/dashboard' || isMobileMenuOpen ? 'pl-2 opacity-100' : 'pl-0 md:opacity-0 md:group-hover/nav:opacity-100 md:group-hover/nav:pl-2'}
                        `}
                    >
                        <div className="size-10 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shrink-0 shadow-2xl shadow-black/20">
                            <span className="material-symbols-outlined text-xl font-light">rocket_launch</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] leading-none">Produs</span>
                            <span className="text-[9px] font-medium text-black/40 dark:text-white/40 uppercase tracking-[0.1em] mt-1">Intelligence OS</span>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex flex-col gap-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const isOverview = deferredPath === '/dashboard' || isMobileMenuOpen;
                            
                            return (
                                <motion.button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className="relative flex items-center h-12 w-full group/item"
                                    whileHover={{ x: 4 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                >
                                    {/* Active Indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="absolute left-0 w-1 h-6 bg-electric-blue rounded-full z-20"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    <div className="flex items-center w-full px-4 relative">
                                        <div className={`size-10 rounded-xl flex items-center justify-center transition-all duration-500 relative
                                            ${isActive ? 'bg-electric-blue/10' : 'bg-transparent group-hover/nav:bg-black/5 dark:group-hover/nav:bg-white/5'}
                                        `}>
                                            <div className={`absolute inset-0 rounded-xl transition-all duration-500
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
                                            ${isOverview ? 'relative pl-14 md:pl-16 opacity-100 translate-x-0' : 'pl-16 opacity-0 -translate-x-12 md:group-hover/nav:opacity-100 md:group-hover/nav:translate-x-[-10px] md:group-hover/nav:pl-14 md:group-hover/nav:pointer-events-auto'}
                                        `}>
                                            <div className="flex items-center gap-4">
                                                <div className={`h-px bg-electric-blue transition-all duration-300 ${isOverview ? 'w-4' : 'w-0 md:group-hover/nav:w-4'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-[0.4em] whitespace-nowrap transition-all duration-300
                                                    ${isActive ? 'text-black dark:text-white' : 'text-slate-500 dark:text-slate-400 md:group-hover/nav:text-black md:dark:group-hover:text-white'}
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
                            onClick={() => setIsUserMenuOpen(true)}
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

            {/* Mobile Sidebar Close Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden fixed inset-0 z-[140] bg-black/20 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

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
