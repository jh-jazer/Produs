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
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';
import Avatar from '../components/ui/Avatar';
import { useFinance } from '../hooks/useFinance';
import { usePlanner } from '../hooks/usePlanner';
import { useHabits } from '../hooks/useHabits';
import { useGoals } from '../hooks/useGoals';

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
  const [matrixText, setMatrixText] = useState("");
  const textToType = "PRODUS";
  const matrixChars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*<>";

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
        </AnimatePresence>
      </div>


    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const { user, updateSettings, syncUser } = useAuthStore();
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
    setActiveSection: setGlobalActiveSection,
    isIdPulledDown,
    setIsIdPulledDown
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
  const [activePriorityIndex, setActivePriorityIndex] = useState(9);
  
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const { tasks: plannerTasks = [] } = usePlanner(new Date());
  
  const currDate = new Date();
  const currYear = currDate.getFullYear();
  const currMonth = currDate.getMonth() + 1;
  const { tasks: monthlyTasks = [] } = usePlanner({ year: currYear, month: currMonth });
  const { habits = [] } = useHabits();
  const { goals = [] } = useGoals();

  const [currentTime, setCurrentTime] = useState(new Date());

  const timeUntilMidnight = useMemo(() => {
    const nextMidnight = new Date(currentTime);
    nextMidnight.setHours(24, 0, 0, 0);
    const diffMs = nextMidnight - currentTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMins}m`;
  }, [currentTime]);

  const currentStreak = useMemo(() => {
    return user?.rpg?.loginStreak || 1;
  }, [user]);

  const [claimedDaily, setClaimedDaily] = useState(false);
  const [claimedStreak, setClaimedStreak] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimRewardInfo, setClaimRewardInfo] = useState(null);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);


  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [focusTimeLeft, setFocusTimeLeft] = useState(1500);
  const [focusSelectedTime, setFocusSelectedTime] = useState(25);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const [focusStage, setFocusStage] = useState('select');
  const [lootBoxOpened, setLootBoxOpened] = useState(false);
  const [showFocusCancelConfirm, setShowFocusCancelConfirm] = useState(false);

  // Focus Timer Countdown Effect
  useEffect(() => {
    let interval = null;
    if (showFocusTimer && isFocusRunning && focusTimeLeft > 0) {
      interval = setInterval(() => {
        setFocusTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (showFocusTimer && focusTimeLeft === 0 && isFocusRunning) {
      setIsFocusRunning(false);
      setFocusStage('complete');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showFocusTimer, isFocusRunning, focusTimeLeft]);

  // Toggle layout visibility during Focus Mode
  useEffect(() => {
    if (showFocusTimer) {
      document.body.classList.add('focus-mode-active');
    } else {
      document.body.classList.remove('focus-mode-active');
    }
    return () => {
      document.body.classList.remove('focus-mode-active');
    };
  }, [showFocusTimer]);

  // Progressive reward points calculation
  const calculateFocusPoints = (minutes) => {
    let totalPoints = 0;
    for (let i = 1; i <= minutes; i++) {
      totalPoints += Math.floor((i - 1) / 5) + 1;
    }
    return totalPoints;
  };

  const handleClaimDaily = () => {
    if (claimedDaily) return;
    setClaimRewardInfo({
      title: "DAILY BOUNTY CLASSIFIED",
      subtitle: "SYSTEM REWARD UNLOCKED",
      icon: "stars",
      rewards: ["+50 ProdPoints Granted"]
    });
    setShowClaimModal(true);
    setClaimedDaily(true);
    localStorage.setItem('claimedDailyReward', 'true');
    if (user) {
      const currentCoins = user.rpg?.prodCoins || 0;
      syncUser({
        rpg: {
          ...user.rpg,
          prodCoins: currentCoins + 50
        }
      });
      // Log to activities history
      api.post('/rpg/log-activity', {
        type: 'system',
        action: 'Claimed Daily Bounty reward',
        stat: 'none',
        amount: 50
      }).catch(err => console.error("Failed logging daily claim:", err));
    }
  };

  const handleClaimStreak = () => {
    if (claimedStreak) return;
    setClaimRewardInfo({
      title: "365-DAY CHRONO MILESTONE",
      subtitle: "EPIC LEGEND REWARD",
      icon: "military_tech",
      rewards: ["+1,000 ProdPoints Granted", "ECLIPSE Avatar Frame Unlocked"]
    });
    setShowClaimModal(true);
    setClaimedStreak(true);
    localStorage.setItem('claimedStreakReward', 'true');
    if (user) {
      const currentCoins = user.rpg?.prodCoins || 0;
      const currentExp = user.exp || 0;
      syncUser({
        rpg: {
          ...user.rpg,
          prodCoins: currentCoins + 1000
        },
        exp: currentExp + 500
      });
      // Log to activities history
      api.post('/rpg/log-activity', {
        type: 'system',
        action: 'Claimed Epic 365-Day Chrono Matrix',
        stat: 'none',
        amount: 1000
      }).catch(err => console.error("Failed logging epic streak claim:", err));
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    
    setTimeout(() => {
      if (carouselRef.current) {
        const flexContainer = carouselRef.current.children[0];
        if (flexContainer && flexContainer.children[9]) {
          flexContainer.children[9].scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
        } else {
          carouselRef.current.scrollLeft = (carouselRef.current.scrollWidth / 3) + (carouselRef.current.clientWidth * 0.82);
        }
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const priorityCards = useMemo(() => {
    const todayStr = currentTime.toISOString().split('T')[0];
    const currentHourStr = currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    // 1. Habits Tracker
    const undoneHabits = habits.filter(h => {
      const todayCheck = h.checks?.find(c => c.date === todayStr);
      return !todayCheck || !todayCheck.completed;
    }).slice(0, 3);
    
    const habitsActivities = undoneHabits.length > 0 ? undoneHabits.map(h => ({
      title: h.title,
      time: `STREAK: ${h.streak || 0} DAYS`,
      status: 'PENDING'
    })) : [{ title: 'ALL CLEAR', time: 'TODAY', status: 'STANDBY' }];

    // 2. Daily Activities
    const sortedTasks = [...plannerTasks].filter(t => !t.completed && t.startTime).sort((a, b) => a.startTime.localeCompare(b.startTime));
    const upcomingTasks = sortedTasks.filter(t => (t.startTime <= currentHourStr && currentHourStr <= t.endTime) || t.startTime > currentHourStr);
    
    const dailyActivities = upcomingTasks.length > 0 ? upcomingTasks.slice(0, 3).map(t => ({
      title: t.title,
      time: `${t.startTime} - ${t.endTime}`,
      status: t.startTime <= currentHourStr && currentHourStr <= t.endTime ? 'URGENT' : 'PENDING'
    })) : [{ title: 'NONE YET', time: 'CURRENT', status: 'STANDBY' }];

    // 3. Calendar (Upcoming events this month)
    const upcomingEvents = monthlyTasks.filter(t => t.type === 'event' && t.date && t.date >= todayStr && !t.completed).sort((a, b) => a.date.localeCompare(b.date));
    const calendarActivities = upcomingEvents.length > 0 ? upcomingEvents.slice(0, 3).map(t => ({
      title: t.title,
      time: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
      status: t.date === todayStr ? 'URGENT' : 'PENDING'
    })) : [{ title: 'NO UPCOMING', time: 'THIS MONTH', status: 'STANDBY' }];

    // 4-6. Targets helper
    const getTargetActivities = (period) => {
      const periodGoals = goals.filter(g => g.period === period && !g.completed);
      return periodGoals.length > 0 ? periodGoals.slice(0, 3).map(g => ({
        title: g.title,
        time: 'ACTIVE TARGET',
        status: 'PENDING'
      })) : [{ title: 'NO TARGET', time: period.toUpperCase(), status: 'STANDBY' }];
    };

    // 7-8. Finance helpers
    const getFinanceActivities = (nature) => {
      const items = debts.filter(d => (d.nature || 'debt') === nature);
      return items.length > 0 ? items.slice(0, 3).map(d => ({
        title: d.title,
        time: `$${(d.amount || 0).toLocaleString()} / $${(d.total || 0).toLocaleString()}`,
        status: nature === 'debt' ? 'URGENT' : 'PENDING'
      })) : [{ title: 'ALL CLEAR', time: nature === 'debt' ? 'LIABILITIES' : 'RECEIVABLES', status: 'STANDBY' }];
    };

    return [
      { type: 'multi', header: 'HABITS TRACKER', activities: habitsActivities },
      { type: 'multi', header: 'DAILY ACTIVITY', activities: dailyActivities },
      { type: 'multi', header: 'CALENDAR', activities: calendarActivities },
      { type: 'multi', header: 'THIS WEEK TARGET', activities: getTargetActivities('weekly') },
      { type: 'multi', header: 'THIS MONTH TARGET', activities: getTargetActivities('monthly') },
      { type: 'multi', header: 'THIS YEAR TARGET', activities: getTargetActivities('yearly') },
      { type: 'multi', header: 'DEBTS & LIABILITIES', activities: getFinanceActivities('debt') },
      { type: 'multi', header: 'RECEIVABLE ASSETS', activities: getFinanceActivities('income') }
    ];
  }, [plannerTasks, monthlyTasks, habits, goals, debts, currentTime]);

  const desktopIndex = (activePriorityIndex === null) 
      ? 1 
      : (activePriorityIndex % priorityCards.length);

  const handleNextCard = (e) => {
    e.stopPropagation();
    const nextIndex = (desktopIndex + 1) % priorityCards.length;
    setActivePriorityIndex(nextIndex);
  };

  const handlePrevCard = (e) => {
    e.stopPropagation();
    const prevIndex = (desktopIndex - 1 + priorityCards.length) % priorityCards.length;
    setActivePriorityIndex(prevIndex);
  };

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
            className="px-6 pt-0 md:pl-8 md:pr-12 md:py-6 h-[calc(100dvh-6rem)] md:h-auto md:min-h-screen overflow-hidden md:overflow-visible"
            onClick={() => setActivePriorityIndex(null)}
          >
            {/* Reality Dashboard Layout */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-32 md:gap-8 w-full h-full md:h-auto mb-0 md:mb-24">

              {/* Column 1-5: Integrated Swinging ID Assembly */}
              <div className="md:col-span-5 relative h-full md:min-h-[82vh] w-full flex flex-col items-center justify-center mb-0 snap-start snap-always">
                <div className="absolute inset-0 flex flex-col items-center">
                  
                  {/* Hidden ID Welcome Message */}
                  {!isIdPulledDown && (
                    <motion.div
                      initial={{ opacity: 0, filter: 'blur(10px)', x: -20 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
                      exit={{ opacity: 0, filter: 'blur(10px)', x: -20 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="absolute top-[12%] bottom-2 md:bottom-auto md:top-[5%] left-6 md:left-12 right-6 md:right-12 flex flex-col items-start pointer-events-none text-left"
                    >
                      <h3 className="welcome-title-text font-black tracking-tighter text-black dark:text-white uppercase">
                        {(() => {
                          if (!claimedDaily) return "Welcome";
                          const hour = currentTime.getHours();
                          if (hour < 12) return "Good Morning";
                          if (hour < 18) return "Good Afternoon";
                          return "Good Evening";
                        })()}, {user?.username?.split('#')[0] || 'Operator'}
                      </h3>
                      <p className="text-[10px] md:text-sm font-mono uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mt-1 md:mt-2">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                      
                      {/* Spacer 1 to center Start Focus button */}
                      <div className="flex-1 md:hidden" />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFocusSelectedTime(25);
                          setFocusTimeLeft(1500);
                          setIsFocusRunning(false);
                          setFocusStage('select');
                          setShowFocusTimer(true);
                        }}
                        className="mt-0 md:mt-[9vh] px-8 h-[8vh] bg-transparent text-black dark:text-white font-black uppercase text-[10px] tracking-[0.25em] border border-black dark:border-white rounded-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 pointer-events-auto flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)] active:scale-95 z-20"
                      >
                        <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                        START FOCUS
                      </button>

                      {/* Spacer 2 to center Start Focus button */}
                      <div className="flex-1 md:hidden" />

                      <div className="mt-0 md:mt-[9vh] flex flex-col gap-1 items-start -translate-y-8 md:translate-y-0">
                        <div className="text-2xl md:text-4xl font-black uppercase tracking-[0.25em] text-black dark:text-white leading-none">
                          PRIORITIES
                        </div>
                        <div className="text-[10px] md:text-xs font-mono uppercase tracking-[0.25em] text-black/50 dark:text-white/50">
                          {isMobile 
                            ? (activePriorityIndex !== null ? [...priorityCards, ...priorityCards, ...priorityCards][activePriorityIndex]?.header || 'DAILY ACTIVITY' : 'DAILY ACTIVITY')
                            : priorityCards[desktopIndex].header
                          }
                        </div>
                      </div>

                      {/* Horizontal Scroll Cards / Desktop Slideshow Layout */}
                      {isMobile ? (
                        <div 
                          className="w-screen relative mt-3 -ml-12 cursor-default -translate-y-8"
                          onClick={() => setActivePriorityIndex(null)}
                        >
                          {/* Gradient masks for smooth fade edges */}
                          <div className="absolute left-0 top-0 bottom-0 w-4 md:w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
                          
                          <div 
                            ref={carouselRef}
                            className={`w-full overflow-x-auto pt-3 pb-4 pointer-events-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isDragging ? 'cursor-grabbing' : 'snap-x snap-mandatory cursor-grab'}`}
                            onMouseDown={(e) => {
                              setIsDragging(true);
                              setStartX(e.pageX - carouselRef.current.offsetLeft);
                              setScrollLeft(carouselRef.current.scrollLeft);
                            }}
                            onMouseLeave={() => setIsDragging(false)}
                            onMouseUp={() => setIsDragging(false)}
                            onMouseMove={(e) => {
                              if (!isDragging) return;
                              e.preventDefault();
                              const x = e.pageX - carouselRef.current.offsetLeft;
                              const walk = (x - startX) * 1.5;
                              carouselRef.current.scrollLeft = scrollLeft - walk;
                            }}
                            onScroll={(e) => {
                              const el = e.currentTarget;
                              const setWidth = el.scrollWidth / 3;
                              
                              if (el.scrollLeft >= setWidth * 2 - 10) {
                                el.scrollLeft -= setWidth;
                              } else if (el.scrollLeft <= 0) {
                                el.scrollLeft += setWidth;
                              }

                              const center = el.scrollLeft + el.clientWidth / 2;
                              const flexContainer = el.children[0];
                              if (flexContainer) {
                                let closestIndex = 0;
                                let minDiff = Infinity;
                                Array.from(flexContainer.children).forEach((child, i) => {
                                  const childCenter = child.offsetLeft + child.clientWidth / 2;
                                  const diff = Math.abs(childCenter - center);
                                  if (diff < minDiff) {
                                    minDiff = diff;
                                    closestIndex = i;
                                  }
                                });
                                setActivePriorityIndex(prev => prev === closestIndex ? prev : closestIndex);
                              }
                            }}
                          >
                            <div className="flex gap-12 w-max px-[9vw]">
                              {[...priorityCards, ...priorityCards, ...priorityCards].map((card, i) => {
                                const isActive = i === activePriorityIndex;
                                return (
                                  <div 
                                    key={i} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActivePriorityIndex(i);
                                      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                                    }}
                                    className={`snap-center w-[94vw] h-64 md:h-72 rounded-3xl border-2 backdrop-blur-md p-6 md:p-8 flex flex-col justify-between shrink-0 transition-all duration-500 cursor-pointer group origin-center scale-105 opacity-100 ${
                                      isActive 
                                        ? 'border-black/40 dark:border-white/40 bg-white/80 dark:bg-white/[0.08] shadow-lg shadow-black/[0.05] dark:shadow-white/[0.02]' 
                                        : 'border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] shadow-md hover:border-black/30 dark:hover:border-white/30 hover:bg-white/50 dark:hover:bg-white/[0.04]'
                                    }`}
                                  >
                                    {card.type === 'multi' ? (
                                      <div className="flex flex-col h-full justify-end gap-4">
                                        {card.activities.map((act, idx) => (
                                          <div key={idx} className={`flex flex-col gap-1 ${idx > 0 ? 'pt-2 border-t border-black/10 dark:border-white/10' : ''}`}>
                                            <div className="flex items-center gap-3">
                                              <span className={`shrink-0 w-3 h-3 rounded-full ${
                                                act.status === 'URGENT' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]' :
                                                act.status === 'PENDING' ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]' :
                                                'bg-black/20 dark:bg-white/20'
                                              }`} />
                                              <span className={`text-xl font-black uppercase tracking-wider leading-tight truncate transition-colors duration-300 ${
                                                isActive ? 'text-primary' : 'text-black dark:text-white group-hover:text-primary'
                                              }`}>
                                                {act.title}
                                              </span>
                                            </div>
                                            <span className="text-xs font-mono text-black/50 dark:text-white/50">
                                              {act.time}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex justify-between items-start">
                                          <span className="text-sm font-mono text-black/50 dark:text-white/50">{card.time}</span>
                                        </div>
                                        <span className={`text-3xl font-black uppercase tracking-wider leading-tight transition-colors duration-300 ${
                                          isActive ? 'text-primary' : 'text-black dark:text-white group-hover:text-primary'
                                        }`}>
                                          {card.title}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Desktop Single Card slideshow Layout */
                        <div className="flex items-center gap-6 mt-6 pointer-events-auto select-none w-full max-w-[1180px]">
                          {/* Active Card */}
                          <div 
                            className="w-full md:flex-1 md:max-w-[1060px] h-72 md:h-96 rounded-3xl border-2 border-black/40 dark:border-white/40 bg-white/80 dark:bg-white/[0.08] backdrop-blur-md p-8 md:p-12 flex flex-col justify-between transition-all duration-500 cursor-default shadow-lg shadow-black/[0.05] dark:shadow-white/[0.02] origin-center scale-105 opacity-100 z-20"
                          >
                            {priorityCards[desktopIndex].type === 'multi' ? (
                              <div className="flex flex-col h-full justify-end gap-4 md:gap-6">
                                {priorityCards[desktopIndex].activities.map((act, idx) => (
                                  <div key={idx} className={`flex flex-col gap-1 ${idx > 0 ? 'pt-2 md:pt-4 border-t border-black/10 dark:border-white/10' : ''}`}>
                                    <div className="flex items-center gap-3 md:gap-4">
                                      <span className={`shrink-0 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${
                                        act.status === 'URGENT' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]' :
                                        act.status === 'PENDING' ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]' :
                                        'bg-black/20 dark:bg-white/20'
                                      }`} />
                                      <span className="text-xl md:text-3xl font-black uppercase tracking-wider text-primary leading-none truncate">
                                        {act.title}
                                      </span>
                                    </div>
                                    <span className="text-xs md:text-sm font-mono text-black/50 dark:text-white/50">
                                      {act.time}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <>
                                <div className="flex justify-between items-start">
                                  <span className="text-xs md:text-base font-mono text-black/50 dark:text-white/50">{priorityCards[desktopIndex].time}</span>
                                </div>
                                <span className="text-3xl md:text-5xl font-black uppercase tracking-wider text-primary leading-none">
                                  {priorityCards[desktopIndex].title}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Next Button */}
                          <button
                            onClick={handleNextCard}
                            className="size-10 ml-10 rounded-full border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center transition-all active:scale-90"
                          >
                            <span className="material-symbols-outlined text-black dark:text-white text-base">chevron_right</span>
                          </button>
                        </div>
                      )}


                      {/* Floating Right Side HUD Boxes: Rewards */}
                      {(protocolMode !== 'rpg' || activeRpgTab === 'home') && !isIdPulledDown && (
                        <div className="hidden lg:flex flex-col gap-4 absolute right-14 top-0 w-72 pointer-events-auto">
                          {/* Daily Reward Box */}
                          <div 
                            onClick={() => setShowWeeklyModal(true)}
                            className={`relative border rounded-sm p-4 flex flex-col gap-2 transition-all duration-300 overflow-hidden group/reward select-none cursor-pointer ${
                              claimedDaily 
                                ? 'border-black/5 dark:border-white/5 bg-transparent opacity-60 hover:border-emerald-500/30' 
                                : 'border-black/10 dark:border-white/10 bg-transparent hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-black/5 dark:hover:bg-white/[0.03] hover:shadow-[0_0_20px_rgba(16,185,129,0.05)] active:scale-[0.98]'
                            }`}
                          >
                            {/* Pulsing indicator corner */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                              <span className={`size-2 rounded-full ${claimedDaily ? 'bg-white/20' : 'bg-emerald-500 animate-pulse'}`} />
                              <span className="text-[8px] font-mono tracking-widest text-black/30 dark:text-white/30 uppercase">
                                {claimedDaily ? 'CLAIMED' : 'READY'}
                              </span>
                            </div>

                            <span className="text-[8px] font-mono font-black uppercase tracking-[0.25em] text-black/40 dark:text-white/40">SYSTEM BOUNTY</span>
                            <div className="flex items-center gap-3">
                              <span className={`material-symbols-outlined text-2xl ${claimedDaily ? 'text-white/30' : 'text-emerald-500 transition-transform group-hover/reward:scale-110 duration-300'}`}>workspace_premium</span>
                              <div className="flex flex-col">
                                <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white leading-tight">DAILY REWARD</h4>
                                <p className="text-[9px] font-mono text-black/40 dark:text-white/40 uppercase tracking-widest mt-0.5">
                                  {claimedDaily ? '+50 POINTS & +100 XP' : 'CLAIM POINTS & XP'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* 365 Streak Reward Box */}
                          <div 
                            onClick={() => setShowStreakModal(true)}
                            className={`relative border rounded-sm p-4 flex flex-col gap-2 transition-all duration-300 overflow-hidden group/reward select-none cursor-pointer ${
                              claimedStreak 
                                ? 'border-black/5 dark:border-white/5 bg-transparent opacity-60 hover:border-amber-500/30' 
                                : 'border-black/10 dark:border-white/10 bg-transparent hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:bg-black/5 dark:hover:bg-white/[0.03] hover:shadow-[0_0_20px_rgba(245,158,11,0.05)] active:scale-[0.98]'
                            }`}
                          >
                            {/* Pulsing indicator corner */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                              <span className={`size-2 rounded-full ${claimedStreak ? 'bg-white/20' : 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`} />
                              <span className="text-[8px] font-mono tracking-widest text-black/30 dark:text-white/30 uppercase">
                                {claimedStreak ? 'UNLOCKED' : 'READY'}
                              </span>
                            </div>

                            <span className="text-[8px] font-mono font-black uppercase tracking-[0.25em] text-black/40 dark:text-white/40">ANNUAL MILESTONE</span>
                            <div className="flex items-center gap-3">
                              <span className={`material-symbols-outlined text-2xl ${claimedStreak ? 'text-white/30' : 'text-amber-500 transition-transform group-hover/reward:scale-110 duration-300'}`}>military_tech</span>
                              <div className="flex flex-col">
                                <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white leading-tight">365 STREAK</h4>
                                <p className="text-[9px] font-mono text-black/40 dark:text-white/40 uppercase tracking-widest mt-0.5">
                                  {claimedStreak ? 'ECLIPSE REWARD SECURED' : 'UNLOCK EPIC FRAME'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}



                    </motion.div>
                  )}

                  {/* Sash Cord Pull Handle */}
                  {(!isIdPulledDown || !isMobile) && (
                    <motion.div 
                      initial={{ opacity: 0, y: -50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -50 }}
                      transition={{ type: "spring", stiffness: 150, damping: 18 }}
                      className="absolute top-0 md:-mt-6 right-16 md:right-0 z-40 flex flex-col items-center cursor-pointer pointer-events-auto"
                      onClick={() => setIsIdPulledDown(!isIdPulledDown)}
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
                          {isIdPulledDown ? "RETRACT ID" : "PULL ID"}
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
                    className="absolute top-0 md:-mt-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center"
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
                      <div className="w-[12px] h-[15vh] md:h-20 bg-white opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.1)] shrink-0 z-50 group-hover/retract:bg-white group-hover/retract:opacity-100 transition-all" />
                      
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
                                size={180} 
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

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Unlock/Claim Celebration Overlay Modal */}
      <AnimatePresence>
        {showClaimModal && claimRewardInfo && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setShowClaimModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md bg-black/80 border border-black dark:border-white/10 p-8 text-center flex flex-col items-center gap-6 rounded-sm shadow-[0_0_50px_rgba(255,255,255,0.15)] overflow-hidden pointer-events-auto"
            >
              {/* Subtle grid lines background overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              
              <div className="size-16 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white shrink-0 animate-bounce">
                <span className="material-symbols-outlined text-4xl text-amber-400">
                  {claimRewardInfo.icon}
                </span>
              </div>

              <div className="flex flex-col gap-1 z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">{claimRewardInfo.subtitle}</span>
                <h3 className="text-2xl font-black uppercase tracking-wider text-white leading-tight">
                  {claimRewardInfo.title}
                </h3>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 w-full rounded-sm flex flex-col gap-2 z-10">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">BOUNTY RECLAIMED</span>
                <div className="flex flex-col gap-1">
                  {claimRewardInfo.rewards.map((rew, idx) => (
                    <div key={idx} className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-black uppercase tracking-wider">
                      <span className="material-symbols-outlined text-base">done_all</span>
                      {rew}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowClaimModal(false)}
                className="w-full bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] py-4 rounded-sm hover:bg-white/80 active:scale-95 transition-all z-10"
              >
                CONFIRM & CLOSE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Reward HUD Buttons */}
      {isMobile && !showWeeklyModal && !showStreakModal && protocolMode !== 'rpg' && viewMode !== 'partner' && !isIdPulledDown && (
        <div className="fixed top-[35vh] right-0 z-[100] flex flex-col items-end gap-4 pointer-events-none">
          {/* Daily Reward Button */}
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowWeeklyModal(true)}
            animate={{ width: isIdPulledDown ? '76px' : '96px' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`h-[8vh] flex flex-col items-center justify-center pointer-events-auto group overflow-hidden transition-colors rounded-l-md border-y-2 border-l-2 cursor-pointer ${
              claimedDaily 
                ? 'bg-transparent border-black/10 dark:border-white/20 text-black/60 dark:text-white/60 hover:text-emerald-500 dark:hover:text-emerald-400' 
                : 'bg-emerald-500/10 border-emerald-500 text-emerald-500 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)] font-black animate-pulse'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] pl-1 transition-colors duration-300 text-current">
              DAILY
            </span>
            <span className="text-[7px] font-mono opacity-60 tracking-[0.1em] pl-1 mt-0.5 uppercase text-current">
              {claimedDaily ? timeUntilMidnight : 'READY'}
            </span>
          </motion.button>

          {/* Streak Reward Button */}
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowStreakModal(true)}
            animate={{ width: isIdPulledDown ? '76px' : '96px' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`h-[8vh] flex flex-col items-center justify-center pointer-events-auto group overflow-hidden transition-colors rounded-l-md border-y-2 border-l-2 cursor-pointer ${
              claimedStreak 
                ? 'bg-transparent border-black/10 dark:border-white/20 text-black/60 dark:text-white/60 hover:text-amber-500 dark:hover:text-amber-400' 
                : 'bg-amber-500/10 border-amber-500 text-amber-500 dark:text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] font-black animate-pulse'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] pl-1 transition-colors duration-300 text-current">
              STREAK
            </span>
            <span className="text-[7px] font-mono opacity-60 tracking-[0.1em] pl-1 mt-0.5 uppercase text-current">
              {claimedStreak ? 'SECURED' : 'READY'}
            </span>
          </motion.button>
        </div>
      )}

      {/* Weekly Rewards Modal */}
      <AnimatePresence>
        {showWeeklyModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center pt-24 pb-28 px-4 md:p-6 select-none">
            <style>{`
              .hud-buttons-container {
                display: none !important;
              }
            `}</style>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowWeeklyModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-xl bg-[#0f0f11] border border-white/10 p-6 md:p-8 rounded-sm shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col gap-6 max-h-full overflow-y-auto pointer-events-auto custom-scrollbar"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              
              <div className="flex justify-between items-start z-10">
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">7-DAY MATRIX REGISTRY</span>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white">WEEKLY BOUNTY HUNTER</h3>
                </div>
                <button
                  onClick={() => setShowWeeklyModal(false)}
                  className="p-1 rounded-sm hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 z-10 mt-2">
                {[
                  { day: 1, reward: "+50 POINTS", type: 'POINTS' },
                  { day: 2, reward: "+100 POINTS", type: 'POINTS' },
                  { day: 3, reward: "+100 POINTS", type: 'POINTS' },
                  { day: 4, reward: "+150 POINTS", type: 'POINTS' },
                  { day: 5, reward: "+200 POINTS", type: 'POINTS' },
                  { day: 6, reward: "+250 POINTS", type: 'POINTS' },
                  { day: 7, reward: "+500 POINTS & ECLIPSE FRAME", type: 'LEGENDARY' }
                ].map((item) => {
                  const isCurrentClaimable = item.day === 1 && !claimedDaily;
                  const isAlreadyClaimed = item.day === 1 && claimedDaily;
                  const isLocked = item.day > 1;

                  return (
                    <div 
                      key={item.day}
                      className={`relative border rounded-sm flex flex-col justify-between transition-all duration-300 ${
                        item.day === 7 
                          ? 'p-4 min-h-[110px] col-span-2 md:col-span-2' 
                          : 'p-3 min-h-[80px]'
                      } ${
                        isCurrentClaimable
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse'
                          : isAlreadyClaimed
                          ? 'border-white/5 bg-white/[0.02] opacity-55'
                          : 'border-white/10 bg-white/[0.01]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono tracking-widest text-white/40">DAY {item.day}</span>
                        {isAlreadyClaimed && <span className="material-symbols-outlined text-emerald-500 text-[14px]">check_circle</span>}
                        {isCurrentClaimable && <span className="material-symbols-outlined text-emerald-400 text-[14px] animate-bounce">stars</span>}
                        {isLocked && <span className="material-symbols-outlined text-white/20 text-[14px]">lock</span>}
                      </div>

                      <div className={`flex flex-col gap-0.5 text-left ${item.day === 7 ? 'mt-4' : 'mt-2'}`}>
                        <span className={`text-[11px] font-black uppercase tracking-wider ${isCurrentClaimable ? 'text-emerald-400' : 'text-white'}`}>
                          {item.reward}
                        </span>
                        <span className="text-[7.5px] font-mono text-white/30 tracking-widest uppercase">
                          {item.type}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!claimedDaily ? (
                <button
                  onClick={() => {
                    setShowWeeklyModal(false);
                    handleClaimDaily();
                  }}
                  className="w-full bg-emerald-500 text-black font-black uppercase tracking-[0.3em] text-[10px] py-4 rounded-sm hover:bg-emerald-400 active:scale-95 transition-all z-10 mt-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  CLAIM TODAY'S BOUNTY
                </button>
              ) : (
                <div className="w-full bg-white/5 border border-white/10 text-white/50 font-black uppercase tracking-[0.2em] text-[9px] py-4 rounded-sm text-center z-10 mt-2 font-mono">
                  TODAY'S BOUNTY SECURED. NEXT CLAIM IN {timeUntilMidnight}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 365 Streak Progression Modal */}
      <AnimatePresence>
        {showStreakModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center pt-24 pb-28 px-4 md:p-6 select-none">
            <style>{`
              .hud-buttons-container {
                display: none !important;
              }
            `}</style>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowStreakModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-xl bg-[#0f0f11] border border-white/10 p-6 md:p-8 rounded-sm shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col gap-6 max-h-full overflow-y-auto pointer-events-auto custom-scrollbar"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              
              <div className="flex justify-between items-start z-10">
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500/60">365-DAY CHRONO MATRIX</span>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white">STREAK CHRONICLE</h3>
                </div>
                <button
                  onClick={() => setShowStreakModal(false)}
                  className="p-1 rounded-sm hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-4 rounded-sm z-10 text-left">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-mono tracking-widest text-white/30 uppercase">OPERATIVE STREAK</span>
                  <span className="text-xl font-black text-amber-400 font-sans tracking-wide">{currentStreak} CONSECUTIVE DAYS</span>
                </div>
                <span className="material-symbols-outlined text-amber-500 text-3xl animate-pulse">local_fire_department</span>
              </div>

              <div className="h-[320px] overflow-y-auto pr-2 custom-scrollbar z-10 flex flex-col gap-2 scroll-smooth">
                {Array.from({ length: 365 }, (_, index) => {
                  const day = index + 1;
                  const isUnlocked = day <= currentStreak;
                  
                  let reward = `+${10 + day * 5} ProdPoints`;
                  let rank = 'ROOKIE STEP';
                  if (day % 7 === 0) {
                    reward = `+${day * 15} Points & +${day * 10} XP`;
                    rank = 'WEEKLY WARRIOR';
                  }
                  if (day % 30 === 0) {
                    reward = `+${day * 20} Points & Premium Buff`;
                    rank = 'MONTHLY TITAN';
                  }
                  if (day === 365) {
                    reward = "+1,000 Points & ECLIPSE Avatar Frame";
                    rank = 'ECLIPSE CHRONO LEGEND';
                  }

                  const isStreak365Target = day === 365;

                  return (
                    <div 
                      key={day}
                      className={`p-3 border rounded-sm flex items-center justify-between transition-all duration-200 ${
                        isUnlocked 
                          ? 'border-emerald-500/30 bg-emerald-500/[0.02]' 
                          : isStreak365Target
                          ? 'border-amber-500/50 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                          : 'border-white/5 bg-white/[0.005] opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className={`size-8 rounded-full border flex items-center justify-center shrink-0 ${
                          isUnlocked 
                            ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' 
                            : 'border-white/10 text-white/20'
                        }`}>
                          <span className="text-[10px] font-mono font-black">D{day}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-black uppercase tracking-wider ${isUnlocked ? 'text-white' : 'text-white/60'}`}>
                            {reward}
                          </span>
                          <span className="text-[7px] font-mono tracking-widest text-white/30 uppercase">
                            {rank}
                          </span>
                        </div>
                      </div>

              <div className="flex items-center gap-2">
                        {isUnlocked ? (
                          claimedStreak ? (
                            <span className="text-[7.5px] font-mono font-black text-emerald-500 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/20 rounded-sm">
                              CLAIMED
                            </span>
                          ) : (
                            <span className="text-[7.5px] font-mono font-black text-amber-500 uppercase tracking-widest px-2 py-0.5 bg-amber-500/15 border border-amber-500/20 rounded-sm animate-pulse">
                              CLAIM
                            </span>
                          )
                        ) : (
                          <span className="text-[7.5px] font-mono font-black text-white/40 uppercase tracking-widest px-2 py-0.5 bg-white/5 border border-white/10 rounded-sm">
                            LOCKED
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {currentStreak >= 365 && !claimedStreak ? (
                <button
                  onClick={() => {
                    setShowStreakModal(false);
                    handleClaimStreak();
                  }}
                  className="w-full bg-amber-500 text-black font-black uppercase tracking-[0.3em] text-[10px] py-4 rounded-sm hover:bg-amber-400 active:scale-95 transition-all z-10 shadow-[0_0_25px_rgba(245,158,11,0.3)] animate-pulse"
                >
                  CLAIM EPIC ECLIPSE FRAME
                </button>
              ) : !claimedStreak ? (
                <button
                  onClick={() => {
                    setShowStreakModal(false);
                    // Calculate and award rewards for the user's current streak day
                    const day = Math.min(currentStreak, 364);
                    let points = 10 + day * 5;
                    let desc = `+${points} ProdPoints Granted`;
                    if (day % 7 === 0) {
                      points = day * 15;
                      desc = `+${points} Points & +${day * 10} XP Granted`;
                    } else if (day % 30 === 0) {
                      points = day * 20;
                      desc = `+${points} Points & Premium Buff Granted`;
                    }
                    
                    setClaimRewardInfo({
                      title: `DAY ${currentStreak} STREAK CLAIMED`,
                      subtitle: "CHRONO MILESTONE SECURED",
                      icon: "local_fire_department",
                      rewards: [desc]
                    });
                    setShowClaimModal(true);
                    setClaimedStreak(true);
                    localStorage.setItem('claimedStreakReward', 'true');
                    
                    if (user) {
                      const currentCoins = user.rpg?.prodCoins || 0;
                      const currentExp = user.exp || 0;
                      const xpReward = day % 7 === 0 ? day * 10 : 0;
                      syncUser({
                        rpg: {
                          ...user.rpg,
                          prodCoins: currentCoins + points
                        },
                        exp: currentExp + xpReward
                      });
                      // Log to activities history
                      api.post('/rpg/log-activity', {
                        type: 'system',
                        action: `Claimed Day ${currentStreak} Streak milestone`,
                        stat: 'none',
                        amount: points
                      }).catch(err => console.error("Failed logging intermediate streak claim:", err));
                    }
                  }}
                  className="w-full bg-amber-500 text-black font-black uppercase tracking-[0.3em] text-[10px] py-4 rounded-sm hover:bg-amber-400 active:scale-95 transition-all z-10 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                >
                  CLAIM STREAK REWARDS
                </button>
              ) : (
                <div className="w-full bg-white/5 border border-white/10 text-white/50 font-black uppercase tracking-[0.2em] text-[9px] py-4 rounded-sm text-center z-10 font-mono">
                  STREAK REWARD CLAIMED. KEEP THE STREAK GOING!
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Black Focus Timer Overlay */}
      <AnimatePresence>
        {showFocusTimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] bg-black text-white flex flex-col items-center justify-center p-6 select-none font-mono"
          >
            {/* Subtle matrix-grid overlay for background aesthetics */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Stage 1: Select Focus Time */}
            {focusStage === 'select' && (
              <div className="flex flex-col items-center gap-8 max-w-md text-center z-10">
                <span className="material-symbols-outlined text-5xl text-white/40">hourglass_empty</span>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] tracking-[0.4em] text-white/40 uppercase">FOCUS TIMER</span>
                  <h3 className="text-2xl font-black uppercase tracking-wider text-white">SET FOCUS DURATION</h3>
                </div>

                {/* Pre-sets */}
                <div className="flex gap-4">
                  {[15, 25, 50].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        setFocusSelectedTime(mins);
                        setFocusTimeLeft(mins * 60);
                      }}
                      className={`px-6 py-3 border font-black text-xs uppercase tracking-wider transition-all duration-200 rounded-sm ${
                        focusSelectedTime === mins
                          ? 'border-white bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                          : 'border-white/10 bg-transparent text-white/60 hover:text-white hover:border-white/30'
                      }`}
                    >
                      {mins} MINS
                    </button>
                  ))}
                </div>

                {/* Custom Minutes controls */}
                <div className="flex items-center gap-4 border border-white/10 p-2 rounded-sm bg-white/[0.02]">
                  <button 
                    onClick={() => {
                      const newMins = Math.max(5, focusSelectedTime - 5);
                      setFocusSelectedTime(newMins);
                      setFocusTimeLeft(newMins * 60);
                    }}
                    className="size-8 flex items-center justify-center hover:bg-white/5 active:scale-90 text-white/60 hover:text-white transition-all text-xl"
                  >
                    -
                  </button>
                  <span className="text-xl font-mono font-black w-24 text-center">{focusSelectedTime} MINS</span>
                  <button 
                    onClick={() => {
                      const newMins = Math.min(180, focusSelectedTime + 5);
                      setFocusSelectedTime(newMins);
                      setFocusTimeLeft(newMins * 60);
                    }}
                    className="size-8 flex items-center justify-center hover:bg-white/5 active:scale-90 text-white/60 hover:text-white transition-all text-xl"
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-col gap-3 w-full mt-4">
                  <div className="text-[10px] font-black tracking-widest text-emerald-400 mb-1">
                    ESTIMATED REWARD: +{calculateFocusPoints(focusSelectedTime)} PRODPOINTS
                  </div>
                  <button
                    onClick={() => {
                      setFocusStage('countdown');
                      setIsFocusRunning(true);
                    }}
                    className="w-full bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] py-4 rounded-sm hover:bg-white/80 active:scale-95 transition-all shadow-[0_0_35px_rgba(255,255,255,0.2)]"
                  >
                    START FOCUS TIMER
                  </button>
                  <button
                    onClick={() => setShowFocusTimer(false)}
                    className="w-full bg-transparent text-white/40 hover:text-white/60 font-black uppercase tracking-[0.2em] text-[9px] py-3 rounded-sm transition-all"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {/* Stage 2: Countdown */}
            {focusStage === 'countdown' && (() => {
              const minutesElapsed = Math.floor(((focusSelectedTime * 60) - focusTimeLeft) / 60);
              const pointsEarnedSoFar = calculateFocusPoints(minutesElapsed);
              return (
                <div className="flex flex-col items-center gap-8 max-w-md text-center z-10">
                  <motion.div
                    animate={isFocusRunning ? { rotate: 180 } : {}}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 1 }}
                    className="size-24 flex items-center justify-center border border-white/20 rounded-full bg-white/5"
                  >
                    <span className="material-symbols-outlined text-4xl text-white">
                      hourglass_top
                    </span>
                  </motion.div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] tracking-[0.4em] text-white/40 uppercase">FOCUS TIMER ACTIVE</span>
                    <h3 className="text-6xl font-mono font-black tracking-widest text-white mt-2">
                      {Math.floor(focusTimeLeft / 60).toString().padStart(2, '0')}:{(focusTimeLeft % 60).toString().padStart(2, '0')}
                    </h3>
                    <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-sm shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                      <span className="material-symbols-outlined text-sm animate-pulse">toll</span>
                      POINTS ACCRUED: {pointsEarnedSoFar}
                    </div>
                  </div>

                  <div className="flex gap-4 w-full mt-6">
                    <button
                      onClick={() => {
                        setFocusTimeLeft((prev) => prev + 5 * 60);
                        setFocusSelectedTime((prev) => prev + 5);
                      }}
                      className="flex-1 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-black uppercase tracking-[0.2em] text-[9px] py-3.5 rounded-sm transition-all active:scale-95"
                    >
                      +5 MINS
                    </button>
                    <button
                      onClick={() => {
                        setIsFocusRunning(false);
                        setShowFocusCancelConfirm(true);
                      }}
                      className="flex-1 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 font-black uppercase tracking-[0.2em] text-[9px] py-3.5 rounded-sm transition-all active:scale-95"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Stage 3: Complete / Claim Reward */}
            {focusStage === 'complete' && (
              <div className="flex flex-col items-center gap-8 max-w-md text-center z-10 w-full">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] tracking-[0.4em] text-emerald-400 uppercase">SESSION COMPLETE</span>
                  <h3 className="text-3xl font-black uppercase tracking-wider text-white">CONGRATULATIONS!</h3>
                  <p className="text-xs text-white/50 max-w-xs mt-2 uppercase tracking-wide">
                    {lootBoxOpened ? 'Your rewards have been claimed' : 'Unlock your focus rewards container'}
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {!lootBoxOpened ? (
                    <motion.div
                      key="closed-box"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      onClick={() => setLootBoxOpened(true)}
                      className="cursor-pointer group flex flex-col items-center gap-4 p-8 border border-dashed border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.04] rounded-sm transition-all w-full"
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.05, 1],
                          y: [0, -4, 0]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                        className="size-32 flex items-center justify-center border border-white/10 rounded-sm bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] relative overflow-hidden"
                      >
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="material-symbols-outlined text-6xl text-white opacity-80 group-hover:opacity-100 transition-opacity">
                          redeem
                        </span>
                      </motion.div>
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-colors animate-pulse">
                        TAP TO UNLOCK LOOT BOX
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="opened-box"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="w-full flex flex-col items-center gap-6"
                    >
                      {/* Opened container reveal visual */}
                      <motion.div 
                        initial={{ rotate: -15, scale: 0.5 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", delay: 0.1 }}
                        className="size-20 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-400"
                      >
                        <span className="material-symbols-outlined text-4xl">celebration</span>
                      </motion.div>

                      <div className="p-6 bg-white/5 border border-white/10 w-full rounded-sm flex flex-col gap-2 relative overflow-hidden">
                        {/* Diagonal gold stripes decoration */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rotate-45 translate-x-12 -translate-y-12 pointer-events-none" />
                        
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/30">REWARDS SECURED</span>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-black uppercase tracking-wider">
                            <span className="material-symbols-outlined text-base">toll</span>
                            +{calculateFocusPoints(focusSelectedTime)} ProdPoints Claimed
                          </div>
                          <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-black uppercase tracking-wider">
                            <span className="material-symbols-outlined text-base">bolt</span>
                            +{Math.round(focusSelectedTime * 2)} XP Injected
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setShowFocusTimer(false);
                          setLootBoxOpened(false);
                          // Add ProdPoints and XP reward to player
                          if (user) {
                            const pointsEarned = calculateFocusPoints(focusSelectedTime);
                            const xpEarned = Math.round(focusSelectedTime * 2);
                            const currentCoins = user.rpg?.prodCoins || 0;
                            const currentExp = user.exp || 0;
                            syncUser({
                              rpg: {
                                ...user.rpg,
                                prodCoins: currentCoins + pointsEarned
                              },
                              exp: currentExp + xpEarned
                            });
                          }
                        }}
                        className="w-full bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] py-4 rounded-sm hover:bg-white/80 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                      >
                        FINISH
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            {/* Abort Confirmation Dialog Overlay */}
            <AnimatePresence>
              {showFocusCancelConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-md z-[1000000] flex items-center justify-center p-6"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="max-w-xs w-full border border-white/10 bg-neutral-900 p-6 flex flex-col gap-6 text-center rounded-sm"
                  >
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-black tracking-widest text-rose-500 uppercase">ABORT PROCESS</span>
                      <h4 className="text-lg font-black uppercase text-white tracking-wide">ARE YOU SURE?</h4>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider leading-relaxed">
                        Aborting will forfeit all points accrued during this focus session.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setShowFocusCancelConfirm(false);
                          setIsFocusRunning(false);
                          setFocusStage('select');
                          setFocusTimeLeft(focusSelectedTime * 60);
                        }}
                        className="w-full bg-rose-500 text-white font-black uppercase tracking-[0.2em] text-[9px] py-3 rounded-sm active:scale-95 transition-all"
                      >
                        YES, ABORT
                      </button>
                      <button
                        onClick={() => {
                          setShowFocusCancelConfirm(false);
                          setIsFocusRunning(true);
                        }}
                        className="w-full bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[9px] py-3 rounded-sm active:scale-95 hover:bg-white/10 transition-all"
                      >
                        NO, KEEP FOCUSING
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
