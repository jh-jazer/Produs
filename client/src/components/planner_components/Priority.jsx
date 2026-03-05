import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import api from '../../services/api';

const fetcher = url => api.get(url).then(res => res.data);

const Priority = ({ isCompact = false }) => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-CA');
    const { data: tasks, mutate } = useSWR(`/planner/tasks?date=${dateStr}`, fetcher);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Helper to check if current time is within a task's window
    const getActiveTask = () => {
        if (!tasks) return null;

        const nowStr = currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

        return tasks.find(t => {
            if (!t.startTime || !t.endTime) return false;
            return nowStr >= t.startTime && nowStr <= t.endTime;
        });
    };

    const activeTask = getActiveTask();
    const otherTasks = tasks?.filter(t => t._id !== activeTask?._id) || [];
    const events = otherTasks.filter(t => t.type === 'event');
    const todoTasks = otherTasks.filter(t => t.type === 'task' || !t.type);

    const toggleComplete = async (task) => {
        try {
            await api.patch(`/planner/tasks/${task._id}`, { completed: !task.completed });
            mutate();
        } catch (error) {
            console.error('Failed to toggle task:', error);
        }
    };

    return (
        <div className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] shadow-sm flex flex-col transition-all min-h-[200px] ${isCompact ? 'p-4 gap-4' : 'p-6 gap-6'}`}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Priority</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Focus for Today</p>
                    </div>
                </div>
                {!isCompact && (
                    <div className="text-right">
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {today.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                )}
            </div>

            {/* Active Now Section */}
            <div className="space-y-3">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Active Now</h4>
                {activeTask ? (
                    <div className="relative overflow-hidden p-5 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 group">
                        <div className="absolute top-0 right-0 p-4 opacity-20 transition-transform group-hover:scale-110">
                            <span className="material-symbols-outlined text-4xl">bolt</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Current Activity</p>
                            <h5 className={`${isCompact ? 'text-lg' : 'text-xl'} font-black mb-1`}>{activeTask.title}</h5>
                            <div className="flex items-center gap-2 text-xs font-bold opacity-90">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                <span>{activeTask.startTime} - {activeTask.endTime}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={`${isCompact ? 'p-4' : 'p-5'} rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800/50 flex flex-col items-center justify-center text-center gap-2`}>
                        <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-3xl">coffee</span>
                        <p className="text-xs font-bold text-slate-400">No scheduled activity</p>
                    </div>
                )}
            </div>

            {/* Daily Briefing - Hidden in Compact Mode */}
            {!isCompact && (
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Daily Briefing</h4>

                    <div className="space-y-2">
                        {events.length > 0 && events.map(event => (
                            <div key={event._id} className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                                <span className="material-symbols-outlined text-purple-500 text-sm">event</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{event.title}</span>
                                <span className="ml-auto text-[10px] font-black text-purple-400 uppercase">Event</span>
                            </div>
                        ))}

                        {todoTasks.length > 0 ? todoTasks.map(task => (
                            <div
                                key={task._id}
                                onClick={() => toggleComplete(task)}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${task.completed
                                    ? 'bg-slate-50 dark:bg-slate-800/10 border-transparent opacity-50'
                                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-primary/30 shadow-sm'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-sm ${task.completed ? 'text-green-500' : 'text-slate-400'}`}>
                                    {task.completed ? 'check_circle' : 'circle'}
                                </span>
                                <span className={`text-sm font-bold ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {task.title}
                                </span>
                                {task.startTime && (
                                    <span className="ml-auto text-[10px] font-black text-slate-400">{task.startTime}</span>
                                )}
                            </div>
                        )) : events.length === 0 && (
                            <p className="text-center text-xs font-bold text-slate-400 py-4 italic">No other tasks for today</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Priority;
