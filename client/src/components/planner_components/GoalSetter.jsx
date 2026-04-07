import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import api from '../../services/api';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useGoals } from '../../hooks/useGoals';

const fetcher = url => api.get(url).then(res => res.data);

/* ─── helpers ─────────────────────────────────────────── */

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/** Returns all ISO week numbers that touch the given month/year,
 *  paired with a human-readable label like "Week 1 (Mar 3–9)". */
function getWeeksInMonth(year, month) {
    const weeks = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let current = new Date(firstDay);
    // rewind to Monday
    current.setDate(current.getDate() - ((current.getDay() + 6) % 7));

    let weekNum = 1;
    while (current <= lastDay) {
        const weekStart = new Date(current);
        const weekEnd = new Date(current);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const fmt = (d) =>
            d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        weeks.push({
            weekNum,
            label: `Week ${weekNum}`,
            range: `${fmt(weekStart)} – ${fmt(weekEnd)}`,
            // Store as ISO week within the year for the DB
            isoWeek: getISOWeek(weekStart),
            startDate: weekStart,
        });

        current.setDate(current.getDate() + 7);
        weekNum++;
    }
    return weeks;
}

function getISOWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/* ─── period config ──────────────────────────────────── */

const PERIODS = [
    { id: 'weekly',  label: 'Weekly',  icon: 'calendar_view_week' },
    { id: 'monthly', label: 'Monthly', icon: 'calendar_month' },
    { id: 'yearly',  label: 'Yearly',  icon: 'flag' },
];

/* ─── component ──────────────────────────────────────── */

const GoalSetter = ({ viewMode = 'me', isReadOnly = false }) => {
    const now = new Date();
    const [view, setView] = useState('monthly');
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [selectedWeekIdx, setSelectedWeekIdx] = useState(0);   // index into weeksInMonth
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);

    const upcomingYears = Array.from({ length: 10 }, (_, i) => now.getFullYear() + i);
    const weeksInMonth = useMemo(
        () => getWeeksInMonth(selectedYear, selectedMonth),
        [selectedYear, selectedMonth]
    );

    // Clamp week index when month changes
    const safeWeekIdx = Math.min(selectedWeekIdx, weeksInMonth.length - 1);
    const currentWeek = weeksInMonth[safeWeekIdx];

    /* ── Local goals hook ── */
    const filters = useMemo(() => ({
        period: view,
        year: selectedYear,
        month: view === 'yearly' ? undefined : selectedMonth,
        week: view === 'weekly' ? currentWeek?.isoWeek : undefined
    }), [view, selectedYear, selectedMonth, currentWeek, view]);

    const { goals: filteredGoals, addGoal: addGoalLocal, toggleGoal: toggleGoalLocal, deleteGoal: deleteGoalLocal, isLoading } = useGoals(filters);

    /* ── CRUD ── */
    const addGoal = async () => {
        if (!newGoalTitle.trim()) return;
        const payload = {
            title: newGoalTitle.trim(),
            period: view,
            year: Number(selectedYear),
        };
        if (view === 'monthly') payload.month = Number(selectedMonth);
        if (view === 'weekly')  { payload.month = Number(selectedMonth); payload.week = currentWeek?.isoWeek; }

        await addGoalLocal(payload);
        setNewGoalTitle('');
    };

    const toggleGoal = async (goal) => {
        await toggleGoalLocal(goal._id);
    };

    const deleteGoal = async (id) => {
        await deleteGoalLocal(id);
    };

    /* ── titles ── */
    const viewTitle = {
        weekly:  currentWeek ? `${currentWeek.label}, ${MONTHS[selectedMonth]} ${selectedYear}` : '',
        monthly: `${MONTHS[selectedMonth]} ${selectedYear}`,
        yearly:  `${selectedYear} Goals`,
    }[view];

    const viewDesc = {
        weekly:  'Tasks you must get done this week.',
        monthly: 'Things you must accomplish this month.',
        yearly:  'Your primary objectives for the year.',
    }[view];

    /* ── render: period scroll bar ── */
    const PeriodBar = () => {
        if (view === 'monthly' || view === 'weekly') {
            return (
                <div className="flex flex-col gap-3">
                    {/* Month scroller */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {MONTHS.map((m, idx) => (
                            <button
                                key={m}
                                onClick={() => { setSelectedMonth(idx); setSelectedWeekIdx(0); }}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                                    selectedMonth === idx
                                        ? 'bg-primary text-white shadow-none'
                                        : 'bg-slate-50 dark:bg-[#000000]/50 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#000000]'
                                }`}
                            >
                                {m.substring(0, 3)}
                            </button>
                        ))}
                    </div>

                    {/* Week scroller (only for weekly) */}
                    {view === 'weekly' && (
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {weeksInMonth.map((w, idx) => (
                                <button
                                    key={w.weekNum}
                                    onClick={() => setSelectedWeekIdx(idx)}
                                    className={`flex flex-col items-center px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap border-2 ${
                                        safeWeekIdx === idx
                                            ? 'border-primary bg-primary/5 text-primary shadow-none'
                                            : 'border-transparent bg-slate-50 dark:bg-[#000000]/50 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#000000]'
                                    }`}
                                >
                                    <span>{w.label}</span>
                                    <span className="text-[9px] font-bold normal-case text-slate-400 mt-0.5">{w.range}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // Yearly
        return (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {upcomingYears.map(y => (
                    <button
                        key={y}
                        onClick={() => setSelectedYear(y)}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all whitespace-nowrap ${
                            selectedYear === y
                                ? 'bg-primary text-white shadow-none'
                                : 'bg-slate-50 dark:bg-[#000000]/50 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#000000]'
                        }`}
                    >
                        {y}
                    </button>
                ))}
            </div>
        );
    };

    const completedCount = filteredGoals.filter(g => g.completed).length;
    const progress = filteredGoals.length ? Math.round((completedCount / filteredGoals.length) * 100) : 0;

    return (
        <>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="Delete Goal"
                message="Are you sure you want to delete this goal?"
                confirmLabel="Delete"
                onConfirm={() => { deleteGoal(confirmDelete); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />
            <div className="flex flex-col gap-5 overflow-hidden">

            {/* Header */}
            <div className="px-6 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">{viewTitle}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{viewDesc}</p>
                </div>

                {/* Period tabs */}
                <div className="flex bg-slate-100 dark:bg-[#000000] p-1 rounded-xl shrink-0">
                    {PERIODS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setView(p.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                view === p.id
                                    ? 'bg-white dark:bg-[#121212] text-primary shadow-none'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">{p.icon}</span>
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Period scroll bar */}
            <div className="px-6">
                <PeriodBar />
            </div>

            {/* Progress bar (when there are goals) */}
            {filteredGoals.length > 0 && (
                <div className="px-6">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                        <span className="text-[10px] font-black text-primary">{completedCount}/{filteredGoals.length} done · {progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-[#000000] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-700"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Add input */}
            {!isReadOnly && (
                <div className="px-6">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newGoalTitle}
                            onChange={e => setNewGoalTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addGoal()}
                            placeholder={`Add a ${view} must-do…`}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#000000]/50 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        <button
                            onClick={addGoal}
                            disabled={!newGoalTitle.trim()}
                            className="p-2.5 bg-[#121212] dark:bg-white text-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-none flex items-center justify-center min-w-[44px] disabled:opacity-30"
                        >
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Goal list */}
            <div className="px-6 pb-6 flex flex-col gap-2">
                {filteredGoals.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-white/10/60 rounded-2xl flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-700">
                            { view === 'weekly' ? 'calendar_view_week' : view === 'monthly' ? 'calendar_month' : 'flag' }
                        </span>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                            No {view} must-dos yet
                        </p>
                        {!isReadOnly && (
                            <p className="text-[10px] text-slate-400">Type above and press Enter to add one.</p>
                        )}
                    </div>
                ) : (
                    filteredGoals.map(goal => (
                        <div
                            key={goal._id}
                            className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${
                                goal.completed
                                    ? 'bg-slate-50 dark:bg-[#000000]/20 border-transparent opacity-50'
                                    : 'bg-white dark:bg-[#000000]/30 border-slate-200 dark:border-white/10/50 hover:border-primary/30 hover:shadow-none'
                            }`}
                        >
                            {/* Check button */}
                            <button
                                onClick={() => !isReadOnly && toggleGoal(goal)}
                                className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                    goal.completed
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400'
                                }`}
                            >
                                {goal.completed && (
                                    <span className="material-symbols-outlined text-xs font-black">check</span>
                                )}
                            </button>

                            {/* Title */}
                            <span className={`flex-1 text-sm font-bold transition-all leading-tight ${
                                goal.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                            }`}>
                                {goal.title}
                            </span>

                            {/* Period badge */}
                            <span className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                goal.period === 'weekly'
                                    ? 'border-violet-200 text-violet-500 dark:border-violet-800 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30'
                                    : goal.period === 'monthly'
                                        ? 'border-primary/20 text-primary bg-primary/5'
                                        : 'border-amber-200 text-amber-600 bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:bg-amber-950/30'
                            }`}>
                                {goal.period === 'weekly' ? 'W' : goal.period === 'monthly' ? 'M' : 'Y'}
                            </span>

                            {/* Delete */}
                            {!isReadOnly && (
                                <button
                                onClick={() => setConfirmDelete(goal._id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
            </div>
        </>
    );
};

export default GoalSetter;
