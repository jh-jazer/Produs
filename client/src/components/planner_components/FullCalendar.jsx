import React, { useState } from 'react';
import ConfirmDialog from '../ui/ConfirmDialog';
import { usePlannerLocal } from '../../hooks/usePlannerLocal';

const FullCalendar = ({ onDateSelect, selectedDate, viewMode = 'me', isReadOnly = false }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [addModal, setAddModal] = useState(null); // { startDate: Date, endDate: Date }
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskColor, setNewTaskColor] = useState('#a855f7'); // Default to purple for events
    const [selection, setSelection] = useState(null); // { start: Date, current: Date }
    const [isDragging, setIsDragging] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const colors = [
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Purple', value: '#a855f7' },
        { name: 'Rose', value: '#f43f5e' },
        { name: 'Amber', value: '#f59e0b' },
        { name: 'Emerald', value: '#10b981' },
        { name: 'Slate', value: '#64748b' }
    ];

    const { tasks, addTask: addTaskLocal, deleteTask: deleteTaskLocal } = usePlannerLocal(null);

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
        const startStr = addModal.startDate.toLocaleDateString('en-CA');
        const endStr = addModal.endDate.toLocaleDateString('en-CA');

        await addTaskLocal({
            title: newTaskTitle.trim(),
            description: newTaskDescription.trim(),
            date: startStr,
            endDate: startStr === endStr ? null : endStr,
            type: 'event', // Force event type
            color: newTaskColor
        });
        setNewTaskTitle('');
        setNewTaskDescription('');
        setAddModal(null);
    };

    const deleteTask = async (taskId) => {
        await deleteTaskLocal(taskId);
    };

    const getTasksForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return tasks?.filter(t => {
            if (t.type !== 'event') return false; // Filter for events only
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
            if (t.type !== 'event') return false; // Filter for events only
            const tStart = t.date;
            const tEnd = t.endDate || t.date;
            return (tStart <= endStr && tEnd >= startStr);
        });
    };

    return (
        <>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="Delete Event"
                message="Are you sure you want to delete this calendar event?"
                confirmLabel="Delete"
                onConfirm={() => { deleteTask(confirmDelete); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />
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

                            <div className="mt-1 flex justify-center h-4">
                                {dayTasks.some(t => t.type === 'note') ? (
                                    <span className="material-symbols-outlined text-[10px] text-slate-400">description</span>
                                ) : dayTasks.length > 0 ? (
                                    <div className="size-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                                ) : null}
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
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setAddModal(null)}></div>
                    <div className="relative bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 flex flex-col gap-4 max-h-[90%] overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">
                                    {addModal.startDate.toDateString() === addModal.endDate.toDateString()
                                        ? `${months[addModal.startDate.getMonth()]} ${addModal.startDate.getDate()}, ${addModal.startDate.getFullYear()}`
                                        : `${addModal.startDate.getDate()} - ${addModal.endDate.getDate()} ${months[addModal.endDate.getMonth()]}`
                                    }
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daily Notes & Observations</p>
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
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: t.color || '#a855f7' }}></div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{t.title}</span>
                                            </div>
                                            {t.description && (
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 ml-4 leading-relaxed">{t.description}</p>
                                            )}
                                        </div>
                                        {!isReadOnly && (
                                            <button
                                                onClick={() => setConfirmDelete(t._id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-red-500 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                    <div className="py-8 text-center flex flex-col items-center gap-2 opacity-40">
                                        <span className="material-symbols-outlined text-4xl">event_available</span>
                                        <p className="text-xs font-bold italic text-slate-500">No events for this day</p>
                                    </div>
                            )}
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-700 w-full my-1"></div>

                        {/* Quick Add Form Section */}
                        {!isReadOnly && (
                            <div className="space-y-4 pt-2">
                                    <input
                                        type="text"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="Event Title"
                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                        autoFocus
                                    />
                                    <textarea
                                        value={newTaskDescription}
                                        onChange={(e) => setNewTaskDescription(e.target.value)}
                                        placeholder="Add notes or event details..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none resize-none custom-scrollbar"
                                    />

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
                            )}
                        </div>
                    </div>
                )}

            <div className="mt-6 flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 justify-center">
                <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-purple-500"></div>
                    Events & Notes
                </div>
            </div>
            </div>
        </>
    );
};

export default FullCalendar;
