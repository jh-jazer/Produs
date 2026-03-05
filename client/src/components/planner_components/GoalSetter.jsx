import React, { useState } from 'react';
import useSWR from 'swr';
import api from '../../services/api';

const fetcher = url => api.get(url).then(res => res.data);

const GoalSetter = () => {
    const [view, setView] = useState('monthly'); // 'monthly', 'yearly'
    const now = new Date();
    const currentYear = now.getFullYear();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

    const { data: goals, mutate } = useSWR(`/planner/goals?year=${currentYear}`, fetcher);
    const [newGoalTitle, setNewGoalTitle] = useState('');

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const filteredGoals = goals?.filter(g => {
        if (view === 'yearly') return g.period === 'yearly';
        return g.period === 'monthly' && g.month === selectedMonth;
    }) || [];

    const addGoal = async () => {
        if (!newGoalTitle.trim()) return;
        try {
            const payload = {
                title: newGoalTitle.trim(),
                period: view,
                year: Number(currentYear),
                month: view === 'monthly' ? Number(selectedMonth) : undefined
            };

            const response = await api.post('/planner/goals', payload);
            if (response.data) {
                setNewGoalTitle('');
                await mutate();
            }
        } catch (error) {
            console.error('Failed to add goal:', error.response?.data || error.message);
            alert('Failed to add goal. Please try again.');
        }
    };

    const toggleGoal = async (goal) => {
        try {
            await api.patch(`/planner/goals/${goal._id}`, { completed: !goal.completed });
            mutate();
        } catch (error) {
            console.error('Failed to update goal:', error);
        }
    };

    const deleteGoal = async (id) => {
        try {
            await api.delete(`/planner/goals/${id}`);
            mutate();
        } catch (error) {
            console.error('Failed to delete goal:', error);
        }
    };

    const getViewTitle = () => {
        if (view === 'yearly') return `${currentYear} Goals`;
        return `${months[selectedMonth]} Goals`;
    };

    const getViewDescription = () => {
        if (view === 'yearly') return 'Set your primary objectives for this year.';
        return 'Set your specific goals for this month.';
    };

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{getViewTitle()}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{getViewDescription()}</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {['monthly', 'yearly'].map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${view === v
                                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            {view === 'monthly' && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {months.map((m, idx) => (
                        <button
                            key={m}
                            onClick={() => setSelectedMonth(idx)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${selectedMonth === idx
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            {m.substring(0, 3)}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex gap-2">
                <input
                    type="text"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                    placeholder={`Add a ${view} goal...`}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
                />
                <button
                    onClick={addGoal}
                    className="p-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg flex items-center justify-center min-w-[44px]"
                >
                    <span className="material-symbols-outlined">add</span>
                </button>
            </div>

            {view === 'monthly' && filteredGoals.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border-l-4 border-primary">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        These are your goal for the month of <span className="text-primary">{months[selectedMonth]}</span>
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGoals.map((goal) => (
                    <div
                        key={goal._id}
                        className={`p-4 rounded-xl border flex flex-col gap-3 group transition-all duration-300 ${goal.completed
                            ? 'bg-slate-50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/40 opacity-60'
                            : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-primary/30 hover:shadow-md'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => toggleGoal(goal)}
                                    className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${goal.completed
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                                        }`}
                                >
                                    {goal.completed && <span className="material-symbols-outlined text-xs font-black">check</span>}
                                </button>
                                <span className={`text-sm font-bold transition-all ${goal.completed ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'
                                    }`}>
                                    {goal.title}
                                </span>
                            </div>
                            <button
                                onClick={() => deleteGoal(goal._id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-400">Status</span>
                                <span className={goal.completed ? 'text-emerald-500' : 'text-primary'}>
                                    {goal.completed ? 'Completed' : 'In Progress'}
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${goal.completed ? 'bg-emerald-500' : 'bg-primary'}`}
                                    style={{ width: goal.completed ? '100%' : '35%' }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredGoals.length === 0 && (
                    <div className="col-span-full text-center py-10 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800/50 rounded-2xl">
                        <span className="material-symbols-outlined text-3xl mb-2 opacity-20">flag</span>
                        <p className="text-xs font-black uppercase tracking-widest">No goals set for this {view.replace('ly', '')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoalSetter;

