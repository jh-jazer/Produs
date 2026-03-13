import React from 'react';
import api from '../../services/api';

const JournalHistory = ({ entries = [], onAction }) => {
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this journal entry?')) return;
        try {
            await api.delete(`/journal/${id}`);
            if (onAction) onAction();
        } catch (error) {
            console.error('Failed to delete entry:', error);
        }
    };

    return (
        <div className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Journal History</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
                    {entries.length} Entries
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {entries.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10 opacity-50">
                        <span className="material-symbols-outlined text-4xl mb-2">history_edu</span>
                        <p className="text-xs font-bold uppercase tracking-widest text-center px-4">Your story begins here. Write your first entry.</p>
                    </div>
                ) : (
                    entries.map((entry) => (
                        <div 
                            key={entry._id}
                            className="group relative p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{entry.mood}</span>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">
                                            {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDelete(entry._id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-300 hover:text-rose-500 transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed font-medium">
                                {entry.content}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default JournalHistory;
