import React, { useState } from 'react';
import useSWR from 'swr';
import api from '../../services/api';

const fetcher = url => api.get(url).then(res => res.data);

const FullCalendar = ({ onDateSelect, selectedDate, viewMode = 'me', isReadOnly = false }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [addModal, setAddModal] = useState(null); // { startDate: Date, endDate: Date }
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskType, setNewTaskType] = useState('task'); // 'task' or 'event'
    const [newTaskColor, setNewTaskColor] = useState('#3b82f6');
    const [selection, setSelection] = useState(null); // { start: Date, current: Date }
    const [isDragging, setIsDragging] = useState(false);

    const colors = [
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Purple', value: '#a855f7' },
        { name: 'Rose', value: '#f43f5e' },
        { name: 'Amber', value: '#f59e0b' },
        { name: 'Emerald', value: '#10b981' },
        { name: 'Slate', value: '#64748b' }
    ];

    const { data: tasks, mutate } = useSWR(`/planner/tasks?year=${viewDate.getFullYear()}&month=${viewDate.getMonth() + 1}${viewMode === 'partner' ? '&view=partner' : ''}`, fetcher);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));

    const handleMouseDown = (day) => {
        if (isReadOnly) return;
        const clickedDate = new Date(year, month, day);
        setSelection({ start: clickedDate, current: clickedDate });
        setIsDragging(true);
    };

    const handleMouseEnter = (day) => {
        if (!isDragging) return;
        const hoverDate = new Date(year, month, day);
        setSelection(prev => ({ ...prev, current: hoverDate }));
    };

    const handleMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);
        if (selection) {
            const start = selection.start < selection.current ? selection.start : selection.current;
            const end = selection.start < selection.current ? selection.current : selection.start;
            setAddModal({ startDate: start, endDate: end });
            setSelection(null);
            onDateSelect(start);
        }
    };

    const handleDayClick = (day) => {
        // Fallback for simple clicks if needed, though MouseUp covers it
        if (!selection && !isDragging) {
            const clickedDate = new Date(year, month, day);
            onDateSelect(clickedDate);
            setAddModal({ startDate: clickedDate, endDate: clickedDate });
        }
    };

    const addTask = async () => {
        if (!newTaskTitle.trim()) return;
        try {
            const startStr = addModal.startDate.toLocaleDateString('en-CA');
            const endStr = addModal.endDate.toLocaleDateString('en-CA');

            await api.post('/planner/tasks', {
                title: newTaskTitle.trim(),
                date: startStr,
                endDate: startStr === endStr ? null : endStr,
                type: newTaskType,
                color: newTaskColor
            });
            setNewTaskTitle('');
            setAddModal(null);
            mutate();
        } catch (error) {
            console.error('Failed to add task from calendar:', error);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            await api.delete(`/planner/tasks/${taskId}`);
            mutate(); // Re-fetch tasks after deletion
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const getTasksForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return tasks?.filter(t => {
            if (t.date === dateStr) return true;
            if (t.endDate && dateStr >= t.date && dateStr <= t.endDate) return true;
            return false;
        }) || [];
    };

    const getTasksForRange = (start, end) => {
        if (!tasks) return [];
        const startStr = start.toLocaleDateString('en-CA');
        const endStr = end.toLocaleDateString('en-CA');
        return tasks.filter(t => {
            const tStart = t.date;
            const tEnd = t.endDate || t.date;
            return (tStart <= endStr && tEnd >= startStr);
        });
    };

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm flex flex-col font-inter relative min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white shrink-0">{months[month]} {year}</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all border border-slate-200 dark:border-slate-800"
                    >
                        <span className="material-symbols-outlined text-lg leading-none">chevron_left</span>
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all border border-slate-200 dark:border-slate-800"
                    >
                        <span className="material-symbols-outlined text-lg leading-none">chevron_right</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-3 text-center text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 auto-rows-[40px] md:auto-rows-[55px] select-none">
                {/* Previous Month Days */}
                {[...Array(firstDayOfMonth)].map((_, i) => {
                    const d = daysInPrevMonth - firstDayOfMonth + i + 1;
                    return (
                        <div key={`prev-${d}`} className="border-b border-r border-slate-50 dark:border-slate-800/20 p-2 text-slate-200 dark:text-slate-700 text-xs font-medium opacity-50">{d}</div>
                    );
                })}

                {/* Current Month Days */}
                {[...Array(daysInMonth)].map((_, i) => {
                    const d = i + 1;
                    const date = new Date(year, month, d);
                    const isToday = date.toDateString() === today.toDateString();
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const isLastInCol = (firstDayOfMonth + i + 1) % 7 === 0;
                    const dayTasks = getTasksForDay(d);
                    const multiDayTask = dayTasks.find(t => t.endDate);
                    const bgColor = multiDayTask ? (multiDayTask.color || (multiDayTask.type === 'event' ? '#a855f7' : '#3b82f6')) : '';

                    // Selection highlighting
                    let isInSelection = false;
                    if (selection) {
                        const start = selection.start < selection.current ? selection.start : selection.current;
                        const end = selection.start < selection.current ? selection.current : selection.start;
                        isInSelection = date >= start && date <= end;
                    }

                    return (
                        <div
                            key={`curr-${d}`}
                            onMouseDown={() => handleMouseDown(d)}
                            onMouseEnter={() => handleMouseEnter(d)}
                            onMouseUp={handleMouseUp}
                            className={`border-b ${isLastInCol ? '' : 'border-r'} border-slate-100 dark:border-slate-800/50 p-2 transition-all cursor-pointer group relative hover:opacity-90 ${isSelected || isInSelection ? 'ring-2 ring-inset ring-primary/40 z-10' : ''}`}
                            style={{ backgroundColor: multiDayTask ? `${bgColor}20` : '' }}
                        >
                            <span className={`size-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${isToday ? 'bg-primary text-white shadow-lg' : isSelected ? 'text-primary' : (multiDayTask ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-slate-300')
                                }`}
                                style={!isToday && !isSelected && multiDayTask ? { color: bgColor } : {}}
                            >
                                {d}
                            </span>

                            <div className="mt-2 space-y-1">
                                {dayTasks.slice(0, 3).map((t, idx) => {
                                    const taskStart = new Date(t.date);
                                    const taskEnd = t.endDate ? new Date(t.endDate) : null;
                                    const isStart = taskStart.getDate() === d;
                                    const isEnd = taskEnd && taskEnd.getDate() === d;
                                    const bg = t.color || (t.type === 'event' ? '#a855f7' : '#3b82f6');
                                    return (
                                        <div
                                            key={t._id}
                                            className="h-1 rounded-full transition-all duration-500 relative flex items-center"
                                            style={{
                                                backgroundColor: bg,
                                                borderLeft: isStart ? `4px solid ${bg}` : undefined,
                                                borderRight: isEnd ? `4px solid ${bg}` : undefined,
                                            }}
                                            title={t.title}
                                        />
                                    );
                                })}
                                {dayTasks.length > 3 && (
                                    <div className="text-[8px] font-black text-slate-400 text-center">+{dayTasks.length - 3}</div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Next Month Days */}
                {[...Array(42 - daysInMonth - firstDayOfMonth)].map((_, i) => {
                    const d = i + 1;
                    const isLastInCol = (firstDayOfMonth + daysInMonth + i + 1) % 7 === 0;
                    return (
                        <div key={`next-${d}`} className={`border-b ${isLastInCol ? '' : 'border-r'} border-slate-50 dark:border-slate-800/20 p-2 text-slate-200 dark:text-slate-700 text-xs font-medium opacity-50`}>{d}</div>
                    );
                })}
            </div>

            {/* Quick Add Modal */}
            {addModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm rounded-2xl" onClick={() => setAddModal(null)}></div>
                    <div className="relative bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 flex flex-col gap-4 max-h-[90%] overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">
                                    {addModal.startDate.toDateString() === addModal.endDate.toDateString()
                                        ? `${months[addModal.startDate.getMonth()]} ${addModal.startDate.getDate()}, ${addModal.startDate.getFullYear()}`
                                        : `${addModal.startDate.getDate()} - ${addModal.endDate.getDate()} ${months[addModal.endDate.getMonth()]}`
                                    }
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Day Focus & Planning</p>
                            </div>
                            <button onClick={() => setAddModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        {/* Existing Tasks in Modal */}
                        <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar min-h-0 flex-1">
                            {getTasksForRange(addModal.startDate, addModal.endDate).length > 0 ? (
                                getTasksForRange(addModal.startDate, addModal.endDate).map(t => (
                                    <div key={t._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 group">
                                        <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: t.color || (t.type === 'event' ? '#a855f7' : '#3b82f6') }}></div>
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex-1 truncate">{t.title}</span>
                                        {!isReadOnly && (
                                            <button
                                                onClick={() => deleteTask(t._id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-red-500 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center flex flex-col items-center gap-2 opacity-40">
                                    <span className="material-symbols-outlined text-4xl">calendar_today</span>
                                    <p className="text-xs font-bold italic text-slate-500">No activities planned yet</p>
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-700 w-full my-1"></div>

                        {/* Quick Add Form Section */}
                        {!isReadOnly && (
                            <div className="space-y-4 pt-2">
                                <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Add New Activity</h5>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="What's the plan?"
                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setNewTaskType('task')}
                                            className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newTaskType === 'task' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-slate-100/50 dark:bg-slate-800/50 text-slate-500'}`}
                                        >
                                            Task
                                        </button>
                                        <button
                                            onClick={() => setNewTaskType('event')}
                                            className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newTaskType === 'event' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-slate-100/50 dark:bg-slate-800/50 text-slate-500'}`}
                                        >
                                            Event
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center py-1">
                                        <div className="flex gap-2">
                                            {colors.map(c => (
                                                <button
                                                    key={c.value}
                                                    onClick={() => setNewTaskColor(c.value)}
                                                    className={`size-5 rounded-full transition-all ${newTaskColor === c.value ? 'ring-2 ring-slate-400 ring-offset-2 dark:ring-offset-slate-900 scale-110' : 'hover:scale-110 opacity-70'}`}
                                                    style={{ backgroundColor: c.value }}
                                                    title={c.name}
                                                />
                                            ))}
                                        </div>
                                        <button
                                            onClick={addTask}
                                            disabled={!newTaskTitle.trim()}
                                            className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-6 flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 justify-center">
                <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-primary shadow-sm shadow-primary/40"></div>Tasks</div>
                <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-purple-500 shadow-sm shadow-purple-500/40"></div>Events</div>
            </div>
        </div>
    );
};

export default FullCalendar;
