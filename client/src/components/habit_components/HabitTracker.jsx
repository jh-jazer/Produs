import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import ConfirmDialog from '../ui/ConfirmDialog';

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

function HabitTracker({
    activeDate = new Date(),
    onDateChange,
    onFilterChange,
    currentFilter = 'All',
    habits = [],
    myHabits = [],
    partnerHabits = [],
    checks = {},
    isLoading = false,
    isDashboard = false,
    isReadOnly = false,
    isPartnerView = false,
    partnerName = "Partner",
    toggleCheck,
    addHabit,
    deleteHabit,
    updateHabit,
    reorderHabits,
    myUserId
}) {
    const [editMode, setEditMode] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState('suggestions');
    const [editingHabit, setEditingHabit] = useState(null);
    const [newHabit, setNewHabit] = useState({ name: '', icon: 'local_drink', color: 'emerald', isShared: false, category: 'Productivity' });
    const [localTeamHabits, setLocalTeamHabits] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(today.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const getWeekOfMonth = (date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - 3);
        const weekNum = Math.ceil(startOfWeek.getDate() / 7);
        const suffixes = ["1st", "2nd", "3rd", "4th", "5th"];
        return suffixes[weekNum - 1] || "5th";
    };

    const { teamHabits, partnerHabitsOnly } = React.useMemo(() => {
        if (!isPartnerView) {
            const sorted = [...habits].sort((a, b) => (a.systemId ? -1 : 1));
            return { teamHabits: sorted, partnerHabitsOnly: [] };
        }
        const shared = {};
        const standalonePartner = [];
        habits.forEach(h => {
            if (h.isShared && h.sharedGroupId) {
                if (!shared[h.sharedGroupId]) shared[h.sharedGroupId] = { myPart: null, partnerPart: null };
                if (h.userId === myUserId) shared[h.sharedGroupId].myPart = h;
                else shared[h.sharedGroupId].partnerPart = h;
            } else if (h.userId !== myUserId) {
                standalonePartner.push(h);
            }
        });
        const team = Object.keys(shared).map(gid => ({
            ...shared[gid].myPart || shared[gid].partnerPart,
            _id: gid,
            myPart: shared[gid].myPart,
            partnerPart: shared[gid].partnerPart,
            isGrouped: true
        })).sort((a, b) => (a.systemId ? -1 : 1));
        return { teamHabits: team, partnerHabitsOnly: standalonePartner };
    }, [habits, isPartnerView, myUserId]);

    useEffect(() => {
        setLocalTeamHabits(teamHabits);
    }, [teamHabits]);

    const getDays = () => {
        if (isDashboard) return [today];
        const days = [];
        const start = new Date(activeDate);
        start.setDate(activeDate.getDate() - 3);
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    };
    const daysToDisplay = getDays();

    const handleToggle = async (habitId, date) => {
        if (isReadOnly || editMode) return;
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        await toggleCheck(habitId, dateStr);
    };

    const handleAddHabit = async () => {
        if (!newHabit.name.trim()) return;
        await addHabit({ ...newHabit, name: newHabit.name.trim() });
        setNewHabit({ name: '', icon: 'local_drink', color: 'emerald', isShared: false, category: 'Productivity' });
        setAddModalOpen(false);
        setModalStep('suggestions');
    };

    const handleUpdateHabit = async () => {
        if (!editingHabit) return;
        await updateHabit(editingHabit._id, {
            name: editingHabit.name,
            icon: editingHabit.icon,
            color: editingHabit.color,
            category: editingHabit.category
        });
        setEditingHabit(null);
    };

    const handleReorder = async (newList) => {
        setLocalTeamHabits(newList);
        await reorderHabits(newList.map(h => h._id));
    };

    const renderHabitRow = (habit) => {
        const colors = COLOR_MAP[habit.color] || COLOR_MAP.emerald;
        const isEditing = editingHabit?._id === (habit.isGrouped ? habit.myPart?._id : habit._id);
        const isSystemHabit = !!(habit.myPart ? habit.myPart.systemId : habit.systemId);

        return (
            <div key={habit._id} className={`flex items-center gap-4 py-3 ${isSystemHabit ? 'bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl my-1.5 px-3 shadow-sm' : 'border-b border-slate-100 dark:border-slate-800/50'}`}>
                <div className={`${isDashboard ? 'flex-1 min-w-0' : 'w-1/3 min-w-[150px]'} flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300`}>
                    {isEditing ? (
                        <div className="flex flex-col gap-2 w-full p-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-primary/20">
                            <input
                                type="text"
                                value={editingHabit.name}
                                onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })}
                                className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-900 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
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

                <div className={`flex-1 flex ${isDashboard ? 'justify-end' : 'justify-between'} items-center`}>
                    {daysToDisplay.map((date, dayIdx) => {
                        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        const myChecked = habit.myPart ? checks[habit.myPart._id]?.completed[dateStr] : checks[habit._id]?.completed[dateStr];
                        const partnerChecked = habit.partnerPart ? checks[habit.partnerPart._id]?.completed[dateStr] : false;
                        
                        const targetDate = new Date(date);
                        targetDate.setHours(0, 0, 0, 0);
                        const isLocked = targetDate > today || targetDate < fourteenDaysAgo;
                        const isHiddenOnMobile = dayIdx === 0 || dayIdx === 1 || dayIdx === 5 || dayIdx === 6;

                        return (
                            <div key={dayIdx} className={`relative w-8 h-8 flex items-center justify-center ${isHiddenOnMobile ? 'hidden md:flex' : 'flex'}`}>
                                <button
                                    onClick={() => handleToggle(habit.myPart?._id || habit._id, date)}
                                    disabled={editMode || isLocked || isReadOnly || isSystemHabit}
                                    className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all overflow-hidden ${myChecked ? colors.bg + ' ' + colors.text : 'border border-slate-200 dark:border-slate-700'} ${isLocked ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'}`}
                                >
                                    {isPartnerView && habit.isGrouped && partnerChecked && (
                                        <div className="absolute right-0 top-0 w-2 h-2 rounded-full bg-primary/40"></div>
                                    )}
                                    <span className="material-symbols-outlined text-[10px]">check</span>
                                </button>
                            </div>
                        );
                    })}
                </div>

                {editMode && (
                    <div className="w-16 shrink-0 flex items-center justify-end gap-1">
                        {isEditing ? (
                            <button onClick={handleUpdateHabit} className="p-1 rounded-md hover:bg-emerald-500/10 text-emerald-500"><span className="material-symbols-outlined text-base">check</span></button>
                        ) : (
                            <>
                                <button onClick={() => setEditingHabit(habit.isGrouped ? habit.myPart : habit)} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-base">edit</span></button>
                                {!isSystemHabit && <button onClick={() => setConfirmDelete(habit.isGrouped ? habit.myPart?._id : habit._id)} className="p-1 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-500"><span className="material-symbols-outlined text-base">delete</span></button>}
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="Delete Habit"
                message="Are you sure you want to delete this habit? All its history will be lost."
                confirmLabel="Delete"
                onConfirm={() => { deleteHabit(confirmDelete); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group flex-1 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out min-h-[280px]">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500 pointer-events-none"></div>

                <div className="relative z-10 flex flex-row justify-between items-center gap-3 mb-6">
                    <div className="flex justify-between items-center flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{isPartnerView ? `Team View` : 'Habit Tracker'}</h3>
                        {!isDashboard && onDateChange && (
                            <div className="hidden md:flex items-center gap-1 p-0.5">
                                <button onClick={() => onDateChange(-1)} className="p-1 px-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary transition-all"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                                <div className="px-1 text-[10px] font-black text-slate-600 dark:text-slate-300 min-w-[100px] text-center uppercase tracking-wider">
                                    <span>{months[activeDate.getMonth()]} • {getWeekOfMonth(activeDate)}</span>
                                </div>
                                <button onClick={() => onDateChange(1)} className="p-1 px-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary transition-all"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        {!isReadOnly && !isDashboard && (
                            <>
                                <button onClick={() => setAddModalOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5"><span className="material-symbols-outlined text-xl">add_circle</span></button>
                                <button onClick={() => { setEditMode(!editMode); setEditingHabit(null); }} className={`p-2 rounded-lg transition-all duration-300 ${editMode ? 'text-primary bg-primary/10 ring-1 ring-primary/20 shadow-sm' : 'text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}><span className="material-symbols-outlined text-xl">edit</span></button>
                            </>
                        )}
                    </div>
                </div>

                <div className="relative z-10 w-full overflow-y-auto custom-scrollbar flex-1 flex flex-col">
                    <div className="flex items-center gap-4 py-3 border-b border-slate-200 dark:border-slate-800">
                        <div className={`${isDashboard ? 'flex-1 min-w-0' : 'w-1/3 min-w-[150px]'} font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider`}>Habit</div>
                        <div className={`flex-1 flex ${isDashboard ? 'justify-end' : 'justify-between'} items-center text-xs font-semibold text-slate-400 dark:text-slate-500`}>
                            {daysToDisplay.map((date, i) => (
                                <span key={i} className={`w-8 h-8 flex items-center justify-center text-center ${date.toDateString() === today.toDateString() ? 'text-primary font-black' : ''} ${(i === 0 || i === 1 || i === 5 || i === 6) ? 'hidden md:flex' : 'flex'}`}>{date.getDate()}</span>
                            ))}
                        </div>
                        {editMode && <div className="w-16"></div>}
                    </div>

                    <div className={`flex flex-col overflow-y-auto pr-1 custom-scrollbar ${isDashboard ? 'max-h-[240px]' : 'max-h-[500px]'}`}>
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => <div key={i} className="h-12 w-full bg-slate-100 animate-pulse rounded-lg my-1"></div>)
                        ) : (
                            <div className="flex flex-col">
                                {teamHabits.map(habit => renderHabitRow(habit))}
                                {isPartnerView && partnerHabitsOnly.map(habit => renderHabitRow(habit))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Simple Add Habit Modal */}
            {addModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAddModalOpen(false)}></div>
                    <div className="relative z-10 w-full max-w-sm bg-white dark:bg-[#192233] rounded-2xl p-5 border shadow-2xl">
                        <h3 className="text-lg font-black mb-4">Add New Habit</h3>
                        <input
                            type="text"
                            placeholder="Habit name..."
                            value={newHabit.name}
                            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border mb-4"
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setAddModalOpen(false)} className="flex-1 py-2 rounded-xl border">Cancel</button>
                            <button onClick={handleAddHabit} className="flex-1 py-2 rounded-xl bg-primary text-white font-bold">Add</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default HabitTracker;
