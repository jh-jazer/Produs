import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Edit2 } from 'lucide-react';
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
        category: 'STR',
        habits: [
            { name: 'Workout Session', icon: 'fitness_center', color: 'red' },
            { name: '7h+ Sleep', icon: 'bedtime', color: 'indigo' },
            { name: 'Healthy Nutrition', icon: 'restaurant', color: 'emerald' },
            { name: 'Hydration (2L)', icon: 'local_drink', color: 'blue' },
        ]
    },
    {
        category: 'DEX',
        habits: [
            { name: 'Morning Routine', icon: 'wb_sunny', color: 'orange' },
            { name: 'Time Block Day', icon: 'schedule', color: 'amber' },
            { name: 'Inbox Zero', icon: 'mail', color: 'blue' },
            { name: 'Quick Task Dash', icon: 'bolt', color: 'cyan' },
        ]
    },
    {
        category: 'INT',
        habits: [
            { name: 'Deep Work Box', icon: 'psychology', color: 'blue' },
            { name: 'Read 20 Pages', icon: 'menu_book', color: 'indigo' },
            { name: 'Skill Practice', icon: 'brush', color: 'pink' },
            { name: 'Journaling', icon: 'history_edu', color: 'blue' },
        ]
    },
    {
        category: 'WIS',
        habits: [
            { name: 'Meditation', icon: 'self_improvement', color: 'purple' },
            { name: 'Weekly Review', icon: 'auto_awesome', color: 'amber' },
            { name: 'Gratitude List', icon: 'favorite', color: 'rose' },
            { name: 'Budget Check', icon: 'payments', color: 'emerald' },
        ]
    },
    {
        category: 'CHA',
        habits: [
            { name: 'Linked Goal Check', icon: 'link', color: 'blue' },
            { name: 'Accountability Call', icon: 'groups', color: 'pink' },
            { name: 'Shared Habit', icon: 'handshake', color: 'rose' },
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

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

function HabitTracker({
    activeDate = new Date(),
    onDateChange,
    onFilterChange,
    currentFilter = 'All',
    habits = EMPTY_ARRAY,
    myHabits = EMPTY_ARRAY,
    partnerHabits = EMPTY_ARRAY,
    checks = EMPTY_OBJECT,
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
    const [newHabit, setNewHabit] = useState({ name: '', icon: 'local_drink', color: 'emerald', isShared: false, category: 'DEX' });
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
        const CORE_ORDER = ['planner', 'finance', 'journal', 'workout'];

        const sortHabits = (a, b) => {
            const sysA = a.myPart ? a.myPart.systemId : a.systemId;
            const sysB = b.myPart ? b.myPart.systemId : b.systemId;

            if (sysA && !sysB) return -1;
            if (!sysA && sysB) return 1;
            if (sysA && sysB) {
                return CORE_ORDER.indexOf(sysA) - CORE_ORDER.indexOf(sysB);
            }
            return 0; // Stable for non-system habits
        };

        if (!isPartnerView) {
            const sorted = [...habits].sort(sortHabits);
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
        })).sort(sortHabits);

        const standalonePartnerSorted = [...standalonePartner].sort(sortHabits);
        return { teamHabits: team, partnerHabitsOnly: standalonePartnerSorted };
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

    const selectSuggestion = (habit, category) => {
        setNewHabit({ ...habit, category, isShared: isPartnerView });
        setModalStep('custom');
    };

    const startEditHabit = (habit) => {
        setEditingHabit({ ...habit });
    };

    const cancelEditHabit = () => {
        setEditingHabit(null);
    };

    const saveEditHabit = async () => {
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

    const saveOrder = (newList) => {
        handleReorder(newList);
    };

    const renderHabitRow = (habit) => {
        const colors = COLOR_MAP[habit.color] || COLOR_MAP.emerald;
        const isEditing = editingHabit?._id === (habit.isGrouped ? habit.myPart?._id : habit._id);
        const isSystemHabit = !!(habit.myPart ? habit.myPart.systemId : habit.systemId);

        return (
            <div 
                key={habit._id} 
                className={`group/row relative flex items-center gap-4 py-3.5 my-1.5 rounded-2xl transition-all duration-300 border
                    ${isSystemHabit 
                        ? 'bg-slate-100/80 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.02)] shadow-none' 
                        : 'bg-white/40 dark:bg-black/20 border-slate-100 dark:border-white/[0.05] hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-50/80 dark:hover:bg-white/[0.04] shadow-sm'}
                    ${editMode ? 'pl-2 cursor-grab active:cursor-grabbing' : 'px-4'}`}
            >
                {/* Vertical Accent Indicator */}
                <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${colors.solid} opacity-40 group-hover/row:opacity-100 transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
                
                {editMode && !isPartnerView && (
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 cursor-grab active:cursor-grabbing hover:text-primary transition-colors pr-1">drag_indicator</span>
                )}

                {/* Habit Name (or edit form) */}
                <div className={`${isDashboard ? 'flex-1 min-w-0' : 'w-1/3 min-w-[150px]'} flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 overflow-visible`}>
                    {isEditing ? (
                        <div className="flex flex-col gap-2 w-full p-1 bg-white dark:bg-[#000000] rounded-lg shadow-none border border-primary/20">
                            <div className="flex items-center gap-2">
                                <select
                                    value={editingHabit.icon}
                                    onChange={(e) => setEditingHabit({ ...editingHabit, icon: e.target.value })}
                                    className="w-10 h-8 text-[10px] bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    {ICON_OPTIONS.map(opt => (
                                        <option key={opt.icon} value={opt.icon}>{opt.label}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={editingHabit.name}
                                    onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })}
                                    disabled={!!editingHabit.systemId}
                                    className={`flex-1 min-w-0 px-2 py-1 text-xs bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary dark:text-white ${editingHabit.systemId ? 'opacity-50 cursor-not-allowed' : ''}`}
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

                <div className={`flex-1 flex ${isDashboard ? 'justify-end' : 'justify-between'} items-center`}>
                    {daysToDisplay.map((date, dayIdx) => {
                        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        const myChecked = habit.myPart ? checks[habit.myPart._id]?.completed[dateStr] : checks[habit._id]?.completed[dateStr];
                        const partnerChecked = habit.partnerPart ? checks[habit.partnerPart._id]?.completed[dateStr] : false;
                        
                        const targetDate = new Date(date);
                        targetDate.setHours(0, 0, 0, 0);
                        const isFuture = targetDate > today;
                        const isTooOld = targetDate < fourteenDaysAgo;
                        const isLocked = isFuture || isTooOld;
                        const isHiddenOnMobile = dayIdx === 0 || dayIdx === 1 || dayIdx === 5 || dayIdx === 6;

                        return (
                            <div key={dayIdx} className={`relative w-8 h-8 flex items-center justify-center ${isHiddenOnMobile ? 'hidden md:flex' : 'flex'}`}>
                                {isPartnerView && habit.isGrouped ? (
                                    // SPLIT CHECK CIRCLE
                                    <div className="relative w-7 h-7 rounded-full border border-slate-200 dark:border-white/10 overflow-hidden flex">
                                        {/* My Half (Left) */}
                                        <button
                                            onClick={() => handleToggle(habit.myPart?._id || habit._id, date)}
                                            disabled={editMode || isLocked || isReadOnly || isSystemHabit}
                                            title={isSystemHabit ? "Completed automatically by doing the task" : ""}
                                            className={`relative w-1/2 h-full flex items-center justify-end pr-0.5 z-10 ${isSystemHabit ? 'cursor-default' : ''}`}
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
                                            className="relative w-1/2 h-full opacity-80 border-l border-slate-200 dark:border-white/10 flex items-center justify-start pl-0.5 z-10"
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
                                        onClick={() => handleToggle(habit._id, date)}
                                        disabled={editMode || isLocked || isReadOnly || (isPartnerView && habit.userId !== myUserId) || isSystemHabit}
                                        title={isSystemHabit ? "Completed automatically by doing the task" : ""}
                                        className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all overflow-hidden ${isFuture
                                            ? 'border border-dashed border-slate-200 dark:border-white/10 opacity-30 shadow-none cursor-not-allowed'
                                            : isTooOld
                                                ? myChecked
                                                    ? `${colors.text} opacity-60 cursor-default`
                                                    : 'border border-slate-100 dark:border-white/10 opacity-40 cursor-default'
                                                : myChecked
                                                    ? `${colors.text} shadow-none`
                                                    : 'border border-slate-200 dark:border-white/10 hover:border-slate-400'
                                            } ${!editMode && !isLocked && !isSystemHabit ? 'hover:scale-110 active:scale-95' : (isSystemHabit ? 'cursor-default opacity-80' : '')}`}
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

                {editMode && (
                    <div className="w-16 shrink-0 flex items-center justify-end gap-1">
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
                                 {(!isPartnerView || habit.myPart) && (
                                     <button onClick={() => startEditHabit(habit.isGrouped ? habit.myPart : habit)} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#000000] text-slate-400 hover:text-primary transition-colors" title="Edit">
                                         <span className="material-symbols-outlined text-base">edit</span>
                                     </button>
                                 )}
                                 {(!isPartnerView || habit.myPart) && !(habit.isGrouped ? habit.myPart?.systemId : habit.systemId) && (
                                     <button onClick={() => setConfirmDelete(habit.isGrouped ? habit.myPart._id : habit._id)} className="p-1 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
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

    return (
        <React.Fragment>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="Delete Habit"
                message="Are you sure you want to delete this habit? All its history will be lost."
                confirmLabel="Delete"
                onConfirm={() => { deleteHabit(confirmDelete); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />
            <div className={`relative flex flex-col justify-between group flex-1 transition-all duration-300 ease-in-out ${isDashboard ? 'min-h-[280px]' : ''}`}>
                <div className="relative z-10 flex flex-row justify-between items-center gap-3 mb-6 font-inter">
                    <div className="flex justify-between items-center flex-1">
                        {!isDashboard && onDateChange && (
                            <div className="hidden md:flex items-center gap-1 p-0.5">
                                <button
                                    onClick={() => onDateChange(-1)}
                                    className="p-1 px-1.5 hover:bg-white dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-cyan-500 transition-all font-inter"
                                >
                                    <span className="material-symbols-outlined text-sm font-inter">chevron_left</span>
                                </button>
                                <div className="px-1 text-[10px] font-black text-slate-600 dark:text-slate-300 min-w-[100px] text-center uppercase tracking-wider font-mono">
                                    <span>{months[activeDate.getMonth()]} • {getWeekOfMonth(activeDate)}</span>
                                </div>
                                <button
                                    onClick={() => onDateChange(1)}
                                    className="p-1 px-1.5 hover:bg-white dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-cyan-500 transition-all font-inter"
                                >
                                    <span className="material-symbols-outlined text-sm font-inter">chevron_right</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <div className="flex items-center gap-2">
                            {!isReadOnly && !isDashboard && (
                                <button
                                    onClick={() => {
                                        setNewHabit({ name: '', icon: 'local_drink', color: 'emerald', isShared: isPartnerView, category: 'Productivity' });
                                        setAddModalOpen(true);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-900 text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] font-inter"
                                    title={isPartnerView ? 'Add Team Habit' : 'Add Habit'}
                                >
                                    <Plus size={14} strokeWidth={3} /> ADD_HABIT
                                </button>
                            )}

                            {!isReadOnly && !isDashboard && (
                                <button
                                    onClick={() => { setEditMode(!editMode); setEditingHabit(null); }}
                                    className={`p-2 rounded-xl border transition-all duration-300 ${editMode ? 'text-cyan-500 bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-slate-500 border-white/5 hover:border-white/10 hover:bg-white/5'}`}
                                    title={editMode ? 'Stop Editing' : 'Edit Habits'}
                                >
                                    <Edit2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="relative z-10 w-full overflow-y-auto custom-scrollbar hover-scrollbar flex-1 flex flex-col pt-2 font-inter">
                    {/* Header Row */}
                    <div className="flex items-center gap-4 py-4 border-b border-slate-200 dark:border-white/10 px-4">
                        {editMode && !isPartnerView && (
                            <div className="w-[24px] pr-1"></div>
                        )}
                        <div className={`${isDashboard ? 'flex-1 min-w-0' : 'w-1/3 min-w-[150px]'} font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider`}>Habit</div>
                        <div className={`flex-1 flex ${isDashboard ? 'justify-end' : 'justify-between'} items-center text-xs font-semibold text-slate-400 dark:text-slate-500`}>
                            {daysToDisplay.map((date, i) => (
                                <span key={i} className={`w-8 h-8 flex items-center justify-center text-center ${date.toDateString() === today.toDateString() ? 'text-primary font-black' : ''} ${(i === 0 || i === 1 || i === 5 || i === 6) ? 'hidden md:flex' : 'flex'}`}>{date.getDate()}</span>
                            ))}
                        </div>
                        {editMode && <div className="w-16"></div>}
                    </div>

                    {/* Habit Rows */}
                    <div className={`flex flex-col overflow-y-auto pr-1 custom-scrollbar hover-scrollbar ${isDashboard ? 'max-h-[240px]' : 'max-h-[500px]'}`}>
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-white/10/50 animate-pulse">
                                    <div className={`${isDashboard ? 'flex-1' : 'w-1/3'} flex items-center gap-2`}>
                                        <div className="w-6 h-6 bg-slate-200 dark:bg-[#121212] rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-3 bg-slate-200 dark:bg-[#121212] rounded w-24 mb-1"></div>
                                            <div className="h-2 bg-slate-100 dark:bg-[#000000] rounded w-16"></div>
                                        </div>
                                    </div>
                                    <div className={`flex-1 flex ${isDashboard ? 'justify-end' : 'justify-between'} items-center`}>
                                        {daysToDisplay.map((_, j) => (
                                            <div key={j} className="w-8 h-8 flex items-center justify-center">
                                                <div className="w-7 h-7 bg-slate-100 dark:bg-[#000000] rounded-full"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <React.Fragment>
                                {/* Render Team/Shared Habits Section */}
                                {editMode && !isPartnerView ? (
                                    <Reorder.Group axis="y" values={localTeamHabits} onReorder={setLocalTeamHabits} className="flex flex-col">
                                        {localTeamHabits
                                            .filter(h => currentFilter === 'All' || h.category === currentFilter || !!(h.myPart ? h.myPart.systemId : h.systemId))
                                            .map((habit) => (
                                                <Reorder.Item key={habit._id} value={habit} onDragEnd={() => saveOrder(localTeamHabits)}>
                                                    {renderHabitRow(habit)}
                                                </Reorder.Item>
                                            ))}
                                    </Reorder.Group>
                                ) : (
                                    <React.Fragment>
                                        {teamHabits
                                            .filter(h => currentFilter === 'All' || h.category === currentFilter || !!(h.myPart ? h.myPart.systemId : h.systemId))
                                            .map((habit) => renderHabitRow(habit))}
                                    </React.Fragment>
                                )}

                                {/* Divider for Team View */}
                                {isPartnerView && teamHabits.length > 0 && partnerHabitsOnly.length > 0 && (
                                    <div className="py-2">
                                        <hr className="border-slate-100 dark:border-white/10" />
                                        <div className="pt-2 pb-1 px-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{partnerName}'s Private Habits</span>
                                        </div>
                                    </div>
                                )}

                                {/* Render Partner Only Habits Section */}
                                {isPartnerView && partnerHabitsOnly
                                    .filter(h => currentFilter === 'All' || h.category === currentFilter || !!h.systemId)
                                    .map((habit) => renderHabitRow(habit))}
                            </React.Fragment>
                        )}
                    </div>
                </div>
            </div>

            {/* Simple Add Habit Modal */}
            {addModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setAddModalOpen(false); setModalStep('suggestions'); }}></div>

                    {/* Modal Card */}
                    <div className={`relative z-10 w-full max-w-sm bg-white dark:bg-[#121212] rounded-2xl shadow-2xl border overflow-hidden transition-all ${isPartnerView ? 'border-primary/30 ring-1 ring-primary/10' : 'border-slate-200 dark:border-white/10'}`}>
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                    {isPartnerView && <span className="material-symbols-outlined text-primary text-lg">group</span>}
                                    {modalStep === 'suggestions' 
                                        ? (isPartnerView ? 'Add Team Habit' : 'Add New Habit') 
                                        : (isPartnerView ? 'Custom Team Habit' : 'Custom Habit')}
                                </h3>
                                <button onClick={() => { setAddModalOpen(false); setModalStep('suggestions'); }} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#000000] text-slate-400 transition-colors">
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
                                                            className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-white/10/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
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
                                        className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">add</span>
                                        <span className="text-xs font-black uppercase tracking-wider">Create Custom Habit</span>
                                    </button>
                                </div>
                            ) : (
                                <React.Fragment>
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
                                    
                                    {/* Category Picker */}
                                    <div className="flex flex-col gap-1.5 mb-5">
                                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category (Stat)</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['STR', 'INT', 'WIS', 'DEX', 'CHA', 'PER'].map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setNewHabit({ ...newHabit, category: cat })}
                                                    className={`px-2 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all ${newHabit.category === cat 
                                                        ? 'bg-primary/10 border-primary text-primary' 
                                                        : 'bg-slate-50 dark:bg-[#000000]/50 border-slate-100 dark:border-white/10 text-slate-400 hover:border-slate-200'}`}
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
                                                            : 'bg-slate-50 dark:bg-[#000000]/50 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#000000] hover:scale-105'
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
                                    <div className="flex items-center gap-3 p-2.5 mb-4 rounded-xl bg-slate-50 dark:bg-[#000000]/30 border border-slate-100 dark:border-white/10">
                                        <div className="relative shrink-0 flex items-center justify-center size-8 bg-white dark:bg-[#000000] rounded-lg shadow-none border border-slate-100 dark:border-white/10">
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
                                            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-[#000000] transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleAddHabit}
                                            disabled={!newHabit.name.trim()}
                                            className="flex-1 py-2.5 rounded-xl bg-[#121212] dark:bg-white text-white dark:text-slate-900 text-sm font-black hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-none disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            Add Habit
                                        </button>
                                    </div>
                                </React.Fragment>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
}

export default HabitTracker;
