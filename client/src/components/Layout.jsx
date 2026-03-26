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

export const DashboardContext = React.createContext();


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

            {/* Sidebar Backdrop Mobile */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-md z-[140]"
                    />
                )}
            </AnimatePresence>

            {/* Main Side Navigation */}
            <aside
                className={`
                    fixed md:relative z-[150] h-full flex flex-col transition-all duration-[600ms] ease-[0.16,1,0.3,1]
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${(deferredPath === '/dashboard' || (isMobileMenuOpen && deferredPath === '/dashboard')) ? 'w-72' : 'w-20'}
                    ${isMobileMenuOpen ? 'bg-[#f8f8f8]/90 dark:bg-[#050505]/90 backdrop-blur-xl border-r border-black/[0.08] dark:border-white/10 shadow-2xl' : ''}
                    ${deferredPath === '/dashboard' || isMobileMenuOpen ? 'border-r border-black/[0.08] dark:border-white/10' : ''}
                `}
            >
                {/* 1. Sidebar Header: Logo */}
                <div className="h-24 flex items-center px-6 shrink-0">
                    <div className="flex items-center gap-5 group cursor-pointer relative" onClick={() => navigate('/dashboard')}>
                        <div className={`size-6 shrink-0 flex items-center justify-center bg-black dark:bg-white rotate-45 transition-all group-hover:bg-electric-blue group-hover:rotate-0 ${isMobileMenuOpen ? 'rotate-0' : ''}`} />
                        <div className={`hidden md:flex flex-col overflow-hidden transition-all duration-500 ease-in-out
                            ${(deferredPath === '/dashboard') ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
                        `}>
                            <span className="font-black text-[11px] uppercase tracking-[0.8em] leading-none text-black dark:text-white">Produs</span>
                            <span className="text-[8px] font-bold text-electric-blue uppercase tracking-widest mt-1.5 opacity-60">System Core</span>
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
                                    className={`relative group/nav flex items-center h-12 rounded-2xl transition-all duration-300
                                        ${isActive ? 'bg-black/[0.04] dark:bg-white/[0.06]' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}
                                        ${!isOverview ? 'w-12' : 'w-full'}
                                    `}
                                >
                                    {/* Active Indicator Line */}
                                    <div className={`absolute left-0 top-[calc(50%-12px)] w-[2px] transition-colors duration-500 bg-slate-200 dark:bg-white/10
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
                                        <div className={`hidden md:flex items-center absolute left-0 w-max pointer-events-none transition-all duration-[400ms] ease-[0.16,1,0.3,1]
                                            ${isOverview ? 'relative pl-14 md:pl-16 opacity-100 translate-x-0' : 'pl-16 opacity-0 -translate-x-12 group-hover/nav:opacity-100 group-hover/nav:translate-x-[-10px] group-hover/nav:pl-14 group-hover/nav:pointer-events-auto'}
                                        `}>
                                            <div className="flex items-center gap-4">
                                                <div className={`h-px bg-electric-blue transition-all duration-300 ${isOverview ? 'w-4' : 'w-0'}`} />
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
                <div className={`mt-auto p-4 md:p-6 flex flex-col items-start pl-[20px] gap-5 transition-all duration-[600ms] 
                    ${(deferredPath === '/dashboard') ? 'border-t border-black/[0.06] dark:border-white/10' : 'border-t-0'}
                `}>

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
                            {(deferredPath === '/dashboard') && (
                                <motion.div 
                                    key="profile-greeting"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                    className="hidden md:flex flex-col whitespace-nowrap"
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
