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

function Layout() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isBugModalOpen, setIsBugModalOpen] = useState(false);

    const { user, logout, syncUser } = useAuthStore();

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
            className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 h-screen flex flex-col overflow-hidden"
        >
            <div className="layout-container flex h-full flex-col">
                <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-10 py-3">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            className="md:hidden relative size-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors active:scale-95"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <span className="material-symbols-outlined text-[22px]">menu</span>
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="sm:hidden font-ubuntu text-xl font-black tracking-tight text-slate-900 dark:text-white transition-all">
                                {getPageTitle()}
                            </span>
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="size-8 flex items-center justify-center rounded-lg overflow-hidden bg-white shadow-sm ring-1 ring-slate-900/10">
                                    <img src="/produs-logo.png" alt="Produs Logo" className="w-full h-full object-cover" />
                                </div>
                                <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">Produs</h2>
                            </div>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        {['Overview', 'Habits', 'Planner', 'Finance', 'Journal'].map((item) => (
                            <NavLink
                                key={item}
                                to={item === 'Overview' ? '/dashboard' : `/dashboard/${item.toLowerCase()}`}
                                end={item === 'Overview'}
                                className={({ isActive }) =>
                                    isActive
                                        ? "text-slate-900 dark:text-white border-b-2 border-primary pb-1 transition-colors text-sm font-bold"
                                        : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                                }
                            >
                                {item}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={() => setIsSearchModalOpen(true)}
                            className="relative size-10 flex items-center justify-center rounded-full text-slate-500 hover:text-primary transition-colors active:scale-95"
                            aria-label="Search users"
                        >
                            <span className="material-symbols-outlined text-[24px]">search</span>
                        </button>
                        
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="relative bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-primary/20 overflow-hidden bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500 hover:ring-primary/40 transition-all active:scale-95"
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
                                        className="absolute right-0 mt-3 w-48 bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 overflow-hidden"
                                    >
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-1 font-bold text-xs text-slate-400 uppercase tracking-widest">Account</div>
                                        <button onClick={() => { navigate('/dashboard/profile'); setIsProfileOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors">
                                            <span className="material-symbols-outlined text-lg">dashboard</span> Profile
                                        </button>
                                        {user?.email === 'ernestodesabillejr@gmail.com' && (
                                            <button 
                                                onClick={() => { navigate('/dashboard/admin'); setIsProfileOpen(false); }} 
                                                className="w-full px-4 py-2.5 text-left text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-3 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">admin_panel_settings</span> Manage
                                            </button>
                                        )}
                                        <button onClick={() => { setIsNotificationsOpen(true); setIsProfileOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors">
                                            <div className="flex items-center gap-3"><span className="material-symbols-outlined text-lg">notifications</span> Notifications</div>
                                            {unreadCount > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                                        </button>
                                        <button onClick={() => { setIsSettingsModalOpen(true); setIsProfileOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors">
                                            <span className="material-symbols-outlined text-lg">settings</span> Settings
                                        </button>
                                        <button onClick={() => { setIsBugModalOpen(true); setIsProfileOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm font-bold text-rose-500/80 hover:bg-rose-50 dark:hover:bg-rose-900/10 flex items-center gap-3 transition-colors">
                                            <span className="material-symbols-outlined text-lg">bug_report</span> Report Bug
                                        </button>
                                        <div className="h-px bg-slate-200 dark:bg-slate-700 my-1.5 mx-0"></div>
                                        <button onClick={handleSignOut} className="w-full px-4 py-2.5 text-left text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-3 transition-colors">
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
                                        className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#192233] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden z-[60]"
                                    >
                                        <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
                                            <button onClick={() => { setIsNotificationsOpen(false); setIsProfileOpen(true); }} className="size-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors -ml-2">
                                                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                                            </button>
                                            <h4 className="text-sm font-black dark:text-white flex-1">Notifications</h4>
                                            {unreadCount > 0 && <button onClick={markAllAsRead} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Mark all as read</button>}
                                        </div>
                                        <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                                            {mergedNotifications.length > 0 ? (
                                                <div className="p-2 space-y-1">
                                                    {mergedNotifications.map((n) => (
                                                        <button key={n.id} onClick={() => handleNotificationClick(n)} className={`w-full text-left p-3 rounded-2xl flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative group ${!n.read ? 'bg-slate-50/50 dark:bg-primary/5' : ''}`}>
                                                            <div className={`size-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center ${n.color}`}><span className="material-symbols-outlined text-xl">{n.icon}</span></div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-xs font-bold leading-snug mb-1 ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{n.text}</p>
                                                                <p className="text-[10px] text-slate-400 font-medium">{n.time}</p>
                                                            </div>
                                                            {!n.read && <div className="absolute right-3 top-1/2 -translate-y-1/2 size-1.5 bg-primary rounded-full" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center text-xs text-slate-400 font-medium">All caught up!</div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
                            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 left-0 h-full w-72 z-[80] bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl md:hidden">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 flex items-center justify-center rounded-lg overflow-hidden bg-white shadow-sm ring-1 ring-slate-900/10">
                                            <img src="/produs-logo.png" alt="Produs Logo" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">Produs</span>
                                    </div>
                                    <button onClick={() => setIsMobileMenuOpen(false)} className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <span className="material-symbols-outlined text-xl">close</span>
                                    </button>
                                </div>
                                <nav className="flex flex-col gap-1 p-4 flex-1">
                                    {['Overview', 'Habits', 'Planner', 'Finance', 'Journal'].map((name) => (
                                        <NavLink key={name} to={name === 'Overview' ? '/dashboard' : `/dashboard/${name.toLowerCase()}`} end={name === 'Overview'} onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                            <span className="material-symbols-outlined text-xl">
                                                {name === 'Overview' && 'dashboard'}
                                                {name === 'Habits' && 'check_circle'}
                                                {name === 'Planner' && 'event'}
                                                {name === 'Finance' && 'payments'}
                                                {name === 'Journal' && 'book'}
                                            </span> {name}
                                        </NavLink>
                                    ))}
                                </nav>
                                <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 font-medium">Produs &copy; {new Date().getFullYear()}</div>
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
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSearchModalOpen(false)} className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} className="relative w-full max-w-lg bg-white dark:bg-[#192233] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
                                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                                    <button onClick={() => setIsSearchModalOpen(false)} className="size-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"><span className="material-symbols-outlined text-[20px]">close</span></button>
                                </div>
                                <UserSearch />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user} />
                <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
                <BugReportModal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} />
                <OnboardingModal isOpen={!!user && !user.onboardingCompleted} />
            </div>
        </motion.div>
    );
}

export default Layout;
