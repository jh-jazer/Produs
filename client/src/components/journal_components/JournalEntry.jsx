import React, { useState } from 'react';
import api from '../../services/api';

const JournalEntry = ({ onAction }) => {
    const [content, setContent] = useState('');
    const [mood, setMood] = useState('😊');
    const [loading, setLoading] = useState(false);

    const moods = ['😠', '🙁', '😐', '🙂', '😊'];

    const handleSave = async () => {
        if (!content.trim()) return;
        setLoading(true);
        try {
            await api.post('/journal', { content, mood });
            setContent('');
            setMood('😊');
            if (onAction) onAction();
        } catch (error) {
            console.error('Failed to save journal entry:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm glow-active relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col gap-6">
                {/* Daily Prompt */}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Daily Prompt</p>
                    <p className="text-slate-700 dark:text-slate-200 font-medium italic">"What is one small victory you achieved today, and how did it make you feel?"</p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Entry</h2>
                        <div className="flex items-center gap-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Mood</p>
                            <div className="flex gap-2">
                                {moods.map(m => (
                                    <button 
                                        key={m}
                                        onClick={() => setMood(m)}
                                        className={`text-xl hover:scale-110 transition-transform ${mood === m ? 'scale-125 grayscale-0 ring-2 ring-primary/20 rounded-full p-0.5' : 'grayscale hover:grayscale-0'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col">
                        <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-2 flex gap-1">
                            <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400"><span className="material-symbols-outlined text-lg">format_bold</span></button>
                            <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400"><span className="material-symbols-outlined text-lg">format_italic</span></button>
                            <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400"><span className="material-symbols-outlined text-lg">format_list_bulleted</span></button>
                            <div className="w-px bg-slate-200 dark:border-slate-700 mx-1 border-r border-slate-200 dark:border-slate-700"></div>
                            <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400"><span className="material-symbols-outlined text-lg">link</span></button>
                        </div>
                        <textarea 
                            className="w-full bg-transparent border-none focus:ring-0 p-4 min-h-[200px] text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 resize-none outline-none font-medium" 
                            placeholder="Start typing your thoughts..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 mt-2">
                        <button 
                            onClick={() => setContent('')}
                            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Discard
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={loading || !content.trim()}
                            className="px-8 py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Entry'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JournalEntry;
