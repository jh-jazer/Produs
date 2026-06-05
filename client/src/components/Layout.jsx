import React, { useState, useEffect, useRef, useContext } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import SideEnergyBar from './dashboard/SideEnergyBar';
import useSWR from 'swr';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { soundManager } from '../services/sound';
import { 
    Plus, 
    PenTool, 
    Calendar, 
    Layout as LayoutIcon,
    Search,
    Handshake,
    User,
    Bell,
    Lock,
    Zap,
    Cpu,
    ShoppingBag,
    ChevronDown,
    Target,
    BookOpen,
    Clock,
    FileText,
    CreditCard,
    ListChecks
} from 'lucide-react';

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
import QuickActionModal from './ui/QuickActionModal';
import LevelDisplay from './ui/LevelDisplay';
import DashboardHeader from './dashboard/DashboardHeader';
import ConnectionsModal from './ui/ConnectionsModal';
import IdentityEditModal from './ui/IdentityEditModal';
import QRModal from './ui/QRModal';
import AddGoalModal from './ui/AddGoalModal';
import AddEventModal from './ui/AddEventModal';
import { DashboardContext } from '../context/DashboardContext';
import StatsModal from './ui/StatsModal';
import CoinDisplay from './ui/CoinDisplay';
import CoreDisplay from './ui/CoreDisplay';
import EnergyDisplay from './ui/EnergyDisplay';
import DecisionModal from './ui/DecisionModal';
import ScrollIndicator from './landing/ScrollIndicator';
import HudButtons from './ui/HudButtons';
import ThemeToggle from './ui/ThemeToggle';
import { useTheme } from '../hooks/useTheme';
import useMobile from '../hooks/useMobile';
import ProToolsModal from './ui/ProToolsModal';
import ToolsMarketplaceModal from './ui/ToolsMarketplaceModal';
import AddTransactionModal from './ui/AddTransactionModal';
import { useFinance } from '../hooks/useFinance';

const GlobalTransactionPortal = ({ isOpen, onClose }) => {
    const { budgets, addFinanceItem } = useFinance();
    
    const budgetCategories = budgets.map(b => b.category);
    const availableCategories = budgetCategories.length > 0 ? budgetCategories : [
        'General', 'Food', 'Transport', 'Utilities', 'Entertainment',
        'Tech', 'Home', 'Fashion', 'Hobby', 'Fitness', 'Wellness',
        'Education', 'Travel', 'Vehicles', 'Gifts', 'Pets', 'Other'
    ];
    if (!availableCategories.includes('General')) availableCategories.push('General');

    return (
        <AddTransactionModal 
            isOpen={isOpen}
            onClose={onClose}
            addFinanceItem={addFinanceItem}
            availableCategories={availableCategories}
        />
    );
};

const GlobalMobileHeader = ({ activeSection, onClick, protocolMode, shakeMerchant, handleOpenMerchant, isIdPulledDown, onOpenNotifications, hasAnyUnread }) => {
  const [matrixText, setMatrixText] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const { user } = useAuthStore();
  const { setIsUserMenuOpen } = useContext(DashboardContext);
  const location = useLocation();
  const navigate = useNavigate();
  const textToType = "PRODUS";
  const matrixChars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*<>";

  const getPageConfig = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard/habits')) return { id: 'habits', title: 'HABITS TRACKER', subtitle: 'DAILY CONSISTENCY' };
    if (path.startsWith('/dashboard/planner')) return { id: 'planner', title: 'DAILY PLANNER', subtitle: 'SCHEDULE & NOTES' };
    if (path.startsWith('/dashboard/calendar')) {
      const subtitle = activeSection === 'weekly_calendar' ? 'WEEKLY GOALS' : 
                       activeSection === 'yearly_calendar' ? 'ANNUAL GOALS' : 'MONTHLY TIMELINE';
      return { id: 'calendar', title: 'CALENDAR & GOALS', subtitle };
    }
    if (path.startsWith('/dashboard/goals')) return { id: 'goals', title: 'GOALS', subtitle: 'MILESTONES & TARGETS' };
    if (path.startsWith('/dashboard/writing/journal')) return { id: 'spiritual', title: 'JOURNAL', subtitle: 'DAILY REFLECTIONS' };
    if (path.startsWith('/dashboard/writing/notes')) return { id: 'spiritual', title: 'NOTES', subtitle: 'SCRATCHPAD MEMOS' };
    if (path.startsWith('/dashboard/writing/lists')) return { id: 'spiritual', title: 'LISTS', subtitle: 'TASK TRACKING' };
    if (path.startsWith('/dashboard/spiritual') || path.startsWith('/dashboard/writing')) return { id: 'spiritual', title: 'WRITE HUB', subtitle: 'JOURNAL, NOTES & LISTS' };
    if (path.startsWith('/dashboard/financial')) return { id: 'financial', title: 'FINANCIAL HUB', subtitle: 'LEDGER & ACCOUNTS' };
    
    if (activeSection === 'priority') return { id: 'priority', title: 'PRIORITY LIST', subtitle: 'DAILY OBJECTIVES' };
    if (activeSection === 'overview') return { id: 'overview', title: 'FINANCES', subtitle: 'REAL-TIME SYNC' };
    if (activeSection === 'breakdown') return { id: 'breakdown', title: 'TRANSACTIONS', subtitle: 'LEDGER BREAKDOWN' };
    return { id: 'produs', title: 'PRODUS', isMain: true };
  };

  const config = getPageConfig();

  useEffect(() => {
    if (config.isMain) {
      let iteration = 0;
      let currentIdx = 0;
      setMatrixText("");
      setShowProfile(false);

      const timer = setInterval(() => {
        iteration++;
        if (iteration % 3 === 0) currentIdx++;

        if (currentIdx > textToType.length) {
          clearInterval(timer);
          setMatrixText(textToType);
        } else {
          const chars = textToType.split("").map((actualChar, idx) => {
            if (idx < currentIdx) return actualChar;
            return matrixChars[Math.floor(Math.random() * matrixChars.length)];
          });
          setMatrixText(chars.slice(0, currentIdx + 2).join(""));
        }
      }, 40);

      const profileTimer = setTimeout(() => {
        setShowProfile(true);
      }, 2500);

      return () => {
        clearInterval(timer);
        clearTimeout(profileTimer);
      };
    } else {
      setShowProfile(false);
    }
  }, [config.isMain]);


  return (
    <div className="fixed top-8 left-6 right-16 z-[100] md:hidden pointer-events-none flex justify-between items-start layout-mobile-header">
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {config.isMain ? (
            <AnimatePresence mode="wait">
              {!showProfile ? (
                <motion.div
                  key="produs"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.3 }}
                  className="pointer-events-auto cursor-pointer mt-1.5"
                  onClick={onClick}
                >
                  <h1 className="wordmark text-foreground flex items-center font-mono" style={{ fontSize: '14px' }}>
                    <span>{matrixText}</span>
                    <span className="animate-pulse inline-block w-1.5 h-3.5 bg-current ml-0.5 opacity-60 shrink-0" />
                  </h1>
                </motion.div>
              ) : !isIdPulledDown ? (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="pointer-events-auto flex items-center gap-3.5 mt-1 cursor-pointer"
                  onClick={() => setIsUserMenuOpen(true)}
                >
                  {/* Profile Image + Level Badge */}
                  <div className="relative size-14 shrink-0">
                    <div className="size-full rounded-full overflow-hidden border-2 border-black/40 dark:border-white/15 bg-black/5 dark:bg-white/10 flex items-center justify-center">
                      <Avatar config={user?.avatar} />
                    </div>
                    {/* Show guardian level in normal mode, hero level in RPG mode */}
                    {protocolMode === 'rpg' ? (
                      user?.hero && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-amber-500 text-white text-[8px] font-black px-1 py-0.5 rounded-md shadow-md border border-amber-400/20 z-20">
                          {user.hero.level}
                        </div>
                      )
                    ) : (
                      (user?.guardianLevel || 0) > 0 && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-primary text-white text-[8px] font-black px-1 py-0.5 rounded-md shadow-md border border-primary/20 z-20">
                          {user.guardianLevel}
                        </div>
                      )
                    )}
                  </div>
                  

                  <div className="flex items-stretch gap-1.5">
                    {/* Notification Bell Icon */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenNotifications && onOpenNotifications();
                      }}
                      className="flex items-center justify-center px-3 bg-black/5 dark:bg-white/5 border border-black/40 dark:border-white/10 rounded-md hover:bg-black/10 dark:hover:bg-white/10 hover:scale-95 transition-all shadow-sm cursor-pointer relative"
                      title="Notifications"
                    >
                      <span className="material-symbols-outlined text-black dark:text-white text-[20px]">notifications</span>
                      {hasAnyUnread && (
                        <span className="absolute top-1 right-1.5 size-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] animate-pulse" />
                      )}
                    </div>

                    {/* Merchant Quick Access */}
                    <motion.div 
                      animate={{ x: shakeMerchant ? [-6, 6, -6, 6, -3, 3, 0] : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMerchant();
                      }}
                      className="flex items-center justify-center px-3 bg-black/5 dark:bg-white/5 border border-black/40 dark:border-white/10 rounded-md hover:bg-black/10 dark:hover:bg-white/10 hover:scale-95 transition-all shadow-sm cursor-pointer relative"
                      title="Market"
                    >
                      <span className="material-symbols-outlined text-black dark:text-white text-[20px]">shopping_bag</span>
                    </motion.div>

                    {/* Prod points Display */}
                    <div className="flex items-center justify-between gap-1.5 bg-black/5 dark:bg-white/5 border border-black/40 dark:border-white/10 px-3.5 py-2 rounded-md select-none min-w-[96px]">
                      <span className="text-sm font-black uppercase tracking-wider text-amber-500">
                        {user?.rpg?.prodCoins || 0}
                      </span>
                      <span className="text-[11px] font-bold text-black dark:text-white/40 uppercase tracking-[0.2em]">PTS</span>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          ) : (
            <motion.div
              key={config.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-0.5 bg-background/80 backdrop-blur-sm py-1 px-2 -ml-2 rounded-sm pointer-events-auto"
            >
              <span className="text-2xl font-black uppercase tracking-[0.3em] text-black dark:text-white">{config.title}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

function Layout() {
    const { user, signOut } = useAuthStore();
    const { isDark, setThemeMode } = useTheme(); 
    const isMobile = useMobile();
    const [viewMode, setViewMode] = useState('personal'); 
    const [protocolMode, setProtocolMode] = useState('reality'); 
    const mainRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const isOverview = location.pathname === '/dashboard';
    const profileRef = useRef(null);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileModalUser, setProfileModalUser] = useState(null);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isBugModalOpen, setIsBugModalOpen] = useState(false);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isOperationModalOpen, setIsOperationModalOpen] = useState(false);
    const [isLandingModalOpen, setIsLandingModalOpen] = useState(false);
    const [isIdentityEditModalOpen, setIsIdentityEditModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [qrModalMode, setQrModalMode] = useState('choice');
    const [isToolsStoreModalOpen, setIsToolsStoreModalOpen] = useState(false);
    const [isMarketplaceModalOpen, setIsMarketplaceModalOpen] = useState(false);
    const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
    const [isQuickActionModalOpen, setIsQuickActionModalOpen] = useState(false);
    
    const [addEventInitialDate, setAddEventInitialDate] = useState(null);
    const [marketplaceCategory, setMarketplaceCategory] = useState('all');
    const [mobileTabs, setMobileTabs] = useState(null); 
    const [activeRpgTab, setActiveRpgTab] = useState('home');
    const [activeSection, setActiveSection] = useState('produs');
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [isMoreExpanded, setIsMoreExpanded] = useState(false);
    const [isIdPulledDown, setIsIdPulledDown] = useState(false);
    const [activeToasts, setActiveToasts] = useState([]);
    const [showMerchantToast, setShowMerchantToast] = useState(false);
    const [shakeMerchant, setShakeMerchant] = useState(false);

    useEffect(() => {
        if (showMerchantToast) {
            const timer = setTimeout(() => {
                setShowMerchantToast(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showMerchantToast]);

    const handleOpenMerchant = () => {
        setShakeMerchant(true);
        setShowMerchantToast(true);
        setTimeout(() => setShakeMerchant(false), 500);
    };

    const { data: freshUser } = useSWR(user ? '/auth/me' : null);
    const syncUser = useAuthStore((state) => state.syncUser);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (isUserMenuOpen || isSettingsModalOpen) {
            setIsMobileMenuOpen(false);
        }
    }, [isUserMenuOpen, isSettingsModalOpen]);

    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTop = 0;
        }
    }, [protocolMode]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.isContentEditable) return;
            if (e.key.toLowerCase() === 'm') {
                setProtocolMode(prev => prev === 'rpg' ? 'reality' : 'rpg');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (freshUser) syncUser(freshUser);
    }, [freshUser]);

    useEffect(() => {
        if (user && user.onboardingCompleted === false) {
            setIsOnboardingOpen(true);
        }
    }, [user?.onboardingCompleted]);

    const { data: notifications = [] } = useSWR('/notifications', (url) => api.get(url).then(res => res.data), {
        refreshInterval: 30000
    });

    const prevNotificationsRef = useRef([]);
    const isFirstNotificationsMountRef = useRef(true);

    useEffect(() => {
        if (!notifications || notifications.length === 0) return;

        if (isFirstNotificationsMountRef.current) {
            // Track initial notifications on mount
            prevNotificationsRef.current = notifications.map(n => n._id);
            isFirstNotificationsMountRef.current = false;
            return;
        }

        // Detect new unread notifications
        const newUnread = notifications.filter(n => !n.read && !prevNotificationsRef.current.includes(n._id));

        if (newUnread.length > 0) {
            newUnread.forEach(notification => {
                setActiveToasts(prev => {
                    if (prev.some(t => t._id === notification._id)) return prev;
                    return [...prev, notification];
                });

                // Auto-dismiss after 4 seconds
                setTimeout(() => {
                    setActiveToasts(prev => prev.filter(t => t._id !== notification._id));
                }, 4000);

                prevNotificationsRef.current.push(notification._id);
            });
            soundManager.play('notification');
        }

        notifications.forEach(n => {
            if (!prevNotificationsRef.current.includes(n._id)) {
                prevNotificationsRef.current.push(n._id);
            }
        });
    }, [notifications]);

    const { data: activitiesHistory = [] } = useSWR(user ? '/rpg/history' : null, (url) => api.get(url).then(res => res.data), {
        refreshInterval: 10000
    });

    const unreadCount = notifications.filter(n => !n.read).length;
    const unreadActivitiesCount = activitiesHistory.filter(act => !act.read).length;
    const hasAnyUnread = unreadCount > 0 || unreadActivitiesCount > 0;

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
        { id: 'habits', name: 'Habit Tracker', path: '/dashboard/habits', icon: Zap },
        { id: 'planner', name: 'Daily Planner', path: '/dashboard/planner', icon: LayoutIcon },
        { id: 'calendar', name: 'Calendar & Goals', path: '/dashboard/calendar', icon: Calendar },
        { id: 'financial', name: 'Financial Hub', path: '/dashboard/financial', icon: CreditCard },
        { id: 'writing', name: 'Write Hub', path: '/dashboard/writing', icon: PenTool },
    ];

    const proToolsCategories = [
        { id: 'spiritual', name: 'Spiritual', icon: 'auto_awesome', color: { light: '#7C3AED', dark: '#A78BFA' } },
        { id: 'intellectual', name: 'Intellectual', icon: 'psychology', color: { light: '#2563EB', dark: '#60A5FA' } },
        { id: 'physical', name: 'Physical', icon: 'monitor_heart', color: { light: '#DC2626', dark: '#F87171' } },
        { id: 'emotional', name: 'Emotional', icon: 'favorite', color: { light: '#DB2777', dark: '#F472B6' } },
        { id: 'social', name: 'Social', icon: 'group', color: { light: '#059669', dark: '#34D399' } },
        { id: 'financial', name: 'Financial', icon: 'payments', color: { light: '#D97706', dark: '#FBBF24' } },
    ];

    const categoryTools = {
        spiritual: [
            { id: 'journal', icon: 'edit_note', path: '/dashboard/spiritual', tabId: 'journal' },
        ],
        intellectual: [],
        physical: [
            { id: 'workout', icon: 'fitness_center', path: '/dashboard/physical', tabId: 'workout' },
            { id: 'nutrition', icon: 'restaurant', path: '/dashboard/physical', tabId: 'nutrition' },
            { id: 'bmi', icon: 'monitor_weight', path: '/dashboard/physical', tabId: 'bmi' },
            { id: 'water', icon: 'water_drop', path: '/dashboard/physical', tabId: 'water' },
            { id: 'sleep', icon: 'bedtime', path: '/dashboard/physical', tabId: 'sleep' },
        ],
        financial: [
            { id: 'summary', icon: 'account_balance', path: '/dashboard/financial', tabId: 'summary' },
            { id: 'budget', icon: 'pie_chart', path: '/dashboard/financial', tabId: 'budget' },
            { id: 'savings', icon: 'shield', path: '/dashboard/financial', tabId: 'savings' },
            { id: 'wishlist', icon: 'shopping_cart', path: '/dashboard/financial', tabId: 'wishlist' },
            { id: 'debts', icon: 'trending_up', path: '/dashboard/financial', tabId: 'debts' },
        ]
    };

    return (
        <>
            <AnimatePresence>
                {showMerchantToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: "-50%", scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                        exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="fixed top-8 left-1/2 z-[9999] px-6 py-4 bg-black/95 dark:bg-white/95 text-white dark:text-black border border-white/10 dark:border-black/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-3.5 backdrop-blur-md w-max max-w-[90vw]"
                    >
                        <div className="flex flex-col text-center w-full">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">PROTOCOL LOCKED</span>
                            <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest mt-2 leading-none">Merchant locked, coming soon</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <DashboardContext.Provider value={{
            viewMode,
            setViewMode,
            protocolMode,
            setProtocolMode,
            activeRpgTab,
            setActiveRpgTab,
            setIsOperationModalOpen,
            setIsLandingModalOpen,
            setIsConnectionsModalOpen,
            setIsIdentityEditModalOpen,
            setIsQrModalOpen,
            setQrModalMode,
            setIsSearchModalOpen,
            setIsNotificationModalOpen,
            setIsToolsStoreModalOpen,
            setIsMarketplaceModalOpen,
            setIsAddGoalModalOpen,
            setIsAddEventModalOpen,
            setIsAddTransactionModalOpen,
            setAddEventInitialDate,
            marketplaceCategory,
            setMarketplaceCategory,
            mobileTabs,
            setMobileTabs,
            isUserMenuOpen,
            setIsUserMenuOpen
        }}>
            <div className="bg-transparent font-sans text-[#111111] dark:text-black h-[100dvh] flex flex-row overflow-hidden">
                {/* Mobile Top Bar */}
                <div className="hidden fixed top-0 left-0 right-0 h-20 flex items-center px-4 z-[135] bg-transparent transition-all duration-300 pointer-events-none layout-mobile-top-bar">
                    <div className="flex items-center w-full pointer-events-auto">
                    
                    {/* Profile Avatar + LVL Badge (Left Side) */}
                    <button
                        className="relative flex items-center active:scale-95 transition-all mr-4 shrink-0 p-[1.5px]"
                        onClick={() => setIsUserMenuOpen(true)}
                    >
                        {/* EXP progress ring: guardian (reality) or hero (rpg) */}
                        {(protocolMode === 'rpg'
                            ? (user?.hero?.level || 0) > 0
                            : (user?.guardianLevel || 0) > 0
                        ) && (() => {
                            const isRpg = protocolMode === 'rpg';
                            const expVal = isRpg ? (user?.hero?.exp || 0) : (user?.guardianExp || 0);
                            const lvlInfo = isRpg
                                ? { totalRequired: 0, xpToNext: 100 } // hero calc done client-side simply
                                : { totalRequired: user?.totalRequired || 0, xpToNext: user?.nextLevelExp || 100 };
                            const progress = Math.min(100, Math.max(0, ((expVal - lvlInfo.totalRequired) / lvlInfo.xpToNext) * 100));
                            const ringColor = isRpg ? 'text-amber-500' : 'text-primary';
                            return (
                                <div className="absolute inset-0 size-full">
                                    <svg className="size-full -rotate-90">
                                        <circle cx="18" cy="18" r="17" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-black dark:text-white/10" />
                                        <motion.circle
                                            cx="18" cy="18" r="17"
                                            fill="none" stroke="currentColor"
                                            strokeWidth="1.5" strokeLinecap="round"
                                            strokeDasharray="106.81"
                                            initial={{ strokeDashoffset: 106.81 }}
                                            animate={{ strokeDashoffset: 106.81 - (106.81 * progress) / 100 }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className={`${ringColor} drop-shadow-[0_0_3px_rgba(var(--primary-rgb),0.3)]`}
                                        />
                                    </svg>
                                </div>
                            );
                        })()}
                        <div className="size-9 rounded-full overflow-hidden bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0 relative z-10">
                            <Avatar config={user?.avatar} />
                        </div>
                        {/* Level badge */}
                        {protocolMode === 'rpg' ? (
                            (user?.hero?.level || 0) > 0 && (
                                <div className="absolute -bottom-0.5 -right-0.5 bg-amber-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md shadow-lg border border-amber-400/20 scale-100 z-20">
                                    {user.hero.level}
                                </div>
                            )
                        ) : (
                            (user?.guardianLevel || 0) > 0 && (
                                <div className="absolute -bottom-0.5 -right-0.5 bg-primary text-white text-[7px] font-black px-1.5 py-0.5 rounded-md shadow-lg border border-primary/20 scale-100 z-20">
                                    {user.guardianLevel}
                                </div>
                            )
                        )}
                    </button>

                    <div
                        className={`flex items-center gap-2.5 active:scale-95 transition-all cursor-pointer group ${isOverview ? 'opacity-100 flex' : 'opacity-0 pointer-events-none hidden md:flex'}`}
                        onClick={() => setIsLandingModalOpen(true)}
                    >
                        <span className="wordmark text-foreground mt-1">PRODUS</span>
                    </div>

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

                    {/* EXP progress bar at bottom of mobile header */}
                    {(protocolMode === 'rpg' ? (user?.hero?.level || 0) : (user?.guardianLevel || 0)) > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ 
                                    width: protocolMode === 'rpg'
                                        ? `${Math.min(100, Math.max(0, ((user?.hero?.exp || 0) / (user?.nextLevelExp || 100)) * 100))}%`
                                        : `${Math.min(100, Math.max(0, (((user?.guardianExp || 0) - (user?.totalRequired || 0)) / (user?.nextLevelExp || 100)) * 100))}%`
                                }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={`h-full shadow-[0_0_8px_var(--primary-glow)] ${
                                    protocolMode === 'rpg' ? 'bg-amber-500' : 'bg-primary'
                                }`}
                            />
                        </div>
                    )}
                    </div>
                    
                    <div className="absolute top-0 right-0 pt-2">
                        <HudButtons 
                            onRpgClick={() => setProtocolMode(prev => prev === 'rpg' ? 'reality' : 'rpg')}
                            onPartnerClick={() => setViewMode(prev => prev === 'personal' ? 'partner' : 'personal')}
                            isRpgActive={protocolMode === 'rpg'}
                            isPartnerActive={viewMode === 'partner'}
                        />
                    </div>
                </div>

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

                <aside className="hidden md:flex relative z-[150] h-full flex-col transition-all duration-[600ms] ease-[0.16,1,0.3,1] md:w-[18vw] layout-sidebar-left">
                    <div className="h-24 flex items-center px-2 shrink-0">
                        <div className="flex items-center gap-5 group cursor-pointer relative" onClick={() => setIsLandingModalOpen(true)}>
                            <div className="p-2 md:p-4 transition-all duration-[600ms] opacity-100 translate-y-0 flex items-center gap-2">
                                <span className="wordmark text-foreground">PRODUS</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        soundManager.play('click');
                                        setIsNotificationModalOpen(true);
                                    }}
                                    className="relative flex items-center justify-center p-1.5 rounded-sm hover:bg-foreground/10 transition-colors text-foreground/60 hover:text-foreground active:scale-95 cursor-pointer"
                                    title="Notifications"
                                >
                                    <span className="material-symbols-outlined text-[16px] md:text-[18px]">notifications</span>
                                    {hasAnyUnread && (
                                        <span className="absolute top-1 right-1 size-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] animate-pulse" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 px-2 pt-2 pb-8 overflow-visible min-h-0">
                        <div className="flex flex-col gap-1">
                            {/* Quick Add Button */}
                            <motion.button 
                                onClick={() => setIsQuickActionModalOpen(true)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full mb-6 p-4 border border-black/10 dark:border-white/10 rounded-2xl flex items-center gap-4 group hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                            >
                                <div className="size-10 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/5 transition-transform group-hover:scale-105">
                                    <Plus size={20} />
                                </div>
                                <div className="flex flex-col items-start gap-0.5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black dark:text-white">QUICK ADD</span>
                                    <span className="text-[8px] font-mono uppercase tracking-widest text-black dark:text-white/40">OPERATION HUB</span>
                                </div>
                            </motion.button>

                            {navItems.map((item, idx) => {
                                const isOverview = location.pathname === '/dashboard';
                                const currentSubTab = mobileTabs?.activeTab || location.state?.activeTab;
                                
                                const isActive = protocolMode === 'rpg' 
                                    ? activeRpgTab === item.id 
                                    : (item.path === '/dashboard' && location.pathname === '/dashboard') || 
                                      (location.pathname.startsWith(item.path) && (!item.tabId || item.tabId === currentSubTab));
                                
                                return (
                                    <React.Fragment key={item.id}>
                                        <motion.button
                                            onClick={() => {
                                                soundManager.play('click');
                                                if (protocolMode === 'rpg') {
                                                    if (location.pathname !== '/dashboard') navigate('/dashboard');
                                                    setActiveRpgTab(item.id);
                                                } else {
                                                    if (item.id === 'more') {
                                                        setIsMoreExpanded(!isMoreExpanded);
                                                        return;
                                                    }
                                                    if (item.tabId && mobileTabs) {
                                                        mobileTabs.setActiveTab(item.tabId);
                                                    }
                                                    navigate(item.path, { state: { activeTab: item.tabId } });
                                                }
                                            }}
                                            className="relative group/nav flex items-center rounded-2xl transition-all duration-300 h-10 w-full"
                                        >
                                            <div className={`absolute left-0 top-[calc(50%-12px)] w-[2px] h-6 transition-colors duration-500 ${isActive ? 'bg-black dark:bg-white' : 'bg-slate-200 dark:bg-white/10'}`} />

                                            <div className="relative flex items-center w-full h-full">
                                                <div className="pl-6 md:pl-8 flex items-center gap-2">
                                                    <span className={`font-sans font-black uppercase tracking-[0.4em] text-[10px] whitespace-nowrap transition-all duration-300 ${isActive ? 'text-black dark:text-white' : 'text-black/50 dark:text-white/40 group-hover/nav:text-black dark:group-hover/nav:text-white'}`}>
                                                        {item.name}
                                                    </span>
                                                    {item.id === 'more' && (
                                                        <span className={`ml-1 inline-block transition-transform duration-300 ${isMoreExpanded ? 'rotate-180' : 'rotate-0'}`}>
                                                            <ChevronDown className={`w-3 h-3 transition-colors ${isActive ? 'text-black dark:text-white' : 'text-black/50 dark:text-white/40 group-hover/nav:text-black dark:group-hover/nav:text-white'}`} />
                                                        </span>
                                                    )}
                                                    {isActive && (
                                                        <motion.div layoutId="sidebarActiveIndicator" className="size-1 rounded-full bg-black dark:bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                                    )}
                                                </div>
                                            </div>
                                        </motion.button>

                                        {item.id === 'more' && protocolMode === 'reality' && (
                                            <AnimatePresence>
                                                {isMoreExpanded && (
                                                    <motion.div 
                                                        key="more-categories-dropdown"
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="relative flex flex-col gap-1 pl-12 mt-2 mb-4 overflow-hidden"
                                                    >
                                                        <div className="absolute left-8 top-0 bottom-4 w-[1px] bg-black/10 dark:bg-white/10" />
                                                        {proToolsCategories.map((cat) => (
                                                            <div key={cat.id} className="relative flex flex-col gap-1">
                                                                <div className="absolute -left-4 top-[14px] w-3 h-[1px] bg-black/10 dark:bg-white/10" />
                                                                <button
                                                                    onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                                                                    className="flex items-center gap-2 py-1 transition-all duration-300 hover:translate-x-1"
                                                                    style={{ color: expandedCategory === cat.id ? (isDark ? cat.color.dark : cat.color.light) : 'inherit' }}
                                                                >
                                                                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] italic ${expandedCategory === cat.id ? '' : 'text-black hover:text-black dark:hover:text-black'}`}>
                                                                        {cat.name}
                                                                    </span>
                                                                    <div className={`size-1 rounded-full transition-all duration-300 ${expandedCategory === cat.id ? 'scale-125' : 'scale-50 opacity-20'}`} style={{ backgroundColor: isDark ? cat.color.dark : cat.color.light }} />
                                                                </button>
                                                                <AnimatePresence>
                                                                    {expandedCategory === cat.id && (
                                                                        <motion.div
                                                                            key={`tools-${cat.id}`}
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: 'auto', opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            className="flex flex-wrap gap-2 py-2 overflow-hidden"
                                                                        >
                                                                            {(categoryTools[cat.id] || []).map((tool) => (
                                                                                <button
                                                                                    key={tool.id}
                                                                                    onClick={() => {
                                                                                        if (tool.tabId && mobileTabs) mobileTabs.setActiveTab(tool.tabId);
                                                                                        navigate(tool.path, { state: { activeTab: tool.tabId } });
                                                                                    }}
                                                                                    style={{ '--pillar-color': isDark ? cat.color.dark : cat.color.light }}
                                                                                    className="size-8 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center hover:border-[var(--pillar-color)] hover:text-[var(--pillar-color)] transition-all group"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-[16px] transition-transform group-hover:scale-110">{tool.icon}</span>
                                                                                </button>
                                                                            ))}
                                                                            <button
                                                                                onClick={() => {
                                                                                    setMarketplaceCategory(cat.id);
                                                                                    setIsMarketplaceModalOpen(true);
                                                                                }}
                                                                                style={{ '--pillar-color': isDark ? cat.color.dark : cat.color.light }}
                                                                                className="size-8 rounded-full border border-dashed border-black/20 dark:border-white/20 flex items-center justify-center hover:border-[var(--pillar-color)] hover:text-[var(--pillar-color)] transition-all"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[16px]">add</span>
                                                                            </button>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-auto p-4 md:p-6 flex flex-col items-start gap-4 shrink-0 pl-[20px]">
                        <div className="mb-2 flex flex-col gap-4 transition-all duration-500">
                            <motion.div 
                                animate={{ x: shakeMerchant ? [-6, 6, -6, 6, -3, 3, 0] : 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="flex flex-col items-start gap-1 cursor-pointer relative group/merchant" 
                                onClick={handleOpenMerchant} 
                                title="Merchant feature is locked"
                            >
                                <EnergyDisplay current={user?.rpg?.energy?.current ?? (10 + (user?.guardianLevel || 0))} max={10 + (user?.guardianLevel || 0)} variant="minimal" className="scale-[0.8] origin-left opacity-75 group-hover/merchant:opacity-30 transition-all" />
                                <CoreDisplay amount={user?.rpg?.cores || 0} className="sidebar-core-display scale-[0.8] origin-left opacity-75 group-hover/merchant:opacity-30 transition-all" variant="minimal" />
                                <CoinDisplay amount={user?.rpg?.prodCoins || 0} className="sidebar-coin-display scale-[0.8] origin-left opacity-75 group-hover/merchant:opacity-30 transition-all" variant="minimal" />
                                
                                {/* Lock Overlay on Hover */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/merchant:opacity-100 transition-opacity bg-black/5 dark:bg-white/[0.02] rounded-md backdrop-blur-[1px] text-center p-1">
                                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-wider leading-tight">MERCHANT LOCKED</span>
                                    <span className="text-[6px] font-bold text-rose-500/80 uppercase tracking-widest mt-0.5">COMING SOON</span>
                                </div>
                            </motion.div>
                        </div>
                        <ThemeToggle className="mb-1" />
                        <div className="relative flex items-center gap-4 group" ref={profileRef}>
                            <div className="relative shrink-0 p-[2px]">
                                {/* Desktop sidebar EXP ring — mode-aware */}
                                {(protocolMode === 'rpg' ? (user?.hero?.level || 0) : (user?.guardianLevel || 0)) > 0 && (() => {
                                    const isRpg = protocolMode === 'rpg';
                                    const expVal = isRpg ? (user?.hero?.exp || 0) : (user?.guardianExp || 0);
                                    const totalReq = isRpg ? 0 : (user?.totalRequired || 0);
                                    const nxtLvl  = user?.nextLevelExp || 100;
                                    const progress = Math.min(100, Math.max(0, ((expVal - totalReq) / nxtLvl) * 100));
                                    const ringClass = isRpg
                                        ? 'text-amber-500 drop-shadow-[0_0_3px_rgba(245,158,11,0.4)]'
                                        : 'text-black dark:text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.3)]';
                                    return (
                                        <div className="absolute inset-0 size-full">
                                            <svg className="size-full -rotate-90">
                                                <circle cx="20" cy="20" r="19" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-black dark:text-white/10" />
                                                <motion.circle
                                                    cx="20" cy="20" r="19"
                                                    fill="none" stroke="currentColor"
                                                    strokeWidth="2" strokeLinecap="round"
                                                    strokeDasharray="119.38"
                                                    initial={{ strokeDashoffset: 119.38 }}
                                                    animate={{ strokeDashoffset: 119.38 - (119.38 * progress) / 100 }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className={ringClass}
                                                />
                                            </svg>
                                        </div>
                                    );
                                })()}
                                <button onClick={() => setIsUserMenuOpen(true)} className="size-10 rounded-full overflow-hidden active:scale-95 bg-black/10 dark:bg-white/10 flex items-center justify-center relative z-10">
                                    <Avatar config={user?.avatar} />
                                    {hasAnyUnread && (
                                        <div className="absolute top-1 right-1 size-2 rounded-full bg-white border border-black shadow-[0_0_6px_rgba(255,255,255,0.8)] z-30" />
                                    )}
                                </button>
                                {/* Level badge — guardian or hero */}
                                {protocolMode === 'rpg' ? (
                                    (user?.hero?.level || 0) > 0 && (
                                        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[7px] font-black px-1 py-0.5 rounded-md shadow-lg border border-amber-400/20 scale-95 z-20 pointer-events-none">{user.hero.level}</div>
                                    )
                                ) : (
                                    (user?.guardianLevel || 0) > 0 && (
                                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-white text-black text-[7px] font-black px-1 py-0.5 rounded-md shadow-lg border border-black/10 scale-95 z-20 pointer-events-none">{user.guardianLevel}</div>
                                    )
                                )}
                            </div>
                            <div className="flex flex-col whitespace-nowrap overflow-hidden max-w-[140px]">
                                <p className="text-[10px] font-black text-black dark:text-white leading-none uppercase tracking-[0.2em]">@{(user?.username || 'OPERATOR').split('#')[0].replace(/\d+/g, '')}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-[400ms] ease-[0.16,1,0.3,1]">
                    {isMobile && <GlobalMobileHeader activeSection={activeSection} onClick={() => setIsLandingModalOpen(true)} protocolMode={protocolMode} shakeMerchant={shakeMerchant} handleOpenMerchant={handleOpenMerchant} isIdPulledDown={isIdPulledDown} onOpenNotifications={() => setIsNotificationModalOpen(true)} hasAnyUnread={hasAnyUnread} />}
                    <div ref={mainRef} className={`flex-1 overflow-x-hidden ${protocolMode === 'rpg' ? 'overflow-y-hidden' : 'overflow-y-auto'} custom-scrollbar flex flex-col relative mt-0 ${isMobile ? 'snap-y snap-mandatory' : ''}`}>
                        <ConnectionsModal isOpen={isConnectionsModalOpen} onClose={() => setIsConnectionsModalOpen(false)} onProfileClick={(username) => { setProfileModalUser(username); setIsConnectionsModalOpen(false); }} />
                        <IdentityEditModal isOpen={isIdentityEditModalOpen} onClose={() => setIsIdentityEditModalOpen(false)} />
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.main 
                                key={location.pathname}
                                initial={{ x: "100%", opacity: 1 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: "-10%", opacity: 0, scale: 0.96, pointerEvents: 'none' }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className={`relative z-0 flex-1 flex flex-col ${protocolMode === 'rpg' ? 'justify-center pb-0 pt-0' : 'justify-start pb-10 md:pb-0 pt-0 md:pt-1'} px-0 md:pl-4 lg:pl-6 md:pr-8 lg:pr-12 w-full`}
                            >
                                <Outlet context={{ 
                                    setIsLandingModalOpen, 
                                    setIsSearchModalOpen, 
                                    setIsNotificationModalOpen, 
                                    setIsConnectionsModalOpen,
                                    setIsIdentityEditModalOpen,
                                    setIsQrModalOpen,
                                    setQrModalMode,
                                    setIsProfileModalOpen,
                                    setIsSettingsModalOpen,
                                    unreadCount, 
                                    viewMode, 
                                    setViewMode, 
                                    protocolMode, 
                                    setProtocolMode, 
                                    activeRpgTab, 
                                    setActiveRpgTab,
                                    activeSection,
                                    setActiveSection,
                                    isIdPulledDown,
                                    setIsIdPulledDown
                                }} />
                            </motion.main>
                        </AnimatePresence>
                    </div>
                </div>
                
                <aside className="hidden md:flex w-[4vw] flex-col items-center justify-between py-12 bg-white/50 dark:bg-black/50 backdrop-blur-sm relative shrink-0 layout-sidebar-right">
                    <div className="flex flex-col items-center gap-8 w-full h-full">
                        {protocolMode === 'reality' && <div className="flex-1 w-full" />}
                    </div>
                </aside>

                <div className="md:hidden fixed top-8 right-0 z-[101] layout-mobile-profile-btn">
                    {isOverview ? (
                        <button 
                            onClick={() => setThemeMode(isDark ? 'light' : 'dark')} 
                            className="pl-4 pr-6 py-2 text-black dark:text-white/60 hover:text-black dark:hover:text-white transition-all active:scale-90 relative"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                                {isDark ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>
                    ) : (
                        <button 
                            onClick={() => setIsUserMenuOpen(true)} 
                            className="pl-4 pr-6 py-2 text-black dark:text-white/60 hover:text-black dark:hover:text-white transition-all active:scale-90 relative flex items-center justify-center"
                        >
                            <div className="relative size-14 shrink-0">
                                <div className="size-full rounded-full overflow-hidden border-2 border-black/40 dark:border-white/15 bg-black/5 dark:bg-white/10 flex items-center justify-center">
                                    <Avatar config={user?.avatar} />
                                </div>
                                {/* Show guardian level in normal mode, hero level in RPG mode */}
                                {protocolMode === 'rpg' ? (
                                    user?.hero && (
                                        <div className="absolute -bottom-0.5 -right-0.5 bg-amber-500 text-white text-[8px] font-black px-1 py-0.5 rounded-md shadow-md border border-amber-400/20 z-20">
                                            {user.hero.level}
                                        </div>
                                    )
                                ) : (
                                    (user?.guardianLevel || 0) > 0 && (
                                        <div className="absolute -bottom-0.5 -right-0.5 bg-primary text-white text-[8px] font-black px-1 py-0.5 rounded-md shadow-md border border-primary/20 z-20">
                                            {user.guardianLevel}
                                        </div>
                                    )
                                )}
                            </div>
                            {hasAnyUnread && (
                                <span className="absolute top-1 right-6 size-2 rounded-full bg-red-500 border border-white dark:border-neutral-900 shadow-[0_0_6px_rgba(239,68,68,0.8)] z-30" />
                            )}
                        </button>
                    )}
                </div>

                {isOverview && (!isMobile || activeSection === 'produs') && (
                    <HudButtons 
                        onRpgClick={() => setProtocolMode(prev => prev === 'rpg' ? 'reality' : 'rpg')}
                        onPartnerClick={() => setViewMode(prev => prev === 'personal' ? 'partner' : 'personal')}
                        isRpgActive={protocolMode === 'rpg'}
                        isPartnerActive={viewMode === 'partner'}
                        isShrunk={isMobile && isIdPulledDown}
                    />
                )}

                {protocolMode === 'reality' && location.pathname !== '/dashboard' && (
                    <div className="hidden md:block">
                        <ScrollIndicator variant="dashboard" containerRef={mainRef} />
                    </div>
                )}

                <AnimatePresence>
                    {isSearchModalOpen && (
                        <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[10vw] px-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSearchModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} className="relative w-full max-w-lg bg-white dark:bg-[#000000] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-black/[0.08] dark:border-white/10 overflow-hidden flex flex-col max-h-[80vh] ar-corners">
                                <div className="flex items-center justify-between p-4 border-b border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02]">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] ml-4 text-black dark:text-white/40">Database Search</h4>
                                    <button onClick={() => setIsSearchModalOpen(false)} className="size-8 flex items-center justify-center rounded-full text-black dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"><span className="material-symbols-outlined text-[20px]">close</span></button>
                                </div>
                                <div className="p-4 flex-1 overflow-y-auto">
                                    <UserSearch onSelect={() => setIsSearchModalOpen(false)} />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {isProfileModalOpen && <ProfileModal username={user?.username} onClose={() => setIsProfileModalOpen(false)} />}
                
                <AnimatePresence>
                    {profileModalUser && (
                        <ProfileModal
                            username={profileModalUser}
                            onClose={() => setProfileModalUser(null)}
                        />
                    )}
                </AnimatePresence>
                
                <UserMenuModal
                    isOpen={isUserMenuOpen}
                    onClose={() => setIsUserMenuOpen(false)}
                    user={user}
                    unreadCount={unreadCount}
                    hasAnyUnread={hasAnyUnread}
                    onOpenSettings={() => setIsSettingsModalOpen(true)}
                    onOpenNotifications={() => setIsNotificationModalOpen(true)}
                    onOpenBugReport={() => setIsBugModalOpen(true)}
                    onOpenStats={() => setIsStatsModalOpen(true)}
                    onSignOut={handleSignOut}
                    onOpenMerchant={handleOpenMerchant}
                />

                {isSettingsModalOpen && <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} onOpenBugReport={() => setIsBugModalOpen(true)} />}
                {isBugModalOpen && <BugReportModal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} user={user} />}
                {isNotificationModalOpen && <NotificationModal isOpen={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)} user={user} />}
                {isStatsModalOpen && <StatsModal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} user={user} />}
                {isOnboardingOpen && <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />}
                <OperationModeModal isOpen={isOperationModalOpen} onClose={() => setIsOperationModalOpen(false)} />
                <QRModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} userId={user?._id} initialMode={qrModalMode} />

                <DecisionModal
                    isOpen={isLandingModalOpen}
                    message="Terminate operative session and return to central hub protocol?"
                    confirmLabel="CONFIRM_EXIT"
                    cancelLabel="STAY_HERE"
                    onConfirm={() => { setIsLandingModalOpen(false); navigate('/landing'); }}
                    onCancel={() => setIsLandingModalOpen(false)}
                />

                <ProToolsModal isOpen={isToolsStoreModalOpen} onClose={() => setIsToolsStoreModalOpen(false)} />
                <ToolsMarketplaceModal isOpen={isMarketplaceModalOpen} onClose={() => setIsMarketplaceModalOpen(false)} category={marketplaceCategory} />
                <AddGoalModal isOpen={isAddGoalModalOpen} onClose={() => setIsAddGoalModalOpen(false)} />
                <AddEventModal isOpen={isAddEventModalOpen} onClose={() => { setIsAddEventModalOpen(false); setAddEventInitialDate(null); }} initialDate={addEventInitialDate} />
                <GlobalTransactionPortal isOpen={isAddTransactionModalOpen} onClose={() => setIsAddTransactionModalOpen(false)} />
                <QuickActionModal isOpen={isQuickActionModalOpen} onClose={() => setIsQuickActionModalOpen(false)} />
                <MobileBottomNav />

                {/* Floating Toast Notification Queue */}
                <div className="fixed bottom-24 md:bottom-8 right-6 md:right-8 z-[10005] flex flex-col gap-3 pointer-events-none w-max max-w-[90vw] md:max-w-[360px]">
                    <AnimatePresence>
                        {activeToasts.map((toast) => {
                            const getIcon = (type) => {
                                switch (type) {
                                    case 'achievement': return 'emoji_events';
                                    case 'habit': return 'history_edu';
                                    case 'finance': return 'payments';
                                    case 'partner': return 'favorite';
                                    default: return 'notifications';
                                }
                            };

                            const getColor = (type) => {
                                switch (type) {
                                    case 'achievement': return 'text-amber-500 bg-amber-500/10';
                                    case 'habit': return 'text-primary bg-primary/10';
                                    case 'finance': return 'text-emerald-500 bg-emerald-500/10';
                                    case 'partner': return 'text-rose-500 bg-rose-500/10';
                                    default: return 'text-slate-400 bg-slate-400/10';
                                }
                            };

                            return (
                                <motion.div
                                    key={toast._id}
                                    initial={{ opacity: 0, y: 50, scale: 0.9, x: 50 }}
                                    animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.85, x: 100 }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                    className="pointer-events-auto flex gap-4 p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-black/95 text-foreground shadow-[0_15px_35px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.5)] backdrop-blur-md min-w-[280px] select-none"
                                >
                                    <div className={`size-10 rounded-sm flex items-center justify-center shrink-0 ${getColor(toast.type)}`}>
                                        <span className="material-symbols-outlined text-xl">{getIcon(toast.type)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 leading-none mb-1.5">
                                            {toast.type || 'system'} notification
                                        </span>
                                        <p className="text-[10px] font-black uppercase tracking-wider leading-snug text-foreground/90">
                                            {toast.text}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setActiveToasts(prev => prev.filter(t => t._id !== toast._id));
                                        }}
                                        className="text-foreground/40 hover:text-foreground text-[10px] font-mono self-start ml-2"
                                    >
                                        ✕
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardContext.Provider>
        </>
    );
}

export default Layout;
