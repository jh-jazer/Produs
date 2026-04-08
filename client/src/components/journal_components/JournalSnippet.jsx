/* eslint-disable */
import React, { useState } from "react";
import api from "../../services/api";
import { mutate } from "swr";

function JournalSnippet() {
  const [loading, setLoading] = useState(false);
  const [lastMood, setLastMood] = useState(null);

  const handleMoodLog = async (mood) => {
    setLoading(true);
    try {
      await api.post("/journal", {
        content: `Logged mood: ${mood} via overview`,
        mood,
        tags: ["overview-log"],
      });
      setLastMood(mood);
      // Trigger refresh for any journal-related SWR keys
      mutate("/journal");

      // Visual feedback
      setTimeout(() => setLastMood(null), 2000);
    } catch (error) {
      console.error("Failed to log mood snippet:", error);
    } finally {
      setLoading(false);
    }
  };

  const moods = ["😠", "🙁", "😐", "🙂", "😊"];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none flex flex-col flex-1 min-h-[180px] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mood Tracker</h3>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">Daily Reflection</p>
        </div>
        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#000000] text-slate-500 dark:text-slate-400 transition-colors">
          <span className="material-symbols-outlined text-xl">more_horiz</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-center px-2 py-4">
          {moods.map((m) => (
            <button
              key={m}
              disabled={loading}
              onClick={() => handleMoodLog(m)}
              className={`relative text-4xl transition-all duration-300 hover:scale-125 ${
                loading ? "opacity-30 grayscale" : "grayscale hover:grayscale-0"
              } ${lastMood === m ? "scale-125 grayscale-0 drop-shadow-xl" : ""}`}
            >
              {m}
              {lastMood === m && (
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-slate-400">
          <span>Status</span>
          <span className={`${loading ? "text-amber-500" : "text-emerald-500"}`}>
            {loading ? "LOGGING..." : "READY"}
          </span>
      </div>
    </div>
  );
}

export default JournalSnippet;
