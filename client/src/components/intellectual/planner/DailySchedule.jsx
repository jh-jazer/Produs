import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { usePlanner } from '../../../hooks/usePlanner';
import { Plus } from 'lucide-react';

const fetcher = url => api.get(url).then(res => res.data);

const DailySchedule = ({ viewMode = 'me', isReadOnly = false, onFlip }) => {
    const containerRef = useRef(null);
    const today = new Date();
    const { tasks, addTask, updateTask, deleteTask, isLoading } = usePlanner(today);
    
    const [isAdding, setIsAdding] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [newHabit, setNewHabit] = useState({ title: '', startTime: '09:00', endTime: '10:00' });
    const [snapKey, setSnapKey] = useState(0);
    const [confirmDelete, setConfirmDelete] = useState(null);
    
    const { data: user, mutate: mutateUser } = useSWR('/auth/me', fetcher);
    const sleepStart = user?.settings?.sleepMode?.start || "22:00";
    const sleepEnd = user?.settings?.sleepMode?.end || "07:00";

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

    const handleAddTask = async () => {
        if (!newHabit.title.trim()) return;
        await addTask({ ...newHabit, type: 'task' });
        setNewHabit({ title: '', startTime: '09:00', endTime: '10:00' });
        setIsAdding(false);
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
        times.push({ label: `${String(i).padStart(2, '0')}:00`, val: `${String(i).padStart(2, '0')}:00`, hour: i });
    }
    const visibleTimes = times.filter(t => !isDuringSleep(t.hour));
    const scheduleItems = tasks?.filter(t => t.startTime) || [];

    return (
        <div className="flex flex-col gap-8 font-sans h-full relative">
            <div className="absolute -top-16 right-0 flex gap-2 z-20">
                <button onClick={() => setIsAdding(true)} className="size-10 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all">
                    <Plus size={16} />
                </button>
                <button onClick={onFlip} className="size-10 flex items-center justify-center border border-white/10 text-white/40 hover:border-white/30 transition-all">
                    <span className="material-symbols-outlined text-sm font-bold italic">west</span>
                </button>
            </div>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="PURGE_NODE"
                message="Confirm deletion of scheduled activity node."
                confirmLabel="PURGE"
                onConfirm={() => { handleDeleteTask(confirmDelete); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />

            <div className="flex-1 overflow-y-auto custom-scrollbar relative pr-4">
                <div ref={containerRef} className="relative min-h-[1000px] mt-4">
                    {/* Hourly marks */}
                    <div className="flex flex-col relative">
                        {visibleTimes.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-6 h-[80px] relative group/line">
                                <span className="w-12 text-[10px] font-mono text-white/20 group-hover/line:text-white/60 transition-colors uppercase">{t.label}</span>
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
                                className="absolute left-20 right-0 bg-white text-black p-4 group overflow-hidden flex flex-col justify-center cursor-grab active:cursor-grabbing border border-black"
                                style={{ top: `${top}px`, height: `${height}px` }}
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-5 rotate-12">
                                    <span className="material-symbols-outlined text-4xl">terminal</span>
                                </div>
                                <div className="relative z-10 flex flex-col">
                                    <span className="text-[11px] font-black uppercase tracking-tighter truncate">{task.title}</span>
                                    {height > 40 && <span className="text-[9px] font-mono font-bold opacity-60">{task.startTime} - {task.endTime}</span>}
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
            {isAdding && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-md">
                    <div className="absolute inset-0 bg-black/80" onClick={() => setIsAdding(false)} />
                    <div className="relative w-full max-w-md bg-[#0a0a0a] border-4 border-white p-8 shadow-[0_0_100px_rgba(255,255,255,0.1)]">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">INITIALIZE // TIMELINE_NODE</span>
                                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Add Objective</h3>
                            </div>
                            <button onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        <div className="flex flex-col gap-6">
                            <input 
                                value={newHabit.title}
                                onChange={e => setNewHabit({...newHabit, title: e.target.value})}
                                placeholder="OBJECTIVE_IDENTIFIER..."
                                className="w-full bg-white/5 border border-white/10 p-4 text-sm font-black uppercase tracking-widest focus:border-white transition-all outline-none"
                                autoFocus
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">START_TIMESTAMP</span>
                                    <input type="time" value={newHabit.startTime} onChange={e => setNewHabit({...newHabit, startTime: e.target.value})} className="bg-white/5 border border-white/10 p-3 text-white font-mono text-sm" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">END_TIMESTAMP</span>
                                    <input type="time" value={newHabit.endTime} onChange={e => setNewHabit({...newHabit, endTime: e.target.value})} className="bg-white/5 border border-white/10 p-3 text-white font-mono text-sm" />
                                </div>
                            </div>

                            <button onClick={handleAddTask} className="mt-4 w-full py-6 bg-white text-black font-black uppercase tracking-[0.5em] text-xs hover:bg-white/90 active:scale-95 transition-all">
                                ALLOCATE_BLOCK
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default DailySchedule;
