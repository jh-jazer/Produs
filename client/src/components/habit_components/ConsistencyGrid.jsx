import React from 'react';

const ConsistencyGrid = ({ checks = {} }) => {
    // Correct week spans for month alignment in a 53-week view
    const monthWeeks = [
        { label: 'Jan', span: 4 },
        { label: 'Feb', span: 4 },
        { label: 'Mar', span: 5 },
        { label: 'Apr', span: 4 },
        { label: 'May', span: 4 },
        { label: 'Jun', span: 5 },
        { label: 'Jul', span: 4 },
        { label: 'Aug', span: 4 },
        { label: 'Sep', span: 5 },
        { label: 'Oct', span: 4 },
        { label: 'Nov', span: 4 },
        { label: 'Dec', span: 5 }
    ];

    const totalCells = 53 * 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate intensity for a given date
    const getIntensity = (dateStr) => {
        let count = 0;
        Object.values(checks).forEach(habitChecks => {
            if (habitChecks[dateStr]) count++;
        });
        return count;
    };

    // Calculate dates for the grid
    // We want the last day (bottom right) to be the most recent Saturday of the current week
    const lastDay = new Date(today);
    lastDay.setDate(today.getDate() + (6 - today.getDay())); // Move to Saturday

    const getCellData = (index) => {
        const date = new Date(lastDay);
        const daysToSubtract = (totalCells - 1) - index;
        date.setDate(lastDay.getDate() - daysToSubtract);

        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const isFuture = date > today;
        const count = getIntensity(dateStr);

        return { date, dateStr, isFuture, count };
    };

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm font-inter min-h-[220px]">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-lg font-bold dark:text-white leading-none tracking-tight">Consistency Grid</h3>
                    <p className="text-xs text-slate-500 mt-1">Yearly view of your activity across all categories</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></span>
                        <span className="w-2.5 h-2.5 rounded-sm bg-primary/20"></span>
                        <span className="w-2.5 h-2.5 rounded-sm bg-primary/40"></span>
                        <span className="w-2.5 h-2.5 rounded-sm bg-primary/60"></span>
                        <span className="w-2.5 h-2.5 rounded-sm bg-primary/80"></span>
                        <span className="w-2.5 h-2.5 rounded-sm bg-primary"></span>
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="flex gap-2">
                <div className="flex flex-col gap-1 pr-2 pt-6">
                    <div className="h-2.5"></div>
                    <span className="text-[9px] font-bold text-slate-400 h-2.5 flex items-center uppercase">Mon</span>
                    <div className="h-2.5"></div>
                    <span className="text-[9px] font-bold text-slate-400 h-2.5 flex items-center uppercase">Wed</span>
                    <div className="h-2.5"></div>
                    <span className="text-[9px] font-bold text-slate-400 h-2.5 flex items-center uppercase">Fri</span>
                    <div className="h-2.5"></div>
                </div>

                <div className="flex-1 overflow-x-auto custom-scrollbar pb-3">
                    <div className="grid grid-flow-col auto-cols-[minmax(10px,1fr)] gap-1 mb-2">
                        {monthWeeks.map(m => (
                            <div key={m.label} style={{ gridColumn: `span ${m.span}` }} className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                {m.label}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-flow-col grid-rows-7 gap-1 w-max">
                        {[...Array(totalCells)].map((_, i) => {
                            const { date, dateStr, isFuture, count } = getCellData(i);

                            const themes = [
                                'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
                                'bg-primary/20 border-primary/10',
                                'bg-primary/40 border-primary/10',
                                'bg-primary/60 border-primary/10',
                                'bg-primary/80 border-primary/10',
                                'bg-primary border-primary/20'
                            ];

                            const level = Math.min(count, themes.length - 1);
                            const cellClass = themes[level];

                            return (
                                <div
                                    key={i}
                                    className={`w-2.5 h-2.5 rounded-sm border-[0.5px] ${cellClass} transition-all duration-300 cursor-pointer relative group ${isFuture ? 'opacity-20 cursor-not-allowed' : ''}`}
                                >
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap font-black shadow-xl border border-slate-700 dark:border-slate-200 ring-4 ring-black/5 dark:ring-white/5">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            {!isFuture && (
                                                <span className="text-primary font-bold">
                                                    {count > 0 ? `${count} habits completed` : 'No activity'}
                                                </span>
                                            )}
                                            {isFuture && <span className="text-slate-400 italic font-medium">Future Date</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsistencyGrid;
