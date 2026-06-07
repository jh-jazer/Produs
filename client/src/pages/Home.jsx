import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { useRef, useMemo, useCallback } from 'react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import useMobile from '../hooks/useMobile';
import { useSWRConfig } from 'swr';
import { soundManager } from '../services/sound';

// Components
import RPGImmersiveOverlay from '../components/rpg/RPGImmersiveOverlay';
import AwakeningOverlay from '../components/dashboard/AwakeningOverlay';
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';
import HomeSkeleton from '../components/ui/HomeSkeleton';
import Avatar from '../components/ui/Avatar';
import { useFinance } from '../hooks/useFinance';
import { usePlanner } from '../hooks/usePlanner';
import { useHabits } from '../hooks/useHabits';
import { useGoals } from '../hooks/useGoals';
import IdentityCard from '../components/ui/IdentityCard';

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
              <h1 className="wordmark text-foreground flex items-center font-mono" style={{ fontSize: '14px' }}>
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
  const { user, updateSettings, syncUser, viewMode } = useAuthStore();
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
  const autoSlideTimerRef = useRef(null);
  
  const carouselRef = useRef(null);

  const { tasks: plannerTasks = [] } = usePlanner(new Date());
  
  const currDate = new Date();
  const currYear = currDate.getFullYear();
  const currMonth = currDate.getMonth() + 1;
  const { tasks: monthlyTasks = [] } = usePlanner({ year: currYear, month: currMonth });
  const { habits = [], toggleCheck: toggleHabitCheck } = useHabits();
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

  const { mutate } = useSWRConfig();

  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, [currentTime]);

  const claimedDaily = useMemo(() => {
    return user?.rpg?.dailyReward?.lastClaimed === todayStr;
  }, [user, todayStr]);

  const claimedStreak = useMemo(() => {
    return user?.rpg?.streakReward?.lastClaimed === todayStr;
  }, [user, todayStr]);

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimRewardInfo, setClaimRewardInfo] = useState(null);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);


  const handleClaimDaily = async () => {
    if (claimedDaily) return;
    try {
      const { data } = await api.post('/rpg/claim-daily');
      setClaimRewardInfo({
        title: data.title,
        subtitle: data.subtitle,
        icon: data.icon,
        rewards: data.rewards
      });
      setShowClaimModal(true);
      mutate('/auth/me');
    } catch (err) {
      console.error("Failed to claim daily reward:", err);
    }
  };

  const handleClaimStreak = async () => {
    if (claimedStreak) return;
    try {
      const { data } = await api.post('/rpg/claim-streak');
      setClaimRewardInfo({
        title: data.title,
        subtitle: data.subtitle,
        icon: data.icon,
        rewards: data.rewards
      });
      setShowClaimModal(true);
      mutate('/auth/me');
    } catch (err) {
      console.error("Failed to claim streak reward:", err);
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

    const getClosestDateObj = (d) => {
      const dateStr = d.dueDate || formatDate(d.createdAt);
      const startDate = new Date(dateStr);
      if (isNaN(startDate.getTime())) return new Date(8640000000000000);

      if (!d.isMonthly) {
        return startDate;
      }

      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();
      const day = startDate.getDate();
      const duration = d.monthsLeft || 1;

      const monthNames = [
          'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
          'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
      ];

      const isMonthInstancePaid = (offset) => {
        const mIdx = (startMonth + offset) % 12;
        const yVal = startYear + Math.floor((startMonth + offset) / 12);
        const label = `${monthNames[mIdx]} ${yVal}`;
        const expectedTitle = d.nature === 'income' 
            ? `Received: ${d.title} (${label})`
            : `Paid: ${d.title} (${label})`;
        const expectedType = d.nature === 'income' ? 'income' : 'expense';
        return transactions.some(t => t.title === expectedTitle && t.type === expectedType);
      };

      for (let i = 0; i < duration; i++) {
        if (!isMonthInstancePaid(i)) {
          const mIdx = (startMonth + i) % 12;
          const yVal = startYear + Math.floor((startMonth + i) / 12);
          return new Date(yVal, mIdx, day);
        }
      }

      const lastOffset = duration - 1;
      const mIdx = (startMonth + lastOffset) % 12;
      const yVal = startYear + Math.floor((startMonth + lastOffset) / 12);
      return new Date(yVal, mIdx, day);
    };

    // 1. Habits Tracker
    const undoneHabits = habits.filter(h => {
      const todayCheck = h.checks?.find(c => c.date === todayStr);
      return !todayCheck || !todayCheck.completed;
    }).slice(0, 3);
    
    const habitsActivities = undoneHabits.length > 0 ? undoneHabits.map(h => ({
      title: h.name,
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
      if (items.length === 0) {
        return [{ title: 'ALL CLEAR', time: nature === 'debt' ? 'LIABILITIES' : 'RECEIVABLES', status: 'STANDBY' }];
      }

      const sortedItems = [...items].sort((a, b) => getClosestDateObj(a) - getClosestDateObj(b));

      return sortedItems.slice(0, 3).map(d => {
        const closestDate = getClosestDateObj(d);
        const formattedDate = closestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
        return {
          title: d.title,
          time: `₱${(d.amount || 0).toLocaleString()} • DUE: ${formattedDate}`,
          status: nature === 'debt' ? 'URGENT' : 'PENDING'
        };
      });
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
  }, [plannerTasks, monthlyTasks, habits, goals, debts, transactions, currentTime]);

  const desktopIndex = (activePriorityIndex === null) 
      ? 1 
      : (activePriorityIndex % priorityCards.length);

  const resetAutoSlideTimer = useCallback(() => {
    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
    }
    if (priorityCards.length === 0) return;
    const n = priorityCards.length;
    autoSlideTimerRef.current = setInterval(() => {
      setActivePriorityIndex(prev => {
        // Work in the middle set (indices n..2n-1) to keep infinite loop working
        const cur = prev === null ? n : prev;
        const inMiddle = n + ((cur - n + 1 + n) % n);
        // Scroll the carousel element directly (works even if isMobile)
        const el = carouselRef.current;
        if (el) {
          const flexContainer = el.children[0];
          if (flexContainer) {
            const targetCard = flexContainer.children[inMiddle];
            if (targetCard) {
              const cardCenter = targetCard.offsetLeft + targetCard.offsetWidth / 2;
              el.scrollTo({ left: cardCenter - el.clientWidth / 2, behavior: 'smooth' });
            }
          }
        }
        return inMiddle;
      });
    }, 5000);
  }, [priorityCards.length]);

  const handleNextCard = (e) => {
    e.stopPropagation();
    const nextIndex = (desktopIndex + 1) % priorityCards.length;
    setActivePriorityIndex(nextIndex);
    resetAutoSlideTimer();
  };

  const handlePrevCard = (e) => {
    e.stopPropagation();
    const prevIndex = (desktopIndex - 1 + priorityCards.length) % priorityCards.length;
    setActivePriorityIndex(prevIndex);
    resetAutoSlideTimer();
  };

  // Helper: scroll mobile carousel to a given card index (within the tripled set)
  const scrollCarouselToIndex = (idx) => {
    const el = carouselRef.current;
    if (!el) return;
    const flexContainer = el.children[0];
    if (!flexContainer) return;
    const targetCard = flexContainer.children[idx];
    if (!targetCard) return;
    const cardCenter = targetCard.offsetLeft + targetCard.offsetWidth / 2;
    el.scrollTo({ left: cardCenter - el.clientWidth / 2, behavior: 'smooth' });
  };

  // Auto-slide priority cards every 5 seconds when not interacted with
  useEffect(() => {
    resetAutoSlideTimer();
    return () => {
      if (autoSlideTimerRef.current) clearInterval(autoSlideTimerRef.current);
    };
  }, [priorityCards.length, resetAutoSlideTimer]);

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
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [activeSection, setActiveSection] = useState('produs');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isIdMenuOpen, setIsIdMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [showAddTx, setShowAddTx] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openAddTransaction) {
      setShowAddTx(true);
      // Consume state so it doesn't repeatedly trigger on standard component unmount/remount
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
            className="px-6 pt-0 md:pl-8 md:pr-12 md:py-6 h-[calc(100dvh-6rem)] md:h-auto md:min-h-screen overflow-hidden md:overflow-visible"
          >
            <HomeSkeleton />
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
                      className="absolute top-[7%] bottom-2 md:bottom-auto md:top-[0.5%] left-6 md:left-12 right-6 md:right-12 flex flex-col items-start pointer-events-none text-left"
                    >
                      <div className="relative top-20 md:top-0">
                        <h3 className="welcome-title-text font-black tracking-tighter text-black dark:text-white uppercase mt-8 md:mt-[4.5vh]">
                          {(() => {
                            if (!claimedDaily) return "Welcome";
                            const hour = currentTime.getHours();
                            const suffix = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
                            return (
                              <>
                                What are we up to<br className="md:hidden" /> this<br className="hidden md:block" /> {suffix}?
                              </>
                            );
                          })()}
                          <br />
                          {user?.username?.split('#')[0] || 'Operator'}
                        </h3>
                        <p className="text-[10px] md:text-sm font-mono uppercase tracking-[0.2em] text-black dark:text-white/40 mt-1 md:mt-2">
                          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      
                      {/* Spacer 1 to center Start Focus button */}
                      <div className="flex-1 md:hidden" />

                      {/* Focus Controls & Rewards Container */}
                      <div className="flex flex-col-reverse md:flex-row md:items-center gap-3 md:gap-6 mt-2 md:mt-[4vh]">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/focustimer');
                          }}
                          animate={{
                            scale: [1, 1.02, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          className="w-[55vw] max-w-[240px] md:w-auto relative group pointer-events-auto z-20 overflow-hidden"
                        >
                          {/* Outer glow pulse ring */}
                          <motion.span
                            className="absolute inset-0 rounded-sm bg-black/10 dark:bg-white/20"
                            animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                          />

                          {/* Button body */}
                          <span className="relative w-full flex items-center justify-center md:justify-start gap-3 md:px-8 h-[8vh] min-h-[44px] bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.15)] dark:shadow-[0_0_30px_rgba(255,255,255,0.15)] group-hover:shadow-[0_0_45px_rgba(0,0,0,0.25)] dark:group-hover:shadow-[0_0_45px_rgba(255,255,255,0.25)] transition-shadow duration-300">
                            {/* Animated hourglass */}
                            <motion.span
                              className="material-symbols-outlined text-[15px] leading-none"
                              animate={{ rotate: [0, 0, 180, 180, 360] }}
                              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 0.5, 0.9, 1] }}
                            >
                              hourglass_empty
                            </motion.span>
                            START FOCUS
                            {/* Shimmer sweep */}
                            <motion.span
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
                              animate={{ x: ['-100%', '200%'] }}
                              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                            />
                          </span>
                        </motion.button>

                        {/* Focus Rewards Preview */}
                        <div className="flex flex-col gap-1 pointer-events-auto select-none items-start md:translate-y-[0.5vh]">
                          <div className="flex items-center gap-1.5 text-[9px] font-black tracking-widest font-mono uppercase">
                            <span className="text-black/40 dark:text-white/40">GET :</span>
                            <span className="text-blue-600 dark:text-blue-400">EXP,</span>
                            <span className="text-amber-600 dark:text-amber-400">PTS</span>
                            <span className="text-black/40 dark:text-white/40">&</span>
                            <span className="text-purple-600 dark:text-purple-400">LEGENDARY DROPS</span>
                          </div>
                        </div>
                      </div>

                      {/* Spacer 2 to center Start Focus button */}
                      <div className="flex-1 md:hidden" />

                      <div className="mt-0 md:mt-[9vh] flex flex-col gap-1 items-start -translate-y-8 md:translate-y-0">
                        <div className="text-2xl md:text-4xl font-black uppercase tracking-[0.25em] text-black dark:text-white leading-none">
                          PRIORITIES
                        </div>
                        <div className="text-[10px] md:text-xs font-mono uppercase tracking-[0.25em] text-black dark:text-white/50">
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
                            className="w-full overflow-x-auto pt-3 pb-4 pointer-events-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] cursor-default"
                            onTouchStart={() => {
                              if (autoSlideTimerRef.current) clearInterval(autoSlideTimerRef.current);
                            }}
                            onTouchEnd={resetAutoSlideTimer}
                            onMouseEnter={() => {
                              if (autoSlideTimerRef.current) clearInterval(autoSlideTimerRef.current);
                            }}
                            onMouseLeave={resetAutoSlideTimer}
                            onScroll={(e) => {
                              resetAutoSlideTimer();
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
                            <div className="flex gap-20 md:gap-12 w-max px-[7.5vw] md:px-[9vw]">
                              {[...priorityCards, ...priorityCards, ...priorityCards].map((card, i) => {
                                const isActive = i === activePriorityIndex;
                                return (
                                  <div 
                                    key={i} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const n = priorityCards.length;
                                      // Advance to the next card in the middle set for infinite looping
                                      const nextIdx = n + ((i - n + 1 + n) % n);
                                      setActivePriorityIndex(nextIdx);
                                      scrollCarouselToIndex(nextIdx);
                                      resetAutoSlideTimer();
                                    }}
                                    className="snap-center w-[85vw] md:w-[94vw] h-64 md:h-72 rounded-3xl border-2 border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] shadow-md backdrop-blur-md p-6 md:p-8 flex flex-col justify-between shrink-0 transition-all duration-500 cursor-pointer group origin-center scale-105 opacity-100"
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
                                              <span className="text-xl font-black uppercase tracking-wider leading-tight truncate transition-colors duration-300 text-black dark:text-white">
                                                {act.title}
                                              </span>
                                            </div>
                                            <span className="text-xs font-mono text-black dark:text-white/50">
                                              {act.time}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex justify-between items-start">
                                          <span className="text-sm font-mono text-black dark:text-white/50">{card.time}</span>
                                        </div>
                                        <span className="text-3xl font-black uppercase tracking-wider leading-tight transition-colors duration-300 text-black dark:text-white">
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
                        <div 
                          onMouseEnter={() => {
                            if (autoSlideTimerRef.current) clearInterval(autoSlideTimerRef.current);
                          }}
                          onMouseLeave={resetAutoSlideTimer}
                          className="flex items-center gap-6 mt-6 pointer-events-auto select-none w-full max-w-[1180px]"
                        >
                          {/* Active Card */}
                          <div 
                            onClick={handleNextCard}
                            className="w-full md:flex-1 md:max-w-[1060px] h-72 md:h-96 rounded-3xl border-2 border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] backdrop-blur-md p-8 md:p-12 flex flex-col justify-between transition-all duration-500 cursor-pointer shadow-md origin-center scale-105 opacity-100 z-20"
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
                                      <span className="text-xl md:text-3xl font-black uppercase tracking-wider text-black dark:text-white leading-none truncate">
                                        {act.title}
                                      </span>
                                    </div>
                                    <span className="text-xs md:text-sm font-mono text-black dark:text-white/50">
                                      {act.time}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <>
                                <div className="flex justify-between items-start">
                                  <span className="text-xs md:text-base font-mono text-black dark:text-white/50">{priorityCards[desktopIndex].time}</span>
                                </div>
                                <span className="text-3xl md:text-5xl font-black uppercase tracking-wider text-black dark:text-white leading-none">
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
                              <span className="text-[8px] font-mono tracking-widest text-black dark:text-white/30 uppercase">
                                {claimedDaily ? 'CLAIMED' : 'READY'}
                              </span>
                            </div>

                            <span className="text-[8px] font-mono font-black uppercase tracking-[0.25em] text-black dark:text-white/40">SYSTEM BOUNTY</span>
                            <div className="flex items-center gap-3">
                              <span className={`material-symbols-outlined text-2xl ${claimedDaily ? 'text-white/30' : 'text-emerald-500 transition-transform group-hover/reward:scale-110 duration-300'}`}>workspace_premium</span>
                              <div className="flex flex-col">
                                <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white leading-tight">DAILY REWARD</h4>
                                <p className="text-[9px] font-mono text-black dark:text-white/40 uppercase tracking-widest mt-0.5">
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
                              <span className="text-[8px] font-mono tracking-widest text-black dark:text-white/30 uppercase">
                                {claimedStreak ? 'UNLOCKED' : 'READY'}
                              </span>
                            </div>

                            <span className="text-[8px] font-mono font-black uppercase tracking-[0.25em] text-black dark:text-white/40">ANNUAL MILESTONE</span>
                            <div className="flex items-center gap-3">
                              <span className={`material-symbols-outlined text-2xl ${claimedStreak ? 'text-white/30' : 'text-amber-500 transition-transform group-hover/reward:scale-110 duration-300'}`}>military_tech</span>
                              <div className="flex flex-col">
                                <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white leading-tight flex items-center gap-1.5">
                                  <span>365 STREAK</span>
                                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm bg-orange-500/10 text-orange-500 text-[9px] font-black tracking-normal uppercase">
                                    <span>{currentStreak}</span>
                                    <span className="material-symbols-outlined text-[10px] animate-pulse">local_fire_department</span>
                                  </div>
                                </h4>
                                <p className="text-[9px] font-mono text-black dark:text-white/40 uppercase tracking-widest mt-0.5">
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
                      {/* Anchor Mount - stays fixed */}
                      <div className="w-4 h-1.5 bg-black dark:bg-white/80 rounded-t-sm shadow-[0_0_8px_rgba(0,0,0,0.4)] dark:shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                      {/* Cord + Ring together — sway as one unit from anchor */}
                      <motion.div
                        className="flex flex-col items-center origin-top"
                        animate={{ rotateZ: [0, 2, -1.5, 1, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
                      >
                        {/* Cord Line */}
                        <div className="w-[2px] h-[180px] bg-gradient-to-b from-black/80 via-black/50 to-black/20 dark:from-white/80 dark:via-white/50 dark:to-white/20" />
                        {/* Pulsing ring handle */}
                        <motion.div 
                          whileHover={{ scale: 1.15, y: 3 }}
                          whileTap={{ scale: 0.95, y: 15 }}
                          className="size-9 rounded-full border-2 border-black/60 dark:border-white/60 bg-white/90 dark:bg-black/90 backdrop-blur-md flex items-center justify-center shadow-lg shadow-black/20 dark:shadow-black/40 group relative"
                        >
                          <div className="size-3.5 rounded-full bg-black dark:bg-white animate-pulse shadow-[0_0_12px_rgba(0,0,0,0.8)] dark:shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
                          
                          {/* Permanently visible indicator text below the ring */}
                          <span className="absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8.5px] font-mono font-black uppercase tracking-[0.25em] text-black/50 dark:text-white/50 group-hover:text-black dark:group-hover:text-white transition-all duration-300 select-none">
                            {isIdPulledDown ? "RETRACT ID" : "PULL ID"}
                          </span>
                        </motion.div>
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
                      <div className="w-4 h-1 bg-black dark:bg-white z-[60] shadow-[0_0_15px_rgba(0,0,0,0.5)] dark:shadow-[0_0_15px_rgba(255,255,255,0.5)] shrink-0 group-hover/retract:bg-black dark:group-hover/retract:bg-white group-hover/retract:scale-x-125 transition-all" />
                      <div
                        className="w-[12px] h-[15vh] md:h-20 bg-black dark:bg-white opacity-80 shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] shrink-0 z-50 group-hover/retract:bg-black dark:group-hover/retract:bg-white group-hover/retract:opacity-100 transition-all origin-top"
                      />
                      
                      <span className="absolute -top-6 whitespace-nowrap bg-black/90 text-white text-[7px] font-mono font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-sm border border-white/10 opacity-0 group-hover/retract:opacity-100 transition-opacity pointer-events-none">
                        RETRACT ID
                      </span>
                    </div>

                    <div className="relative -mt-4">
                      <IdentityCard
                        user={user}
                        isOwnProfile={true}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        isFlipped={isFlipped}
                        setIsFlipped={setIsFlipped}
                        isIdMenuOpen={isIdMenuOpen}
                        setIsIdMenuOpen={setIsIdMenuOpen}
                        setIsConnectionsModalOpen={setIsConnectionsModalOpen}
                        setIsSearchModalOpen={setIsSearchModalOpen}
                        setIsQrModalOpen={setIsQrModalOpen}
                        setQrModalMode={setQrModalMode}
                        currentBalance={currentBalance}
                        netProjection={netProjection}
                        totalSavings={totalSavings}
                        onClose={() => setIsIdPulledDown(false)}
                      />
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
                ? 'bg-transparent border-black/40 dark:border-white/40 text-black dark:text-white/60 hover:text-emerald-500 dark:hover:text-emerald-400' 
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
                ? 'bg-transparent border-black/40 dark:border-white/40 text-black dark:text-white/60 hover:text-amber-500 dark:hover:text-amber-400' 
                : 'bg-amber-500/10 border-amber-500 text-amber-500 dark:text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] font-black animate-pulse'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] pl-1 transition-colors duration-300 text-current flex items-center gap-1">
              <span>{currentStreak}</span>
              <span className="material-symbols-outlined text-[13px] text-orange-500 animate-pulse">local_fire_department</span>
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
          <div className="fixed inset-0 md:left-[18vw] md:right-[4vw] z-[99999] flex items-center justify-center pt-24 pb-28 px-4 md:p-6 select-none">
            <style>{`
              .hud-buttons-container {
                display: none !important;
              }
            `}</style>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 md:left-[18vw] md:right-[4vw] bg-black/60 dark:bg-black/80 backdrop-blur-md"
              onClick={() => setShowWeeklyModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#0f0f11] border border-black/10 dark:border-white/10 p-6 md:p-8 rounded-sm shadow-[0_0_50px_rgba(16,185,129,0.1)] dark:shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col gap-6 max-h-full overflow-y-auto pointer-events-auto custom-scrollbar"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              
              <div className="flex justify-between items-start z-10">
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black/40 dark:text-white/40">7-DAY MATRIX REGISTRY</span>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider text-black dark:text-white">WEEKLY BOUNTY HUNTER</h3>
                </div>
                <button
                  onClick={() => setShowWeeklyModal(false)}
                  className="p-1 rounded-sm hover:bg-black/5 dark:hover:bg-white/5 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
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
                  const claimsCount = user?.rpg?.dailyReward?.claimsCount || 0;
                  const activeWeeklyDay = claimedDaily 
                    ? (((claimsCount - 1) % 7) + 1)
                    : ((claimsCount % 7) + 1);

                  const isCurrentClaimable = item.day === activeWeeklyDay && !claimedDaily;
                  const isAlreadyClaimed = item.day < activeWeeklyDay || (item.day === activeWeeklyDay && claimedDaily);
                  const isLocked = item.day > activeWeeklyDay;

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
                          ? 'border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] opacity-55'
                          : 'border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono tracking-widest text-black/40 dark:text-white/40">DAY {item.day}</span>
                        {isAlreadyClaimed && <span className="material-symbols-outlined text-emerald-500 text-[14px]">check_circle</span>}
                        {isCurrentClaimable && <span className="material-symbols-outlined text-emerald-400 text-[14px] animate-bounce">stars</span>}
                        {isLocked && <span className="material-symbols-outlined text-black/20 dark:text-white/20 text-[14px]">lock</span>}
                      </div>

                      <div className={`flex flex-col gap-0.5 text-left ${item.day === 7 ? 'mt-4' : 'mt-2'}`}>
                        <span className={`text-[11px] font-black uppercase tracking-wider ${isCurrentClaimable ? 'text-emerald-600 dark:text-emerald-400' : 'text-black dark:text-white'}`}>
                          {item.reward}
                        </span>
                        <span className="text-[7.5px] font-mono text-black/30 dark:text-white/30 tracking-widest uppercase">
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
                <div className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/50 dark:text-white/50 font-black uppercase tracking-[0.2em] text-[9px] py-4 rounded-sm text-center z-10 mt-2 font-mono">
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
          <div className="fixed inset-0 md:left-[18vw] md:right-[4vw] z-[99999] flex items-center justify-center pt-24 pb-28 px-4 md:p-6 select-none">
            <style>{`
              .hud-buttons-container {
                display: none !important;
              }
            `}</style>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 md:left-[18vw] md:right-[4vw] bg-black/60 dark:bg-black/80 backdrop-blur-md"
              onClick={() => setShowStreakModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#0f0f11] border border-black/10 dark:border-white/10 p-6 md:p-8 rounded-sm shadow-[0_0_50px_rgba(245,158,11,0.1)] dark:shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col gap-6 max-h-full overflow-y-auto pointer-events-auto custom-scrollbar"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              
              <div className="flex justify-between items-start z-10">
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-600 dark:text-amber-500/60">365-DAY CHRONO MATRIX</span>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider text-black dark:text-white">STREAK CHRONICLE</h3>
                </div>
                <button
                  onClick={() => setShowStreakModal(false)}
                  className="p-1 rounded-sm hover:bg-black/5 dark:hover:bg-white/5 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="flex justify-between items-center bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-4 rounded-sm z-10 text-left">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-mono tracking-widest text-black/30 dark:text-white/30 uppercase">OPERATIVE STREAK</span>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-sans tracking-wide">{currentStreak} CONSECUTIVE DAYS</span>
                </div>
                <span className="material-symbols-outlined text-amber-500 text-3xl animate-pulse">local_fire_department</span>
              </div>

              <div className="h-[320px] overflow-y-auto pr-2 custom-scrollbar z-10 flex flex-col gap-2 scroll-smooth">
                {Array.from({ length: 365 }, (_, index) => {
                  const day = index + 1;
                  const isUnlocked = day <= currentStreak;
                  const isClaimed = day < currentStreak || (day === currentStreak && claimedStreak);
                  
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
                          : 'border-black/5 dark:border-white/5 bg-black/[0.005] dark:bg-white/[0.005] opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className={`size-8 rounded-full border flex items-center justify-center shrink-0 ${
                          isUnlocked 
                            ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' 
                            : 'border-black/10 dark:border-white/10 text-black/20 dark:text-white/20'
                        }`}>
                          <span className="text-[10px] font-mono font-black">D{day}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-black uppercase tracking-wider ${isUnlocked ? 'text-black dark:text-white' : 'text-black/60 dark:text-white/60'}`}>
                            {reward}
                          </span>
                          <span className="text-[7px] font-mono tracking-widest text-black/30 dark:text-white/30 uppercase">
                            {rank}
                          </span>
                        </div>
                      </div>

              <div className="flex items-center gap-2">
                        {isUnlocked ? (
                          isClaimed ? (
                            <span className="text-[7.5px] font-mono font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/20 rounded-sm">
                              CLAIMED
                            </span>
                          ) : (
                            <span className="text-[7.5px] font-mono font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest px-2 py-0.5 bg-amber-500/15 border border-amber-500/20 rounded-sm animate-pulse">
                              CLAIM
                            </span>
                          )
                        ) : (
                          <span className="text-[7.5px] font-mono font-black text-black/40 dark:text-white/40 uppercase tracking-widest px-2 py-0.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm">
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
                    handleClaimStreak();
                  }}
                  className="w-full bg-amber-500 text-black font-black uppercase tracking-[0.3em] text-[10px] py-4 rounded-sm hover:bg-amber-400 active:scale-95 transition-all z-10 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                >
                  CLAIM STREAK REWARDS
                </button>
              ) : (
                <div className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/50 dark:text-white/50 font-black uppercase tracking-[0.2em] text-[9px] py-4 rounded-sm text-center z-10 font-mono">
                  STREAK REWARD CLAIMED. KEEP THE STREAK GOING!
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
}
