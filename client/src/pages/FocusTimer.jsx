import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { soundManager } from '../services/sound';
import useAuthStore from '../store/useAuthStore';
import { useHabits } from '../hooks/useHabits';

export default function FocusTimer() {
  const navigate = useNavigate();
  const { user, updateSettings, syncUser } = useAuthStore();
  const { habits = [], toggleCheck: toggleHabitCheck } = useHabits();

  const [focusTimeLeft, setFocusTimeLeft] = useState(1500);
  const [focusSelectedTime, setFocusSelectedTime] = useState(25);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const [focusStage, setFocusStage] = useState('select');
  const [lootBoxOpened, setLootBoxOpened] = useState(false);
  const [showFocusCancelConfirm, setShowFocusCancelConfirm] = useState(false);
  const [hasCompletedFocusHabitThisSession, setHasCompletedFocusHabitThisSession] = useState(false);
  const [focusBgSound, setFocusBgSound] = useState('rain');
  const [focusAlarmSound, setFocusAlarmSound] = useState('zen');
  const [focusBgVolume, setFocusBgVolume] = useState(0.5);
  const [focusAlarmVolume, setFocusAlarmVolume] = useState(0.5);
  const [showTimerSettings, setShowTimerSettings] = useState(false);

  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Sync with user sound settings on mount/user load
  useEffect(() => {
    if (user) {
      setFocusBgSound(user?.settings?.defaultFocusBg || 'rain');
      setFocusAlarmSound(user?.settings?.defaultAlarm || 'zen');
      const userBgVolume = user?.settings?.bgVolume;
      const userAlarmVolume = user?.settings?.alarmVolume;
      setFocusBgVolume(typeof userBgVolume === 'number' ? userBgVolume : 0.5);
      setFocusAlarmVolume(typeof userAlarmVolume === 'number' ? userAlarmVolume : 0.5);
    }
  }, [user]);

  const handleFocusBgVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setFocusBgVolume(val);
    soundManager.setBgVolume(val);
  };

  const handleFocusBgVolumeCommit = async (val) => {
    try {
      await updateSettings({ bgVolume: val });
    } catch (err) {
      console.error('Failed to sync focus timer background volume:', err);
    }
  };

  const handleFocusAlarmVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setFocusAlarmVolume(val);
  };

  const handleFocusAlarmVolumeCommit = async (val) => {
    try {
      await updateSettings({ alarmVolume: val });
    } catch (err) {
      console.error('Failed to sync focus timer alarm volume:', err);
    }
  };

  // Auto-complete Focus habit when focus time reaches 5 mins (300 seconds)
  useEffect(() => {
    if (isFocusRunning) {
      const elapsedSeconds = (focusSelectedTime * 60) - focusTimeLeft;
      if (elapsedSeconds >= 300 && !hasCompletedFocusHabitThisSession) {
        setHasCompletedFocusHabitThisSession(true);
        const focusHabit = habits.find(h => h.systemId === 'focus');
        if (focusHabit) {
          const isAlreadyCompleted = focusHabit.checks?.some(c => c.date === todayStr && c.completed);
          if (!isAlreadyCompleted) {
            toggleHabitCheck(focusHabit._id, todayStr);
          }
        }
      }
    }
  }, [focusTimeLeft, isFocusRunning, focusSelectedTime, habits, todayStr, hasCompletedFocusHabitThisSession, toggleHabitCheck]);

  // Focus Timer Countdown Effect
  useEffect(() => {
    let interval = null;
    if (isFocusRunning && focusTimeLeft > 0) {
      interval = setInterval(() => {
        setFocusTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (focusTimeLeft === 0 && isFocusRunning) {
      setIsFocusRunning(false);
      setFocusStage('complete');
      soundManager.stopFocusBackground();
      soundManager.startAlarm(focusAlarmSound);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocusRunning, focusTimeLeft, focusAlarmSound]);

  // Stop alarm and background audio on unmount
  useEffect(() => {
    return () => {
      soundManager.stopAlarm();
      soundManager.stopFocusBackground();
      window._bgPreviewTimeout && clearTimeout(window._bgPreviewTimeout);
    };
  }, []);

  // Toggle layout visibility during Focus Mode
  useEffect(() => {
    document.body.classList.add('focus-mode-active');
    return () => {
      document.body.classList.remove('focus-mode-active');
    };
  }, []);

  // Progressive reward points calculation
  const calculateFocusPoints = (minutes) => {
    let totalPoints = 0;
    for (let i = 1; i <= minutes; i++) {
      totalPoints += Math.floor((i - 1) / 5) + 1;
    }
    return totalPoints;
  };

  return (
    <div className="min-h-screen w-full bg-white text-black dark:bg-black dark:text-white flex flex-col items-center justify-center p-6 select-none font-mono relative overflow-hidden">
      {/* Subtle matrix-grid overlay for background aesthetics */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Stage 1: Select Focus Time */}
      {focusStage === 'select' && (
        <div className="flex flex-col items-center gap-8 w-[320px] sm:w-[360px] text-center z-10">
          {/* Custom Minutes controls - Circular */}
          <div className="relative size-60 md:size-64 flex items-center justify-center">
            {/* Settings icon at top right corner of the timer round display */}
            <button 
              onClick={() => setShowTimerSettings(true)}
              className="absolute -top-6 -right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors z-20"
              title="Audio Settings"
            >
              <span className="material-symbols-outlined text-lg">settings</span>
            </button>

            {/* Decorative background circle */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 size-full pointer-events-none">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="transparent" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                className="text-black/30 dark:text-white/30" 
              />
            </svg>

            {/* Controls centered inside the circle */}
            <div className="flex items-center gap-4 z-10">
              <button 
                onClick={() => {
                  const newMins = Math.max(5, focusSelectedTime - 5);
                  setFocusSelectedTime(newMins);
                  setFocusTimeLeft(newMins * 60);
                }}
                className="size-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-all text-2xl font-bold"
              >
                -
              </button>
              <div className="flex flex-col items-center justify-center w-24">
                <span className="text-4xl font-mono font-black leading-none">{focusSelectedTime}</span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mt-1">MINS</span>
              </div>
              <button 
                onClick={() => {
                  const newMins = Math.min(180, focusSelectedTime + 5);
                  setFocusSelectedTime(newMins);
                  setFocusTimeLeft(newMins * 60);
                }}
                className="size-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-all text-2xl font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Rewards Preview */}
          <div className="w-full flex flex-col items-center gap-1.5 py-1 select-none">
            <span className="text-[9px] font-black tracking-[0.3em] text-black/35 dark:text-white/35 uppercase">
              POSSIBLE REWARDS
            </span>
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[10px] font-black tracking-widest font-mono">
              <span className="text-amber-500 dark:text-amber-400">+{calculateFocusPoints(focusSelectedTime)} PRODPOINTS</span>
              <span className="text-black/20 dark:text-white/20">•</span>
              <span className="text-blue-600 dark:text-blue-400">+{Math.round(focusSelectedTime * 1.5)} EXP</span>
              <span className="text-black/20 dark:text-white/20">•</span>
              {(() => {
                if (focusSelectedTime >= 90) return <span className="text-amber-500 dark:text-amber-400">LEGENDARY LOOT DROP</span>;
                if (focusSelectedTime >= 50) return <span className="text-purple-500 dark:text-purple-400">EPIC LOOT DROP</span>;
                if (focusSelectedTime >= 25) return <span className="text-blue-500 dark:text-blue-400">RARE LOOT DROP</span>;
                return <span className="text-emerald-500 dark:text-emerald-400">UNCOMMON LOOT DROP</span>;
              })()}
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => {
                // Clear any preview timeout
                window._bgPreviewTimeout && clearTimeout(window._bgPreviewTimeout);
                setFocusStage('countdown');
                setIsFocusRunning(true);
                setHasCompletedFocusHabitThisSession(false);
                soundManager.play('timerStart');
                soundManager.startFocusBackground(focusBgSound);
              }}
              className="w-full bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-[0.3em] text-[10px] py-4 rounded-sm hover:opacity-80 active:scale-95 transition-all shadow-[0_0_35px_rgba(0,0,0,0.1)] dark:shadow-[0_0_35px_rgba(255,255,255,0.2)]"
            >
              START FOCUS TIMER
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-transparent text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60 font-black uppercase tracking-[0.2em] text-[9px] py-3 rounded-sm transition-all"
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
          <div className="flex flex-col items-center gap-8 w-[320px] sm:w-[360px] text-center z-10">
            <div className="relative size-60 md:size-64 flex items-center justify-center">
              {/* Settings icon at top right corner of the timer round display */}
              <button 
                onClick={() => setShowTimerSettings(true)}
                className="absolute -top-6 -right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors z-20"
                title="Audio Settings"
              >
                <span className="material-symbols-outlined text-lg">settings</span>
              </button>

              {/* Background track circle */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 size-full pointer-events-none">
                <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="1" className="text-black/20 dark:text-white/20" />
              </svg>

              {/* Revolving progress circle */}
              <motion.svg 
                viewBox="0 0 100 100" 
                className="absolute inset-0 size-full pointer-events-none"
                animate={isFocusRunning ? { rotate: [0, 360] } : { rotate: 0 }}
                transition={isFocusRunning ? { repeat: Infinity, duration: 15, ease: "linear" } : { duration: 0.5 }}
              >
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={2 * Math.PI * 45 * (1 - focusTimeLeft / (focusSelectedTime * 60))}
                  className="text-black dark:text-white transition-all duration-300 drop-shadow-[0_0_8px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                />
              </motion.svg>

              {/* Centered duration text display */}
              <div className="flex flex-col items-center justify-center z-10">
                <motion.div
                  animate={isFocusRunning ? { rotate: 180 } : {}}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", repeatDelay: 2 }}
                  className="mb-1"
                >
                  <span className="material-symbols-outlined text-xl text-black dark:text-white">
                    hourglass_top
                  </span>
                </motion.div>
                <span className="text-[8px] md:text-[9px] tracking-[0.4em] text-black dark:text-white uppercase">ACTIVE FOCUS</span>
                <h3 className="text-3xl md:text-4xl font-mono font-black tracking-widest text-black dark:text-white mt-1 leading-none">
                  {Math.floor(focusTimeLeft / 60).toString().padStart(2, '0')}:{(focusTimeLeft % 60).toString().padStart(2, '0')}
                </h3>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="mt-2 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-sm shadow-[0_0_15px_rgba(16,185,129,0.05)]">
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
                className="flex-1 bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 hover:bg-black/20 dark:hover:bg-white/20 text-black dark:text-white font-black uppercase tracking-[0.2em] text-[9px] py-3.5 rounded-sm transition-all active:scale-95"
              >
                +5 MINS
              </button>
              <button
                onClick={() => {
                  setIsFocusRunning(false);
                  setShowFocusCancelConfirm(true);
                }}
                className="flex-1 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-black uppercase tracking-[0.2em] text-[9px] py-3.5 rounded-sm transition-all active:scale-95"
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
            <span className="text-[10px] tracking-[0.4em] text-emerald-600 dark:text-emerald-400 uppercase">SESSION COMPLETE</span>
            <h3 className="text-3xl font-black uppercase tracking-wider text-black dark:text-white">CONGRATULATIONS!</h3>
            <p className="text-xs text-black/50 dark:text-white/50 max-w-xs mt-2 uppercase tracking-wide">
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
                onClick={() => {
                  setLootBoxOpened(true);
                  soundManager.stopAlarm();
                  soundManager.stopFocusBackground();
                }}
                className="cursor-pointer group flex flex-col items-center gap-4 p-8 border border-dashed border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-sm transition-all w-full"
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
                  className="size-32 flex items-center justify-center border border-black/10 dark:border-white/10 rounded-sm bg-black/5 dark:bg-white/5 shadow-[0_0_30px_rgba(0,0,0,0.05)] dark:shadow-[0_0_30px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] relative overflow-hidden"
                >
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-black/10 dark:via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="material-symbols-outlined text-6xl text-black dark:text-white opacity-80 group-hover:opacity-100 transition-opacity">
                    redeem
                  </span>
                </motion.div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white transition-colors animate-pulse">
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
                  className="size-20 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-600 dark:text-emerald-400"
                >
                  <span className="material-symbols-outlined text-4xl">celebration</span>
                </motion.div>

                <div className="p-6 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 w-full rounded-sm flex flex-col gap-2 relative overflow-hidden">
                  {/* Diagonal gold stripes decoration */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rotate-45 translate-x-12 -translate-y-12 pointer-events-none" />
                  
                  <span className="text-[9px] font-black uppercase tracking-widest text-black/30 dark:text-white/30">REWARDS SECURED</span>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-black uppercase tracking-wider">
                      <span className="material-symbols-outlined text-base">toll</span>
                      +{calculateFocusPoints(focusSelectedTime)} ProdPoints Claimed
                    </div>
                    <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-black uppercase tracking-wider">
                      <span className="material-symbols-outlined text-base">bolt</span>
                      +{Math.round(focusSelectedTime * 2)} XP Injected
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
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
                    navigate('/dashboard');
                  }}
                  className="w-full bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-[0.3em] text-[10px] py-4 rounded-sm hover:opacity-80 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
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
            className="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-md z-[1000000] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-xs w-full border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 flex flex-col gap-6 text-center rounded-sm shadow-xl"
            >
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black tracking-widest text-rose-500 uppercase">ABORT PROCESS</span>
                <h4 className="text-lg font-black uppercase text-black dark:text-white tracking-wide">ARE YOU SURE?</h4>
                <p className="text-[10px] text-black/40 dark:text-white/40 uppercase tracking-wider leading-relaxed">
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
                    soundManager.stopFocusBackground();
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
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white font-black uppercase tracking-[0.2em] text-[9px] py-3 rounded-sm active:scale-95 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                >
                  NO, KEEP FOCUSING
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Focus Timer Dedicated Audio Settings Modal */}
      <AnimatePresence>
        {showTimerSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[1000000] flex items-center justify-center p-6 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#0c0c0e] border border-black/10 dark:border-white/10 p-6 rounded-sm shadow-2xl flex flex-col gap-5 font-mono text-black dark:text-white"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-black/40 dark:text-white/40">AMBIENCE CONFIG</span>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white">TIMER AUDIO SETTINGS</h4>
                </div>
                <button
                  onClick={() => {
                    setShowTimerSettings(false);
                    if (!isFocusRunning) {
                      window._bgPreviewTimeout && clearTimeout(window._bgPreviewTimeout);
                      soundManager.stopFocusBackground();
                    }
                  }}
                  className="p-1 rounded-sm hover:bg-black/5 dark:hover:bg-white/5 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Focus Background Picker */}
                <div className="flex flex-col gap-1.5 w-full text-left select-none">
                  <span className="text-[8px] font-black tracking-[0.3em] text-black/40 dark:text-white/40 uppercase">FOCUS BACKGROUND</span>
                  <div className="flex flex-wrap gap-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-1 rounded-sm w-full">
                    {[
                      { id: 'silence', label: '🔇 SILENCE' },
                      { id: 'white_noise', label: '💨 WHITE' },
                      { id: 'brown_noise', label: '🎛️ BROWN' },
                      { id: 'rain', label: '🌧️ RAIN' },
                      { id: 'ocean_waves', label: '🌊 OCEAN' },
                      { id: 'thunderstorm', label: '⚡ THUNDER' }
                    ].map(sound => (
                      <button
                        key={sound.id}
                        onClick={() => {
                          setFocusBgSound(sound.id);
                          if (isFocusRunning) {
                            soundManager.startFocusBackground(sound.id);
                          } else {
                            soundManager.startFocusBackground(sound.id);
                            const previewTimeout = setTimeout(() => {
                              soundManager.stopFocusBackground();
                            }, 6000);
                            window._bgPreviewTimeout && clearTimeout(window._bgPreviewTimeout);
                            window._bgPreviewTimeout = previewTimeout;
                          }
                        }}
                        className={`flex-[1_0_30%] min-w-[85px] py-1.5 text-[8px] font-black uppercase tracking-wider rounded-sm transition-all ${
                          focusBgSound === sound.id 
                            ? 'bg-black text-white dark:bg-white dark:text-black font-bold' 
                            : 'text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        {sound.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alarm Sound Picker */}
                <div className="flex flex-col gap-1.5 w-full text-left select-none">
                  <span className="text-[8px] font-black tracking-[0.3em] text-black/40 dark:text-white/40 uppercase">TIMER ALARM SOUND</span>
                  <div className="flex flex-wrap gap-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-1 rounded-sm w-full">
                    {[
                      { id: 'zen', label: '🔔 ZEN' },
                      { id: 'digital', label: '📟 DIGITAL' },
                      { id: 'crystal', label: '💎 CRYSTAL' },
                      { id: 'retro', label: '🕹️ RETRO' },
                      { id: 'pulse', label: '🚨 PULSE' }
                    ].map(alarm => (
                      <button
                        key={alarm.id}
                        onClick={() => {
                          setFocusAlarmSound(alarm.id);
                          soundManager.previewAlarm(alarm.id);
                        }}
                        className={`px-1 py-1.5 text-[8px] font-black uppercase tracking-wider rounded-sm transition-all text-center flex-1 ${
                          focusAlarmSound === alarm.id 
                            ? 'bg-black text-white dark:bg-white dark:text-black font-bold' 
                            : 'text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        {alarm.label.split(' ')[1]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focus Background Volume Slider */}
                <div className="flex flex-col gap-1.5 w-full text-left select-none">
                  <div className="flex justify-between w-full text-[8px] font-black tracking-[0.3em] text-black/40 dark:text-white/40 uppercase">
                    <span>BACKGROUND VOLUME</span>
                    <span>{Math.round(focusBgVolume * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-3 w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-sm">
                    <span className="material-symbols-outlined text-black/60 dark:text-white/60 text-sm">
                      {focusBgVolume === 0 ? 'volume_mute' : focusBgVolume < 0.5 ? 'volume_down' : 'volume_up'}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={focusBgVolume}
                      onChange={handleFocusBgVolumeChange}
                      onMouseUp={() => handleFocusBgVolumeCommit(focusBgVolume)}
                      onTouchEnd={() => handleFocusBgVolumeCommit(focusBgVolume)}
                      className="flex-1 accent-black dark:accent-white bg-black/10 dark:bg-white/10 h-1 rounded-sm appearance-none cursor-pointer outline-none"
                    />
                  </div>
                </div>

                {/* Alarm Volume Slider */}
                <div className="flex flex-col gap-1.5 w-full text-left select-none">
                  <div className="flex justify-between w-full text-[8px] font-black tracking-[0.3em] text-black/40 dark:text-white/40 uppercase">
                    <span>ALARM VOLUME</span>
                    <span>{Math.round(focusAlarmVolume * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-3 w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-sm">
                    <span className="material-symbols-outlined text-black/60 dark:text-white/60 text-sm">
                      {focusAlarmVolume === 0 ? 'volume_mute' : focusAlarmVolume < 0.5 ? 'volume_down' : 'volume_up'}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={focusAlarmVolume}
                      onChange={handleFocusAlarmVolumeChange}
                      onMouseUp={() => handleFocusAlarmVolumeCommit(focusAlarmVolume)}
                      onTouchEnd={() => handleFocusAlarmVolumeCommit(focusAlarmVolume)}
                      className="flex-1 accent-black dark:accent-white bg-black/10 dark:bg-white/10 h-1 rounded-sm appearance-none cursor-pointer outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowTimerSettings(false);
                  if (!isFocusRunning) {
                    window._bgPreviewTimeout && clearTimeout(window._bgPreviewTimeout);
                    soundManager.stopFocusBackground();
                  }
                }}
                className="w-full bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-[0.3em] text-[9px] py-4 rounded-sm hover:opacity-85 active:scale-95 transition-all shadow-md mt-2"
              >
                DONE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
