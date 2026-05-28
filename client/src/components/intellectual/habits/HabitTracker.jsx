import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Edit2, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../ui/ConfirmDialog';

import AddHabitModal, { ICON_OPTIONS } from './AddHabitModal';

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
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState('suggestions');
    const [editingHabit, setEditingHabit] = useState(null);
    const [localTeamHabits, setLocalTeamHabits] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [habitFilter, setHabitFilter] = useState('system'); // 'system' | 'personal'

    const CORE_REDIRECTS = {
        'focus': '/dashboard',
        'planner': '/dashboard/planner',
        'finance': '/dashboard/finance',
        'journal': '/dashboard/journal',
        'workout': '/dashboard/planner'
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    const { teamHabits, partnerHabitsOnly } = React.useMemo(() => {
        const CORE_ORDER = ['focus', 'planner', 'workout', 'journal', 'finance'];
        const sortHabits = (a, b) => {
            const sysA = a.myPart ? a.myPart.systemId : a.systemId;
            const sysB = b.myPart ? b.myPart.systemId : b.systemId;
            if (sysA && !sysB) return -1;
            if (!sysA && sysB) return 1;
            if (sysA && sysB) return CORE_ORDER.indexOf(sysA) - CORE_ORDER.indexOf(sysB);
            return 0;
        };
// ... rest of the code is unchanged. Let's make sure the target matches exactly.

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

        return { teamHabits: team, partnerHabitsOnly: standalonePartner.sort(sortHabits) };
    }, [habits, isPartnerView, myUserId]);

    useEffect(() => {
        setLocalTeamHabits(teamHabits);
    }, [teamHabits]);

    const filteredHabits = React.useMemo(() => {
        return localTeamHabits.filter(habit => {
            const isSystemHabit = !!(habit.myPart ? habit.myPart.systemId : habit.systemId);
            if (habitFilter === 'system') return isSystemHabit;
            if (habitFilter === 'personal') return !isSystemHabit;
            return true;
        });
    }, [localTeamHabits, habitFilter]);

    const daysToDisplay = React.useMemo(() => {
        const days = [];
        const start = new Date(activeDate);
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - 2);
        for (let i = 0; i < 3; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    }, [activeDate]);

    const handleToggle = async (habitId, date) => {
        if (isReadOnly || editMode) return;
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        await toggleCheck(habitId, dateStr);
    };

    const handleAddHabit = async (habitData) => {
        await addHabit(habitData);
    };

    const renderHabitRow = (habit) => {
        const isEditing = editingHabit?._id === (habit.isGrouped ? habit.myPart?._id : habit._id);
        const isSystemHabit = !!(habit.myPart ? habit.myPart.systemId : habit.systemId);

        return (
            <div 
                key={habit._id} 
                className={`group/row relative flex items-center gap-4 py-4 border-b border-black/5 dark:border-white/5 transition-all
                    ${editMode ? 'pl-2 cursor-grab active:cursor-grabbing' : 'px-4'}
                    hover:bg-black/5 dark:hover:bg-white/[0.02]`}
            >
                {editMode && !isPartnerView && (
                    <span className="material-symbols-outlined text-black/20 dark:text-white/20 hover:text-black dark:hover:text-white transition-colors pr-1">drag_indicator</span>
                )}

                <div 
                    className="flex items-center gap-3 flex-1 min-w-0"
                    onClick={() => {
                        if (isSystemHabit && !editMode) {
                            const sysId = habit.myPart ? habit.myPart.systemId : habit.systemId;
                            const path = CORE_REDIRECTS[sysId];
                            if (sysId === 'focus') {
                                navigate('/dashboard', { state: { openFocusTimer: true } });
                            } else if (path) {
                                navigate(path);
                            }
                        }
                    }}
                >
                    <div className="relative shrink-0 flex items-center justify-center size-8 bg-black/5 dark:bg-white/5 rounded-sm border border-black/10 dark:border-white/10 group-hover/row:border-black/30 dark:group-hover/row:border-white/30 transition-all">
                        <span className="material-symbols-outlined text-black/60 dark:text-white/60 text-lg group-hover/row:scale-110 transition-transform">{habit.icon}</span>
                        {isSystemHabit && <div className="absolute -top-1 -right-1 size-2 bg-black dark:bg-white rounded-full animate-pulse" />}
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                        <span className="text-[15px] font-black uppercase tracking-tighter text-black/80 dark:text-white/80 group-hover/row:text-black dark:group-hover/row:text-white transition-colors truncate">{habit.name}</span>
                        {!isSystemHabit && habit.streak > 0 && (
                            <span className="text-[15px] font-black italic text-amber-500 shrink-0 ml-1 flex items-center select-none" title={`${habit.streak} day streak`}>
                                {habit.streak}🔥
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex justify-end md:justify-between items-center max-w-[300px]">
                    {daysToDisplay.map((date, idx) => {
                        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        const myChecked = habit.myPart ? checks[habit.myPart._id]?.completed[dateStr] : checks[habit._id]?.completed[dateStr];
                        const isToday = date.toDateString() === today.toDateString();
                        const isFuture = date > today;

                        return (
                            <div key={idx} className="relative flex items-center justify-center size-10">
                                <button
                                    onClick={() => handleToggle(habit._id, date)}
                                    disabled={editMode || isFuture || isReadOnly || isSystemHabit}
                                    className={`relative size-8 transition-all rounded-sm flex items-center justify-center border
                                        ${myChecked 
                                            ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black shadow-md' 
                                            : isToday ? 'border-black dark:border-white hover:bg-black/10 dark:hover:bg-white/10' : 'border-black/55 dark:border-white/60 hover:border-black dark:hover:border-white'}
                                        ${isFuture ? 'opacity-10 cursor-not-allowed' : ''}
                                        ${isSystemHabit ? 'cursor-default' : 'active:scale-90'}
                                    `}
                                >
                                    {myChecked && <span className="material-symbols-outlined text-[14px] font-black">check</span>}
                                    {isToday && !myChecked && <div className="size-1.5 bg-black/20 dark:bg-white/20 rounded-full animate-ping" />}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {editMode && (
                    <div className="w-16 shrink-0 flex items-center justify-end gap-2">
                        <button onClick={() => setConfirmDelete(habit.isGrouped ? habit.myPart._id : habit._id)} className="text-black/20 dark:text-white/20 hover:text-black dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8 font-sans relative">
            <div className="relative flex items-center justify-between gap-2 md:absolute md:-top-16 md:left-0 md:right-0 mb-4 md:mb-0 z-20 px-4 md:px-0">
                {/* Habit type filter toggle */}
                <div className="flex items-center border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.02] p-1 rounded-sm h-[36px]">
                    <button
                        onClick={() => setHabitFilter('system')}
                        className={`h-full px-6 flex items-center justify-center text-[10px] font-black uppercase tracking-wider transition-all rounded-sm cursor-pointer ${
                            habitFilter === 'system'
                                ? 'bg-black text-white dark:bg-white dark:text-black font-black shadow-sm'
                                : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.04]'
                        }`}
                    >
                        System
                    </button>
                    <button
                        onClick={() => setHabitFilter('personal')}
                        className={`h-full px-6 flex items-center justify-center text-[10px] font-black uppercase tracking-wider transition-all rounded-sm cursor-pointer ${
                            habitFilter === 'personal'
                                ? 'bg-black text-white dark:bg-white dark:text-black font-black shadow-sm'
                                : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.04]'
                        }`}
                    >
                        Personal
                    </button>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => setAddModalOpen(true)} className="size-[36px] flex items-center justify-center border border-black/60 dark:border-white/40 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all shrink-0 rounded-sm">
                        <Plus size={14} />
                    </button>
                    <button onClick={() => setEditMode(!editMode)} className={`size-[36px] flex items-center justify-center border transition-all shrink-0 rounded-sm ${editMode ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-sm' : 'border-black/60 dark:border-white/40 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'}`}>
                        <Edit2 size={14} />
                    </button>
                </div>
            </div>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="DELETE HABIT"
                message="Are you sure you want to remove this habit? Historical data will be permanently deleted."
                confirmLabel="DELETE"
                onConfirm={() => { deleteHabit(confirmDelete); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />

            <div className="flex flex-col">
                <div className="flex items-center gap-4 px-4 py-4 border-b border-black/10 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-black/50 dark:text-white/30">
                    <div className="flex-1">HABIT LIST</div>
                    <div className="flex-1 flex justify-end md:justify-between items-center max-w-[300px]">
                        {daysToDisplay.map((d, i) => {
                            const isToday = d.toDateString() === today.toDateString();
                            return (
                                <span key={i} className={`w-10 text-center font-bold ${isToday ? 'text-black dark:text-white font-black' : 'text-black/60 dark:text-white/50'}`}>
                                    {d.getDate()}
                                </span>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col">
                    {isLoading ? (
                        Array(3).fill(0).map((_, i) => <div key={i} className="h-16 w-full animate-pulse bg-white/5 my-1" />)
                    ) : filteredHabits.length > 0 ? (
                        filteredHabits.map(renderHabitRow)
                    ) : habits.length === 0 ? (
                        /* Truly empty — first time */
                        <motion.button
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setAddModalOpen(true)}
                            className="w-full flex flex-col items-center justify-center py-16 gap-5 border border-dashed border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 hover:bg-black/5 dark:hover:bg-white/[0.02] transition-all group/empty"
                        >
                            <div className="size-12 border-2 border-dashed border-black/30 dark:border-white/20 group-hover/empty:border-black/50 dark:group-hover/empty:border-white/50 flex items-center justify-center transition-all">
                                <span className="material-symbols-outlined text-black/40 dark:text-white/30 group-hover/empty:text-black/80 dark:group-hover/empty:text-white/80 transition-colors">add</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/40 group-hover/empty:text-black/80 dark:group-hover/empty:text-white/80 transition-colors">Add your first habit</span>
                                <span className="text-[8px] font-mono text-black/40 dark:text-white/20 uppercase tracking-widest">Start building your daily protocol</span>
                            </div>
                        </motion.button>
                    ) : (
                        /* Has habits but none match filter */
                        <motion.button
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setAddModalOpen(true)}
                            className="w-full flex items-center gap-4 px-4 py-4 border-b border-dashed border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/[0.02] transition-all group/add"
                        >
                            <div className="size-8 border border-dashed border-black/30 dark:border-white/20 group-hover/add:border-black/50 dark:group-hover/add:border-white/50 flex items-center justify-center transition-all shrink-0">
                                <span className="material-symbols-outlined text-sm text-black/40 dark:text-white/30 group-hover/add:text-black/80 dark:group-hover/add:text-white/80 transition-colors">add</span>
                            </div>
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/50 dark:text-white/30 group-hover/add:text-black/70 dark:group-hover/add:text-white/70 transition-colors">Add a new habit</span>
                                <span className="text-[8px] font-mono text-black/40 dark:text-white/20 uppercase tracking-widest">Extend your protocol</span>
                            </div>
                        </motion.button>
                    )}
                </div>
            </div>


            {/* Add Habit Modal - Tactical */}
            <AddHabitModal 
                isOpen={addModalOpen} 
                onClose={() => setAddModalOpen(false)} 
                onAdd={handleAddHabit} 
                isSystemMode={habitFilter === 'system'}
            />
        </div>
    );
}

export default HabitTracker;
