import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useJournal } from '../../hooks/useJournal';
import { sanitizeHtml } from '../../utils/sanitize';

const parseMarkdown = (text) => {
    if (!text) return { __html: '' };

    let html = text
        .replace(/- \[[xX]\] (.*)/g, '<div class="flex items-start gap-2 my-1"><span class="material-symbols-outlined text-emerald-500 text-[16px] mt-0.5">check_box</span> <span>$1</span></div>')
        .replace(/- \[ \] (.*)/g, '<div class="flex items-start gap-2 my-1"><span class="material-symbols-outlined text-slate-400 text-[16px] mt-0.5">check_box_outline_blank</span> <span>$1</span></div>')
        .replace(/^- (?!\[)(.*)/gm, '<div class="flex items-start gap-2 my-1 text-slate-600 dark:text-slate-300"><span class="text-primary text-[10px] mt-1 mr-1">•</span> <span>$1</span></div>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold">$1</a>')
        .replace(/^&gt; (.*)/gm, '<blockquote class="border-l-[3px] border-primary/40 pl-3 my-2 italic text-slate-500 dark:text-slate-400 bg-primary/5 py-1 pr-2 rounded-r-md">$1</blockquote>')
        .replace(/\n/g, '<br />');

    html = html.replace(/<\/div><br \/>/g, '</div>');
    html = html.replace(/<\/blockquote><br \/>/g, '</blockquote>');

    const sanitizedHtml = sanitizeHtml(html);

    return { __html: sanitizedHtml };
};

const JournalHistory = ({ entries = [], onAction }) => {
    const [confirmDelete, setConfirmDelete] = useState(null);
    const { deleteEntry } = useJournal();

    const handleDelete = async (id) => {
        try {
            await deleteEntry(id);
            if (onAction) onAction();
        } catch (error) {
            console.error('Failed to delete entry:', error);
        }
    };

    return (
        <>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="Delete Journal Entry"
                message="Are you sure you want to delete this journal entry? This cannot be undone."
                confirmLabel="Delete"
                onConfirm={() => { handleDelete(confirmDelete); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />
            <div className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Journal History</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-[#000000] px-2 py-1 rounded border border-slate-100 dark:border-white/10">
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
                    <AnimatePresence mode="popLayout">
                        {entries.map((entry, idx) => (
                            <motion.div 
                                key={entry._id || idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.8, delay: Math.min(idx * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
                                className="group relative p-4 rounded-xl bg-white dark:bg-[#121212]/40 border border-slate-100 dark:border-white/10 hover:border-primary/30 transition-all shadow-none hover:shadow-none"
                            >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{entry.mood}</span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black text-slate-900 dark:text-white">
                                                {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                            {entry.isPending && (
                                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest border border-amber-500/20 animate-pulse">
                                                    <span className="material-symbols-outlined text-[10px]">sync</span>
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setConfirmDelete(entry._id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-300 hover:text-rose-500 transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                            <div 
                                className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed font-medium"
                                dangerouslySetInnerHTML={parseMarkdown(entry.content)}
                            />
                        </motion.div>
                    ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
        </>
    );
};

export default JournalHistory;
