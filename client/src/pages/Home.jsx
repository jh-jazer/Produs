import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { useRef, useMemo } from 'react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import useMobile from '../hooks/useMobile';
import { QRCodeSVG } from 'qrcode.react';

// Components
import RPGImmersiveOverlay from '../components/rpg/RPGImmersiveOverlay';
import AwakeningOverlay from '../components/dashboard/AwakeningOverlay';
import PriorityHUD from '../components/dashboard/PriorityHUD';
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';
import Avatar from '../components/ui/Avatar';
import FinancialOverview from '../components/finance_components/FinancialOverview';
import FinancialBreakdown from '../components/finance_components/FinancialBreakdown';
import { useFinance } from '../hooks/useFinance';

const ChippedBorder = ({ opacity = 0.8 }) => (
  <div
    className="absolute inset-[-2px] rounded-sm pointer-events-none z-0"
    style={{
      border: '4px solid currentColor',
      opacity,
      clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
    }}
  />
);

const MobileLogoText = ({ activeSection, onClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [matrixText, setMatrixText] = useState("");
  const textToType = "PRODUS";
  const matrixChars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*<>";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeSection === 'produs') {
      let iteration = 0;
      let currentIdx = 0;
      setMatrixText("");

      const timer = setInterval(() => {
        iteration++;
        
        if (iteration % 3 === 0) {
          currentIdx++;
        }

        if (currentIdx > textToType.length) {
          clearInterval(timer);
          setMatrixText(textToType);
        } else {
          const chars = textToType.split("").map((actualChar, idx) => {
            if (idx < currentIdx) {
              return actualChar;
            }
            return matrixChars[Math.floor(Math.random() * matrixChars.length)];
          });
          
          setMatrixText(chars.slice(0, currentIdx + 2).join(""));
        }
      }, 40);

      return () => clearInterval(timer);
    }
  }, [activeSection]);

  const formattedDate = currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="fixed top-8 left-6 right-6 z-[100] md:hidden pointer-events-none flex justify-between items-start">
      {/* Left side dynamic header */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {activeSection === 'produs' && (
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
          )}
          {activeSection === 'priority' && (
            <motion.div
              key="priority"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-0.5 bg-background/80 backdrop-blur-sm py-1 px-2 -ml-2 rounded-sm"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground">PRIORITY LIST</span>
              <span className="text-[8px] font-mono uppercase tracking-widest text-foreground/40">DAILY OBJECTIVES</span>
            </motion.div>
          )}
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-0.5 bg-background/80 backdrop-blur-sm py-1 px-2 -ml-2 rounded-sm"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground">FINANCES</span>
              <span className="text-[8px] font-mono uppercase tracking-widest text-foreground/40">REAL-TIME SYNC</span>
            </motion.div>
          )}
          {activeSection === 'breakdown' && (
            <motion.div
              key="breakdown"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-0.5 bg-background/80 backdrop-blur-sm py-1 px-2 -ml-2 rounded-sm"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground">TRANSACTIONS</span>
              <span className="text-[8px] font-mono uppercase tracking-widest text-foreground/40">LEDGER BREAKDOWN</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right side live clock/date */}
      <div className="flex flex-col items-end gap-0.5 bg-background/80 backdrop-blur-sm py-1 px-2 mr-1 rounded-sm shrink-0 mt-0.5 font-mono">
        <span className="text-[13px] font-black tracking-tighter leading-none text-foreground">{formattedTime}</span>
        <span className="text-[7px] font-black uppercase tracking-[0.3em] text-foreground/40 font-sans">{formattedDate}</span>
      </div>
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const { user, updateSettings } = useAuthStore();
  const setNeuralSyncDismissed = useAuthStore((state) => state.setNeuralSyncDismissed);
  const {
    protocolMode,
    setProtocolMode,
    activeRpgTab,
    setActiveRpgTab,
    setIsLandingModalOpen,
    setIsConnectionsModalOpen,
    setIsSearchModalOpen,
    setIsIdentityEditModalOpen,
    setIsQrModalOpen,
    setQrModalMode,
    setActiveSection: setGlobalActiveSection
  } = useOutletContext();

  const { 
      transactions, 
      budgets, 
      debts, 
      savings, 
      addFinanceItem, 
      updateFinanceItem: rawUpdateFinanceItem,
      deleteFinanceItem: rawDeleteFinanceItem 
  } = useFinance();

  const updateFinanceItem = async (type, id, payload) => {
    const realId = typeof id === 'string' && id.includes('-inst-') ? id.split('-inst-')[0] : id;
    return rawUpdateFinanceItem(type, realId, payload);
  };

  const deleteFinanceItem = async (type, id) => {
    const actualId = id !== undefined ? id : type;
    const realId = typeof actualId === 'string' && actualId.includes('-inst-') ? actualId.split('-inst-')[0] : actualId;
    return rawDeleteFinanceItem(realId);
  };

  const totalSavings = savings.reduce((sum, s) => sum + (s.amount || 0), 0);
  const actualDebts = debts.filter(d => d.nature === 'debt' || !d.nature);
  const totalDebt = actualDebts.reduce((sum, d) => sum + (d.amount || 0), 0);
  const upcomingIncome = debts.filter(d => d.nature === 'income');
  const totalUpcomingIncome = upcomingIncome.reduce((sum, d) => sum + (d.amount || 0), 0);

  const currentBalance = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - 
                        transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProjection = currentBalance + totalUpcomingIncome - totalDebt;

  const formatDate = (dateInput) => {
    if (!dateInput) return new Date().toISOString().split('T')[0];
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
      return d.toISOString().split('T')[0];
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  };

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      if (selectedYear !== 'all' && d.getFullYear() !== parseInt(selectedYear)) return false;
      if (selectedMonth !== 'all' && d.getMonth() !== parseInt(selectedMonth)) return false;
      return true;
    });
  }, [transactions, selectedYear, selectedMonth]);

  const getFilteredAmount = (d) => {
    const amt = parseFloat(d.amount) || 0;
    const dateStr = d.dueDate || formatDate(d.createdAt);
    const startDate = new Date(dateStr);
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const duration = d.monthsLeft || 1;

    const targetYear = selectedYear === 'all' ? null : parseInt(selectedYear);
    const targetMonth = selectedMonth === 'all' ? null : parseInt(selectedMonth);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const isMonthInstancePaid = (offset) => {
      const mIdx = (startMonth + offset) % 12;
      const yVal = startYear + Math.floor((startMonth + offset) / 12);
      const label = `${monthNames[mIdx].toUpperCase()} ${yVal}`;
      const expectedTitle = d.nature === 'income' 
          ? `Received: ${d.title} (${label})`
          : `Paid: ${d.title} (${label})`;
      const expectedType = d.nature === 'income' ? 'income' : 'expense';
      return transactions.some(t => t.title === expectedTitle && t.type === expectedType);
    };

    if (!d.isMonthly) {
      const label = `${monthNames[startMonth].toUpperCase()} ${startYear}`;
      const expectedTitle = d.nature === 'income' 
          ? `Received: ${d.title} (${label})`
          : `Paid: ${d.title} (${label})`;
      const expectedType = d.nature === 'income' ? 'income' : 'expense';
      const isPaid = transactions.some(t => t.title === expectedTitle && t.type === expectedType);
      return isPaid ? 0 : amt;
    }

    // If viewing all time
    if (targetYear === null && targetMonth === null) {
      let sum = 0;
      for (let i = 0; i < duration; i++) {
        if (!isMonthInstancePaid(i)) {
          sum += amt;
        }
      }
      return sum;
    }

    // If viewing a specific calendar month
    if (targetYear !== null && targetMonth !== null) {
      const startAbs = startYear * 12 + startMonth;
      const targetAbs = targetYear * 12 + targetMonth;
      if (targetAbs >= startAbs && targetAbs < startAbs + duration) {
        const offset = targetAbs - startAbs;
        return isMonthInstancePaid(offset) ? 0 : amt;
      }
      return 0;
    }

    // If viewing a specific year (all months)
    if (targetYear !== null && targetMonth === null) {
      let sum = 0;
      const startAbs = startYear * 12 + startMonth;
      const endAbs = startAbs + duration - 1;
      const yearStartAbs = targetYear * 12;
      const yearEndAbs = targetYear * 12 + 11;

      const overlapStart = Math.max(startAbs, yearStartAbs);
      const overlapEnd = Math.min(endAbs, yearEndAbs);

      if (overlapStart <= overlapEnd) {
        for (let abs = overlapStart; abs <= overlapEnd; abs++) {
          const offset = abs - startAbs;
          if (!isMonthInstancePaid(offset)) {
            sum += amt;
          }
        }
      }
      return sum;
    }

    // If viewing a specific month across all years
    if (targetYear === null && targetMonth !== null) {
      let sum = 0;
      for (let i = 0; i < duration; i++) {
        if ((startMonth + i) % 12 === targetMonth) {
          if (!isMonthInstancePaid(i)) {
            sum += amt;
          }
        }
      }
      return sum;
    }

    return amt;
  };

  const getOverallUnpaidTotal = (d) => {
    const amt = parseFloat(d.amount) || 0;
    const dateStr = d.dueDate || formatDate(d.createdAt);
    const startDate = new Date(dateStr);
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const duration = d.monthsLeft || 1;

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const isMonthInstancePaid = (offset) => {
      const mIdx = (startMonth + offset) % 12;
      const yVal = startYear + Math.floor((startMonth + offset) / 12);
      const label = `${monthNames[mIdx].toUpperCase()} ${yVal}`;
      const expectedTitle = d.nature === 'income' 
          ? `Received: ${d.title} (${label})`
          : `Paid: ${d.title} (${label})`;
      const expectedType = d.nature === 'income' ? 'income' : 'expense';
      return transactions.some(t => t.title === expectedTitle && t.type === expectedType);
    };

    if (!d.isMonthly) {
      const label = `${monthNames[startMonth].toUpperCase()} ${startYear}`;
      const expectedTitle = d.nature === 'income' 
          ? `Received: ${d.title} (${label})`
          : `Paid: ${d.title} (${label})`;
      const expectedType = d.nature === 'income' ? 'income' : 'expense';
      const isPaid = transactions.some(t => t.title === expectedTitle && t.type === expectedType);
      return isPaid ? 0 : amt;
    }

    let sum = 0;
    for (let i = 0; i < duration; i++) {
      if (!isMonthInstancePaid(i)) {
        sum += amt;
      }
    }
    return sum;
  };

  const filteredDebts = useMemo(() => {
    return debts.filter(d => {
      const dateStr = d.dueDate || formatDate(d.createdAt);
      const startDate = new Date(dateStr);
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();

      const targetYear = selectedYear === 'all' ? null : parseInt(selectedYear);
      const targetMonth = selectedMonth === 'all' ? null : parseInt(selectedMonth);

      // If standard non-recurring debt
      if (!d.isMonthly) {
        const matchYear = targetYear === null || startYear === targetYear;
        const matchMonth = targetMonth === null || startMonth === targetMonth;
        return matchYear && matchMonth;
      }

      // If recurring debt
      const duration = d.monthsLeft || 1;
      const startAbs = startYear * 12 + startMonth;
      const endAbs = startAbs + duration - 1;

      if (targetYear !== null && targetMonth !== null) {
        const targetAbs = targetYear * 12 + targetMonth;
        return targetAbs >= startAbs && targetAbs <= endAbs;
      }

      if (targetYear !== null && targetMonth === null) {
        const yearStartAbs = targetYear * 12;
        const yearEndAbs = targetYear * 12 + 11;
        return startAbs <= yearEndAbs && endAbs >= yearStartAbs;
      }

      if (targetYear === null && targetMonth !== null) {
        for (let i = 0; i < duration; i++) {
          if ((startMonth + i) % 12 === targetMonth) return true;
        }
        return false;
      }

      return true;
    });
  }, [debts, selectedYear, selectedMonth]);

  const filteredSavings = useMemo(() => {
    return savings.filter(s => {
      const dateStr = formatDate(s.createdAt);
      const sDate = new Date(dateStr);
      if (selectedYear !== 'all' && sDate.getFullYear() !== parseInt(selectedYear)) return false;
      if (selectedMonth !== 'all' && sDate.getMonth() !== parseInt(selectedMonth)) return false;
      return true;
    });
  }, [savings, selectedYear, selectedMonth]);

  const totalSavingsForMonth = useMemo(() => {
    return filteredSavings.reduce((sum, s) => sum + (s.amount || 0), 0);
  }, [filteredSavings]);

  const actualDebtsForMonth = useMemo(() => {
    return filteredDebts.filter(d => d.nature === 'debt' || !d.nature);
  }, [filteredDebts]);

  const totalDebtForMonth = useMemo(() => {
    return actualDebtsForMonth.reduce((sum, d) => sum + getFilteredAmount(d), 0);
  }, [actualDebtsForMonth, selectedYear, selectedMonth]);

  const upcomingIncomeForMonth = useMemo(() => {
    return filteredDebts.filter(d => d.nature === 'income');
  }, [filteredDebts]);

  const totalUpcomingIncomeForMonth = useMemo(() => {
    return upcomingIncomeForMonth.reduce((sum, d) => sum + getFilteredAmount(d), 0);
  }, [upcomingIncomeForMonth, selectedYear, selectedMonth]);

  const combinedTransactions = useMemo(() => {
    const txItems = filteredTransactions.map(t => ({
      ...t,
      rawType: 'transaction'
    }));

    const debtItems = filteredDebts.map(d => ({
      _id: d._id,
      title: d.title,
      amount: getOverallUnpaidTotal(d),
      monthlyAmount: d.amount,
      type: d.nature === 'income' ? 'upcoming' : 'debt',
      category: d.nature === 'income' ? 'Receivable' : 'Debt',
      date: d.dueDate || formatDate(d.createdAt),
      rawType: 'debt',
      isMonthly: d.isMonthly,
      monthsLeft: d.monthsLeft,
      startDate: d.dueDate || formatDate(d.createdAt)
    }));

    const savingItems = filteredSavings.map(s => ({
      _id: s._id,
      title: s.title,
      amount: s.amount,
      type: 'savings',
      category: s.category || 'Savings',
      date: formatDate(s.createdAt),
      rawType: 'saving'
    }));

    return [...txItems, ...debtItems, ...savingItems].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  }, [filteredTransactions, filteredDebts, filteredSavings]);

  const isMobile = useMobile();
  const fileInputRef = useRef(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [activeSection, setActiveSection] = useState('produs');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isIdMenuOpen, setIsIdMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isIdPulledDown, setIsIdPulledDown] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username?.split('#')[0] || '',
    bio: user?.bio || '',
    avatar: user?.avatar || {}
  });

  const [showAddTx, setShowAddTx] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openAddTransaction) {
      setShowAddTx(true);
      // Consume state so it doesn't repeatedly trigger on standard component unmount/remount
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username?.split('#')[0] || '',
        bio: user.bio || '',
        avatar: user.avatar || {}
      });
    }
  }, [user]);

  const handleSaveInline = async () => {
    try {
      await updateSettings({
        username: editData.username,
        bio: editData.bio,
        avatar: editData.avatar
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to sync identity", error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/auth/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditData(prev => ({ ...prev, avatar: data.url }));
    } catch (error) {
      console.error("Image upload failed", error);
    }
  };

  // Scroll tracking for the HUD indicator (Global Page Level)
  useEffect(() => {
    const container = document.querySelector('.custom-scrollbar');
    if (!container) return;
    const handleScroll = () => {
      setIsAtTop(container.scrollTop < 10);
      
      const priorityEl = document.getElementById('section-priority');
      const overviewEl = document.getElementById('section-overview');
      const breakdownEl = document.getElementById('section-breakdown');

      let current = 'produs';
      if (container.scrollTop < 50) {
        current = 'produs';
      } else {
        if (breakdownEl && breakdownEl.getBoundingClientRect().top < 250) {
          current = 'breakdown';
        } else if (overviewEl && overviewEl.getBoundingClientRect().top < 250) {
          current = 'overview';
        } else if (priorityEl && priorityEl.getBoundingClientRect().top < 250) {
          current = 'priority';
        }
      }
      setActiveSection(current);
      if (setGlobalActiveSection) setGlobalActiveSection(current);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [setGlobalActiveSection]);

  useEffect(() => {
    if (user && user.username) {
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleInitiateAwakening = async () => {
    setNeuralSyncDismissed(false);
    navigate('/dashboard/neural-sync');
  };

  const generateCodenameHash = (str) => {
    if (!str) return 'UNKNOWN';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).toUpperCase().slice(0, 8);
  };

  const codenameHash = generateCodenameHash(user?.username || user?.name || 'OPERATIVE');

  useEffect(() => {
    if (isFlipped) {
      const timer = setTimeout(() => {
        setIsFlipped(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [isFlipped]);

  const isUnawakened = !user?.rpg?.path;
  const isLevel0Active = isUnawakened && protocolMode === 'rpg';

  return (
    <div className="w-full bg-transparent text-foreground font-sans">
      <AnimatePresence mode="wait">
        {isLevel0Active && !isInitializing ? (
          <motion.div
            key="awakening"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 h-full flex items-center justify-center px-4 overflow-hidden py-20"
          >
            <AwakeningOverlay
              onAwaken={handleInitiateAwakening}
              onBackToReality={() => setProtocolMode('reality')}
              isLoading={false}
              hasStarted={user?.rpg?.completedAnswers?.length > 0}
              userId={user?._id}
            />
          </motion.div>
        ) : protocolMode === 'rpg' && !isInitializing ? (
          <motion.div
            key="rpg-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <RPGImmersiveOverlay
              user={user}
              activeTab={activeRpgTab}
              setActiveTab={setActiveRpgTab}
            />
          </motion.div>
        ) : isInitializing ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8 pt-0 md:p-12"
          >
            <WorkspaceSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="reality"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-6 pt-0 md:pl-8 md:pr-12 md:py-6"
          >
            {/* Reality Dashboard Layout */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-32 md:gap-8 w-full mb-32 md:mb-24">

              {/* Column 1-2: Integrated Swinging ID Assembly */}
              <div className="md:col-span-2 relative min-h-[82vh] md:min-h-[unset] h-auto md:h-16 flex flex-col items-center justify-center mb-0 snap-start snap-always">
                <div className="absolute inset-0 flex flex-col items-center">
                  {/* Sash Cord Pull Handle */}
                  {!isIdPulledDown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -50 }}
                      transition={{ type: "spring", stiffness: 150, damping: 18 }}
                      className="absolute top-0 md:mt-12 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center cursor-pointer pointer-events-auto"
                      onClick={() => setIsIdPulledDown(true)}
                    >
                      {/* Anchor Mount */}
                      <div className="w-4 h-1.5 bg-white/80 rounded-t-sm shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                      {/* Cord Line */}
                      <div className="w-[2px] h-[180px] bg-gradient-to-b from-white/80 via-white/50 to-white/20" />
                      {/* Pulsing ring handle */}
                      <motion.div 
                        whileHover={{ scale: 1.15, y: 3 }}
                        whileTap={{ scale: 0.95, y: 15 }}
                        className="size-9 rounded-full border-2 border-white/60 bg-black/90 backdrop-blur-md flex items-center justify-center shadow-lg shadow-black/40 group relative"
                      >
                        <div className="size-3.5 rounded-full bg-white animate-pulse shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
                        
                        {/* Permanently visible indicator text below the ring */}
                        <span className="absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8.5px] font-mono font-black uppercase tracking-[0.25em] text-white/50 group-hover:text-white transition-all duration-300 select-none">
                          PULL ID
                        </span>
                      </motion.div>
                    </motion.div>
                  )}

                  <motion.div 
                    initial={{ y: -600, opacity: 0 }}
                    animate={{ 
                      y: isIdPulledDown ? 0 : -600, 
                      opacity: isIdPulledDown ? 1 : 0 
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: isIdPulledDown ? 120 : 200, 
                      damping: isIdPulledDown ? 14 : 28,
                      mass: isIdPulledDown ? 1.2 : 1
                    }}
                    style={{ 
                      transformOrigin: "top center",
                      pointerEvents: isIdPulledDown ? 'auto' : 'none'
                    }}
                    className="absolute top-0 md:mt-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center"
                  >
                    <div 
                      className="flex flex-col items-center cursor-pointer group/retract relative"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsIdPulledDown(false);
                      }}
                      title="RETRACT ID"
                    >
                      <div className="w-4 h-1 bg-white z-[60] shadow-[0_0_15px_rgba(255,255,255,0.5)] shrink-0 group-hover/retract:bg-white group-hover/retract:scale-x-125 transition-all" />
                      <div className="w-[12px] h-[15vh] md:h-5 bg-white opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.1)] shrink-0 z-50 group-hover/retract:bg-white group-hover/retract:opacity-100 transition-all" />
                      
                      <span className="absolute -top-6 whitespace-nowrap bg-black/90 text-white text-[7px] font-mono font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-sm border border-white/10 opacity-0 group-hover/retract:opacity-100 transition-opacity pointer-events-none">
                        RETRACT ID
                      </span>
                    </div>

                    <div className="relative -mt-4 perspective-[1000px] cursor-pointer pointer-events-auto" onClick={() => setIsFlipped(!isFlipped)}>
                      <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} style={{ transformStyle: "preserve-3d", originY: 0 }} className="relative w-[82vw] md:w-[320px] min-h-[70vh] md:min-h-[446px]">
                        {/* FRONT FACE */}
                        <div className="absolute inset-0 bg-gray-300 dark:bg-[#121212] text-black dark:text-white p-6 md:p-8 rounded-sm flex flex-col justify-between items-center text-center overflow-hidden" style={{ backfaceVisibility: "hidden" }}>
                          <ChippedBorder opacity={1} />
                          {/* PRODUS WATERMARK */}
                          <div className="absolute inset-0 flex items-end justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.02] select-none z-0 pb-20 md:pb-24" style={{ transform: 'translateX(100px)' }}>
                            <span className="font-sans font-black text-[70px] md:text-[90px] tracking-[0.1em] uppercase">PRODUS</span>
                          </div>
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 size-8 bg-black/10 dark:bg-[#000000] rounded-full border-[7px] border-white dark:border-[#121212] z-20 flex items-center justify-center">
                            <div className="absolute inset-[-1px] rounded-full border-[0.5px] border-black/30 dark:border-white/30" style={{ clipPath: 'polygon(0% 0%, 25% 5%, 50% 0%, 75% 5%, 100% 0%, 95% 25%, 100% 50%, 95% 75%, 100% 100%, 75% 95%, 50% 100%, 25% 95%, 0% 100%, 5% 75%, 0% 50%, 5% 25%)' }} />
                          </div>
                          <div className="flex flex-col gap-6 w-full items-center mt-4">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 dark:text-white/20">{(user?.rpg?.archetype?.name && user.rpg.archetype.name !== 'None' ? user.rpg.archetype.name.toUpperCase() : 'ROOKIE')}_ID</span>
                              <span className="text-sm font-black tracking-tighter uppercase opacity-80">{codenameHash}</span>
                            </div>
                            <div className="h-[1px] bg-black/10 dark:bg-white/10 w-full" />
                            <div className="flex flex-col items-center gap-6">
                              <div
                                onClick={(e) => {
                                  if (isEditing) {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                  }
                                }}
                                className={`size-48 md:size-52 bg-black/5 dark:bg-black rounded-sm overflow-hidden border border-black/10 dark:border-white/10 shrink-0 relative transition-all ${isEditing ? 'ring-2 ring-primary cursor-pointer' : ''}`}
                              >
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  accept="image/*"
                                />
                                <div className="w-full h-full bg-white p-2 pb-6 shadow-xl relative">
                                  {/* Level Badge - Absolute Corner Overlay */}
                                  <div className="absolute top-0 left-0 px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black text-[9px] font-black uppercase tracking-widest z-30 shadow-lg">
                                    LVL_{user?.rpg?.level || 1}
                                  </div>
                                  <div className="size-full bg-black/5 overflow-hidden flex items-center justify-center relative">
                                    <Avatar config={editData.avatar} className="size-full" />
                                    {/* EXP Bar - Anchored to bottom of image */}
                                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/10 dark:bg-white/5 z-40 overflow-hidden border-t border-black/5 dark:border-white/5">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (user?.rpg?.exp || 0) / 10)}%` }}
                                        className="h-full bg-black dark:bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                                      />
                                    </div>
                                    {/* Texture Overlay */}
                                    <div className="absolute inset-0 bg-black/5 pointer-events-none mix-blend-overlay" />
                                  </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 dark:via-white/5 to-transparent h-1/2 w-full top-0 animate-scanline" />
                                {isEditing && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-white text-xl">upload</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-center gap-1 w-full px-0">
                                {isEditing ? (
                                  <div className="flex flex-col items-center gap-2 w-full px-8">
                                    <div className="relative w-full">
                                      <input
                                        type="text"
                                        value={editData.username}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') }))}
                                        className="w-full bg-black/10 dark:bg-white/10 border-b border-primary/50 text-[10px] font-black text-center uppercase tracking-[0.3em] outline-none py-1"
                                        maxLength={8}
                                        autoFocus
                                      />
                                      <span className="absolute right-0 bottom-1 text-[8px] opacity-20 font-mono">#{user?.username?.split('#')[1]}</span>
                                    </div>
                                    <textarea
                                      value={editData.bio}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                                      className="w-full bg-black/10 dark:bg-white/10 border-b border-primary/50 text-[9px] font-mono italic text-center tracking-tight outline-none py-1 min-h-[40px] resize-none"
                                      maxLength={160}
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex flex-col items-center w-full px-4">
                                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 dark:text-white/40">{user?.username?.split('#')[0].toUpperCase() || 'OPERATIVE'}</span>
                                      <span className="text-[9px] font-mono italic opacity-60 tracking-tight leading-tight mb-2 text-center">
                                        "{user?.bio || 'System_Access_Granted'}"
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Network Connectivity Status */}
                            <div className="flex flex-col items-center mb-10 w-full px-8">
                              <div className="w-full flex items-start justify-between border-y border-black/[0.03] dark:border-white/[0.03] py-4 px-2">
                                <div className="flex flex-col items-center">
                                  <span className="text-[7px] font-black text-black/20 dark:text-white/20 uppercase tracking-[0.4em] mb-1.5">NETWORKS</span>
                                  <span className="text-[14px] font-black tracking-widest text-black dark:text-white leading-none">
                                    {user?.connections?.length || 0}
                                  </span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <span className="text-[7px] font-black text-black/20 dark:text-white/20 uppercase tracking-[0.4em] mb-1.5">LINKED TO:</span>
                                  <span className={`text-[10px] font-black tracking-widest leading-none uppercase ${user?.partner?.username ? 'text-emerald-500' : 'text-black dark:text-white'}`}>
                                    {user?.partner?.username ? `@${user.partner.username.split('#')[0].toUpperCase()}` : 'X'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Financial Vitals inside ID - Bottom Bar */}
                            <div className="absolute bottom-8 left-0 w-full px-8 py-3 flex items-start justify-between gap-2 border-t border-black/10 dark:border-white/10">
                              {[
                                { l: 'CURRENT', v: currentBalance },
                                { l: 'PROJECTION', v: netProjection },
                                { l: 'SAVINGS', v: totalSavings }
                              ].map((m, i) => (
                                <div key={i} className="flex flex-col items-center flex-1 min-w-0">
                                  <span className="text-[13px] font-black tracking-tighter leading-none" style={{ color: m.v > 0 ? '#10b981' : m.v < 0 ? '#f43f5e' : 'inherit' }}>
                                    {user?.currency === 'PHP' ? '₱' : '$'}{m.v < 0 ? '-' : ''}{Math.abs(m.v).toLocaleString()}
                                  </span>
                                  <span className="text-[8px] font-black text-black/20 dark:text-white/20 uppercase tracking-[0.1em] mt-1.5 text-center truncate w-full">{m.l}</span>
                                </div>
                              ))}
                            </div>
                            {/* Retract ID Button (X Icon) on the right side */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsIdPulledDown(false);
                              }}
                              className="absolute top-8 right-8 z-40 p-2 text-black dark:text-white opacity-40 dark:opacity-20 hover:opacity-100 transition-all hover:scale-125 cursor-pointer"
                              title="RETRACT ID"
                            >
                              <span className="material-symbols-outlined text-sm font-bold">
                                close
                              </span>
                            </button>

                            {/* ID Action Menu (Kinetic Transformation) */}
                            <div className="absolute top-8 left-8 z-40 flex flex-col items-center">
                              {isEditing ? (
                                <div className="flex flex-col items-center gap-3 bg-black/5 dark:bg-white/5 backdrop-blur-md p-2 rounded-sm border border-black/10 dark:border-white/10">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}
                                    className="p-1 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-all hover:scale-125"
                                    title="ABORT_CHANGES"
                                  >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                  </button>
                                  <div className="h-[1px] w-3 bg-black/10 dark:bg-white/10" />
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleSaveInline(); }}
                                    className="p-1 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-all hover:scale-125"
                                    title="SYNC_CHANGES"
                                  >
                                    <span className="material-symbols-outlined text-sm">check</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsIdMenuOpen(!isIdMenuOpen);
                                    }}
                                    className={`p-2 transition-all group/menu z-50`}
                                  >
                                    <motion.span
                                      animate={{ rotate: isIdMenuOpen ? 90 : 0 }}
                                      className={`material-symbols-outlined text-sm transition-opacity ${isIdMenuOpen ? 'text-black dark:text-white' : 'text-black dark:text-white opacity-40 dark:opacity-20 group-hover/menu:opacity-100'}`}
                                    >
                                      more_vert
                                    </motion.span>
                                  </button>

                                  <AnimatePresence>
                                    {isIdMenuOpen && (
                                      <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="flex flex-col items-center gap-3 bg-black/5 dark:bg-white/5 backdrop-blur-md p-2 rounded-sm border border-black/10 dark:border-white/10 mt-6"
                                      >
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setIsIdMenuOpen(false); setIsEditing(true); }}
                                          className="p-1 transition-colors"
                                          title="EDIT_ID"
                                        >
                                          <span className="material-symbols-outlined text-[16px] text-black dark:text-white opacity-40 hover:opacity-100">edit</span>
                                        </button>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setIsIdMenuOpen(false); setIsSearchModalOpen(true); }}
                                          className="p-1 transition-colors"
                                          title="SEARCH_ID"
                                        >
                                          <span className="material-symbols-outlined text-[16px] text-black dark:text-white opacity-40 hover:opacity-100">search</span>
                                        </button>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setIsIdMenuOpen(false); setIsIdPulledDown(false); }}
                                          className="p-1 transition-colors"
                                          title="RETRACT_ID"
                                        >
                                          <span className="material-symbols-outlined text-[16px] text-black dark:text-white opacity-40 hover:opacity-100">arrow_upward</span>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setIsIdMenuOpen(false);
                                            setIsConnectionsModalOpen(true);
                                          }}
                                          className="p-1 transition-colors"
                                          title="NETWORK_ID"
                                        >
                                          <span className="material-symbols-outlined text-[16px] text-black dark:text-white opacity-40 hover:opacity-100">group</span>
                                        </button>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gray-300 dark:bg-[#0f0f0f] text-black dark:text-white p-6 md:p-8 rounded-sm flex flex-col justify-between items-center text-center overflow-hidden" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                          <ChippedBorder opacity={1} />
                          {/* PRODUS WATERMARK */}
                          <div className="absolute inset-0 flex items-end justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.02] select-none z-0 pb-20 md:pb-24" style={{ transform: 'translateX(100px)' }}>
                            <span className="font-sans font-black text-[70px] md:text-[90px] tracking-[0.1em] uppercase">PRODUS</span>
                          </div>
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 size-8 bg-black/10 dark:bg-[#000000] rounded-full border-[7px] border-white dark:border-[#0f0f0f] z-20 flex items-center justify-center">
                            <div className="absolute inset-[-1px] rounded-full border-[0.5px] border-black/20 dark:border-white/20" style={{ clipPath: 'polygon(0% 0%, 25% 5%, 50% 0%, 75% 5%, 100% 0%, 95% 25%, 100% 50%, 95% 75%, 100% 100%, 75% 95%, 50% 100%, 25% 95%, 0% 100%, 5% 75%, 0% 50%, 5% 25%)' }} />
                          </div>
                          <div className="flex flex-col gap-6 w-full items-center mt-10">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 dark:text-white/20">System Metadata</span>
                              <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">Global_Unique_Identifier</span>
                            </div>
                            <div className="p-4 bg-white rounded-sm shadow-[0_0_50px_rgba(255,255,255,0.05)] relative z-10">
                              <QRCodeSVG 
                                id="operator-qr-svg"
                                value={user?._id || 'PRODUS_OPERATIVE'} 
                                size={140} 
                                bgColor={"#FFFFFF"} 
                                fgColor={"#000000"} 
                                level={"H"} 
                              />
                            </div>
                            <div className="flex flex-col items-center gap-4 w-full">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-black/10 dark:text-white/10">Full Access Key</span>
                                <div className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-2.5 rounded-sm font-mono text-[9px] break-all leading-relaxed opacity-60 text-center uppercase tracking-tighter">
                                  {user?._id || 'SESSION_DATA_NOT_FOUND'}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-2.5 w-full pt-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const svg = document.getElementById('operator-qr-svg');
                                    if (!svg) return;
                                    const svgData = new XMLSerializer().serializeToString(svg);
                                    const canvas = document.createElement("canvas");
                                    const ctx = canvas.getContext("2d");
                                    const img = new Image();
                                    img.onload = () => {
                                      canvas.width = img.width;
                                      canvas.height = img.height;
                                      ctx.fillStyle = "white";
                                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                                      ctx.drawImage(img, 0, 0);
                                      const link = document.createElement("a");
                                      link.download = `operator_key_${user?._id?.slice(-6).toUpperCase()}.png`;
                                      link.href = canvas.toDataURL("image/png");
                                      link.click();
                                    };
                                    img.src = "data:image/svg+xml;base64," + btoa(svgData);
                                  }}
                                  className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black font-black text-[9px] uppercase tracking-[0.4em] hover:bg-black/90 dark:hover:bg-white/90 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                  <span className="material-symbols-outlined text-[14px]">download</span>
                                  SAVE QR CODE
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setQrModalMode('scan');
                                    setIsQrModalOpen(true);
                                  }}
                                  className="w-full py-3.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white font-black text-[9px] uppercase tracking-[0.4em] hover:bg-black/10 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                  <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
                                  SCAN QR CODE
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div id="section-priority" className="snap-start snap-always md:col-span-5 w-full flex flex-col gap-8 pt-28 pb-0 md:py-10 md:min-h-[80vh]">
                <PriorityHUD />
              </div>
            </div>

            {/* Bottom Grid Layout - Split Financial HUD */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-32 md:gap-8 max-w-full md:snap-start md:snap-always h-auto pt-0 md:pt-20 pb-40 md:pb-4">
              
              {/* Left Part: Financial Overview (8/12) */}
              <motion.div 
                id="section-overview"
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="snap-start snap-always scroll-mt-28 md:scroll-mt-0 md:snap-align-none md:col-span-8 group relative bg-foreground/[0.03] rounded-sm p-6 md:p-12 hover:bg-foreground/[0.05] transition-all flex flex-col justify-start min-h-[82vh] md:min-h-[500px]"
              >
                <ChippedBorder opacity={0.7} />
                <FinancialOverview
                  transactions={transactions}
                  budgets={budgets}
                  currencySymbol={user?.currency === 'PHP' ? '₱' : '$'}
                  totalSavings={totalSavingsForMonth}
                  totalDebt={totalDebtForMonth}
                  totalUpcomingIncome={totalUpcomingIncomeForMonth}
                  addFinanceItem={addFinanceItem}
                  deleteFinanceItem={deleteFinanceItem}
                  showAddTx={showAddTx}
                  setShowAddTx={setShowAddTx}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                />
              </motion.div>

              {/* Right Part: Breakdown (4/12) */}
              <motion.div 
                id="section-breakdown"
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.1 }}
                className="snap-start snap-always scroll-mt-28 md:scroll-mt-0 md:snap-align-none md:col-span-4 group relative bg-foreground/[0.03] rounded-sm p-6 md:p-12 hover:bg-foreground/[0.05] transition-all flex flex-col justify-start min-h-[82vh] md:min-h-0"
              >
                <ChippedBorder opacity={0.7} />
                <FinancialBreakdown
                  selectedTransactions={combinedTransactions}
                  totalExpenses={filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)}
                  localCurrency={user?.currency === 'PHP' ? '₱' : '$'}
                  setShowAddTx={setShowAddTx}
                  updateFinanceItem={updateFinanceItem}
                  deleteFinanceItem={deleteFinanceItem}
                  addFinanceItem={addFinanceItem}
                  allTransactions={transactions}
                  budgets={budgets}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
