import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import ProfileModal from './ui/ProfileModal';
import SettingsModal from './ui/SettingsModal';
import OnboardingModal from './ui/OnboardingModal';
import Avatar from './ui/Avatar';



function Layout() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const { user, logout, setCredentials } = useAuthStore();

    // Fetch Notifications from Backend
    const { data: notifications = [], mutate: mutateNotifications } = useSWR(user ? '/notifications' : null, {
        refreshInterval: 30000 // Refresh every 30s
    });

    const navigate = useNavigate();
    const profileRef = useRef(null);
    const mobileMenuRef = useRef(null);

    // Periodically refresh user data to catch new partner requests
    const { data: updatedUserData } = useSWR('/auth/me', {
        refreshInterval: 15000, // Refresh every 15 seconds
        onSuccess: (data) => {
            // Only update if something changed to avoid unnecessary re-renders
            if (JSON.stringify(data.incomingPartnerRequest) !== JSON.stringify(user?.incomingPartnerRequest) ||
                JSON.stringify(data.outgoingPartnerRequest) !== JSON.stringify(user?.outgoingPartnerRequest) ||
                data.partner?._id !== user?.partner?._id) {
                setCredentials(data);
            }
        }
    });

    // Merge system notifications with dynamic partner requests
    const mergedNotifications = React.useMemo(() => {
        const list = [...notifications].map(n => ({
            ...n,
            id: n._id,
            time: new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        }));
        if (user?.incomingPartnerRequest) {
            list.unshift({
                id: 'partner-request',
                text: `${user.incomingPartnerRequest.name} wants to link orbits! 🤝`,
                time: "Request Pending",
                read: false,
                icon: "favorite",
                color: "text-rose-500",
                isPartnerRequest: true
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
        if (n.isPartnerRequest) {
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
        
        // Potential deep linking based on type
        if (n.type === 'finance') navigate('/dashboard/finance');
        if (n.type === 'habit') navigate('/dashboard/habits');
        
        setIsNotificationsOpen(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col overflow-x-hidden custom-scrollbar"
        >
            <div className="layout-container flex h-full grow flex-col">
                {/* Header */}
                <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-10 py-3">
                    <div className="flex items-center gap-4">
                        <div className="size-8 flex items-center justify-center rounded-lg overflow-hidden bg-white shadow-sm ring-1 ring-slate-900/10">
                            <img src="/produs-logo.png" alt="Produs Logo" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] hidden sm:block">Produs</h2>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <NavLink
                            to="/dashboard"
                            end
                            className={({ isActive }) =>
                                isActive
                                    ? "text-slate-900 dark:text-white border-b-2 border-primary pb-1 transition-colors text-sm font-bold"
                                    : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                            }
                        >
                            Overview
                        </NavLink>
                        <NavLink
                            to="/dashboard/habits"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-slate-900 dark:text-white border-b-2 border-primary pb-1 transition-colors text-sm font-bold"
                                    : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                            }
                        >
                            Habits
                        </NavLink>
                        <NavLink
                            to="/dashboard/planner"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-slate-900 dark:text-white border-b-2 border-primary pb-1 transition-colors text-sm font-bold"
                                    : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                            }
                        >
                            Planner
                        </NavLink>
                        <NavLink
                            to="/dashboard/finance"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-slate-900 dark:text-white border-b-2 border-primary pb-1 transition-colors text-sm font-bold"
                                    : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                            }
                        >
                            Finance
                        </NavLink>
                        <NavLink
                            to="/dashboard/journal"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-slate-900 dark:text-white border-b-2 border-primary pb-1 transition-colors text-sm font-bold"
                                    : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                            }
                        >
                            Journal
                        </NavLink>
                    </nav>

                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Mobile Menu Toggle */}
                        <div className="md:hidden relative" ref={mobileMenuRef}>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="relative size-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors active:scale-95"
                            >
                                <span className="material-symbols-outlined text-[22px]">
                                    {isMobileMenuOpen ? 'close' : 'menu'}
                                </span>
                            </button>

                            <AnimatePresence>
                                {isMobileMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-3 w-48 bg-white dark:bg-[#192233] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden z-[60] flex flex-col gap-1"
                                    >
                                        <NavLink to="/dashboard" end onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${isActive ? 'bg-primary/10 text-primary dark:text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                            <span className="material-symbols-outlined text-lg">dashboard</span> Overview
                                        </NavLink>
                                        <NavLink to="/dashboard/habits" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${isActive ? 'bg-primary/10 text-primary dark:text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                            <span className="material-symbols-outlined text-lg">check_circle</span> Habits
                                        </NavLink>
                                        <NavLink to="/dashboard/planner" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${isActive ? 'bg-primary/10 text-primary dark:text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                            <span className="material-symbols-outlined text-lg">event</span> Planner
                                        </NavLink>
                                        <NavLink to="/dashboard/finance" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${isActive ? 'bg-primary/10 text-primary dark:text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                            <span className="material-symbols-outlined text-lg">payments</span> Finance
                                        </NavLink>
                                        <NavLink to="/dashboard/journal" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${isActive ? 'bg-primary/10 text-primary dark:text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                            <span className="material-symbols-outlined text-lg">book</span> Journal
                                        </NavLink>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Profile & Notifications */}
                        <div className="relative" ref={profileRef}>
                            <div className="relative inline-block">
                                <button
                                    onClick={() => {
                                        if (isNotificationsOpen) {
                                            setIsNotificationsOpen(false);
                                        } else {
                                            setIsProfileOpen(!isProfileOpen);
                                        }
                                    }}
                                    className="relative bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-primary/20 overflow-hidden bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500 hover:ring-primary/40 transition-all active:scale-95"
                                >
                                    <Avatar config={user?.avatar} />
                                </button>
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 size-3 bg-rose-500 rounded-full border-2 border-background-light dark:border-background-dark pointer-events-none" />
                                )}
                            </div>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute right-0 mt-3 w-48 bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 overflow-hidden"
                                    >
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Account</p>
                                        </div>


                                        <button
                                            onClick={() => { navigate('/dashboard/profile'); setIsProfileOpen(false); }}
                                            className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">dashboard</span>
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => { setIsNotificationsOpen(true); setIsProfileOpen(false); }}
                                            className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-lg">notifications</span>
                                                Notifications
                                            </div>
                                            {unreadCount > 0 && (
                                                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => { setIsSettingsModalOpen(true); setIsProfileOpen(false); }}
                                            className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">settings</span>
                                            Settings
                                        </button>
                                        <div className="h-px bg-slate-100 dark:border-slate-800 my-1 mx-2"></div>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full px-4 py-2.5 text-left text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-3 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">logout</span>
                                            Sign Out
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
                                        className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#192233] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden z-[60]"
                                    >
                                        <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
                                            <button
                                                onClick={() => { setIsNotificationsOpen(false); setIsProfileOpen(true); }}
                                                className="size-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors -ml-2"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                                            </button>
                                            <h4 className="text-sm font-black dark:text-white flex-1">Notifications</h4>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                                            {mergedNotifications.length > 0 ? (
                                                <div className="p-2 space-y-1">
                                                    {mergedNotifications.map((n) => (
                                                        <button
                                                            key={n.id}
                                                            onClick={() => handleNotificationClick(n)}
                                                            className={`w-full text-left p-3 rounded-2xl flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative group ${!n.read ? 'bg-slate-50/50 dark:bg-primary/5' : ''}`}
                                                        >
                                                            <div className={`size-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center ${n.color}`}>
                                                                <span className="material-symbols-outlined text-xl">{n.icon}</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-xs font-bold leading-snug mb-1 ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                                                    {n.text}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-medium">{n.time}</p>
                                                            </div>
                                                            {!n.read && (
                                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 size-1.5 bg-primary rounded-full" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <span className="material-symbols-outlined text-4xl text-slate-200 dark:text-slate-800 mb-2">notifications_off</span>
                                                    <p className="text-xs text-slate-400 font-medium tracking-tight">All caught up!</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <main className="flex-1 flex justify-center py-6 px-4 md:px-8">
                    <Outlet />
                </main>

                {/* Modals */}
                <ProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    user={user}
                />
                <SettingsModal
                    isOpen={isSettingsModalOpen}
                    onClose={() => setIsSettingsModalOpen(false)}
                />

                <OnboardingModal
                    isOpen={!!user && !user.onboardingCompleted}
                />
            </div>
        </motion.div>
    );
}

export default Layout;
