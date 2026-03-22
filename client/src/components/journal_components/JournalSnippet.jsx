import React, { useState } from 'react';
import api from '../../services/api';
import { mutate } from 'swr';

function JournalSnippet() {
    const [loading, setLoading] = useState(false);
    const [lastMood, setLastMood] = useState(null);

    const handleMoodLog = async (mood) => {
        setLoading(true);
        try {
            await api.post('/journal', { 
                content: `Logged mood: ${mood} via overview`, 
                mood,
                tags: ['overview-log']
            });
            setLastMood(mood);
            // Trigger refresh for any journal-related SWR keys
            mutate('/journal');
            
            // Visual feedback
            setTimeout(() => setLastMood(null), 2000);
        } catch (error) {
            console.error('Failed to log mood snippet:', error);
        } finally {
            setLoading(false);
        }
    };

    const moods = ['😠', '🙁', '😐', '🙂', '😊'];

    return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-4 shadow-none flex flex-col flex-1 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Mood Tracker</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                        {lastMood ? `Logged ${lastMood}!` : "How are you feeling?"}
                    </p>
                </div>
                <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#000000] text-slate-500 dark:text-slate-400 transition-colors">
                    <span className="material-symbols-outlined text-base">more_horiz</span>
                </button>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-center px-1">
                    {moods.map((m) => (
                        <button 
                            key={m}
                            disabled={loading}
                            onClick={() => handleMoodLog(m)}
                            className={`text-3xl hover:scale-125 transition-transform ${loading ? 'opacity-50 grayscale' : 'grayscale hover:grayscale-0'} ${lastMood === m ? 'scale-125 grayscale-0' : ''}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default JournalSnippet;
