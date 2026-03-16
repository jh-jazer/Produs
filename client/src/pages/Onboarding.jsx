import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../store/useAuthStore";
import api from "../services/api";

import SmallCalendar from "../components/planner_components/SmallCalendar";
import FinancialStats from "../components/finance_components/FinancialStats";
import JournalSnippet from "../components/journal_components/JournalSnippet";

import feedData from "../data/feed_mock_dataset_500_posts.json";

const MIN_CHANNELS = 3;

const CHANNEL_ICONS = {
  bible_verses: "auto_stories",
  stoicism: "self_improvement",
  philosophers: "history_edu",
  psychology: "psychology",
  science_trivia: "biotech",
  geography: "public",
  history_facts: "account_balance",
  astronomy: "dark_mode",
  biology: "pest_control",
  physics: "bolt",
  ai_facts: "memory",
  economics: "payments",
  mental_models: "hub",
  study_techniques: "edit_note",
  productivity: "rocket_launch",
  creativity: "palette",
  leadership: "group",
  startup_lessons: "business_center",
  famous_quotes: "format_quote",
  language_facts: "language",
  math_curiosities: "calculate",
  ancient_civilizations: "fort",
  brain_science: "neurology",
  human_behavior: "face",
  cultural_facts: "diversity_3"
};

const variants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export default function Onboarding() {

  const navigate = useNavigate();
  const { user, setCredentials } = useAuthStore();

  const [step, setStep] = useState(1);

  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("idle");

  const [timezone, setTimezone] = useState("");
  const [currency, setCurrency] = useState("PHP");

  const [selectedChannels, setSelectedChannels] = useState([
    "productivity",
    "stoicism"
  ]);

  const [loading, setLoading] = useState(false);

  const firstName = user?.name?.split(" ")[0] || "User";

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tz);
  }, []);

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

  /* ---------------- CHANNEL TOGGLE ---------------- */

  const toggleChannel = (id) => {

    setSelectedChannels(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );

  };

  /* ---------------- COMPLETE ---------------- */

  const handleComplete = async () => {

    if (selectedChannels.length < MIN_CHANNELS) return;

    setLoading(true);

    try {

      const { data } = await api.put("/auth/onboarding", {
        username,
        timezone,
        currency,
        subscriptions: selectedChannels
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

    <div className="w-full max-w-[1200px] flex flex-col gap-6">

      <div className="flex flex-col md:flex-row gap-4 min-h-[calc(100vh-140px)] pt-4 pb-12">

        {/* LEFT COLUMN */}

        <div className="w-full md:w-2/3 flex flex-col gap-4">

          <div className="flex flex-col gap-1 pb-2">

            <h1 className="text-xl md:text-2xl font-black tracking-tight">

              {step === 1 && "Claim Your Identity"}
              {step === 2 && "Set Your Environment"}
              {step === 3 && "Fuel Your Mind"}

            </h1>

          </div>

          {/* CARD */}

          <div className="min-h-[380px] flex-1 bg-white dark:bg-[#192233] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center p-8 relative overflow-hidden">

            {/* PROGRESS */}

            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800">

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
                      placeholder="username"
                      className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-14 py-4 font-bold outline-none"
                    />

                    <div className="absolute right-5">

                      {usernameStatus === "checking" && (
                        <div className="size-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      )}

                      {usernameStatus === "available" && (
                        <span className="material-symbols-outlined text-emerald-500">
                          check_circle
                        </span>
                      )}

                      {usernameStatus === "taken" && (
                        <span className="material-symbols-outlined text-rose-500">
                          cancel
                        </span>
                      )}

                    </div>

                  </div>

                  <div className="h-4 mt-2 text-xs font-bold uppercase tracking-widest">

                    {usernameStatus === "available" && (
                      <span className="text-emerald-500">
                        Username available
                      </span>
                    )}

                    {usernameStatus === "taken" && (
                      <span className="text-rose-500">
                        Username is already taken
                      </span>
                    )}

                  </div>

                  <button
                    disabled={usernameStatus !== "available"}
                    onClick={() => setStep(2)}
                    className="w-full mt-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black disabled:opacity-40"
                  >
                    Continue
                  </button>

                </motion.div>
              )}

              {step === 2 && (

                <motion.div
                  key="environment"
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="flex flex-col gap-5 w-full max-w-md"
                >

                  {/* Timezone Card */}
                  <div className="w-full bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/60 dark:to-[#192233] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
                          <span className="material-symbols-outlined text-primary text-lg">public</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detected Timezone</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{timezone}</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                    </div>
                  </div>

                  {/* Currency Label */}
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-emerald-500 text-base">account_balance_wallet</span>
                    </div>
                    <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Primary Currency</p>
                  </div>

                  {/* Currency Buttons */}
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <button
                      onClick={() => setCurrency("USD")}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 relative overflow-hidden ${
                        currency === "USD"
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300"
                      }`}
                    >
                      {currency === "USD" && <div className="absolute inset-0 bg-primary/5" />}
                      <span className={`text-3xl font-black relative z-10 ${currency === "USD" ? "text-primary" : "text-slate-900 dark:text-white"}`}>$</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">United States Dollar</span>
                      {currency === "USD" && (
                        <span className="absolute top-2.5 right-2.5 material-symbols-outlined text-primary text-base">check_circle</span>
                      )}
                    </button>

                    <button
                      onClick={() => setCurrency("PHP")}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 relative overflow-hidden ${
                        currency === "PHP"
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300"
                      }`}
                    >
                      {currency === "PHP" && <div className="absolute inset-0 bg-primary/5" />}
                      <span className={`text-3xl font-black relative z-10 ${currency === "PHP" ? "text-primary" : "text-slate-900 dark:text-white"}`}>₱</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Philippine Peso</span>
                      {currency === "PHP" && (
                        <span className="absolute top-2.5 right-2.5 material-symbols-outlined text-primary text-base">check_circle</span>
                      )}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-sm transition-all"
                    >
                      Continue
                    </button>
                  </div>

                </motion.div>
              )}

              {/* STEP 3 — CHANNELS */}

              {step === 3 && (

                <motion.div
                  key="channels"
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="flex flex-col gap-4 w-full max-w-lg"
                >

                  <div className="flex justify-between text-xs text-slate-500">

                    <span>Select at least 3 interests</span>
                    <span>{selectedChannels.length}</span>

                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[280px] overflow-y-auto">

                    {feedData.channels.map(channel => {

                      const active = selectedChannels.includes(channel.channel_id);

                      return (

                        <button
                          key={channel.channel_id}
                          onClick={() => toggleChannel(channel.channel_id)}
                          className={`p-3 rounded-2xl border-2 flex items-center gap-3 ${
                            active
                              ? "border-primary bg-primary/5"
                              : "border-slate-200 dark:border-slate-800"
                          }`}
                        >

                          <span className="material-symbols-outlined">
                            {CHANNEL_ICONS[channel.channel_id] || "auto_awesome"}
                          </span>

                          <span className="text-xs font-bold truncate">
                            {channel.name}
                          </span>

                        </button>

                      );

                    })}

                  </div>

                  <button
                    disabled={selectedChannels.length < MIN_CHANNELS}
                    onClick={handleComplete}
                    className="py-3 bg-primary text-white rounded-xl font-black"
                  >

                    {loading ? "Finishing..." : "Finish Setup 🚀"}

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