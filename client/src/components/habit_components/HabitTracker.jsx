import React, { useState } from 'react';
import useSWR from 'swr';
import api from '../../services/api';

// ... (keep ICON_OPTIONS, SUGGESTIONS, COLOR_MAP, etc unchanged)
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

const SUGGESTIONS = [
    {
        category: 'Health',
        habits: [
            { name: 'Drink Water', icon: 'local_drink', color: 'emerald' },
            { name: 'Evening Walk', icon: 'directions_run', color: 'orange' },
            { name: 'Eat Healthy', icon: 'restaurant', color: 'amber' },
            { name: 'Go to Gym', icon: 'fitness_center', color: 'red' },
        ]
    },
    {
        category: 'Mindset',
        habits: [
            { name: 'Meditation', icon: 'self_improvement', color: 'purple' },
            { name: 'Read 30m', icon: 'menu_book', color: 'blue' },
            { name: 'Journaling', icon: 'history_edu', color: 'violet' },
            { name: 'Early Bed', icon: 'bedtime', color: 'indigo' },
        ]
    },
    {
        category: 'Creative',
        habits: [
            { name: 'Daily Sketch', icon: 'brush', color: 'pink' },
            { name: 'Coding', icon: 'code', color: 'cyan' },
            { name: 'Practice Music', icon: 'music_note', color: 'violet' },
            { name: 'Writing', icon: 'school', color: 'teal' },
        ]
    },
    {
        category: 'Finance',
        habits: [
            { name: 'Track Expenses', icon: 'payments', color: 'emerald' },
            { name: 'Save $10', icon: 'savings', color: 'amber' },
            { name: 'No Spend Day', icon: 'wallet', color: 'blue' },
        ]
    },
    {
        category: 'Productivity',
        habits: [
            { name: 'Deep Work', icon: 'bolt', color: 'amber' },
            { name: 'Inbox Zero', icon: 'mail', color: 'blue' },
            { name: 'Plan Tomorrow', icon: 'event_note', color: 'indigo' },
        ]
    }
];

const COLOR_MAP = {
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-500', solid: 'bg-emerald-500' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-500', solid: 'bg-blue-500' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-500', solid: 'bg-orange-500' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-500', solid: 'bg-purple-500' },
    red: { bg: 'bg-red-500/20', text: 'text-red-500', solid: 'bg-red-500' },
    cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-500', solid: 'bg-cyan-500' },
    indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-500', solid: 'bg-indigo-500' },
    amber: { bg: 'bg-amber-500/20', text: 'text-amber-500', solid: 'bg-amber-500' },
    pink: { bg: 'bg-pink-500/20', text: 'text-pink-500', solid: 'bg-pink-500' },
    teal: { bg: 'bg-teal-500/10', text: 'text-teal-500', solid: 'bg-teal-500' },
    violet: { bg: 'bg-violet-500/20', text: 'text-violet-500', solid: 'bg-violet-500' },
    rose: { bg: 'bg-rose-500/20', text: 'text-rose-500', solid: 'bg-rose-500' },
};

const fetcher = url => api.get(url).then(res => res.data);

function HabitTracker({
    activeDate = new Date(),
    onDateChange,
    onFilterChange,
    filter: propFilter = 'All',
    habits: propHabits,
    myHabits: propMyHabits,
    partnerHabits: propPartnerHabits,
    checks: propChecks,
    mutateHabits: propMutate,
    isDashboard = false,
    isReadOnly = false,
    isPartnerView = false,
    partnerName = "Partner"
}) {
    // If not passed from parent, fetch internally
    const { data: fetchedHabits, error, isLoading, mutate: swrMutate } = useSWR(propHabits ? null : '/habits', fetcher);

    const habits = propHabits || fetchedHabits || [];
    const mutateHabits = propMutate || swrMutate;

    // Group habits by sharedGroupId for partner view
    const groupedHabits = React.useMemo(() => {
        if (!isPartnerView) return habits;

        const maps = new Map();
        habits.forEach(h => {
            if (h.isShared && h.sharedGroupId) {
                if (!maps.has(h.sharedGroupId)) {
                    maps.set(h.sharedGroupId, { id: h.sharedGroupId, name: h.name, icon: h.icon, color: h.color, myHabit: null, partnerHabit: null, isShared: true });
                }
                const group = maps.get(h.sharedGroupId);
                if (h.user === propMyHabits?.[0]?.user || h.user === habits.find(hab => !hab.isShared)?.user) { // Fallback logic for user detection
                    // Actually better to use propMyHabits if available
                }
                // Let's refine the grouping logic
            }
        });
        return habits; // Fallback for now, will implement proper grouping in the render loop or memo
    }, [habits, isPartnerView]);

    // Better grouping logic directly for the UI
    const displayHabits = React.useMemo(() => {
        if (!isPartnerView) return habits;

        const shared = {};
        const standalone = [];

        habits.forEach(h => {
            if (h.isShared && h.sharedGroupId) {
                if (!shared[h.sharedGroupId]) {
                    shared[h.sharedGroupId] = { myHabit: null, partnerHabit: null };
                }
                if (h.user === (propMyHabits?.[0]?.user || "me")) { // Need a robust way to identify 'me'
                    shared[h.sharedGroupId].myHabit = h;
                } else {
                    shared[h.sharedGroupId].partnerHabit = h;
                }
            } else {
                standalone.push(h);
            }
        });

        // Reconstruct: Shared ones first, then standalone
        const result = [];
        Object.keys(shared).forEach(gid => {
            const h = shared[gid].myHabit || shared[gid].partnerHabit;
            result.push({
                ...h,
                _id: gid, // Use groupId as temporary UI id
                myPart: shared[gid].myHabit,
                partnerPart: shared[gid].partnerHabit,
                isGrouped: true
            });
        });

        return [...result, ...standalone];
    }, [habits, isPartnerView, propMyHabits]);

    // Derive checks dictionary from the flat habit.checks array for easy O(1) lookups
    // Note: In partner view, checks is already passed as { habitId: { completed: {}, user: id } }
    const checksDict = React.useMemo(() => {
        if (isPartnerView) return propChecks;
        const dict = {};
        habits.forEach(habit => {
            dict[habit._id] = { completed: {} };
            if (habit.checks && Array.isArray(habit.checks)) {
                habit.checks.forEach(check => {
                    dict[habit._id].completed[check.date] = check.completed;
                });
            }
        });
        return dict;
    }, [habits, propChecks, isPartnerView]);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const getWeekOfMonth = (date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - 3);
        const day = startOfWeek.getDate();
        const weekNum = Math.ceil(day / 7);
        const suffixes = ["1st", "2nd", "3rd", "4th", "5th"];
        return suffixes[weekNum - 1] || "5th";
    };

    const [editMode, setEditMode] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState('suggestions'); // 'suggestions' or 'custom'
    const [editingHabit, setEditingHabit] = useState(null);
    const [newHabit, setNewHabit] = useState({ name: '', icon: 'local_drink', color: 'emerald' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - today.getDay());
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    // Generate days to display based on view and activeDate
    const getDays = () => {
        if (isDashboard) return [today];
        const days = [];
        // Show 7 days around the active date (3 before, 3 after)
        const start = new Date(activeDate);
        start.setDate(activeDate.getDate() - 3);
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const daysToDisplay = getDays();

    const toggleCheck = async (habitId, date) => {
        if (editMode || isReadOnly) return;

        // Prevent checking future days
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        if (targetDate > today || targetDate < startOfCurrentWeek) return;

        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        // Optimistic update
        if (mutateHabits) {
            mutateHabits(current => {
                if (!current) return current;
                return current.map(h => {
                    if (h._id === habitId) {
                        const checkIndex = h.checks.findIndex(c => c.date === dateStr);
                        const newChecks = [...h.checks];
                        if (checkIndex > -1) {
                            newChecks[checkIndex].completed = !newChecks[checkIndex].completed;
                        } else {
                            newChecks.push({ date: dateStr, completed: true });
                        }
                        return { ...h, checks: newChecks };
                    }
                    return h;
                });
            }, false);
        }

        try {
            await api.patch(`/habits/${habitId}/check`, { dateStr });
            if (mutateHabits) mutateHabits(); // Revalidate
        } catch (error) {
            console.error('Failed to toggle check:', error);
            if (mutateHabits) mutateHabits(); // Rollback
        }
    };

    const addHabit = async () => {
        if (!newHabit.name.trim()) return;

        const payload = {
            name: newHabit.name.trim(),
            icon: newHabit.icon,
            color: newHabit.color,
            isShared: newHabit.isShared,
            category: SUGGESTIONS.find(s => s.habits.some(h => h.icon === newHabit.icon))?.category || 'Productivity',
        };

        try {
            await api.post('/habits', payload);
            mutateHabits();
        } catch (error) {
            console.error('Failed to create habit:', error);
        }

        setNewHabit({ name: '', icon: 'local_drink', color: 'emerald' });
        setAddModalOpen(false);
        setModalStep('suggestions');
    };

    const selectSuggestion = async (suggestion, category) => {
        const payload = {
            name: suggestion.name,
            icon: suggestion.icon,
            color: suggestion.color,
            category,
        };

        try {
            await api.post('/habits', payload);
            mutateHabits();
        } catch (error) {
            console.error('Failed to create suggested habit:', error);
        }

        setAddModalOpen(false);
    };

    const deleteHabit = async (id) => {
        // Optimistic update
        mutateHabits(current => current.filter(h => h._id !== id), false);
        try {
            await api.delete(`/habits/${id}`);
            mutateHabits();
        } catch (error) {
            console.error('Failed to delete habit:', error);
            mutateHabits(); // Rollback
        }
    };

    const startEditHabit = (habit) => {
        setEditingHabit({ ...habit });
    };

    const saveEditHabit = () => {
        // Not implemented in backend yet, just reverting editing state for now
        if (!editingHabit) return;
        setEditingHabit(null);
    };

    const cancelEditHabit = () => {
        setEditingHabit(null);
    };

    const isChecked = (habitId, date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return checksDict[habitId]?.completed[dateStr] || false;
    };

    return (
        <>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm flex flex-col justify-between relative overflow-visible group flex-1 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out min-h-[400px]">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>

                {/* Header */}
                <div className="relative z-10 flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white shrink-0">
                            {isPartnerView ? `${partnerName} Sync` : 'Habit Tracker'}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Week Selector Integrated */}
                        {!isDashboard && onDateChange && (
                            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-0.5 mr-2">
                                <button
                                    onClick={() => onDateChange(-1)}
                                    className="p-1 px-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </button>
                                <div className="px-1 text-[10px] font-black text-slate-600 dark:text-slate-300 min-w-[100px] text-center uppercase tracking-wider">
                                    {months[activeDate.getMonth()]} • {getWeekOfMonth(activeDate)}
                                </div>
                                <button
                                    onClick={() => onDateChange(1)}
                                    className="p-1 px-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>
                        )}

                        {!isReadOnly && !isDashboard && (
                            <button
                                onClick={() => setAddModalOpen(true)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 hover:text-primary transition-colors"
                                title="Add Habit"
                            >
                                <span className="material-symbols-outlined text-xl">add_circle</span>
                            </button>
                        )}

                        {!isReadOnly && !isDashboard && (
                            <button
                                onClick={() => { setEditMode(!editMode); setEditingHabit(null); }}
                                className={`p-2 rounded-lg transition-all duration-300 ${editMode ? 'text-primary bg-primary/10 ring-1 ring-primary/20 shadow-sm' : 'text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                                title={editMode ? 'Stop Editing' : 'Edit Habits'}
                            >
                                <span className="material-symbols-outlined text-xl">edit</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="relative z-10 w-full overflow-y-auto custom-scrollbar flex-1 flex flex-col">

                    {/* Header Row */}
                    <div className="flex items-center gap-4 py-3 border-b border-slate-200 dark:border-slate-800">
                        <div className={`${isDashboard ? 'flex-1 min-w-0' : 'w-1/3 min-w-[150px]'} font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider`}>Habit</div>
                        <div className="flex-1 flex justify-end items-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                            {isDashboard ? (
                                <span className="w-8 text-center font-black text-primary uppercase tracking-widest">✓</span>
                            ) : (
                                daysToDisplay.map((date, i) => {
                                    const isToday = date.toDateString() === today.toDateString();
                                    return (
                                        <span key={i} className={`w-8 text-center ${isToday ? 'text-primary font-black' : ''}`}>
                                            {date.getDate()}
                                        </span>
                                    );
                                })
                            )}
                        </div>
                        {editMode && <div className="w-16"></div>}
                    </div>

                    {/* Habit Rows */}
                    <div className={`flex flex-col overflow-y-auto pr-1 custom-scrollbar ${isDashboard ? 'max-h-[240px]' : 'max-h-[380px]'}`}>
                        {displayHabits
                            .filter(h => propFilter === 'All' || h.category === propFilter)
                            .sort((a, b) => {
                                const checkedA = isChecked(a.myPart?._id || a._id, today);
                                const checkedB = isChecked(b.myPart?._id || b._id, today);
                                if (checkedA === checkedB) return 0;
                                return checkedA ? 1 : -1;
                            })
                            .map((habit) => {
                                const colors = COLOR_MAP[habit.color] || COLOR_MAP.emerald;
                                const isEditing = editingHabit?._id === habit._id;

                                return (
                                    <div key={habit._id} className={`flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800/50 ${editMode ? 'hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-lg transition-colors' : ''}`}>

                                        {/* Habit Name (or edit form) */}
                                        <div className={`${isDashboard ? 'flex-1 min-w-0' : 'w-1/3 min-w-[150px]'} flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 overflow-hidden`}>
                                            {isEditing ? (
                                                <div className="flex items-center gap-2 w-full">
                                                    <select
                                                        value={editingHabit.icon}
                                                        onChange={(e) => setEditingHabit({ ...editingHabit, icon: e.target.value })}
                                                        className="w-10 h-8 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                                                    >
                                                        {ICON_OPTIONS.map(opt => (
                                                            <option key={opt.icon} value={opt.icon}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="text"
                                                        value={editingHabit.name}
                                                        onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })}
                                                        className="flex-1 min-w-0 px-2 py-1 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <span className={`material-symbols-outlined ${colors.text} text-lg shrink-0`}>{habit.icon}</span>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="truncate">{habit.name}</span>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wide truncate ${habit.streak > 0 ? colors.text : 'text-slate-400'}`}>
                                                            {habit.streak > 0 ? `${habit.streak}d streak 🔥` : 'No streak'}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Day Checks */}
                                        <div className={`flex-1 flex ${isDashboard ? 'justify-end' : 'justify-between'} items-center`}>
                                            {daysToDisplay.map((date, dayIdx) => {
                                                const dateStr = date.toISOString().split('T')[0];
                                                const myChecked = habit.myPart ? checksDict[habit.myPart._id]?.completed[dateStr] : checksDict[habit._id]?.completed[dateStr];
                                                const partnerChecked = habit.partnerPart ? checksDict[habit.partnerPart._id]?.completed[dateStr] : false;

                                                const isGrouped = habit.isGrouped;

                                                const targetDate = new Date(date);
                                                targetDate.setHours(0, 0, 0, 0);
                                                const isFuture = targetDate > today;
                                                const isPastWeek = targetDate < startOfCurrentWeek;
                                                const isLocked = isFuture || isPastWeek;

                                                return (
                                                    <div key={dayIdx} className="relative w-8 h-8 flex items-center justify-center">
                                                        {isPartnerView && isGrouped ? (
                                                            // SPLIT CHECK CIRCLE
                                                            <div className="relative w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden flex">
                                                                {/* My Half (Left) */}
                                                                <button
                                                                    onClick={() => toggleCheck(habit.myPart?._id || habit._id, date)}
                                                                    disabled={editMode || isLocked || isReadOnly}
                                                                    className={`w-1/2 h-full transition-all ${myChecked ? colors.bg : 'bg-transparent'} flex items-center justify-end pr-0.5`}
                                                                >
                                                                    <div className={`w-1 h-1 rounded-full ${myChecked ? colors.text : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                                                </button>
                                                                {/* Partner Half (Right) */}
                                                                <div
                                                                    className={`w-1/2 h-full transition-all ${partnerChecked ? colors.bg : 'bg-transparent'} opacity-80 border-l border-slate-200 dark:border-slate-700 flex items-center justify-start pl-0.5`}
                                                                >
                                                                    <div className={`w-1 h-1 rounded-full ${partnerChecked ? colors.text : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            // NORMAL CHECK CIRCLE
                                                            <button
                                                                onClick={() => toggleCheck(habit._id, date)}
                                                                disabled={editMode || isLocked || isReadOnly || (isPartnerView && habit.user !== propMyHabits?.[0]?.user)}
                                                                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isFuture
                                                                    ? 'border border-dashed border-slate-200 dark:border-slate-700 opacity-30 shadow-none cursor-not-allowed'
                                                                    : isPastWeek
                                                                        ? myChecked
                                                                            ? `${colors.bg} ${colors.text} opacity-60 cursor-default`
                                                                            : 'border border-slate-100 dark:border-slate-800 opacity-40 cursor-default'
                                                                        : myChecked
                                                                            ? `${colors.bg} ${colors.text} shadow-sm`
                                                                            : 'border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                                                                    } ${!editMode && !isLocked ? 'hover:scale-110 active:scale-95' : ''}`}
                                                            >
                                                                <span className={`material-symbols-outlined text-[10px] ${(!myChecked && !isFuture) || isPastWeek ? 'text-slate-300 dark:text-slate-600' : ''}`}>
                                                                    {isFuture ? 'lock' : 'check'}
                                                                </span>
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Edit Actions */}
                                        {editMode && (
                                            <div className="w-16 shrink-0 flex items-center justify-end gap-1">
                                                {isEditing ? (
                                                    <>
                                                        <button onClick={saveEditHabit} className="p-1 rounded-md hover:bg-emerald-500/10 text-emerald-500 transition-colors" title="Save">
                                                            <span className="material-symbols-outlined text-base">check</span>
                                                        </button>
                                                        <button onClick={cancelEditHabit} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors" title="Cancel">
                                                            <span className="material-symbols-outlined text-base">close</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => startEditHabit(habit)} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors" title="Edit">
                                                            <span className="material-symbols-outlined text-base">edit</span>
                                                        </button>
                                                        <button onClick={() => deleteHabit(habit._id)} className="p-1 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                                            <span className="material-symbols-outlined text-base">delete</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>

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
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setAddModalOpen(false); setModalStep('suggestions'); }}></div>

                    {/* Modal Card */}
                    <div className="relative z-10 w-full max-w-sm bg-white dark:bg-[#192233] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                                    {modalStep === 'suggestions' ? 'Add New Habit' : 'Custom Habit'}
                                </h3>
                                <button onClick={() => { setAddModalOpen(false); setModalStep('suggestions'); }} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {modalStep === 'suggestions' ? (
                                <div className="flex flex-col gap-6">
                                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                        {SUGGESTIONS.map((cat) => (
                                            <div key={cat.category} className="space-y-2">
                                                <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">{cat.category}</h4>
                                                <div className="grid grid-cols-1 gap-1.5">
                                                    {cat.habits.map((habit) => (
                                                        <button
                                                            key={habit.name}
                                                            onClick={() => selectSuggestion(habit, cat.category)}
                                                            className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                                                        >
                                                            <span className={`material-symbols-outlined ${COLOR_MAP[habit.color].text} text-xl group-hover:scale-110 transition-transform`}>{habit.icon}</span>
                                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{habit.name}</span>
                                                            <span className="material-symbols-outlined ml-auto text-slate-300 dark:text-slate-600 text-sm group-hover:text-primary transition-colors">add</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setModalStep('custom')}
                                        className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">add</span>
                                        <span className="text-sm font-black uppercase tracking-wider">Create Custom Habit</span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Habit Name */}
                                    <div className="flex flex-col gap-1.5 mb-5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Habit Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Drink 8 glasses of water"
                                            value={newHabit.name}
                                            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-slate-400/70"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Icon Picker */}
                                    <div className="flex flex-col gap-1.5 mb-4">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Choose Icon</label>
                                        <div className="grid grid-cols-6 gap-2">
                                            {ICON_OPTIONS.map((opt) => {
                                                const isSelected = newHabit.icon === opt.icon;
                                                return (
                                                    <button
                                                        key={opt.icon}
                                                        onClick={() => setNewHabit({ ...newHabit, icon: opt.icon })}
                                                        className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${isSelected
                                                            ? `${COLOR_MAP[newHabit.color].bg} ${COLOR_MAP[newHabit.color].text} ring-2 ring-offset-1 ring-primary scale-110`
                                                            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105'
                                                            }`}
                                                        title={opt.label}
                                                    >
                                                        <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Color Picker */}
                                    <div className="flex flex-col gap-1.5 mb-5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Choose Color</label>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.keys(COLOR_MAP).map((colorKey) => {
                                                const isSelected = newHabit.color === colorKey;
                                                return (
                                                    <button
                                                        key={colorKey}
                                                        onClick={() => setNewHabit({ ...newHabit, color: colorKey })}
                                                        className={`size-6 rounded-full transition-all ${COLOR_MAP[colorKey].solid} ${isSelected ? 'ring-2 ring-offset-2 ring-primary scale-125' : 'hover:scale-110'}`}
                                                        title={colorKey}
                                                    ></button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    <div className="flex items-center gap-3 p-3 mb-5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700">
                                        <span className={`material-symbols-outlined text-lg ${COLOR_MAP[newHabit.color]?.text}`}>{newHabit.icon}</span>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{newHabit.name || 'Your Habit Name'}</span>
                                        <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase">Preview</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setModalStep('suggestions')}
                                            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={addHabit}
                                            disabled={!newHabit.name.trim()}
                                            className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            Add Habit
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default HabitTracker;
