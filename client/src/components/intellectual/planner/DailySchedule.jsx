import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { usePlanner } from '../../../hooks/usePlanner';
import { Plus, Layout, Save } from 'lucide-react';
import AddPlanModal from '../../ui/AddPlanModal';

const fetcher = url => api.get(url).then(res => res.data);

const DailySchedule = ({ viewMode = 'me', isReadOnly = false, onFlip }) => {
    const containerRef = useRef(null);
    const today = new Date();
    const { tasks, addTask, updateTask, deleteTask, isLoading } = usePlanner(today);
    
    const [isAdding, setIsAdding] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [snapKey, setSnapKey] = useState(0);
    const [confirmDelete, setConfirmDelete] = useState(null);
    
    const { data: user, mutate: mutateUser } = useSWR('/auth/me', fetcher);
    
    // Local state for sleep editing
    const [tempSleep, setTempSleep] = useState({ start: '22:00', end: '07:00' });
    const [isSavingSleep, setIsSavingSleep] = useState(false);

    useEffect(() => {
        if (user?.settings?.sleepMode) {
            setTempSleep({
                start: user.settings.sleepMode.start || '22:00',
                end: user.settings.sleepMode.end || '07:00'
            });
        }
    }, [user]);

    const sleepStart = user?.settings?.sleepMode?.start || "22:00";
    const sleepEnd = user?.settings?.sleepMode?.end || "07:00";

    // Auto-save sleep settings
    useEffect(() => {
        const timer = setTimeout(() => {
            if (user?.settings?.sleepMode && (
                tempSleep.start !== user.settings.sleepMode.start || 
                tempSleep.end !== user.settings.sleepMode.end
            )) {
                handleSaveSleep();
            }
        }, 1000); // 1s debounce
        return () => clearTimeout(timer);
    }, [tempSleep]);

    const handleSaveSleep = async () => {
        try {
            setIsSavingSleep(true);
            await api.put('/auth/settings', {
                sleepMode: tempSleep
            });
            await mutateUser();
            setSnapKey(prev => prev + 1);
        } catch (err) {
            console.error("Failed to save sleep settings:", err);
        } finally {
            setIsSavingSleep(false);
        }
    };

    const isOverlapping = (start1, end1, start2, end2) => {
        const toMin = (s) => {
            if (!s) return null;
            const [h, m] = s.split(':').map(Number);
            return h * 60 + m;
        };
        const s1 = toMin(start1);
        let e1 = toMin(end1);
        const s2 = toMin(start2);
        let e2 = toMin(end2);
        if (e1 === null || e1 <= s1) e1 = s1 + 30;
        if (e2 === null || e2 <= s2) e2 = s2 + 30;
        return s1 < e2 && s2 < e1;
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
        return (totalMin / 60) * 80; // Scaled for better readability
    };

    const getHeight = (start, end) => {
        if (!start || !end) return 40;
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        const durationMin = (h2 * 60 + m2) - (h1 * 60 + m1);
        return (durationMin / 60) * 80;
    };

    const isDuringSleep = (h) => {
        const startH = Number(sleepStart.split(':')[0]);
        const endH = Number(sleepEnd.split(':')[0]);
        if (startH < endH) return h >= startH && h < endH;
        return h >= startH || h < endH;
    };

    const times = [];
    for (let i = 0; i <= 23; i++) {
        const hour12 = i % 12 || 12;
        const ampm = i >= 12 ? 'PM' : 'AM';
        times.push({ label: `${hour12} ${ampm}`, val: `${String(i).padStart(2, '0')}:00`, hour: i });
    }
    const visibleTimes = times.filter(t => !isDuringSleep(t.hour));
    const scheduleItems = tasks?.filter(t => t.startTime) || [];

    return (
        <div className="flex flex-col gap-3 font-sans h-full relative">
            <div className="flex flex-col gap-2 mb-2">
                {/* First Row: Sleep Time + Add Icon */}
                <div className="flex items-end justify-between gap-4">
                    <div className="flex items-end gap-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-mono uppercase text-white/20">START</span>
                            <input 
                                type="time" 
                                value={tempSleep.start} 
                                onChange={e => setTempSleep({...tempSleep, start: e.target.value})}
                                className="bg-white/5 border border-white/10 h-[38px] w-[110px] px-1 text-white font-mono text-[14px] focus:border-white/40 transition-colors outline-none whitespace-nowrap"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-mono uppercase text-white/20 whitespace-nowrap">END</span>
                            <input 
                                type="time" 
                                value={tempSleep.end} 
                                onChange={e => setTempSleep({...tempSleep, end: e.target.value})}
                                className="bg-white/5 border border-white/10 h-[38px] w-[110px] px-1 text-white font-mono text-[14px] focus:border-white/40 transition-colors outline-none whitespace-nowrap"
                            />
                        </div>
                        {isSavingSleep && (
                            <div className="flex items-center gap-2 mb-2 ml-2">
                                <div className="size-1.5 rounded-full bg-white animate-pulse" />
                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Syncing...</span>
                            </div>
                        )}
                    </div>

                    <button onClick={() => setIsAdding(true)} className="size-[38px] flex items-center justify-center border border-white/40 hover:bg-white hover:text-black transition-all" title="ADD ACTIVITY">
                        <Plus size={16} />
                    </button>
                </div>

                {/* Second Row: Template Icons */}
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
                <div ref={containerRef} className="relative min-h-[1000px] mt-4">
                    {/* Hourly marks */}
                    <div className="flex flex-col relative">
                        {visibleTimes.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-6 h-[80px] relative group/line">
                                <span className="w-16 text-[14px] font-mono text-white/20 group-hover/line:text-white/60 transition-colors uppercase whitespace-nowrap">{t.label}</span>
                                <div className="flex-1 h-px bg-white/5 group-hover/line:bg-white/20 transition-all"></div>
                                {!isReadOnly && (
                                    <button
                                        onClick={() => { setNewHabit({ ...newHabit, startTime: t.val }); setIsAdding(true); }}
                                        className="absolute left-16 opacity-0 group-hover/line:opacity-100 size-6 flex items-center justify-center border border-white/20 text-white hover:bg-white hover:text-black transition-all z-20"
                                    >
                                        <Plus size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Task Blocks */}
                    {scheduleItems.map((task) => {
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
                    })}
                </div>
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
