import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Edit2, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../ui/ConfirmDialog';

import AddHabitModal, { ICON_OPTIONS } from './AddHabitModal';

const SUGGESTIONS = [
    {
        category: 'STR',
        habits: [
            { name: 'Workout Session', icon: 'fitness_center' },
            { name: '7h+ Sleep', icon: 'bedtime' },
            { name: 'Healthy Nutrition', icon: 'restaurant' },
            { name: 'Hydration (2L)', icon: 'local_drink' },
        ]
    },
    {
        category: 'INT',
        habits: [
            { name: 'Deep Work Box', icon: 'psychology' },
            { name: 'Read 20 Pages', icon: 'menu_book' },
            { name: 'Skill Practice', icon: 'brush' },
            { name: 'Journaling', icon: 'history_edu' },
        ]
    }
];

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

    const CORE_REDIRECTS = {
        'planner': '/dashboard/planner',
        'finance': '/dashboard/finance',
        'journal': '/dashboard/journal',
        'workout': '/dashboard/health'
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    const { teamHabits, partnerHabitsOnly } = React.useMemo(() => {
        const CORE_ORDER = ['planner', 'finance', 'journal', 'workout'];
        const sortHabits = (a, b) => {
            const sysA = a.myPart ? a.myPart.systemId : a.systemId;
            const sysB = b.myPart ? b.myPart.systemId : b.systemId;
            if (sysA && !sysB) return -1;
            if (!sysA && sysB) return 1;
            if (sysA && sysB) return CORE_ORDER.indexOf(sysA) - CORE_ORDER.indexOf(sysB);
            return 0;
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

        return { teamHabits: team, partnerHabitsOnly: standalonePartner.sort(sortHabits) };
    }, [habits, isPartnerView, myUserId]);

    useEffect(() => {
        setLocalTeamHabits(teamHabits);
    }, [teamHabits]);

    const daysToDisplay = React.useMemo(() => {
        const days = [];
        const start = new Date(activeDate);
        start.setDate(activeDate.getDate() - 3);
        for (let i = 0; i < 4; i++) {
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
                className={`group/row relative flex items-center gap-4 py-4 border-b border-white/5 transition-all
                    ${editMode ? 'pl-2 cursor-grab active:cursor-grabbing' : 'px-4'}
                    hover:bg-white/[0.02]`}
            >
                {editMode && !isPartnerView && (
                    <span className="material-symbols-outlined text-white/20 hover:text-white transition-colors pr-1">drag_indicator</span>
                )}

                <div 
                    className="flex items-center gap-3 flex-1 min-w-0"
                    onClick={() => {
                        if (isSystemHabit && !editMode) {
                            const sysId = habit.myPart ? habit.myPart.systemId : habit.systemId;
                            const path = CORE_REDIRECTS[sysId];
                            if (path) navigate(path);
                        }
                    }}
                >
                    <div className="relative shrink-0 flex items-center justify-center size-8 bg-white/5 rounded-sm border border-white/10 group-hover/row:border-white/30 transition-all">
                        <span className="material-symbols-outlined text-white/60 text-lg group-hover/row:scale-110 transition-transform">{habit.icon}</span>
                        {isSystemHabit && <div className="absolute -top-1 -right-1 size-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black uppercase tracking-wider text-white/80 group-hover/row:text-white transition-colors truncate">{habit.name}</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                            {isSystemHabit ? 'SYSTEM SYNC' : (habit.streak > 0 ? `${habit.streak} DAY STREAK` : 'NO STREAK')}
                        </span>
                    </div>
                </div>

                <div className="flex-1 flex justify-end md:justify-between items-center max-w-[300px]">
                    {daysToDisplay.map((date, idx) => {
                        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        const myChecked = habit.myPart ? checks[habit.myPart._id]?.completed[dateStr] : checks[habit._id]?.completed[dateStr];
                        const isToday = date.toDateString() === today.toDateString();
                        const isFuture = date > today;

                        return (
                            <div key={idx} className={`relative flex items-center justify-center size-8 ${idx < 3 ? 'hidden md:flex' : 'flex'}`}>
                                <button
                                    onClick={() => handleToggle(habit._id, date)}
                                    disabled={editMode || isFuture || isReadOnly || isSystemHabit}
                                    className={`relative size-6 transition-all rounded-sm flex items-center justify-center border
                                        ${myChecked 
                                            ? 'bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                                            : isToday ? 'border-white/40 hover:border-white' : 'border-white/5 hover:border-white/20'}
                                        ${isFuture ? 'opacity-10 cursor-not-allowed' : ''}
                                        ${isSystemHabit ? 'cursor-default' : 'active:scale-90'}
                                    `}
                                >
                                    {myChecked && <span className="material-symbols-outlined text-[10px] font-black">check</span>}
                                    {isToday && !myChecked && <div className="size-1 bg-white/20 rounded-full animate-ping" />}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {editMode && (
                    <div className="w-16 shrink-0 flex items-center justify-end gap-2">
                        <button onClick={() => setConfirmDelete(habit.isGrouped ? habit.myPart._id : habit._id)} className="text-white/20 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8 font-sans relative">
            <div className="absolute -top-16 right-0 flex gap-2 z-20">
                <button onClick={() => setAddModalOpen(true)} className="size-10 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all">
                    <Plus size={16} />
                </button>
                <button onClick={() => setEditMode(!editMode)} className={`size-10 flex items-center justify-center border transition-all ${editMode ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/30'}`}>
                    <Edit2 size={16} />
                </button>
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
                <div className="flex items-center gap-4 px-4 py-4 border-b border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                    <div className="flex-1">HABIT LIST</div>
                    <div className="flex-1 flex justify-end md:justify-between items-center max-w-[300px]">
                        {daysToDisplay.map((d, i) => (
                            <span key={i} className={`w-8 text-center ${i < 3 ? 'hidden md:inline-block' : ''}`}>{d.getDate()}</span>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col">
                    {isLoading ? (
                        Array(3).fill(0).map((_, i) => <div key={i} className="h-16 w-full animate-pulse bg-white/5 my-1" />)
                    ) : localTeamHabits.length > 0 ? (
                        localTeamHabits.map(renderHabitRow)
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-40 text-center gap-6">
                            <span className="material-symbols-outlined text-5xl opacity-20">rule</span>
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-black uppercase tracking-[0.4em]">No_Active_Habits</span>
                                <span className="text-[10px] font-mono opacity-40 uppercase">System_Modules_Offline</span>
                            </div>
                            <button
                                onClick={() => setAddModalOpen(true)}
                                className="px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all flex items-center gap-3"
                            >
                                Sync_Core_Modules
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Momentum HUD Cards */}
            {!isLoading && habits.some(h => h.streak > 0) && (
                <div className="flex flex-col gap-4 mt-8">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">HABIT MOMENTUM</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {habits.filter(h => h.streak > 0).sort((a,b) => b.streak - a.streak).slice(0, 3).map(h => (
                            <div key={h._id} className="p-6 bg-white/[0.03] border border-white/10 rounded-sm relative overflow-hidden group">
                                <div className="absolute right-[-10px] bottom-[-10px] opacity-5 rotate-12 transition-transform group-hover:scale-125">
                                    <span className="material-symbols-outlined text-[80px]">{h.icon}</span>
                                </div>
                                <div className="relative z-10 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{h.name}</span>
                                        <span className="text-xl font-black italic">{h.streak}D</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} className="h-full bg-white" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Habit Modal - Tactical */}
            <AddHabitModal 
                isOpen={addModalOpen} 
                onClose={() => setAddModalOpen(false)} 
                onAdd={handleAddHabit} 
            />
        </div>
    );
}

export default HabitTracker;
