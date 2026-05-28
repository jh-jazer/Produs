import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { useGoals } from '../../../hooks/useGoals';
import { motion } from 'framer-motion';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function getISOWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getWeeksInMonth(year, month) {
    const weeks = [];
    const lastDay = new Date(year, month + 1, 0);
    let current = new Date(year, month, 1);
    current.setDate(current.getDate() - ((current.getDay() + 6) % 7));
    let weekNum = 1;
    while (current <= lastDay) {
        weeks.push({ weekNum, label: `W${weekNum}`, isoWeek: getISOWeek(current) });
        current.setDate(current.getDate() + 7);
        weekNum++;
    }
    return weeks;
}

const PERIODS = [
    { id: 'weekly',  label: 'WEEKLY' },
    { id: 'monthly', label: 'MONTHLY' },
    { id: 'yearly',  label: 'YEARLY' },
];

const GoalSetter = ({ viewMode = 'me', isReadOnly = false }) => {
    const now = new Date();
    const [view, setView] = useState('monthly');
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [selectedWeekIdx, setSelectedWeekIdx] = useState(0);
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const weeksInMonth = useMemo(() => getWeeksInMonth(selectedYear, selectedMonth), [selectedYear, selectedMonth]);
    const safeWeekIdx = Math.min(selectedWeekIdx, weeksInMonth.length - 1);
    const currentWeek = weeksInMonth[safeWeekIdx];

    const filters = useMemo(() => ({
        period: view,
        year: selectedYear,
        month: view === 'yearly' ? undefined : selectedMonth,
        week: view === 'weekly' ? currentWeek?.isoWeek : undefined
    }), [view, selectedYear, selectedMonth, currentWeek]);

    const { goals: filteredGoals, addGoal: addGoalLocal, toggleGoal: toggleGoalLocal, deleteGoal: deleteGoalLocal, isLoading } = useGoals(filters);

    const addGoal = async () => {
        if (!newGoalTitle.trim()) return;
        const payload = { title: newGoalTitle.trim(), period: view, year: Number(selectedYear), color: 'white' };
        if (view === 'monthly') payload.month = Number(selectedMonth);
        if (view === 'weekly') { payload.month = Number(selectedMonth); payload.week = currentWeek?.isoWeek; }
        await addGoalLocal(payload);
        setNewGoalTitle('');
        setIsAdding(false);
    };

    const completedCount = filteredGoals.filter(g => g.completed).length;
    const progress = filteredGoals.length ? Math.round((completedCount / filteredGoals.length) * 100) : 0;

    return (
        <div className="flex flex-col gap-8 font-sans relative">
            <button onClick={() => setIsAdding(true)} className="absolute -top-16 right-0 size-10 flex items-center justify-center border border-black/40 dark:border-white/40 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all z-20 rounded-sm">
                <span className="material-symbols-outlined text-sm">add</span>
            </button>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="DELETE GOAL"
                message="This goal will be permanently removed from your list."
                confirmLabel="DELETE"
                onConfirm={() => { deleteGoalLocal(confirmDelete); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />

            {/* Selection Bar */}
            <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                {view === 'yearly' ? (
                    [2026, 2027, 2028].map(y => (
                        <button key={y} onClick={() => setSelectedYear(y)} className={`px-4 py-2 border text-[10px] font-black tracking-widest rounded-sm ${selectedYear === y ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'border-black/15 dark:border-white/10 text-black/40 dark:text-white/40 hover:border-black/30 dark:hover:border-white/30'}`}>
                            {y}
                        </button>
                    ))
                ) : (
                    MONTHS.map((m, idx) => (
                        <button key={m} onClick={() => { setSelectedMonth(idx); setSelectedWeekIdx(0); }} className={`px-4 py-2 border text-[10px] font-black tracking-widest rounded-sm ${selectedMonth === idx ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'border-black/15 dark:border-white/10 text-black/40 dark:text-white/40 hover:border-black/30 dark:hover:border-white/30'}`}>
                            {m}
                        </button>
                    ))
                )}
            </div>

            {view === 'weekly' && (
                <div className="flex gap-2">
                    {weeksInMonth.map((w, idx) => (
                        <button key={idx} onClick={() => setSelectedWeekIdx(idx)} className={`flex-1 py-2 border text-[9px] font-black rounded-sm ${safeWeekIdx === idx ? 'bg-black/10 border-black text-black dark:bg-white/10 dark:border-white dark:text-white' : 'border-black/10 dark:border-white/5 text-black/30 dark:text-white/20 hover:border-black/30 dark:hover:border-white/20'}`}>
                            {w.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Progress Readout */}
            {filteredGoals.length > 0 && (
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] font-black tracking-widest text-black/40 dark:text-white/40">
                        <span>GOAL COMPLETION</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-black dark:bg-white shadow-[0_0_10px_rgba(0,0,0,0.2)] dark:shadow-[0_0_10px_white]" />
                    </div>
                </div>
            )}

            {/* Goals List */}
            <div className="flex flex-col gap-3">
                {filteredGoals.length === 0 ? (
                    <div className="py-12 border border-dashed border-black/10 dark:border-white/5 flex flex-col items-center gap-4 opacity-30">
                        <span className="material-symbols-outlined text-4xl text-black/40 dark:text-white/40">target</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/50 dark:text-white/50">NO GOALS DEFINED</span>
                    </div>
                ) : (
                    filteredGoals.map(goal => (
                        <motion.div 
                            key={goal._id} 
                            whileHover={{ x: 4 }}
                            className={`flex items-center gap-4 p-4 border rounded-sm transition-all ${goal.completed ? 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 opacity-40' : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/10 dark:border-white/10'}`}
                        >
                            <button 
                                onClick={() => !isReadOnly && toggleGoalLocal(goal._id)}
                                className={`size-5 border-2 rounded-sm transition-all flex items-center justify-center ${goal.completed ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black shadow-md' : 'border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white'}`}
                            >
                                {goal.completed && <span className="material-symbols-outlined text-[12px] font-black">check</span>}
                            </button>
                            <span className={`flex-1 text-xs font-black uppercase tracking-wider ${goal.completed ? 'line-through text-black/40 dark:text-white/30' : 'text-black/80 dark:text-white/80'}`}>{goal.title}</span>
                            {!isReadOnly && <button onClick={() => setConfirmDelete(goal._id)} className="text-black/30 dark:text-white/20 hover:text-black dark:hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>}
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add Goal Modal */}
            {isAdding && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-md">
                    <div className="absolute inset-0 bg-black/80" onClick={() => setIsAdding(false)} />
                    <div className="relative w-full max-w-md bg-[#0a0a0a] border-4 border-white p-8 shadow-[0_0_100px_rgba(255,255,255,0.1)]">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">ADD NEW GOAL</span>
                                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Define Target</h3>
                            </div>
                            <button onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        <div className="flex flex-col gap-6">
                            <input 
                                value={newGoalTitle}
                                onChange={e => setNewGoalTitle(e.target.value)}
                                placeholder="GOAL NAME..."
                                className="w-full bg-white/5 border border-white/10 p-4 text-sm font-black uppercase tracking-widest focus:border-white transition-all outline-none"
                                autoFocus
                            />
                            <button onClick={addGoal} className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.5em] text-xs hover:bg-white/90 active:scale-95 transition-all">
                                SAVE GOAL
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default GoalSetter;
