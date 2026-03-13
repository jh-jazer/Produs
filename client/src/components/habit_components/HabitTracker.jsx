import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    },
    {
        category: 'Spiritual',
        habits: [
            { name: 'Daily Prayer', icon: 'auto_awesome', color: 'purple' },
            { name: 'Gratitude Journal', icon: 'history_edu', color: 'violet' },
            { name: 'Scripture Reading', icon: 'menu_book', color: 'indigo' },
            { name: 'Acts of Kindness', icon: 'favorite', color: 'rose' },
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
    partnerName = "Partner",
    isLoading: propLoading,
    error: propError
}) {
    // If not passed from parent, fetch internally
    const { data: fetchedHabits, error: fetchError, isLoading: fetchLoading, mutate: swrMutate } = useSWR(propHabits ? null : '/habits', fetcher);

    const habits = propHabits || fetchedHabits || [];
    const mutateHabits = propMutate || swrMutate;
    const isLoading = propLoading !== undefined ? propLoading : fetchLoading;
    const error = propError !== undefined ? propError : fetchError;

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
    const { teamHabits, partnerHabitsOnly } = React.useMemo(() => {
        if (!isPartnerView) return { teamHabits: habits, partnerHabitsOnly: [] };

        const shared = {};
        const standalonePartner = [];

        habits.forEach(h => {
            if (h.isShared && h.sharedGroupId) {
                if (!shared[h.sharedGroupId]) {
                    shared[h.sharedGroupId] = { myHabit: null, partnerHabit: null };
                }
                if (h.user === (propMyHabits?.[0]?.user || "me")) {
                    shared[h.sharedGroupId].myHabit = h;
                } else {
                    shared[h.sharedGroupId].partnerHabit = h;
                }
            } else if (h.user !== (propMyHabits?.[0]?.user || "me")) {
                standalonePartner.push(h);
            }
        });

        const team = [];
        Object.keys(shared).forEach(gid => {
            const h = shared[gid].myHabit || shared[gid].partnerHabit;
            team.push({
                ...h,
                _id: gid,
                myPart: shared[gid].myHabit,
                partnerPart: shared[gid].partnerHabit,
                isGrouped: true
            });
        });

        return { teamHabits: team, partnerHabitsOnly: standalonePartner };
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
    const [newHabit, setNewHabit] = useState({ name: '', icon: 'local_drink', color: 'emerald', isShared: false, category: 'Productivity' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(today.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const renderHabitRow = (habit) => {
        const colors = COLOR_MAP[habit.color] || COLOR_MAP.emerald;
        const isEditing = editingHabit?._id === (habit.isGrouped ? habit.myPart?._id : habit._id);

        return (
            <div key={habit._id} className={`flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800/50 ${editMode ? 'hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-lg transition-colors' : ''}`}>

                {/* Habit Name (or edit form) */}
                <div className={`${isDashboard ? 'flex-1 min-w-0' : 'w-1/3 min-w-[150px]'} flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 overflow-visible`}>
                    {isEditing ? (
                        <div className="flex flex-col gap-2 w-full p-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-primary/20">
                            <div className="flex items-center gap-2">
                                <select
                                    value={editingHabit.icon}
                                    onChange={(e) => setEditingHabit({ ...editingHabit, icon: e.target.value })}
                                    className="w-10 h-8 text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    {ICON_OPTIONS.map(opt => (
                                        <option key={opt.icon} value={opt.icon}>{opt.label}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={editingHabit.name}
                                    onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })}
                                    className="flex-1 min-w-0 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 px-1 py-0.5">
                                {Object.keys(COLOR_MAP).map(colorKey => (
                                    <button
                                        key={colorKey}
                                        onClick={() => setEditingHabit({ ...editingHabit, color: colorKey })}
                                        className={`w-3.5 h-3.5 rounded-full ${COLOR_MAP[colorKey].solid} transition-transform ${editingHabit.color === colorKey ? 'ring-1 ring-offset-1 ring-primary scale-110' : 'hover:scale-110 opacity-70'}`}
                                    />
                                ))}
                            </div>
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
                        const isTooOld = targetDate < fourteenDaysAgo;
                        const isLocked = isFuture || isTooOld;

                        return (
                            <div key={dayIdx} className="relative w-8 h-8 flex items-center justify-center">
                                {isPartnerView && isGrouped ? (
                                    // SPLIT CHECK CIRCLE
                                    <div className="relative w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden flex">
                                        {/* My Half (Left) */}
                                        <button
                                            onClick={() => toggleCheck(habit.myPart?._id || habit._id, date)}
                                            disabled={editMode || isLocked || isReadOnly}
                                            className="relative w-1/2 h-full flex items-center justify-end pr-0.5 z-10"
                                        >
                                            <AnimatePresence>
                                                {myChecked && (
                                                    <motion.div
                                                        initial={{ y: "100%" }}
                                                        animate={{ y: 0 }}
                                                        exit={{ y: "100%" }}
                                                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                                        className={`absolute inset-0 ${colors.bg} z-0`}
                                                    />
                                                )}
                                            </AnimatePresence>
                                            <div className={`relative z-10 w-1 h-1 rounded-full ${myChecked ? colors.text : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                        </button>
                                        {/* Partner Half (Right) */}
                                        <div
                                            className="relative w-1/2 h-full opacity-80 border-l border-slate-200 dark:border-slate-700 flex items-center justify-start pl-0.5 z-10"
                                        >
                                            <AnimatePresence>
                                                {partnerChecked && (
                                                    <motion.div
                                                        initial={{ y: "100%" }}
                                                        animate={{ y: 0 }}
                                                        exit={{ y: "100%" }}
                                                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                                        className={`absolute inset-0 ${colors.bg} z-0`}
                                                    />
                                                )}
                                            </AnimatePresence>
                                            <div className={`relative z-10 w-1 h-1 rounded-full ${partnerChecked ? colors.text : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                        </div>
                                    </div>
                                ) : (
                                    // NORMAL CHECK CIRCLE
                                    <button
                                        onClick={() => toggleCheck(habit._id, date)}
                                        disabled={editMode || isLocked || isReadOnly || (isPartnerView && habit.user !== propMyHabits?.[0]?.user)}
                                        className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all overflow-hidden ${isFuture
                                            ? 'border border-dashed border-slate-200 dark:border-slate-700 opacity-30 shadow-none cursor-not-allowed'
                                            : isTooOld
                                                ? myChecked
                                                    ? `${colors.text} opacity-60 cursor-default`
                                                    : 'border border-slate-100 dark:border-slate-800 opacity-40 cursor-default'
                                                : myChecked
                                                    ? `${colors.text} shadow-sm`
                                                    : 'border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                                            } ${!editMode && !isLocked ? 'hover:scale-110 active:scale-95' : ''}`}
                                    >
                                        <AnimatePresence>
                                            {myChecked && (
                                                <motion.div
                                                    initial={{ y: "100%" }}
                                                    animate={{ y: 0 }}
                                                    exit={{ y: "100%" }}
                                                    transition={{ type: "spring", damping: 25, stiffness: 120 }}
                                                    className={`absolute inset-0 ${colors.bg} z-0`}
                                                >
                                                    {/* Subtle Wave Effect */}
                                                    <motion.div
                                                        animate={{
                                                            x: ["-25%", "25%"],
                                                        }}
                                                        transition={{
                                                            repeat: Infinity,
                                                            repeatType: "mirror",
                                                            duration: 2,
                                                            ease: "linear"
                                                        }}
                                                        className="absolute top-0 left-0 w-[200%] h-1 bg-white/20 dark:bg-white/10 blur-[2px]"
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <span className={`relative z-10 material-symbols-outlined text-[10px] ${(!myChecked && !isFuture) || isTooOld ? 'text-slate-300 dark:text-slate-600' : ''}`}>
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
                                 {(!isPartnerView || habit.myPart) && (
                                     <button onClick={() => startEditHabit(habit.isGrouped ? habit.myPart : habit)} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors" title="Edit">
                                         <span className="material-symbols-outlined text-base">edit</span>
                                     </button>
                                 )}
                                 {(!isPartnerView || habit.myPart) && (
                                     <button onClick={() => deleteHabit(habit.isGrouped ? habit.myPart._id : habit._id)} className="p-1 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                         <span className="material-symbols-outlined text-base">delete</span>
                                     </button>
                                 )}
                             </>
                         )}
                    </div>
                )}
            </div>
        );
    };

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

        if (targetDate > today || targetDate < fourteenDaysAgo) return;

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
            if (mutateHabits) mutateHabits(); // Revalidate all components
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
            category: newHabit.category,
        };

        try {
            await api.post('/habits', payload);
            mutateHabits();
        } catch (error) {
            console.error('Failed to create habit:', error);
        }

        setNewHabit({ name: '', icon: 'local_drink', color: 'emerald', isShared: false, category: 'Productivity' });
        setAddModalOpen(false);
        setModalStep('suggestions');
    };

    const selectSuggestion = async (suggestion, category) => {
        const payload = {
            name: suggestion.name,
            icon: suggestion.icon,
            color: suggestion.color,
            category: category.name || category, // Handle both object and string
            isShared: newHabit.isShared
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
        const habitToDelete = habits.find(h => h._id === id);
        const gid = habitToDelete?.sharedGroupId;

        // Optimistic update
        mutateHabits(current => {
            if (!current) return current;
            return current.filter(h => {
                if (gid && h.sharedGroupId === gid) return false;
                return h._id !== id;
            });
        }, false);
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

    const saveEditHabit = async () => {
        if (!editingHabit) return;
        
        const payload = {
            name: editingHabit.name,
            icon: editingHabit.icon,
            color: editingHabit.color,
            category: editingHabit.category
        };

        try {
            await api.put(`/habits/${editingHabit._id}`, payload);
            mutateHabits();
            setEditingHabit(null);
        } catch (error) {
            console.error('Failed to update habit:', error);
        }
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
                            {isPartnerView ? `Team View` : 'Habit Tracker'}
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
                                onClick={() => {
                                    setNewHabit({ name: '', icon: 'local_drink', color: 'emerald', isShared: isPartnerView, category: 'Productivity' });
                                    setAddModalOpen(true);
                                }}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5"
                                title={isPartnerView ? 'Add Team Habit' : 'Add Habit'}
                            >
                                <span className="material-symbols-outlined text-xl">add_circle</span>
                                {isPartnerView && <span className="text-[10px] font-black uppercase tracking-wider pr-1">Add Team Habit</span>}
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
                        <div className={`flex-1 flex ${isDashboard ? 'justify-end' : 'justify-between'} items-center text-xs font-semibold text-slate-400 dark:text-slate-500`}>
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
                        {isLoading || error ? (
                            // Skeleton Rows for Loading or Error state
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800/50 animate-pulse">
                                    <div className={`${isDashboard ? 'flex-1' : 'w-1/3'} flex items-center gap-2`}>
                                        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-1"></div>
                                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-16"></div>
                                        </div>
                                    </div>
                                    <div className={`flex-1 flex ${isDashboard ? 'justify-end' : 'justify-between'} items-center`}>
                                        {daysToDisplay.map((_, j) => (
                                            <div key={j} className="w-8 h-8 flex items-center justify-center">
                                                <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <>
                                {/* Render Team/Shared Habits Section */}
                                {teamHabits
                                    .filter(h => propFilter === 'All' || h.category === propFilter)
                                    .sort((a, b) => {
                                        const checkedA = isChecked(a.myPart?._id || a._id, today);
                                        const checkedB = isChecked(b.myPart?._id || b._id, today);
                                        if (checkedA === checkedB) return 0;
                                        return checkedA ? 1 : -1;
                                    })
                                    .map((habit) => renderHabitRow(habit))}

                                {/* Divider for Team View */}
                                {isPartnerView && teamHabits.length > 0 && partnerHabitsOnly.length > 0 && (
                                    <div className="py-2">
                                        <hr className="border-slate-100 dark:border-slate-800" />
                                        <div className="pt-2 pb-1 px-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{partnerName}'s Private Habits</span>
                                        </div>
                                    </div>
                                )}

                                {/* Render Partner Only Habits Section */}
                                {isPartnerView && partnerHabitsOnly
                                    .filter(h => propFilter === 'All' || h.category === propFilter)
                                    .map((habit) => renderHabitRow(habit))}
                            </>
                        )}
                    </div>

                    {!isLoading && !error && habits.length === 0 && (
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
                    <div className={`relative z-10 w-full max-w-sm bg-white dark:bg-[#192233] rounded-2xl shadow-2xl border overflow-hidden transition-all ${isPartnerView ? 'border-primary/30 ring-1 ring-primary/10' : 'border-slate-200 dark:border-slate-800'}`}>
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                    {isPartnerView && <span className="material-symbols-outlined text-primary text-lg">group</span>}
                                    {modalStep === 'suggestions' 
                                        ? (isPartnerView ? 'Add Team Habit' : 'Add New Habit') 
                                        : (isPartnerView ? 'Custom Team Habit' : 'Custom Habit')}
                                </h3>
                                <button onClick={() => { setAddModalOpen(false); setModalStep('suggestions'); }} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>

                            {modalStep === 'suggestions' ? (
                                <div className="flex flex-col gap-6">
                                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
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
                                        className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">add</span>
                                        <span className="text-xs font-black uppercase tracking-wider">Create Custom Habit</span>
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
                                    
                                    {/* Category Picker */}
                                    <div className="flex flex-col gap-1.5 mb-5">
                                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Health', 'Mindset', 'Finance', 'Productivity', 'Creative', 'Spiritual'].map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setNewHabit({ ...newHabit, category: cat })}
                                                    className={`px-2 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all ${newHabit.category === cat 
                                                        ? 'bg-primary/10 border-primary text-primary' 
                                                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200'}`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Icon Picker */}
                                    <div className="flex flex-col gap-1.5 mb-3">
                                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Icon</label>
                                        <div className="grid grid-cols-7 gap-1.5">
                                            {ICON_OPTIONS.map((opt) => {
                                                const isSelected = newHabit.icon === opt.icon;
                                                return (
                                                    <button
                                                        key={opt.icon}
                                                        onClick={() => setNewHabit({ ...newHabit, icon: opt.icon })}
                                                        className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${isSelected
                                                            ? `${COLOR_MAP[newHabit.color].bg} ${COLOR_MAP[newHabit.color].text} ring-1 ring-primary`
                                                            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105'
                                                            }`}
                                                        title={opt.label}
                                                    >
                                                        <span className="material-symbols-outlined text-base">{opt.icon}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Color Picker */}
                                    <div className="flex flex-col gap-1.5 mb-4">
                                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Color</label>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.keys(COLOR_MAP).map((colorKey) => {
                                                const isSelected = newHabit.color === colorKey;
                                                return (
                                                    <button
                                                        key={colorKey}
                                                        onClick={() => setNewHabit({ ...newHabit, color: colorKey })}
                                                        className={`size-5 rounded-full transition-all ${COLOR_MAP[colorKey].solid} ${isSelected ? 'ring-1 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'}`}
                                                        title={colorKey}
                                                    ></button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Preview & Actions */}
                                    <div className="flex items-center gap-3 p-2.5 mb-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700">
                                        <div className="relative shrink-0 flex items-center justify-center size-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                                            <span className={`material-symbols-outlined text-base ${COLOR_MAP[newHabit.color]?.text}`}>{newHabit.icon}</span>
                                            {newHabit.isShared && (
                                                <div className="absolute -top-1 -right-1 bg-primary text-[5px] text-white px-0.5 rounded-full font-black ring-1 ring-white dark:ring-slate-900">TEAM</div>
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{newHabit.name || 'Set Name'}</span>
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{newHabit.isShared ? 'Team Habit' : 'Private Habit'}</span>
                                        </div>
                                        <span className="ml-auto text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Preview</span>
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
