import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../store/useAuthStore";
import api from "../services/api";

import SmallCalendar from "../components/planner_components/SmallCalendar";
import FinancialStats from "../components/finance_components/FinancialStats";
import JournalSnippet from "../components/journal_components/JournalSnippet";

const variants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setCredentials, updateSettings } = useAuthStore();

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("idle");
  const [themeMode, setThemeMode] = useState(user?.settings?.themeMode || "system");
  const [loading, setLoading] = useState(false);

  const firstName = user?.name?.split(" ")[0] || "User";

  /* ---------------- USERNAME CHECK ---------------- */

  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");

    const delay = setTimeout(async () => {
      try {
        const { data } = await api.get(`/auth/check-username?username=${username}`);
        setUsernameStatus(data.available ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [username]);

  /* ---------------- THEME PREVIEW ---------------- */

  const handleThemeChange = async (mode) => {
    setThemeMode(mode);
    // Apply theme preview immediately
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (mode === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  };

  /* ---------------- COMPLETE ---------------- */
  
  const handleComplete = async () => {
    setLoading(true);

    try {
      const { data } = await api.put("/auth/onboarding", {
        username,
        themeMode,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currency: "USD" // Default currency
      });

      setCredentials({ ...user, ...data });
      navigate("/dashboard");

    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1200px] flex flex-col gap-6 px-2 md:px-0">
      <div className="flex flex-col md:flex-row gap-4 min-h-[calc(100vh-140px)] pt-4 pb-12">
        {/* LEFT COLUMN */}
        <div className="w-full md:w-2/3 flex flex-col gap-4">
          <div className="flex flex-col gap-1 pb-2">
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              {step === 1 && "Claim Your Identity"}
              {step === 2 && "Visual Calibration"}
              {step === 3 && ""}
            </h1>
          </div>

          {/* CARD */}
          <div className="min-h-[420px] flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center p-8 relative overflow-hidden">
            
            {/* PROGRESS */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-[#000000]">
              <motion.div
                className="bg-primary h-full"
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1 — USERNAME */}
              {step === 1 && (
                <motion.div
                  key="username"
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="flex flex-col items-center text-center max-w-md w-full"
                >
                  <p className="text-sm font-bold text-slate-400 mb-8 uppercase tracking-[0.2em]">How shall you be recorded in the archives?</p>
                  
                  <div className="flex items-center gap-3 relative w-full">
                    <div className="absolute left-6 text-slate-400 font-black text-xl">@</div>
                    <input
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_]/g, "")
                        )
                      }
                      autoFocus
                      placeholder="username"
                      className="w-full bg-slate-50 dark:bg-[#121212] border-2 border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-14 py-4 font-bold outline-none ring-primary/20 focus:ring-4 transition-all"
                    />
                    <div className="absolute right-5">
                      {usernameStatus === "checking" && (
                        <div className="size-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      )}
                      {usernameStatus === "available" && (
                        <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                      )}
                      {usernameStatus === "taken" && (
                        <span className="material-symbols-outlined text-rose-500">cancel</span>
                      )}
                    </div>
                  </div>

                  <div className="h-4 mt-2 text-[10px] font-black uppercase tracking-widest text-center">
                    {usernameStatus === "available" && <span className="text-emerald-500">[ ARCHIVE_SLOT_AVAILABLE ]</span>}
                    {usernameStatus === "taken" && <span className="text-rose-500">[ IDENTITY_CONFLICT_DETECTED ]</span>}
                  </div>

                  <button
                    disabled={usernameStatus !== "available"}
                    onClick={() => setStep(2)}
                    className="w-full mt-10 py-4 bg-[#121212] dark:bg-white text-white dark:text-slate-900 rounded-xl font-black disabled:opacity-40 uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Establish Identity
                  </button>
                </motion.div>
              )}

              {/* STEP 2 — APPEARANCE */}
              {step === 2 && (
                <motion.div
                  key="appearance"
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="flex flex-col gap-6 w-full max-w-md"
                >
                  <p className="text-sm font-bold text-slate-400 text-center uppercase tracking-[0.2em]">Select your visual interface preference.</p>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'light', name: 'Light Mode', icon: 'light_mode' },
                      { id: 'dark', name: 'Dark Mode', icon: 'dark_mode' },
                      { id: 'system', name: 'System Default', icon: 'settings_brightness' }
                    ].map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => handleThemeChange(mode.id)}
                        className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                          themeMode === mode.id
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                            : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`material-symbols-outlined ${themeMode === mode.id ? 'text-primary' : 'text-slate-400'}`}>
                            {mode.icon}
                          </span>
                          <span className={`text-sm font-black uppercase tracking-widest ${themeMode === mode.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                            {mode.name}
                          </span>
                        </div>
                        {themeMode === mode.id && (
                          <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 py-4 bg-[#121212] dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-[1.02]"
                    >
                      Calibrate Visuals
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 — WELCOME */}
              {step === 3 && (
                <motion.div
                  key="welcome"
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="flex flex-col items-center text-center max-w-md w-full"
                >
                  <div className="size-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8">
                    <span className="material-symbols-outlined text-emerald-500 text-4xl animate-pulse">verified_user</span>
                  </div>
                  
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 italic">Welcome to the System, {firstName}.</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-12">
                     Identity @{username} confirmed.<br/>
                     Current Status: [ SHUT-IN ]<br/>
                     Archetype: [ UNKNOWN ]
                  </p>

                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-10 w-full text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notice:</p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                      "To unlock your full potential and reveal your true Archetype, complete the Awakening Protocol on your dashboard."
                    </p>
                  </div>

                  <button
                    onClick={handleComplete}
                    disabled={loading}
                    className="w-full py-5 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-black uppercase tracking-[0.4em] text-xs transition-all hover:scale-[1.02] shadow-xl shadow-primary/20"
                  >
                    {loading ? "Initializing..." : "initialize"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="hidden md:flex md:w-1/3 flex-col gap-4 opacity-30 grayscale pointer-events-none">
          <SmallCalendar />
          <FinancialStats />
          <JournalSnippet />
        </div>
      </div>
    </div>
  );
}