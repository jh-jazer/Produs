/* eslint-disable */
import React, { useState } from 'react';
import { motion } from 'framer-motion';

function SmallCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none flex flex-col justify-between min-h-[300px] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out font-inter overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none">{months[month]}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 uppercase font-black tracking-widest">{year}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={prevMonth}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#000000] text-slate-500 dark:text-slate-400 transition-colors border border-slate-200 dark:border-white/10"
                    >
                        <span className="material-symbols-outlined text-sm leading-none">chevron_left</span>
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#000000] text-slate-500 dark:text-slate-400 transition-colors border border-slate-200 dark:border-white/10"
                    >
                        <span className="material-symbols-outlined text-sm leading-none">chevron_right</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-7 text-center mb-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 text-center text-[11px] gap-y-0.5 font-medium select-none">
                    {/* Previous Month Days */}
                    {[...Array(firstDayOfMonth)].map((_, i) => {
                        const d = daysInPrevMonth - firstDayOfMonth + i + 1;
                        return (
                            <div key={`prev-${d}`} className="text-slate-200 dark:text-slate-700 py-1">{d}</div>
                        );
                    })}

                    {/* Current Month Days */}
                    {[...Array(daysInMonth)].map((_, i) => {
                        const d = i + 1;
                        const date = new Date(year, month, d);
                        const isToday = date.toDateString() === today.toDateString();

                        return (
                            <div
                                key={`curr-${d}`}
                                className={`py-1 rounded-md cursor-pointer transition-colors leading-none flex items-center justify-center relative group ${isToday
                                    ? 'bg-primary text-white font-bold shadow-none shadow-primary/20'
                                    : 'text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#000000]'
                                    }`}
                            >
                                {d}
                                {isToday && (
                                    <motion.div
                                        layoutId="today-indicator"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                                    />
                                )}
                            </div>
                        );
                    })}

                    {/* Next Month Days */}
                    {[...Array(42 - daysInMonth - firstDayOfMonth)].map((_, i) => {
                        const d = i + 1;
                        return (
                            <div key={`next-${d}`} className="text-slate-200 dark:text-slate-700 py-1">{d}</div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default SmallCalendar;
