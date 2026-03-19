import React from 'react';

const ConsistencyGrid = ({ checks = {}, isPartnerView = false, myUserId = null, partnerUserId = null }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [selectedYear, setSelectedYear] = React.useState(today.getFullYear());
    const [isYearOpen, setIsYearOpen] = React.useState(false);

    const totalWeeks = 53;
    const totalCells = totalWeeks * 7;

    // Calculate start date: The first Sunday of or before Jan 1st of the selected year
    const startDate = React.useMemo(() => {
        const firstDayOfYear = new Date(selectedYear, 0, 1);
        const dayOfWeek = firstDayOfYear.getDay(); // 0 is Sunday
        const d = new Date(firstDayOfYear);
        d.setDate(firstDayOfYear.getDate() - dayOfWeek);
        return d;
    }, [selectedYear]);

    // The grid view actually ends 53 weeks after the start date
    const gridEndDate = React.useMemo(() => {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + (totalCells - 1));
        return d;
    }, [startDate, totalCells]);

    // Dynamically calculate month labels based on the first day of each week
    const monthLabels = React.useMemo(() => {
        const labels = [];
        let prevMonth = -1;

        for (let w = 0; w < totalWeeks; w++) {
            const weekDate = new Date(startDate);
            weekDate.setDate(startDate.getDate() + (w * 7));
            const currentMonth = weekDate.getMonth();
            const currentYear = weekDate.getFullYear();

            // Only add label if it's a new month AND it belongs to the selected year
            if (currentMonth !== prevMonth && currentYear === selectedYear) {
                labels.push({
                    month: weekDate.toLocaleDateString('en-US', { month: 'short' }),
                    index: w
                });
                prevMonth = currentMonth;
            }
        }
        return labels;
    }, [startDate, selectedYear]);

    const getIntensity = (dateStr) => {
        let myCount = 0;
        let partnerCount = 0;

        Object.values(checks).forEach(habitInfo => {
            if (habitInfo.completed[dateStr]) {
                if (habitInfo.user === myUserId) myCount++;
                else partnerCount++;
            }
        });
        return { myCount, partnerCount };
    };

    const getCellData = (index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);

        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        const isFuture = date > today;
        const isWrongYear = date.getFullYear() !== selectedYear;
        const { myCount, partnerCount } = getIntensity(dateStr);
        const colIndex = Math.floor(index / 7);

        return { date, dateStr, isFuture, isWrongYear, myCount, partnerCount, colIndex };
    };

    const years = [2024, 2025, 2026];

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm font-inter flex flex-col h-[500px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shrink-0">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none tracking-tight">
                        {isPartnerView ? 'Partner Activity Sync' : 'Consistency Grid'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        {isPartnerView ? '🟦 Me lead • 🟪 Partner lead • 🟨 Perfectly synced' : `Yearly activity trends for ${selectedYear}`}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Year Selector Dropdown */}
                    <div className="relative z-30">
                        <button
                            onClick={() => setIsYearOpen(!isYearOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-[10px] font-black rounded-lg border border-slate-200 dark:border-slate-700 transition-all hover:bg-slate-100"
                        >
                            <span>{selectedYear}</span>
                            <span className={`material-symbols-outlined text-xs transition-transform ${isYearOpen ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                        
                        {isYearOpen && (
                            <div className="absolute top-full right-0 mt-2 w-24 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[60] overflow-hidden animate-in zoom-in-95 duration-200">
                                {years.map(y => (
                                    <button
                                        key={y}
                                        onClick={() => { setSelectedYear(y); setIsYearOpen(false); }}
                                        className={`w-full px-4 py-2 text-[10px] font-bold text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedYear === y ? 'text-primary' : 'text-slate-500'}`}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/30 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800/50">
                        <div className="flex gap-1">
                            {isPartnerView ? (
                                <>
                                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></span>
                                    <span className="w-2.5 h-2.5 rounded-sm bg-yellow-400"></span>
                                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                                    <span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span>
                                </>
                            ) : (
                                <>
                                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></span>
                                    <span className="w-2.5 h-2.5 rounded-sm bg-primary/20"></span>
                                    <span className="w-2.5 h-2.5 rounded-sm bg-primary/40"></span>
                                    <span className="w-2.5 h-2.5 rounded-sm bg-primary/60"></span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {/* Header for Days - Sticky to top */}
                <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#192233]/95 backdrop-blur pt-2 pb-2 pl-12 pr-2">
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                            <span key={idx} className="flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">{day}</span>
                        ))}
                    </div>
                </div>

                <div className="flex relative pl-2 pr-2">
                    {/* Y-axis: Months */}
                    <div className="w-10 shrink-0 relative border-r border-slate-100 dark:border-slate-800/50 mr-2">
                        {monthLabels.map((l, i) => (
                            <div 
                                key={i} 
                                className="absolute text-[10px] font-black text-slate-400 uppercase tracking-tighter text-right w-full pr-2"
                                style={{ top: `${(l.index / totalWeeks) * 100}%`, marginTop: '4px' }}
                            >
                                {l.month}
                            </div>
                        ))}
                    </div>

                    {/* Cells */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-1 pb-6 w-full h-max">
                        {[...Array(totalCells)].map((_, i) => {
                            const { date, isFuture, isWrongYear, myCount, partnerCount } = getCellData(i);

                            let cellClass = 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
                            let statusText = 'No activity';

                            if (!isWrongYear && !isFuture) {
                                if (isPartnerView) {
                                    if (myCount > 0 || partnerCount > 0) {
                                        if (myCount > partnerCount) {
                                            cellClass = 'bg-blue-500 border-blue-400 text-white';
                                            statusText = `I led with ${myCount}`;
                                        } else if (partnerCount > myCount) {
                                            cellClass = 'bg-purple-500 border-purple-400 text-white';
                                            statusText = `Partner led with ${partnerCount}`;
                                        } else {
                                            cellClass = 'bg-yellow-400 border-yellow-300 text-slate-900';
                                            statusText = `Synced! (${myCount} each)`;
                                        }
                                    }
                                } else {
                                    const themes = [
                                        'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
                                        'bg-primary/20 border-primary/10',
                                        'bg-primary/40 border-primary/10',
                                        'bg-primary/60 border-primary/10',
                                        'bg-primary/80 border-primary/10',
                                        'bg-primary border-primary/20'
                                    ];
                                    // Make sure we never index out of bounds
                                    const total = myCount + partnerCount;
                                    const level = Math.min(total, themes.length - 1);
                                    cellClass = themes[level];
                                    statusText = total > 0 ? `${total} completed` : 'No activity';
                                }
                            }

                            const rowIndex = Math.floor(i / 7);
                            const colIndex = i % 7;

                            // Tooltip alignment
                            const xAlign = colIndex < 3 ? 'left-0' : colIndex > 3 ? 'right-0' : 'left-1/2 -translate-x-1/2';
                            const yAlign = rowIndex < 4 ? 'top-full mt-2' : 'bottom-full mb-2';

                            return (
                                <div
                                    key={i}
                                    className={`w-full aspect-square sm:min-h-[24px] max-h-[36px] rounded-md border-[0.5px] ${cellClass} transition-all duration-300 relative group cursor-pointer ${isWrongYear ? 'opacity-0 pointer-events-none' : (isFuture ? 'opacity-20 cursor-not-allowed' : '')}`}
                                >
                                    {!isWrongYear && (
                                        <div className={`absolute ${yAlign} ${xAlign} px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] whitespace-nowrap font-black shadow-xl border border-slate-700 dark:border-slate-200 ring-4 ring-black/5 dark:ring-white/5`}>
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                {!isWrongYear && !isFuture && (
                                                    <span className={`${isPartnerView ? 'text-slate-500 font-bold' : 'text-primary font-bold'}`}>
                                                        {statusText}
                                                    </span>
                                                )}
                                                {isFuture && <span className="text-slate-500 italic">Future</span>}
                                            </div>
                                        </div>
                                    )}
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
