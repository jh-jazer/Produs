import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
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
import useConnectivityStore from '../store/useConnectivityStore';
import SyncService from '../services/SyncService';

// Compact header pill showing sync status + connectivity (Icon only)
function SyncStatusPill({ isOnline, userId }) {
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
            className={`flex items-center justify-center size-8 rounded-lg border transition-all hover:opacity-80 active:scale-95 ${statusColor}`}
        >
            <motion.span
                animate={syncInfo.isSyncing ? { rotate: 360 } : { rotate: 0 }}
                transition={syncInfo.isSyncing ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
                className="material-symbols-outlined text-[18px]"
            >
                {statusIcon}
            </motion.span>
        </button>
    );
}

function Layout() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLogoDropdownOpen, setIsLogoDropdownOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isBugModalOpen, setIsBugModalOpen] = useState(false);

    const { user, logout, syncUser, viewMode, setViewMode } = useAuthStore();
    const isOnline = useConnectivityStore(state => state.isOnline);

    const logoDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (logoDropdownRef.current && !logoDropdownRef.current.contains(event.target)) {
                setIsLogoDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
            setIsMobileMenuOpen(false);
        };
        window.addEventListener('user-selected', handleUserSelected);
        return () => window.removeEventListener('user-selected', handleUserSelected);
    }, []);

    // Perform data synchronization for offline-first architecture
    // Added: Automatic sync when connection is restored
    useEffect(() => {
        if (user?._id && isOnline) {
            SyncService.syncAll(user._id);
        }
    }, [user?._id, isOnline]);

    const { data: notifications = [], mutate: mutateNotifications } = useSWR(user ? '/notifications' : null, {
        refreshInterval: 30000
    });

    const navigate = useNavigate();
    const location = useLocation();
    const profileRef = useRef(null);

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'Overview';
        if (path.includes('/habits')) return 'Habits';
        if (path.includes('/planner')) return 'Planner';
        if (path.includes('/finance')) return 'Finance';
        if (path.includes('/journal')) return 'Journal';
        if (path.includes('/admin')) return 'Admin';
        return 'Produs';
    };

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

    const mergedNotifications = React.useMemo(() => {
        const list = [...notifications].map(n => ({
            ...n,
            id: n._id,
            time: new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        }));
        if (user?.incomingPartnerRequest) {
            list.unshift({
                id: 'partner-request',
                text: `${user.incomingPartnerRequest.name} wants to share orbits! 🤝`,
                time: "Request Pending",
                read: false,
                icon: "favorite",
                color: "text-rose-500",
                isShareRequest: true
            });
        }
        return list;
    }, [notifications, user?.incomingPartnerRequest]);

    const unreadCount = mergedNotifications.filter(n => !n.read).length;

    const handleSignOut = () => {
        logout();
        navigate('/auth');
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications');
            mutateNotifications();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleNotificationClick = async (n) => {
        if (n.isShareRequest) {
            navigate('/dashboard/profile');
            setIsNotificationsOpen(false);
            return;
        }

        if (!n.read) {
            try {
                await api.patch(`/notifications/${n.id}`);
                mutateNotifications();
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }

        if (n.type === 'finance') navigate('/dashboard/finance');
        if (n.type === 'habit') navigate('/dashboard/habits');

        setIsNotificationsOpen(false);
    };

    const navItems = [
        { name: 'Overview', path: '/dashboard', icon: 'dashboard' },
        { name: 'Habits', path: '/dashboard/habits', icon: 'check_circle' },
        { name: 'Planner', path: '/dashboard/planner', icon: 'event' },
        { name: 'Finance', path: '/dashboard/finance', icon: 'payments' },
        { name: 'Journal', path: '/dashboard/journal', icon: 'book' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-[#f8f8f8] dark:bg-[#000000] dark:bg-grid bg-grid-light font-display text-[#111111] dark:text-slate-100 h-screen flex flex-col overflow-hidden"
        >
            <div className="layout-container flex h-full flex-col relative">
                {/* Cinematic Floating Nav */}
                <motion.nav
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="sticky top-0 left-0 w-full z-[100] px-4 md:px-10 py-6 md:py-10 flex justify-between items-center bg-transparent"
                >
                    {/* Brand / Logo with Dropdown */}
                    <div 
                        ref={logoDropdownRef}
                        className="relative flex items-center gap-3 md:gap-4 group cursor-pointer" 
                        onClick={() => setIsLogoDropdownOpen(!isLogoDropdownOpen)}
                    >
                        <div className={`size-5 md:size-6 flex items-center justify-center bg-black dark:bg-white transition-all group-hover:bg-electric-blue ${isLogoDropdownOpen ? 'rotate-0' : 'rotate-45'}`} />
                        <span className="font-bold text-[10px] md:text-[11px] uppercase tracking-[0.5em] md:tracking-[0.8em] text-black/80 dark:text-white/80 group-hover:text-black dark:group-hover:text-white transition-all hidden sm:inline-block">Produs</span>

                        <AnimatePresence>
                            {isLogoDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 10, rotateX: -20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10, rotateX: -20 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    className="absolute left-0 top-full mt-6 w-64 bg-white dark:bg-[#050505] border border-black/[0.08] dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-[110] overflow-hidden ar-corners origin-top-left"
                                >
                                    <div className="py-4 flex flex-col">
                                        <div className="px-6 py-2 mb-2 font-bold text-[9px] uppercase tracking-[0.5em] text-black/30 dark:text-white/20 border-b border-black/[0.05] dark:border-white/[0.05]">Navigation</div>
                                        {navItems.map((item, idx) => (
                                            <motion.button
                                                key={item.name}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(item.path);
                                                    setIsLogoDropdownOpen(false);
                                                }}
                                                className="w-full px-6 py-4 text-left flex items-center gap-4 group/item hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[18px] text-black/30 dark:text-white/20 group-hover/item:text-electric-blue transition-colors">{item.icon}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/50 dark:text-white/40 group-hover/item:text-black dark:group-hover:text-white group-hover/item:tracking-[0.6em] transition-all">{item.name}</span>
                                            </motion.button>
                                        ))}
                                        <div className="mt-4 px-6 pt-4 border-t border-black/[0.05] dark:border-white/[0.05]">
                                            <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-black/20 dark:text-white/10 flex items-center gap-2 italic">
                                                <span className="size-1 rounded-full bg-electric-blue" /> Cinematic Motion
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                        {/* Sync + Connectivity Status Pill */}
                        <SyncStatusPill isOnline={isOnline} userId={user?._id} />
                        
                        {/* Mobile Menu Trigger */}
                        <button
                            className="lg:hidden relative size-8 flex items-center justify-center rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-black/40 dark:text-white/40 transition-colors"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <span className="material-symbols-outlined text-[20px]">menu</span>
                        </button>

                        {/* Mobile Perspective Toggle */}
                        {user?.partner && (
                            <button
                                onClick={() => setViewMode(viewMode === 'me' ? 'partner' : 'me')}
                                title={`Switch to ${viewMode === 'me' ? 'Shared' : 'My'} view`}
                                className={`sm:hidden relative size-10 flex items-center justify-center rounded-full transition-all active:scale-95 ${viewMode === 'partner' ? 'bg-electric-blue/10 text-electric-blue' : 'text-black/50 dark:text-white/40 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-electric-blue dark:hover:text-electric-blue'}`}
                            >
                                <span className="material-symbols-outlined text-[24px]">group</span>
                                {viewMode === 'partner' && <span className="absolute bottom-1 right-1 size-2.5 bg-signal-orange border-[1.5px] border-white dark:border-[#050505] rounded-full" />}
                            </button>
                        )}
                        
                        <div className="relative shrink-0" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="relative bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-electric-blue/20 overflow-hidden bg-black/10 dark:bg-white/10 flex items-center justify-center text-xl font-bold text-black/50 dark:text-white/50 hover:ring-electric-blue/40 transition-all active:scale-95"
                            >
                                <Avatar config={user?.avatar} />
                                {unreadCount > 0 && <span className="absolute top-0 right-0 size-3 bg-rose-500 rounded-full border-2 border-background-light dark:border-background-dark pointer-events-none" />}
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-52 bg-white dark:bg-[#121212] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-black/[0.08] dark:border-white/10 py-2 z-50 overflow-hidden ar-corners"
                                    >
                                        <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.06] mb-1 font-semibold text-[9px] text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">Account</div>
                                        <button onClick={() => { navigate('/dashboard/profile'); setIsProfileOpen(false); }} className="w-full px-4 py-2.5 text-left text-xs font-semibold text-black/70 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center gap-3 transition-colors">
                                            <span className="material-symbols-outlined text-lg">dashboard</span> Profile
                                        </button>
                                        {user?.email === 'ernestodesabillejr@gmail.com' && (
                                            <button 
                                                onClick={() => { navigate('/dashboard/admin'); setIsProfileOpen(false); }} 
                                                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-electric-blue hover:bg-electric-blue/5 flex items-center gap-3 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">admin_panel_settings</span> Manage
                                            </button>
                                        )}
                                        <button onClick={() => { setIsNotificationsOpen(true); setIsProfileOpen(false); }} className="w-full px-4 py-2.5 text-left text-xs font-semibold text-black/70 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center justify-between transition-colors">
                                            <div className="flex items-center gap-3"><span className="material-symbols-outlined text-lg">notifications</span> Notifications</div>
                                            {unreadCount > 0 && <span className="bg-signal-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                                        </button>
                                        <button onClick={() => { setIsSettingsModalOpen(true); setIsProfileOpen(false); }} className="w-full px-4 py-2.5 text-left text-xs font-semibold text-black/70 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center gap-3 transition-colors">
                                            <span className="material-symbols-outlined text-lg">settings</span> Settings
                                        </button>
                                        <button onClick={() => { setIsBugModalOpen(true); setIsProfileOpen(false); }} className="w-full px-4 py-2.5 text-left text-xs font-semibold text-signal-orange/80 hover:bg-signal-orange/5 flex items-center gap-3 transition-colors">
                                            <span className="material-symbols-outlined text-lg">bug_report</span> Report Bug
                                        </button>
                                        <div className="h-px bg-black/[0.06] dark:bg-white/[0.06] my-1.5"></div>
                                        <button onClick={handleSignOut} className="w-full px-4 py-2.5 text-left text-xs font-semibold text-signal-orange hover:bg-signal-orange/5 flex items-center gap-3 transition-colors">
                                            <span className="material-symbols-outlined text-lg">logout</span> Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#121212] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-black/[0.08] dark:border-white/10 p-2 overflow-hidden z-[60] ar-corners"
                                    >
                                        <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center gap-3">
                                            <button onClick={() => { setIsNotificationsOpen(false); setIsProfileOpen(true); }} className="size-8 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center justify-center transition-colors -ml-2">
                                                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                                            </button>
                                            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] dark:text-white flex-1">Notifications</h4>
                                            {unreadCount > 0 && <button onClick={markAllAsRead} className="text-[9px] font-semibold text-electric-blue hover:underline uppercase tracking-[0.3em]">Mark all read</button>}
                                        </div>
                                        <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                                            {mergedNotifications.length > 0 ? (
                                                <div className="p-2 space-y-1">
                                                    {mergedNotifications.map((n) => (
                                                        <button key={n.id} onClick={() => handleNotificationClick(n)} className={`w-full text-left p-3 rounded-2xl flex gap-3 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors relative group ${!n.read ? 'bg-black/[0.03] dark:bg-electric-blue/5' : ''}`}>
                                                            <div className={`size-10 shrink-0 rounded-xl bg-black/[0.04] dark:bg-[#000000] flex items-center justify-center ${n.color}`}><span className="material-symbols-outlined text-xl">{n.icon}</span></div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-xs font-semibold leading-snug mb-1 ${!n.read ? 'text-black dark:text-white' : 'text-black/50 dark:text-white/40'}`}>{n.text}</p>
                                                                <p className="text-[10px] text-black/40 dark:text-white/30 font-medium">{n.time}</p>
                                                            </div>
                                                            {!n.read && <div className="absolute right-3 top-1/2 -translate-y-1/2 size-1.5 bg-electric-blue rounded-full" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center text-[11px] text-black/40 dark:text-white/30 font-medium uppercase tracking-[0.3em]">All caught up</div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.nav>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
                            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 left-0 h-full w-72 z-[80] bg-[#f8f8f8] dark:bg-[#050505] border-r border-black/[0.08] dark:border-white/10 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:hidden">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.06]">
                                    <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                                        <div className="size-8 flex items-center justify-center rounded-lg overflow-hidden bg-white shadow-none ring-1 ring-black/10 dark:ring-white/10">
                                            <img src="/produs-logo.png" alt="Produs Logo" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-black dark:text-white text-[11px] font-semibold uppercase tracking-[0.5em]">Produs</span>
                                    </NavLink>
                                    <button onClick={() => setIsMobileMenuOpen(false)} className="size-8 flex items-center justify-center rounded-lg text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors">
                                        <span className="material-symbols-outlined text-xl">close</span>
                                    </button>
                                </div>

                                <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.06]">
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            setIsSearchModalOpen(true);
                                        }}
                                        className="w-full px-4 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-[#121212]/30 flex items-center gap-3 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-all active:scale-95 group"
                                    >
                                        <span className="material-symbols-outlined text-[20px] group-hover:text-electric-blue transition-colors">search</span>
                                        <span className="text-xs font-semibold uppercase tracking-[0.3em]">Search Users</span>
                                    </button>
                                </div>

                                <nav className="flex flex-col gap-1 p-4 flex-1">
                                    {navItems.map((item) => (
                                        <NavLink 
                                            key={item.name} 
                                            to={item.path} 
                                            end={item.name === 'Overview'} 
                                            onClick={() => setIsMobileMenuOpen(false)} 
                                            className={({ isActive }) => `px-4 py-3 rounded-xl text-[11px] font-semibold uppercase tracking-[0.3em] flex items-center gap-3 transition-colors ${isActive ? 'bg-electric-blue/10 text-electric-blue' : 'text-black/60 dark:text-white/60 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-black dark:hover:text-white'}`}
                                        >
                                            <span className="material-symbols-outlined text-xl">{item.icon}</span> {item.name}
                                        </NavLink>
                                    ))}
                                </nav>
                                <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.06] text-center text-[9px] text-black/30 dark:text-white/20 font-medium uppercase tracking-[0.4em]">Produs &copy; {new Date().getFullYear()}</div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <main className="flex-1 flex justify-center pb-32 md:pb-12 px-4 md:px-6 lg:px-10">
                        <Outlet />
                    </main>
                </div>

                <AnimatePresence>
                    {isSearchModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vw] px-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSearchModalOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} className="relative w-full max-w-lg bg-white dark:bg-[#121212] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-black/[0.08] dark:border-white/10 overflow-hidden flex flex-col max-h-[80vh] ar-corners">
                                <div className="flex items-center justify-between p-4 border-b border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02]">
                                    <button onClick={() => setIsSearchModalOpen(false)} className="size-8 flex items-center justify-center rounded-full text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"><span className="material-symbols-outlined text-[20px]">close</span></button>
                                </div>
                                <UserSearch onSelect={() => setIsSearchModalOpen(false)} />
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
                <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
                <BugReportModal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} />
                <OnboardingModal isOpen={!!user && !user.onboardingCompleted} />
            </div>
        </motion.div>
    );
}

export default Layout;
