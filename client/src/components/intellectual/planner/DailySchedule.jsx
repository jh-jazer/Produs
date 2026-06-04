import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { usePlanner } from '../../../hooks/usePlanner';
import { Plus, Store, Save } from 'lucide-react';
import AddPlanModal from '../../ui/AddPlanModal';
import TemplateStoreModal from '../../ui/TemplateStoreModal';
import SaveTemplateModal from '../../ui/SaveTemplateModal';
import ChippedBorder from '../../ui/ChippedBorder';

const formatTime12h = (timeStr) => {
    if (!timeStr) return '';
    const [hStr, mStr] = timeStr.split(':');
    const h = Number(hStr);
    const m = Number(mStr);
    const ampm = h >= 12 ? 'pm' : 'am';
    const h12 = h % 12 || 12;
    const mPart = m > 0 ? `:${String(m).padStart(2, '0')}` : '';
    return `${h12}${mPart}${ampm}`;
};

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
    const [isStoreOpen, setIsStoreOpen] = useState(false);
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
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

    const handleApplyTemplate = async (activities) => {
        for (const act of activities) {
            await addTask({
                title: act.title,
                startTime: act.startTime,
                endTime: act.endTime,
                type: 'task'
            });
        }
        setSnapKey(prev => prev + 1);
    };

    const handleSaveAsTemplate = ({ name, description }) => {
        const activeActivities = scheduleItems.map(item => ({
            title: item.title,
            startTime: item.startTime,
            endTime: item.endTime
        }));
        if (activeActivities.length === 0) return;
        
        const customTemplate = {
            id: 'custom-' + Date.now(),
            name,
            description,
            badge: 'CUSTOM ARCHIVE',
            activities: activeActivities
        };
        
        const stored = localStorage.getItem('produs_custom_schedule_templates');
        let templates = [];
        if (stored) {
            try {
                templates = JSON.parse(stored);
            } catch (e) {
                console.error(e);
            }
        }
        templates.push(customTemplate);
        localStorage.setItem('produs_custom_schedule_templates', JSON.stringify(templates));
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
    const isPlannerEmpty = scheduleItems.length === 0;

    const selectedDateStr = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

    return (
        <div className="flex flex-col gap-3 font-sans h-full relative">
            <div className="flex flex-col gap-2 mb-2">
                {/* First Row: Sleep Time + Day Dropdown + Add Icon Button */}
                <div className="flex items-center justify-between gap-2 w-full">
                    {/* Left: Day Dropdown + Sleep Time Button */}
                    <div className="flex items-center gap-2 flex-1">
                        {/* Day Dropdown */}
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-wider text-black/40 dark:text-white/40 pointer-events-none">DAY:</span>
                            <select
                                value={selectedDay}
                                onChange={e => setSelectedDay(Number(e.target.value))}
                                className="w-full h-[36px] bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/10 hover:border-black/40 dark:hover:border-white/40 text-black dark:text-white font-black text-[10px] uppercase tracking-[0.3em] pl-[42px] pr-8 outline-none appearance-none cursor-pointer transition-colors"
                            >
                                {DAYS.map((day, i) => {
                                    const isToday = i === todayDayIndex;
                                    return (
                                        <option key={day} value={i} className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white">
                                            {isToday ? '• ' : ''}{day}
                                        </option>
                                    );
                                })}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-black/40 dark:text-white/40">
                                <span className="material-symbols-outlined text-[14px]">expand_more</span>
                            </div>
                        </div>

                        {/* Sleep Time Button */}
                        <button
                            onClick={() => setIsSleepModalOpen(true)}
                            className="flex items-center gap-2 px-3 h-[36px] bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/10 hover:border-black/40 dark:hover:border-white/40 text-black dark:text-white transition-colors rounded-sm text-[10px] font-black uppercase tracking-wider shrink-0 cursor-pointer"
                            title="SET SLEEP WINDOW"
                        >
                            <span className="text-black/40 dark:text-white/40">SLEEP TIME:</span>
                            <span>{formatTime12h(tempSleep.start).toUpperCase()}-{formatTime12h(tempSleep.end).toUpperCase()}</span>
                            {isSavingSleep && (
                                <div className="size-1.5 rounded-full bg-black dark:bg-white animate-pulse ml-1" />
                            )}
                        </button>
                    </div>

                    {/* Right: Add Icon Button */}
                    <button 
                        onClick={() => setIsAdding(true)} 
                        className="size-[36px] shrink-0 flex items-center justify-center border border-black/40 dark:border-white/40 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all rounded-sm cursor-pointer" 
                        title="ADD ACTIVITY"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                {/* Second Row: Actions */}
                <div className="flex gap-3 w-full mt-1">
                    <button 
                        onClick={() => setIsStoreOpen(true)} 
                        className="h-[38px] flex-1 border border-black/40 dark:border-white/40 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all rounded-sm flex items-center justify-center gap-2 group/btn cursor-pointer" 
                        title="TEMPLATES STORE"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">TEMPLATES STORE</span>
                    </button>
                    <button 
                        onClick={() => !isPlannerEmpty && setIsSaveOpen(true)} 
                        disabled={isPlannerEmpty}
                        className={`h-[38px] flex-1 border transition-all rounded-sm flex items-center justify-center gap-2 group/btn cursor-pointer ${
                            isPlannerEmpty 
                                ? "border-black/10 dark:border-white/10 text-black/30 dark:text-white/25 bg-black/5 dark:bg-white/5 cursor-not-allowed opacity-50"
                                : "border-black/40 dark:border-white/40 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
                        }`}
                        title={isPlannerEmpty ? "ADD ACTIVITIES TO SAVE A TEMPLATE" : "SAVE AS TEMPLATE"}
                    >
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
                                    <span className="w-16 text-[14px] font-mono text-black/30 dark:text-white/20 group-hover/line:text-black/60 dark:group-hover/line:text-white/60 transition-colors uppercase whitespace-nowrap">{t.label}</span>
                                    <div className="flex-1 h-px bg-black/5 dark:bg-white/5 group-hover/line:bg-black/25 dark:group-hover/line:bg-white/20 transition-all"></div>
                                    {!isReadOnly && (
                                        <button
                                            onClick={() => setIsAdding(true)}
                                            className="absolute left-16 opacity-0 group-hover/line:opacity-100 size-6 flex items-center justify-center border border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all z-20 rounded-sm"
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
                                    <div className="size-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
                                    <span className="text-[8px] font-mono uppercase tracking-widest text-black dark:text-white">Loading...</span>
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

            {/* Templates Store Modal */}
            <TemplateStoreModal
                isOpen={isStoreOpen}
                onClose={() => setIsStoreOpen(false)}
                onApply={handleApplyTemplate}
            />

            {/* Save Template Modal */}
            <SaveTemplateModal
                isOpen={isSaveOpen}
                onClose={() => setIsSaveOpen(false)}
                onSave={handleSaveAsTemplate}
                currentActivitiesCount={scheduleItems.length}
            />

            {/* Sleep Settings Modal */}
            <SleepSettingsModal
                isOpen={isSleepModalOpen}
                onClose={() => setIsSleepModalOpen(false)}
                tempSleep={tempSleep}
                setTempSleep={setTempSleep}
                isSavingSleep={isSavingSleep}
            />
        </div>
    );
};

const SleepSettingsModal = ({ isOpen, onClose, tempSleep, setTempSleep, isSavingSleep }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/85 backdrop-blur-md"
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-10 w-full max-w-sm bg-white dark:bg-[#080808] p-8 md:p-10 rounded-sm group overflow-hidden border border-black dark:border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]"
                        >
                            <ChippedBorder opacity={0.4} />

                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex flex-col">
                                        <p className="text-[12px] md:text-[14px] font-bold leading-relaxed tracking-[0.2em] text-black/80 dark:text-white/80 uppercase">
                                            SLEEP WINDOW SETTINGS
                                        </p>
                                        <span className="text-[8px] font-mono uppercase text-black/40 dark:text-white/40 tracking-widest mt-0.5">
                                            SET YOUR IDEAL SLEEP & WAKE PROTOCOLS
                                        </span>
                                    </div>
                                    <button onClick={onClose} className="text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">SLEEP TIME</label>
                                        <input
                                            type="time"
                                            value={tempSleep.start}
                                            onChange={e => setTempSleep({ ...tempSleep, start: e.target.value })}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-mono"
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">WAKE TIME</label>
                                        <input
                                            type="time"
                                            value={tempSleep.end}
                                            onChange={e => setTempSleep({ ...tempSleep, end: e.target.value })}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-mono"
                                        />
                                    </div>

                                    {isSavingSleep && (
                                        <div className="flex items-center gap-2 justify-center text-[10px] text-black/40 dark:text-white/40 font-mono">
                                            <div className="size-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
                                            <span>AUTOSAVING PROTOCOL...</span>
                                        </div>
                                    )}

                                    <div className="flex flex-row w-full pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.4em] text-[9px] hover:bg-black/90 dark:hover:bg-white/90 transition-all active:scale-[0.98] rounded-sm relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-2 h-2 bg-white dark:bg-black rotate-45 translate-x-1 -translate-y-1" />
                                            DONE
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>,
        document.body
    );
};

export default DailySchedule;
