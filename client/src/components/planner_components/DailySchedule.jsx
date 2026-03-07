import React, { useState } from 'react';
import useSWR from 'swr';
import api from '../../services/api';

const fetcher = url => api.get(url).then(res => res.data);

const DailySchedule = ({ selectedDate, viewMode = 'me', isReadOnly = false }) => {
    const dateStr = selectedDate.toLocaleDateString('en-CA');
    const { data: tasks, mutate } = useSWR(`/planner/tasks?date=${dateStr}${viewMode === 'partner' ? '&view=partner' : ''}`, fetcher);
    const [isAdding, setIsAdding] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [newTask, setNewTask] = useState({ title: '', startTime: '09:00', endTime: '10:00' });

    // Filter tasks that have time set
    const scheduleItems = tasks?.filter(t => t.startTime && !t.priority) || [];

    const handleAddTask = async () => {
        if (!newTask.title.trim()) return;
        try {
            await api.post('/planner/tasks', {
                ...newTask,
                date: dateStr,
                type: 'task'
            });
            setNewTask({ title: '', startTime: '09:00', endTime: '10:00' });
            setIsAdding(false);
            mutate();
        } catch (error) {
            console.error('Failed to add schedule item:', error);
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await api.delete(`/planner/tasks/${id}`);
            mutate();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const moveTaskAtTime = async (task, newStartTime) => {
        // Calculate new end time (keep duration same)
        const [h1, m1] = task.startTime.split(':').map(Number);
        const [h2, m2] = task.endTime.split(':').map(Number);
        const durationMin = (h2 * 60 + m2) - (h1 * 60 + m1);

        const [nh, nm] = newStartTime.split(':').map(Number);
        const totalEndMin = (nh * 60 + nm) + durationMin;
        const nEh = Math.floor(totalEndMin / 60);
        const nEm = totalEndMin % 60;
        const newEndTime = `${String(nEh).padStart(2, '0')}:${String(nEm).padStart(2, '0')}`;

        try {
            await api.patch(`/planner/tasks/${task._id}`, { startTime: newStartTime, endTime: newEndTime });
            mutate();
        } catch (error) {
            console.error('Failed to move task:', error);
        }
    };

    const getTopPos = (timeStr) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        const startH = 8; // 8 AM
        const totalMin = (h - startH) * 60 + m;
        return (totalMin / 60) * 80; // 80px per hour
    };

    const getHeight = (start, end) => {
        if (!start || !end) return 40;
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        const durationMin = (h2 * 60 + m2) - (h1 * 60 + m1);
        return (durationMin / 60) * 80;
    };

    const times = [];
    for (let i = 8; i <= 21; i++) {
        const h = i > 12 ? i - 12 : i;
        const ampm = i >= 12 ? 'PM' : 'AM';
        times.push({ label: `${h}:00 ${ampm}`, val: `${String(i).padStart(2, '0')}:00` });
    }

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] flex flex-col shadow-xl overflow-hidden h-[500px] transition-all hover:shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-[#192233]/80 backdrop-blur-md z-30 sticky top-0">
                <div>
                    <h3 className="font-black text-slate-900 dark:text-white tracking-tight">Daily Schedule</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Time blocking</p>
                </div>
                {!isReadOnly && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className={`p-2 rounded-xl transition-all ${isAdding ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-primary'}`}
                        >
                            <span className="material-symbols-outlined text-xl">{isAdding ? 'close' : 'add'}</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative font-inter bg-slate-50/30 dark:bg-transparent">
                {isAdding && (
                    <div className="absolute top-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-40 animate-in slide-in-from-top duration-300">
                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                placeholder="Activity title..."
                                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="time"
                                    value={newTask.startTime}
                                    onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-sm"
                                />
                                <span className="flex items-center text-slate-400">to</span>
                                <input
                                    type="time"
                                    value={newTask.endTime}
                                    onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-sm"
                                />
                                <button
                                    onClick={handleAddTask}
                                    className="px-6 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="relative min-h-[1100px] p-6 pt-10">
                    {/* Hourly marks */}
                    <div className="space-y-[80px] relative">
                        {times.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-4 text-[10px] font-black text-slate-300 dark:text-slate-700 h-px relative group/line">
                                <span className="w-12 whitespace-nowrap group-hover/line:text-primary transition-colors">{t.label}</span>
                                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800/50 group-hover/line:bg-primary/20 transition-all"></div>
                                {!isReadOnly && (
                                    <button
                                        onClick={() => { setNewTask({ ...newTask, startTime: t.val }); setIsAdding(true); }}
                                        className="absolute left-16 opacity-0 group-hover/line:opacity-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full size-6 flex items-center justify-center text-primary shadow-sm hover:scale-110 transition-all z-20"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Current Time Indicator */}
                        {(() => {
                            const now = new Date();
                            const hours = now.getHours();
                            const minutes = now.getMinutes();
                            if (hours >= 8 && hours <= 21) {
                                const topPos = ((hours - 8) * 80) + (minutes / 60) * 80;
                                return (
                                    <div className="absolute left-16 right-0 flex items-center z-20 pointer-events-none" style={{ top: `${topPos}px` }}>
                                        <div className="size-2 bg-red-500 rounded-full shadow-lg -ml-1 ring-4 ring-red-500/20"></div>
                                        <div className="flex-1 h-0.5 bg-red-500/40"></div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>

                    {/* Task Blocks */}
                    {scheduleItems.map((task) => {
                        const top = getTopPos(task.startTime);
                        const height = getHeight(task.startTime, task.endTime);
                        return (
                            <div
                                key={task._id}
                                className="absolute left-[5rem] right-6 rounded-xl border-l-4 border-primary bg-primary/10 dark:bg-primary/20 backdrop-blur-sm p-3 group hover:shadow-xl hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer overflow-hidden"
                                style={{ top: `${top}px`, height: `${height}px` }}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">{task.title}</p>
                                        <p className="text-[10px] font-bold text-primary opacity-80">{task.startTime} - {task.endTime}</p>
                                    </div>
                                    {!isReadOnly && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => moveTaskAtTime(task, `${String(Number(task.startTime.split(':')[0]) - 1).padStart(2, '0')}:${task.startTime.split(':')[1]}`)}
                                                className="p-1 hover:bg-white/20 rounded text-slate-500 dark:text-slate-300"
                                            >
                                                <span className="material-symbols-outlined text-sm">expand_less</span>
                                            </button>
                                            <button
                                                onClick={() => moveTaskAtTime(task, `${String(Number(task.startTime.split(':')[0]) + 1).padStart(2, '0')}:${task.startTime.split(':')[1]}`)}
                                                className="p-1 hover:bg-white/20 rounded text-slate-500 dark:text-slate-300"
                                            >
                                                <span className="material-symbols-outlined text-sm">expand_more</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTask(task._id)}
                                                className="p-1 hover:bg-red-500/20 rounded text-red-500"
                                            >
                                                <span className="material-symbols-outlined text-xs">delete</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DailySchedule;
