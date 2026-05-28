import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { usePlanner } from '../../../hooks/usePlanner';
import { DashboardContext } from '../../../context/DashboardContext';

const ChippedBorder = ({ opacity = 0.8 }) => (
    <div 
      className="absolute inset-[-1px] rounded-sm pointer-events-none z-0"
      style={{
        border: '2px solid white',
        opacity,
        clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
      }}
    />
);

const FullCalendar = ({ onDateSelect, selectedDate, viewMode = 'me', isReadOnly = false }) => {
    const { setIsAddEventModalOpen, setAddEventInitialDate } = useContext(DashboardContext);
    const [viewDate, setViewDate] = useState(new Date());
    const [addModal, setAddModal] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const { tasks, deleteTask: deleteTaskLocal, updateTask } = usePlanner({ year, month: month + 1 });

    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editColor, setEditColor] = useState('');

    const colors = [
        { id: 'cyan', bg: 'bg-cyan-500' },
        { id: 'rose', bg: 'bg-rose-500' },
        { id: 'emerald', bg: 'bg-emerald-500' },
        { id: 'amber', bg: 'bg-amber-500' },
        { id: 'purple', bg: 'bg-purple-500' },
    ];

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));

    const getTasksForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return tasks?.filter(t => t.type === 'event' && (t.date === dateStr || (t.endDate && dateStr >= t.date && dateStr <= t.endDate))) || [];
    };

    return (
        <div className="flex flex-col font-sans text-foreground relative h-[400px] md:h-[508px]">
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="DELETE EVENT"
                message="Are you sure you want to delete this event? This action cannot be undone."
                confirmLabel="DELETE"
                onConfirm={async () => { if (confirmDelete) { await deleteTaskLocal(confirmDelete); setConfirmDelete(null); } }}
                onCancel={() => setConfirmDelete(null)}
            />

            <div className="grid grid-cols-7 gap-2 md:gap-3 border-b border-black/10 dark:border-white/10 mb-4 pb-2">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <div key={day} className="text-center text-[9px] font-black text-black/50 dark:text-white/50 uppercase tracking-[0.3em]">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-3">
                {[...Array(firstDayOfMonth)].map((_, i) => <div key={`p-${i}`} className="opacity-0 pointer-events-none" />)}
                {[...Array(daysInMonth)].map((_, i) => {
                    const d = i + 1;
                    const date = new Date(year, month, d);
                    const isToday = date.toDateString() === today.toDateString();
                    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                    const dayTasks = getTasksForDay(d);
                    const rangeEvents = dayTasks.filter(t => t.endDate);
                    const singleEvents = dayTasks.filter(t => !t.endDate);
                    const hasRangeEvent = rangeEvents.length > 0;
                    
                    const colorHexMap = {
                        cyan: '#06b6d4',
                        rose: '#f43f5e',
                        emerald: '#10b981',
                        amber: '#f59e0b',
                        purple: '#a855f7'
                    };

                    let indicatorGradient = '';
                    if (hasRangeEvent) {
                        const colors = rangeEvents.map(e => colorHexMap[e.color] || colorHexMap.cyan);
                        const step = 100 / colors.length;
                        indicatorGradient = `linear-gradient(to right, ${colors.map((c, i) => `${c} ${i * step}%, ${c} ${(i + 1) * step}%`).join(', ')})`;
                    }

                    return (
                        <div
                            key={d}
                            onClick={() => { onDateSelect(date); setAddModal({ startDate: date, endDate: date }); }}
                            className={`h-[60px] md:h-[80px] border border-black/15 dark:border-white/20 hover:border-black/40 dark:hover:border-white/60 rounded-sm p-2 flex flex-col items-end transition-all cursor-pointer group relative hover:bg-black/5 dark:hover:bg-white/[0.08] ${isSelected ? 'bg-black/[0.03] dark:bg-white/[0.05]' : ''}`}
                        >
                            {hasRangeEvent && (
                                <div 
                                    className="absolute bottom-0 left-0 right-0 h-[2px] z-20" 
                                    style={{ background: indicatorGradient }}
                                />
                            )}
                            <span className={`size-12 md:size-16 flex items-center justify-center text-2xl md:text-4xl font-black transition-all rounded-sm ${isToday ? 'bg-black text-white dark:bg-white dark:text-black' : isSelected ? 'text-black dark:text-white' : 'text-black/40 dark:text-white/60 group-hover:text-black dark:group-hover:text-white'}`}>
                                {d}
                            </span>
                            <div className="absolute bottom-2 left-2.5 flex items-center h-4">
                                {singleEvents.length === 1 && (
                                    <div className="size-1 md:size-1.5 bg-black dark:bg-white rounded-full shadow-sm" />
                                )}
                                {singleEvents.length > 1 && singleEvents.length <= 9 && (
                                    <div className="flex items-center gap-0.5">
                                        <span className="text-[9px] md:text-[10px] font-black text-black/35 dark:text-white/40 italic tracking-tighter">{singleEvents.length}</span>
                                        <div className="size-1 bg-black/30 dark:bg-white/40 rounded-full mt-0.5" />
                                    </div>
                                )}
                                {singleEvents.length > 9 && (
                                    <span className="text-[9px] md:text-[10px] font-black text-black/35 dark:text-white/40 italic tracking-tighter bg-black/5 dark:bg-white/5 px-1 rounded-sm border border-black/5 dark:border-white/5">
                                        9+
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
                
                <div className="col-start-4 col-span-4 row-start-6 flex justify-end items-end p-2 h-[50px] md:h-[60px]">
                    <div className="flex items-center gap-6 md:gap-8 mr-2">
                        <button onClick={prevMonth} className="text-black dark:text-white hover:text-black/40 dark:hover:text-white/40 transition-all">
                            <span className="material-symbols-outlined text-xl md:text-2xl">chevron_left</span>
                        </button>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.5em] whitespace-nowrap text-black dark:text-white">
                                {months[month]} {year}
                            </span>
                        </div>
                        <button onClick={nextMonth} className="text-black dark:text-white hover:text-black/40 dark:hover:text-white/40 transition-all">
                            <span className="material-symbols-outlined text-xl md:text-2xl">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {addModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setAddModal(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/20 rounded-sm pt-6 px-6 pb-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                            <ChippedBorder opacity={0.3} />

                            <div className="relative z-10 flex flex-col gap-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">CALENDAR EVENT</span>
                                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">{addModal.startDate.toDateString().toUpperCase()}</span>
                                    </div>
                                    <button onClick={() => setAddModal(null)} className="material-symbols-outlined text-white/20 hover:text-white transition-colors">close</button>
                                </div>

                                <div className="flex flex-col gap-6">
                                    {getTasksForDay(addModal.startDate.getDate()).length > 0 ? (
                                        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                            {getTasksForDay(addModal.startDate.getDate()).map(t => (
                                                <div key={t._id} className="p-4 bg-white/[0.02] border border-white/5 flex flex-col gap-4 group/item hover:border-white/20 transition-all">
                                                    {editingId === t._id ? (
                                                        <div className="flex flex-col gap-4">
                                                            <div className="flex flex-col gap-2">
                                                                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">EDIT NAME:</span>
                                                                <input
                                                                    autoFocus
                                                                    value={editTitle}
                                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                                    className="w-full bg-white/5 border border-white/10 p-2 rounded-sm text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-white/40"
                                                                />
                                                            </div>

                                                            {t.endDate && (
                                                                <div className="flex flex-col gap-2">
                                                                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">PROTOCOL COLOR:</span>
                                                                    <div className="flex gap-2">
                                                                        {colors.map(c => (
                                                                            <button
                                                                                key={c.id}
                                                                                onClick={() => setEditColor(c.id)}
                                                                                className={`size-6 rounded-full border transition-all flex items-center justify-center ${editColor === c.id ? 'border-white scale-110' : 'border-transparent opacity-40'}`}
                                                                            >
                                                                                <div className={`size-3 rounded-full ${c.bg}`} />
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="flex gap-2">
                                                                <button 
                                                                    onClick={async () => {
                                                                        await updateTask(t._id, { title: editTitle, color: editColor });
                                                                        setEditingId(null);
                                                                    }}
                                                                    className="flex-1 py-2 bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-sm hover:bg-white/90"
                                                                >
                                                                    SAVE
                                                                </button>
                                                                <button 
                                                                    onClick={() => setEditingId(null)}
                                                                    className="px-4 py-2 bg-white/5 text-white/40 text-[9px] font-black uppercase tracking-[0.2em] rounded-sm hover:bg-white/10 hover:text-white"
                                                                >
                                                                    CANCEL
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-between items-center w-full">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    {t.endDate && (
                                                                        <div className={`size-1.5 rounded-full ${colors.find(c => c.id === t.color)?.bg || 'bg-cyan-500'}`} />
                                                                    )}
                                                                    <span className="text-[10px] font-black uppercase tracking-wider text-white">{t.title}</span>
                                                                </div>
                                                                {t.recurrence && <span className="text-[7px] font-mono text-white/20 uppercase tracking-widest">{t.recurrence}</span>}
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-all">
                                                                <button 
                                                                    onClick={() => {
                                                                        setEditingId(t._id);
                                                                        setEditTitle(t.title);
                                                                        setEditColor(t.color || 'cyan');
                                                                    }} 
                                                                    className="size-8 flex items-center justify-center rounded-sm text-white/10 hover:text-white hover:bg-white/5 transition-all"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                                </button>
                                                                <button 
                                                                    onClick={() => setConfirmDelete(t._id)} 
                                                                    className="size-8 flex items-center justify-center rounded-sm text-white/10 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-sm bg-white/[0.01]">
                                            <span className="material-symbols-outlined text-white/10 text-4xl mb-2">event_busy</span>
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">NO EVENTS SCHEDULED</span>
                                        </div>
                                    )}

                                    {!isReadOnly && (
                                        <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
                                            <button 
                                                onClick={() => {
                                                    setAddEventInitialDate(addModal.startDate);
                                                    setAddModal(null);
                                                    setIsAddEventModalOpen(true);
                                                }} 
                                                className="w-full p-4 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] rounded-sm hover:bg-white/90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                                ADD NEW EVENT
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none">
                                <span className="material-symbols-outlined text-8xl">event_note</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FullCalendar;
