import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { usePlanner } from '../../../hooks/usePlanner';
import { Plus } from 'lucide-react';
import AddPlanModal from '../../ui/AddPlanModal';

const fetcher = url => api.get(url).then(res => res.data);

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Get the Date object for a given day-of-week index in the current week
const getDateForDay = (dayIndex) => {
    const now = new Date();
    const currentDay = now.getDay();
    const diff = dayIndex - currentDay;
    const d = new Date(now);
    d.setDate(now.getDate() + diff);
    return d;
};

const DailySchedule = ({ viewMode = 'me', isReadOnly = false, onFlip }) => {
    const containerRef = useRef(null);

    const today = new Date();
    const todayDayIndex = today.getDay();

    const [selectedDay, setSelectedDay] = useState(todayDayIndex);
    const selectedDate = getDateForDay(selectedDay);

    const { tasks, addTask, updateTask, deleteTask, isLoading } = usePlanner(selectedDate);

    const [isAdding, setIsAdding] = useState(false);
    const [snapKey, setSnapKey] = useState(0);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const { data: user, mutate: mutateUser } = useSWR('/auth/me', fetcher);

    // Per-day sleep times stored locally keyed by day index
    const [sleepByDay, setSleepByDay] = useState(() => {
        const defaults = {};
        for (let i = 0; i < 7; i++) {
            defaults[i] = { start: '22:00', end: '07:00' };
        }
        return defaults;
    });
    const [isSavingSleep, setIsSavingSleep] = useState(false);

    // Seed from user settings on first load
    useEffect(() => {
        if (user?.settings?.sleepMode) {
            setSleepByDay(prev => {
                const updated = { ...prev };
                for (let i = 0; i < 7; i++) {
                    if (
                        updated[i].start === '22:00' &&
                        updated[i].end === '07:00'
                    ) {
                        updated[i] = {
                            start: user.settings.sleepMode.start || '22:00',
                            end: user.settings.sleepMode.end || '07:00',
                        };
                    }
                }
                return updated;
            });
        }
    }, [user]);

    const tempSleep = sleepByDay[selectedDay];

    const setTempSleep = (val) => {
        setSleepByDay(prev => ({ ...prev, [selectedDay]: val }));
    };

    // Auto-save when sleep changes for the selected day (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSaveSleep();
        }, 1200);
        return () => clearTimeout(timer);
    }, [sleepByDay[selectedDay]]);

    const handleSaveSleep = async () => {
        try {
            setIsSavingSleep(true);
            await api.put('/auth/settings', { sleepMode: tempSleep });
            await mutateUser();
            setSnapKey(prev => prev + 1);
        } catch (err) {
            console.error('Failed to save sleep settings:', err);
        } finally {
            setIsSavingSleep(false);
        }
    };

    const sleepStart = tempSleep.start || '22:00';
    const sleepEnd = tempSleep.end || '07:00';

    const isDuringSleep = (h) => {
        const startH = Number(sleepStart.split(':')[0]);
        const endH = Number(sleepEnd.split(':')[0]);
        if (startH < endH) return h >= startH && h < endH;
        return h >= startH || h < endH;
    };

    const handleAddTask = async (planData) => {
        await addTask(planData);
    };

    const handleDeleteTask = async (id) => {
        await deleteTask(id);
    };

    const moveTaskAtTime = async (task, newStartTime) => {
        const [h1, m1] = task.startTime.split(':').map(Number);
        const [h2, m2] = task.endTime.split(':').map(Number);
        const durationMin = (h2 * 60 + m2) - (h1 * 60 + m1);
        const [nh, nm] = newStartTime.split(':').map(Number);
        const totalEndMin = (nh * 60 + nm) + durationMin;
        const [nEh, nEm] = [Math.floor(totalEndMin / 60), totalEndMin % 60];
        const newEndTime = `${String(nEh).padStart(2, '0')}:${String(nEm).padStart(2, '0')}`;
        await updateTask(task._id, { startTime: newStartTime, endTime: newEndTime });
    };

    const getTopPos = (timeStr) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        const firstHour = visibleTimes.length > 0 ? Number(visibleTimes[0].val.split(':')[0]) : 0;
        const totalMin = (h - firstHour) * 60 + m;
        return (totalMin / 60) * 80;
    };

    const getHeight = (start, end) => {
        if (!start || !end) return 40;
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        const durationMin = (h2 * 60 + m2) - (h1 * 60 + m1);
        return (durationMin / 60) * 80;
    };

    const times = [];
    for (let i = 0; i <= 23; i++) {
        const hour12 = i % 12 || 12;
        const ampm = i >= 12 ? 'PM' : 'AM';
        times.push({ label: `${hour12} ${ampm}`, val: `${String(i).padStart(2, '0')}:00`, hour: i });
    }
    const visibleTimes = times.filter(t => !isDuringSleep(t.hour));
    const scheduleItems = tasks?.filter(t => t.startTime) || [];

    const selectedDateStr = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

    return (
        <div className="flex flex-col gap-3 font-sans h-full relative">
            <div className="flex flex-col gap-2 mb-2">
                {/* Single Row: Sleep + Wake + Day + Add */}
                <div className="flex items-center justify-between gap-2">
                    {/* Left: Sleep + Wake */}
                    <div className="flex items-center gap-2">
                        {/* Sleep */}
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] font-mono uppercase text-white/20 tracking-widest">SLEEP</span>
                            <input
                                type="time"
                                value={tempSleep.start}
                                onChange={e => setTempSleep({ ...tempSleep, start: e.target.value })}
                                className="bg-white/5 border border-white/10 h-[36px] w-[100px] px-1 text-white font-mono text-[12px] focus:border-white/40 transition-colors outline-none"
                            />
                        </div>

                        {/* Wake */}
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] font-mono uppercase text-white/20 tracking-widest">WAKE</span>
                            <input
                                type="time"
                                value={tempSleep.end}
                                onChange={e => setTempSleep({ ...tempSleep, end: e.target.value })}
                                className="bg-white/5 border border-white/10 h-[36px] w-[100px] px-1 text-white font-mono text-[12px] focus:border-white/40 transition-colors outline-none"
                            />
                        </div>

                        {isSavingSleep && (
                            <div className="flex items-center gap-1 self-end pb-1">
                                <div className="size-1 rounded-full bg-white animate-pulse" />
                            </div>
                        )}
                    </div>

                    {/* Right: Day Dropdown + Add Button */}
                    <div className="flex items-center gap-2">
                        {/* Day Dropdown */}
                        <div className="flex flex-col gap-0.5 w-[90px]">
                            <span className="text-[8px] font-mono uppercase text-white/20 tracking-widest">DAY</span>
                            <div className="relative">
                                <select
                                    value={selectedDay}
                                    onChange={e => setSelectedDay(Number(e.target.value))}
                                    className="w-full h-[36px] bg-white/5 border border-white/10 hover:border-white/40 text-white font-black text-[10px] uppercase tracking-[0.3em] px-3 pr-8 outline-none appearance-none cursor-pointer transition-colors"
                                >
                                    {DAYS.map((day, i) => {
                                        const isToday = i === todayDayIndex;
                                        return (
                                            <option key={day} value={i} className="bg-[#0a0a0a] text-white">
                                                {isToday ? '• ' : ''}{day}
                                            </option>
                                        );
                                    })}
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                    <span className="material-symbols-outlined text-[14px]">expand_more</span>
                                </div>
                            </div>
                        </div>

                        {/* Add Button */}
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] font-mono uppercase text-white/20 tracking-widest opacity-0">ADD</span>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="size-[36px] shrink-0 flex items-center justify-center border border-white/40 hover:bg-white hover:text-black transition-all"
                                title="ADD ACTIVITY"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                </div>

                {/* Third Row: Template Buttons */}
                <div className="flex gap-3 w-full">
                    <button onClick={() => {}} className="h-[38px] flex-1 border border-white/40 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 group/btn" title="TEMPLATES STORE">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">TEMPLATES STORE</span>
                    </button>
                    <button onClick={() => {}} className="h-[38px] flex-1 border border-white/40 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 group/btn" title="SAVE AS TEMPLATE">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">SAVE AS TEMPLATE</span>
                    </button>
                </div>
            </div>

            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="DELETE ACTIVITY"
                message="Are you sure you want to delete this activity? This cannot be undone."
                confirmLabel="DELETE"
                onConfirm={() => { handleDeleteTask(confirmDelete); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />

            <div className="flex-1 overflow-y-auto custom-scrollbar relative pr-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedDay}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.15 }}
                        ref={containerRef}
                        className="relative min-h-[1000px] mt-4"
                    >
                        {/* Hourly marks */}
                        <div className="flex flex-col relative">
                            {visibleTimes.map((t, idx) => (
                                <div key={idx} className="flex items-center gap-6 h-[80px] relative group/line">
                                    <span className="w-16 text-[14px] font-mono text-white/20 group-hover/line:text-white/60 transition-colors uppercase whitespace-nowrap">{t.label}</span>
                                    <div className="flex-1 h-px bg-white/5 group-hover/line:bg-white/20 transition-all"></div>
                                    {!isReadOnly && (
                                        <button
                                            onClick={() => setIsAdding(true)}
                                            className="absolute left-16 opacity-0 group-hover/line:opacity-100 size-6 flex items-center justify-center border border-white/20 text-white hover:bg-white hover:text-black transition-all z-20"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Task Blocks */}
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2 opacity-20">
                                    <div className="size-1.5 rounded-full bg-white animate-pulse" />
                                    <span className="text-[8px] font-mono uppercase tracking-widest text-white">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            scheduleItems.map((task) => {
                                const top = getTopPos(task.startTime);
                                const height = getHeight(task.startTime, task.endTime);
                                return (
                                    <motion.div
                                        key={`${task._id}-${task.startTime}-${snapKey}`}
                                        drag={!isReadOnly ? "y" : false}
                                        dragConstraints={containerRef}
                                        dragMomentum={false}
                                        onDragEnd={async (_, info) => {
                                            if (isReadOnly) return;
                                            const dy = info.offset.y;
                                            const currentTop = getTopPos(task.startTime);
                                            const newTop = currentTop + dy;
                                            const firstHour = visibleTimes.length > 0 ? Number(visibleTimes[0].val.split(':')[0]) : 0;
                                            let totalMin = (newTop / 80) * 60 + (firstHour * 60);
                                            totalMin = Math.round(totalMin / 15) * 15;
                                            const h = Math.floor(totalMin / 60);
                                            const m = totalMin % 60;
                                            const newStartTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                                            if (newStartTime !== task.startTime) await moveTaskAtTime(task, newStartTime);
                                        }}
                                        className="absolute left-24 right-0 bg-white text-black p-4 group overflow-hidden flex flex-col justify-center cursor-grab active:cursor-grabbing border border-black"
                                        style={{ top: `${top}px`, height: `${height}px` }}
                                    >
                                        <div className="absolute top-0 right-0 p-2 opacity-5 rotate-12">
                                            <span className="material-symbols-outlined text-4xl">terminal</span>
                                        </div>
                                        <div className="relative z-10 flex flex-col">
                                            <span className="text-[15px] font-black uppercase tracking-tighter truncate">{task.title}</span>
                                            {height > 40 && <span className="text-[11px] font-mono font-bold opacity-60">{task.startTime} - {task.endTime}</span>}
                                        </div>
                                        {!isReadOnly && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setConfirmDelete(task._id); }}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-black/40 hover:text-black transition-all"
                                            >
                                                <span className="material-symbols-outlined text-xs font-bold">close</span>
                                            </button>
                                        )}
                                    </motion.div>
                                );
                            })
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Quick Add Modal */}
            <AddPlanModal
                isOpen={isAdding}
                onClose={() => setIsAdding(false)}
                onAdd={handleAddTask}
            />
        </div>
    );
};

export default DailySchedule;
