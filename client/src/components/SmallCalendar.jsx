/* eslint-disable */
import React from 'react';

function SmallCalendar() {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-4 shadow-none flex flex-col justify-between h-[260px] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">October</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Monthly Overview</p>
                </div>
                <div className="flex gap-1">
                    <button className="p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#000000] text-slate-500 dark:text-slate-400 transition-colors">
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button className="p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#000000] text-slate-500 dark:text-slate-400 transition-colors">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-7 text-center mb-1">
                    <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-0.5">S</div>
                    <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-0.5">M</div>
                    <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-0.5">T</div>
                    <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-0.5">W</div>
                    <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-0.5">T</div>
                    <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-0.5">F</div>
                    <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-0.5">S</div>
                </div>

                <div className="grid grid-cols-7 text-center text-xs gap-y-0 mt-auto">
                    {[24, 25, 26, 27, 28, 29, 30].map(d => (
                        <div key={`prev-${d}`} className="text-slate-300 dark:text-slate-700 py-1">{d}</div>
                    ))}

                    {[...Array(23)].map((_, i) => (
                        <div key={i + 1} className="text-slate-900 dark:text-slate-100 py-1 hover:bg-slate-50 dark:hover:bg-[#000000] rounded cursor-pointer">
                            {i + 1}
                        </div>
                    ))}

                    <div className="bg-primary text-white py-1 rounded font-bold shadow-none cursor-pointer">24</div>

                    <div className="relative py-1 hover:bg-slate-50 dark:hover:bg-[#000000] rounded cursor-pointer">
                        <span className="text-slate-900 dark:text-slate-100 relative z-10">25</span>
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span>
                    </div>

                    {[26, 27, 28, 29, 30, 31].map(d => (
                        <div key={`cur-${d}`} className="text-slate-900 dark:text-slate-100 py-1 hover:bg-slate-50 dark:hover:bg-[#000000] rounded cursor-pointer">{d}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SmallCalendar;
