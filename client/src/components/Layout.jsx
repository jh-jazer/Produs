import React, { useState, useEffect, useRef, useContext } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import SideEnergyBar from './dashboard/SideEnergyBar';
import { Search, Handshake, User, Lock, Zap, Cpu, ShoppingBag, ChevronDown } from 'lucide-react';
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

const GlobalMobileHeader = ({ activeSection, onClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [matrixText, setMatrixText] = useState("");
  const location = useLocation();
  const textToType = "PRODUS";
  const matrixChars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*<>";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

      return () => clearInterval(timer);
    }
  }, [config.isMain]);

  const formattedDate = currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="fixed top-8 left-6 right-6 z-[100] md:hidden pointer-events-none flex justify-between items-start">
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {config.isMain ? (
            <motion.div
              key="produs"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto cursor-pointer mt-1.5"
              onClick={onClick}
            >
              <h1 className="wordmark text-black dark:text-white flex items-center font-mono" style={{ fontSize: '14px' }}>
                <span>{matrixText}</span>
                <span className="animate-pulse inline-block w-1.5 h-3.5 bg-current ml-0.5 opacity-60 shrink-0" />
              </h1>
            </motion.div>
          ) : (
            <motion.div
              key={config.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-0.5 bg-background/80 backdrop-blur-sm py-1 px-2 -ml-2 rounded-sm pointer-events-auto"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground">{config.title}</span>
              <span className="text-[8px] font-mono uppercase tracking-widest text-foreground/40">{config.subtitle}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-end gap-0.5 bg-background/80 backdrop-blur-sm py-1 px-2 mr-1 rounded-sm shrink-0 mt-0.5 font-mono pointer-events-auto">
        <span className="text-[13px] font-black tracking-tighter leading-none text-foreground">{formattedTime}</span>
        <span className="text-[7px] font-black uppercase tracking-[0.3em] text-foreground/40 font-sans">{formattedDate}</span>
      </div>
    </div>
  );
};



function Layout() {
    const { user, signOut } = useAuthStore();
    const { isDark, setThemeMode } = useTheme(); // boots & syncs theme
    const isMobile = useMobile();
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
    const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);

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
    const [isIdentityEditModalOpen, setIsIdentityEditModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isToolsStoreModalOpen, setIsToolsStoreModalOpen] = useState(false);
    const [isMarketplaceModalOpen, setIsMarketplaceModalOpen] = useState(false);
    const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
    const [addEventInitialDate, setAddEventInitialDate] = useState(null);
    const [marketplaceCategory, setMarketplaceCategory] = useState('all');
    const [mobileTabs, setMobileTabs] = useState(null); // { tabs, activeTab, setActiveTab }
    const [activeRpgTab, setActiveRpgTab] = useState('home');
    const [activeSection, setActiveSection] = useState('produs');
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [isMoreExpanded, setIsMoreExpanded] = useState(false);
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

    // Trigger onboarding if not completed
    useEffect(() => {
        if (user && user.onboardingCompleted === false) {
            setIsOnboardingOpen(true);
        }
    }, [user?.onboardingCompleted]);

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
        { id: 'habits', name: 'Habit Tracker', path: '/dashboard/habits', icon: Zap },
        { id: 'planner', name: 'Daily Planner', path: '/dashboard/planner', icon: Zap },
        { id: 'goals', name: 'Goal Setter', path: '/dashboard/goals', icon: Zap },
        { id: 'calendar', name: 'Calendar', path: '/dashboard/calendar', icon: Zap },
        { id: 'more', name: 'More', path: '#', icon: Zap, isHeader: true },
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
                            <Avatar config={user?.avatar} />
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
                        <span className="wordmark text-black dark:text-white mt-1">
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
                                <span className="wordmark text-black dark:text-white">PRODUS</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Primary Navigation */}
                    <div className="flex-1 px-2 pt-7 pb-8 overflow-visible min-h-0">
                        <div className="flex flex-col gap-1">
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
                                                        {item.id === 'more' && (
                                                            <span 
                                                                className={`ml-1 inline-block transition-transform duration-300 ${isMoreExpanded ? 'rotate-180' : 'rotate-0'}`}
                                                            >
                                                                <ChevronDown className="w-3 h-3 text-slate-400" />
                                                            </span>
                                                        )}
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

                                        {/* Render Categories below More */}
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
                                                        {/* Vertical Connecting Line */}
                                                        <div className="absolute left-8 top-0 bottom-4 w-[1px] bg-black/10 dark:bg-white/10" />

                                                        {proToolsCategories.map((cat, catIdx) => (
                                                            <div key={cat.id} className="relative flex flex-col gap-1">
                                                                {/* Horizontal Branch Line */}
                                                                <div className="absolute -left-4 top-[14px] w-3 h-[1px] bg-black/10 dark:bg-white/10" />

                                                                <button
                                                                    onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                                                                    className="flex items-center gap-2 py-1 transition-all duration-300 hover:translate-x-1"
                                                                    style={{ 
                                                                        color: expandedCategory === cat.id 
                                                                            ? (isDark ? cat.color.dark : cat.color.light) 
                                                                            : 'inherit' 
                                                                    }}
                                                                >
                                                                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] italic ${expandedCategory === cat.id ? '' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                                                        {cat.name}
                                                                    </span>
                                                                    <div 
                                                                        className={`size-1 rounded-full transition-all duration-300 ${expandedCategory === cat.id ? 'scale-125' : 'scale-50 opacity-20'}`}
                                                                        style={{ backgroundColor: isDark ? cat.color.dark : cat.color.light }}
                                                                    />
                                                                </button>

                                                                {/* Icons for category */}
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
                                                                                        if (tool.tabId && mobileTabs) {
                                                                                            mobileTabs.setActiveTab(tool.tabId);
                                                                                        }
                                                                                        navigate(tool.path, { state: { activeTab: tool.tabId } });
                                                                                    }}
                                                                                    style={{ '--pillar-color': isDark ? cat.color.dark : cat.color.light }}
                                                                                    className="size-8 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center hover:border-[var(--pillar-color)] hover:text-[var(--pillar-color)] transition-all group"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-[16px] transition-transform group-hover:scale-110">
                                                                                        {tool.icon}
                                                                                    </span>
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

                    {/* 3. Sidebar Footer: Identity HUD */}
                    <div className="mt-auto p-4 md:p-6 flex flex-col items-start gap-4 transition-all duration-[600ms] shrink-0 pl-[20px]">



                        {/* 2.5 Currency Display (Desktop) */}
                        <div className="mb-2 flex flex-col gap-4 transition-all duration-500">
                            <div 
                                className="flex flex-col items-start gap-1 cursor-pointer"
                                onClick={() => navigate('/dashboard/merchant')}
                                title="Open Merchant"
                            >
                                <EnergyDisplay 
                                    current={user?.rpg?.energy?.current ?? (10 + (user?.level || 0))} 
                                    max={10 + (user?.level || 0)} 
                                    variant="minimal" 
                                    className="scale-[0.8] origin-left"
                                />
                                <CoreDisplay amount={user?.rpg?.cores || 0} className="sidebar-core-display scale-[0.8] origin-left" variant="minimal" />
                                <CoinDisplay amount={user?.rpg?.prodCoins || 0} className="sidebar-coin-display scale-[0.8] origin-left" variant="minimal" />
                            </div>
                        </div>

                        {/* Theme Toggle */}
                        <ThemeToggle className="mb-1" />

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
                                    <Avatar config={user?.avatar} />
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
                    {isMobile && <GlobalMobileHeader activeSection={activeSection} onClick={() => setIsLandingModalOpen(true)} />}

                    <div 
                        ref={mainRef}
                        className={`flex-1 overflow-x-hidden ${protocolMode === 'rpg' ? 'overflow-y-hidden' : 'overflow-y-auto'} custom-scrollbar flex flex-col relative mt-0 ${isMobile ? 'snap-y snap-mandatory' : ''}`}
                    >
                        <ConnectionsModal 
                    isOpen={isConnectionsModalOpen} 
                    onClose={() => setIsConnectionsModalOpen(false)}
                    onProfileClick={(username) => navigate(`/dashboard/profile/${username}`)}
                />

                <IdentityEditModal
                    isOpen={isIdentityEditModalOpen}
                    onClose={() => setIsIdentityEditModalOpen(false)}
                />

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
                                    setActiveSection
                                }} />
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
                        className="pl-6 pr-0 py-2 text-black dark:text-white/60 hover:text-black dark:hover:text-white transition-colors active:scale-90"
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

                <QRModal 
                    isOpen={isQrModalOpen} 
                    onClose={() => setIsQrModalOpen(false)} 
                    userId={user?._id}
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

                <ProToolsModal 
                    isOpen={isToolsStoreModalOpen} 
                    onClose={() => setIsToolsStoreModalOpen(false)} 
                />

                <ToolsMarketplaceModal 
                    isOpen={isMarketplaceModalOpen}
                    onClose={() => setIsMarketplaceModalOpen(false)}
                    category={marketplaceCategory}
                />

                <AddGoalModal 
                    isOpen={isAddGoalModalOpen}
                    onClose={() => setIsAddGoalModalOpen(false)}
                />

                <AddEventModal 
                    isOpen={isAddEventModalOpen}
                    onClose={() => {
                        setIsAddEventModalOpen(false);
                        setAddEventInitialDate(null);
                    }}
                    initialDate={addEventInitialDate}
                />

                <GlobalTransactionPortal 
                    isOpen={isAddTransactionModalOpen}
                    onClose={() => setIsAddTransactionModalOpen(false)}
                />

                <MobileBottomNav />
            </div>
        </DashboardContext.Provider>
    );
}

export default Layout;
