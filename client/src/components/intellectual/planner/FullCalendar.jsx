import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { usePlanner } from '../../../hooks/usePlanner';

const FullCalendar = ({ onDateSelect, selectedDate, viewMode = 'me', isReadOnly = false }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [addModal, setAddModal] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const { tasks, addTask: addTaskLocal, deleteTask: deleteTaskLocal } = usePlanner({ year, month: month + 1 });

    const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));

    const addTask = async () => {
        if (!newTaskTitle.trim()) return;
        const startStr = addModal.startDate.toLocaleDateString('en-CA');
        await addTaskLocal({
            title: newTaskTitle.trim(),
            description: newTaskDescription.trim(),
            date: startStr,
            type: 'event',
            color: 'white'
        });
        setNewTaskTitle('');
        setNewTaskDescription('');
        setAddModal(null);
    };

    const getTasksForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return tasks?.filter(t => t.type === 'event' && (t.date === dateStr || (t.endDate && dateStr >= t.date && dateStr <= t.endDate))) || [];
    };

    return (
        <div className="flex flex-col font-sans text-white relative">
            <div className="absolute -top-16 right-0 flex gap-2 z-20">
                <button onClick={prevMonth} className="size-10 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all">
                    <span className="material-symbols-outlined text-sm">west</span>
                </button>
                <button onClick={nextMonth} className="size-10 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all">
                    <span className="material-symbols-outlined text-sm">east</span>
                </button>
            </div>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="PURGE_EVENT"
                message="Confirm deletion of strategic calendar event."
                confirmLabel="PURGE"
                onConfirm={async () => { if (confirmDelete) { await deleteTaskLocal(confirmDelete); setConfirmDelete(null); } }}
                onCancel={() => setConfirmDelete(null)}
            />

            <div className="grid grid-cols-7 border-b border-white/10 mb-2">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <div key={day} className="py-3 text-center text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 auto-rows-[60px] md:auto-rows-[80px]">
                {[...Array(firstDayOfMonth)].map((_, i) => <div key={`p-${i}`} className="border-b border-r border-white/5 opacity-10" />)}
                {[...Array(daysInMonth)].map((_, i) => {
                    const d = i + 1;
                    const date = new Date(year, month, d);
                    const isToday = date.toDateString() === today.toDateString();
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const dayTasks = getTasksForDay(d);

                    return (
                        <div
                            key={d}
                            onClick={() => { onDateSelect(date); setAddModal({ startDate: date, endDate: date }); }}
                            className={`border-b border-r border-white/5 p-2 transition-all cursor-pointer group relative hover:bg-white/[0.03] ${isSelected ? 'bg-white/[0.05]' : ''}`}
                        >
                            <span className={`size-6 flex items-center justify-center text-xs font-black transition-all ${isToday ? 'bg-white text-black' : isSelected ? 'text-white' : 'text-white/30 group-hover:text-white/60'}`}>
                                {d}
                            </span>
                            <div className="mt-2 flex flex-col gap-1">
                                {dayTasks.slice(0, 2).map((t, idx) => (
                                    <div key={idx} className="h-1 bg-white opacity-40 rounded-full w-full" />
                                ))}
                                {dayTasks.length > 2 && <div className="text-[7px] font-black text-white/20">+{dayTasks.length - 2} MORE</div>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Event Modal */}
            {addModal && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-md">
                    <div className="absolute inset-0 bg-black/80" onClick={() => setAddModal(null)} />
                    <div className="relative w-full max-w-md bg-[#0a0a0a] border-4 border-white p-8 shadow-[0_0_100px_rgba(255,255,255,0.1)]">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">CALENDAR // EVENT_NODE</span>
                                <h3 className="text-xl font-black uppercase tracking-tighter italic">{addModal.startDate.toDateString()}</h3>
                            </div>
                            <button onClick={() => setAddModal(null)} className="text-white/40 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        <div className="flex flex-col gap-6">
                            {getTasksForDay(addModal.startDate.getDate()).length > 0 && (
                                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                    {getTasksForDay(addModal.startDate.getDate()).map(t => (
                                        <div key={t._id} className="p-3 bg-white/5 border border-white/10 flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-white/80">{t.title}</span>
                                            <button onClick={() => setConfirmDelete(t._id)} className="text-white/20 hover:text-white"><span className="material-symbols-outlined text-xs">delete</span></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!isReadOnly && (
                                <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
                                    <input 
                                        value={newTaskTitle}
                                        onChange={e => setNewTaskTitle(e.target.value)}
                                        placeholder="EVENT_IDENTIFIER..."
                                        className="w-full bg-white/5 border border-white/10 p-4 text-sm font-black uppercase tracking-widest focus:border-white transition-all outline-none"
                                        autoFocus
                                    />
                                    <button onClick={addTask} className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.5em] text-[10px] hover:bg-white/90 active:scale-95 transition-all">
                                        ADD_EVENT
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default FullCalendar;
