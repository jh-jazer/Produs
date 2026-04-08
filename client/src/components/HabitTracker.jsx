/* eslint-disable */
import React, { useState } from 'react';

const ICON_OPTIONS = [
    { icon: 'local_drink', color: 'emerald', label: 'Water' },
    { icon: 'menu_book', color: 'blue', label: 'Reading' },
    { icon: 'directions_run', color: 'orange', label: 'Running' },
    { icon: 'self_improvement', color: 'purple', label: 'Meditation' },
    { icon: 'fitness_center', color: 'red', label: 'Gym' },
    { icon: 'code', color: 'cyan', label: 'Coding' },
    { icon: 'bedtime', color: 'indigo', label: 'Sleep' },
    { icon: 'restaurant', color: 'amber', label: 'Nutrition' },
    { icon: 'brush', color: 'pink', label: 'Creative' },
    { icon: 'school', color: 'teal', label: 'Study' },
    { icon: 'music_note', color: 'violet', label: 'Music' },
    { icon: 'favorite', color: 'rose', label: 'Wellness' },
];

const COLOR_MAP = {
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-500' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-500' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-500' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-500' },
    red: { bg: 'bg-red-500/20', text: 'text-red-500' },
    cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-500' },
    indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-500' },
    amber: { bg: 'bg-amber-500/20', text: 'text-amber-500' },
    pink: { bg: 'bg-pink-500/20', text: 'text-pink-500' },
    teal: { bg: 'bg-teal-500/20', text: 'text-teal-500' },
    violet: { bg: 'bg-violet-500/20', text: 'text-violet-500' },
    rose: { bg: 'bg-rose-500/20', text: 'text-rose-500' },
};

const DEFAULT_HABITS = [
    { id: 1, name: 'Drink Water', icon: 'local_drink', color: 'emerald', streak: 12, checks: [true, false, false, false, false, false, false] },
    { id: 2, name: 'Read 30 mins', icon: 'menu_book', color: 'blue', streak: 5, checks: [true, true, false, false, false, false, false] },
    { id: 3, name: 'Exercise', icon: 'directions_run', color: 'orange', streak: 0, checks: [false, false, false, false, false, false, false] },
    { id: 4, name: 'Meditation', icon: 'self_improvement', color: 'purple', streak: 28, checks: [true, false, false, false, false, false, false] },
];

function HabitTracker() {
    const [habits, setHabits] = useState(DEFAULT_HABITS);
    const [editMode, setEditMode] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [newHabit, setNewHabit] = useState({ name: '', icon: 'local_drink', color: 'emerald' });

    const todayIndex = 1; // day 25 is today (index 1 in [24,25,26,27,28,29,30])

    const toggleCheck = (habitId, dayIdx) => {
        if (editMode || dayIdx > todayIndex) return;
        setHabits(prev => prev.map(h =>
            h.id === habitId
                ? { ...h, checks: h.checks.map((c, i) => i === dayIdx ? !c : c) }
                : h
        ));
    };

    const addHabit = () => {
        if (!newHabit.name.trim()) return;
        setHabits(prev => [...prev, {
            id: Date.now(),
            name: newHabit.name.trim(),
            icon: newHabit.icon,
            color: newHabit.color,
            checks: [false, false, false, false, false, false, false],
        }]);
        setNewHabit({ name: '', icon: 'local_drink', color: 'emerald' });
        setAddModalOpen(false);
    };

    const deleteHabit = (id) => {
        setHabits(prev => prev.filter(h => h.id !== id));
    };

    const startEditHabit = (habit) => {
        setEditingHabit({ ...habit });
    };

    const saveEditHabit = () => {
        if (!editingHabit) return;
        setHabits(prev => prev.map(h => h.id === editingHabit.id ? editingHabit : h));
        setEditingHabit(null);
    };

    const cancelEditHabit = () => {
        setEditingHabit(null);
    };

    return (
        <>
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none flex flex-col justify-between relative overflow-visible group flex-1 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>

                {/* Header */}
                <div className="relative z-10 flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Habit Tracker</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Stay consistent with your daily goals</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setAddModalOpen(true)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#121212]/50 text-slate-500 hover:text-primary transition-colors"
                            title="Add Habit"
                        >
                            <span className="material-symbols-outlined text-xl">add_circle</span>
                        </button>
                        <button
                            onClick={() => { setEditMode(!editMode); setEditingHabit(null); }}
                            className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#121212]/50 transition-colors ${editMode ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-amber-500'}`}
                            title={editMode ? 'Done Editing' : 'Edit Habits'}
                        >
                            <span className="material-symbols-outlined text-xl">{editMode ? 'check_circle' : 'edit'}</span>
                        </button>
                    </div>
                </div>

                {/* Edit mode banner */}
                {editMode && (
                    <div className="relative z-10 flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                        <span className="material-symbols-outlined text-sm">edit</span>
                        <span className="text-xs font-bold">Edit Mode — Click a habit to edit, or delete it.</span>
                        <button onClick={() => { setEditMode(false); setEditingHabit(null); }} className="ml-auto text-xs font-bold hover:underline">Done</button>
                    </div>
                )}

                {/* Table */}
                {/* Table container with limited height for approx 6 habits */}
                <div className="relative z-10 w-full overflow-x-auto overflow-y-auto custom-scrollbar flex-1 flex flex-col pr-2 max-h-[460px]">

                    {/* Header Row */}
                    <div className="flex items-center gap-4 py-3 border-b border-slate-200 dark:border-white/10">
                        <div className="w-1/3 min-w-[150px] font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Habit</div>
                        <div className="flex-1 flex justify-between items-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                            {[24, 25, 26, 27, 28, 29, 30].map((d, i) => (
                                <span key={d} className={`w-8 h-8 flex items-center justify-center text-center ${i === 1 ? 'text-primary' : ''}`}>{d}</span>
                            ))}
                        </div>
                        {editMode && <div className="w-16"></div>}
                    </div>

                    {/* Habit Rows */}
                    {habits.map((habit) => {
                        const colors = COLOR_MAP[habit.color] || COLOR_MAP.emerald;
                        const isEditing = editingHabit?.id === habit.id;

                        return (
                            <div key={habit.id} className={`flex items-center gap-4 py-3 border-b border-slate-100 dark:border-white/10/50 ${editMode ? 'hover:bg-slate-50 dark:hover:bg-[#000000]/30 rounded-lg transition-colors' : ''}`}>

                                {/* Habit Name (or edit form) */}
                                <div className="w-1/3 min-w-[150px] flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {isEditing ? (
                                        <div className="flex items-center gap-2 w-full">
                                            <select
                                                value={editingHabit.icon}
                                                onChange={(e) => setEditingHabit({ ...editingHabit, icon: e.target.value })}
                                                className="w-10 h-8 text-xs bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                {ICON_OPTIONS.map(opt => (
                                                    <option key={opt.icon} value={opt.icon}>{opt.label}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                value={editingHabit.name}
                                                onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })}
                                                className="flex-1 min-w-0 px-2 py-1 text-sm bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <span className={`material-symbols-outlined ${colors.text} text-lg`}>{habit.icon}</span>
                                            <div className="flex flex-col">
                                                <span>{habit.name}</span>
                                                <span className={`text-[10px] font-bold uppercase tracking-wide ${habit.streak > 0 ? colors.text : 'text-slate-400'}`}>
                                                    {habit.streak > 0 ? `${habit.streak} day streak 🔥` : 'No streak'}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Day Checks */}
                                <div className="flex-1 flex justify-between items-center">
                                    {habit.checks.map((checked, dayIdx) => {
                                        const isFuture = dayIdx > todayIndex;
                                        return (
                                            <button
                                                key={dayIdx}
                                                onClick={() => toggleCheck(habit.id, dayIdx)}
                                                disabled={editMode || isFuture}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isFuture
                                                    ? 'border border-dashed border-slate-200 dark:border-white/10 opacity-30'
                                                    : checked
                                                        ? `${colors.bg} ${colors.text}`
                                                        : 'border border-slate-200 dark:border-white/10'
                                                    } ${!editMode && !isFuture ? 'hover:scale-110 active:scale-95' : ''} ${editMode ? 'opacity-50 cursor-default' : ''}`}
                                            >
                                                <span className={`material-symbols-outlined text-sm ${!checked || isFuture ? 'text-slate-300 dark:text-slate-600' : ''}`}>
                                                    {isFuture ? 'lock' : 'check'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Edit Actions */}
                                {editMode && (
                                    <div className="w-16 flex items-center justify-end gap-1">
                                        {isEditing ? (
                                            <>
                                                <button onClick={saveEditHabit} className="p-1 rounded-md hover:bg-emerald-500/10 text-emerald-500 transition-colors" title="Save">
                                                    <span className="material-symbols-outlined text-base">check</span>
                                                </button>
                                                <button onClick={cancelEditHabit} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#000000] text-slate-400 transition-colors" title="Cancel">
                                                    <span className="material-symbols-outlined text-base">close</span>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => startEditHabit(habit)} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#000000] text-slate-400 hover:text-primary transition-colors" title="Edit">
                                                    <span className="material-symbols-outlined text-base">edit</span>
                                                </button>
                                                <button onClick={() => deleteHabit(habit.id)} className="p-1 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                                    <span className="material-symbols-outlined text-base">delete</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {habits.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-2">playlist_add</span>
                            <p className="text-sm font-medium">No habits yet. Add one to get started!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ====== Add Habit Modal ====== */}
            {addModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAddModalOpen(false)}></div>

                    {/* Modal Card */}
                    <div className="relative z-10 w-full max-w-sm bg-white dark:bg-[#121212] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">New Habit</h3>
                                <button onClick={() => setAddModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#000000] text-slate-400 transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {/* Habit Name */}
                            <div className="flex flex-col gap-1.5 mb-5">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Habit Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Drink 8 glasses of water"
                                    value={newHabit.name}
                                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#000000]/30 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-slate-400/70"
                                    autoFocus
                                />
                            </div>

                            {/* Icon Picker */}
                            <div className="flex flex-col gap-1.5 mb-5">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Choose Icon</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {ICON_OPTIONS.map((opt) => {
                                        const isSelected = newHabit.icon === opt.icon;
                                        return (
                                            <button
                                                key={opt.icon}
                                                onClick={() => setNewHabit({ ...newHabit, icon: opt.icon, color: opt.color })}
                                                className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${isSelected
                                                    ? `${COLOR_MAP[opt.color].bg} ${COLOR_MAP[opt.color].text} ring-2 ring-offset-1 ring-primary scale-110`
                                                    : 'bg-slate-50 dark:bg-[#000000]/50 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#000000] hover:scale-105'
                                                    }`}
                                                title={opt.label}
                                            >
                                                <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Preview */}
                            {newHabit.name && (
                                <div className="flex items-center gap-3 p-3 mb-5 rounded-xl bg-slate-50 dark:bg-[#000000]/30 border border-slate-100 dark:border-white/10">
                                    <span className={`material-symbols-outlined text-lg ${COLOR_MAP[newHabit.color]?.text}`}>{newHabit.icon}</span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{newHabit.name}</span>
                                    <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase">Preview</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setAddModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-[#000000] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={addHabit}
                                    disabled={!newHabit.name.trim()}
                                    className="flex-1 py-2.5 rounded-xl bg-[#121212] dark:bg-white text-white dark:text-slate-900 text-sm font-black hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-none disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    Add Habit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default HabitTracker;
