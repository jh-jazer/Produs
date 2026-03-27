import React from 'react';

const ConsistencyGrid = ({ checks = {}, isPartnerView = false, myUserId = null, partnerUserId = null }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [selectedYear, setSelectedYear] = React.useState(today.getFullYear());
    const [isYearOpen, setIsYearOpen] = React.useState(false);

    const totalWeeks = 53;
    const totalCells = totalWeeks * 7;

    const years = [2024, 2025, 2026];

    const startDate = React.useMemo(() => {
        const firstDayOfYear = new Date(selectedYear, 0, 1);
        const dayOfWeek = firstDayOfYear.getDay();
        const d = new Date(firstDayOfYear);
        d.setDate(firstDayOfYear.getDate() - dayOfWeek);
        return d;
    }, [selectedYear]);

    const monthLabels = React.useMemo(() => {
        const labels = [];
        let prevMonth = -1;
        for (let w = 0; w < totalWeeks; w++) {
            const weekDate = new Date(startDate);
            weekDate.setDate(startDate.getDate() + (w * 7));
            const currentMonth = weekDate.getMonth();
            const currentYear = weekDate.getFullYear();
            if (currentMonth !== prevMonth && currentYear === selectedYear) {
                labels.push({ month: weekDate.toLocaleDateString('en-US', { month: 'short' }), index: w });
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

    const getCellClass = (myCount, partnerCount, isFuture, isWrongYear) => {
        if (isWrongYear || isFuture) return 'bg-slate-100 dark:bg-[#000000] border-slate-200 dark:border-white/10';
        if (isPartnerView) {
            if (myCount === 0 && partnerCount === 0) return 'bg-slate-100 dark:bg-[#000000] border-slate-200 dark:border-white/10';
            if (myCount > partnerCount) return 'bg-blue-500 border-blue-400';
            if (partnerCount > myCount) return 'bg-purple-500 border-purple-400';
            return 'bg-yellow-400 border-yellow-300';
        } else {
            const themes = [
                'bg-slate-100 dark:bg-[#000000] border-slate-200 dark:border-white/10',
                'bg-primary/20 border-primary/10',
                'bg-primary/40 border-primary/20',
                'bg-primary/60 border-primary/30',
                'bg-primary/80 border-primary/40',
                'bg-primary border-primary/50',
            ];
            const total = myCount + partnerCount;
            return themes[Math.min(total, themes.length - 1)];
        }
    };

    const getStatusText = (myCount, partnerCount, isFuture) => {
        if (isFuture) return 'Future';
        if (isPartnerView) {
            if (myCount === 0 && partnerCount === 0) return 'No activity';
            if (myCount > partnerCount) return `You led (${myCount} vs ${partnerCount})`;
            if (partnerCount > myCount) return `Partner led (${partnerCount} vs ${myCount})`;
            return `Perfectly synced! (${myCount} each)`;
        }
        const total = myCount + partnerCount;
        return total > 0 ? `${total} habit${total !== 1 ? 's' : ''} completed` : 'No activity';
    };

    return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none font-inter flex flex-col h-[500px] md:h-auto">

            {/* ── Header ── */}
            <div className="flex flex-row justify-between items-center gap-4 mb-4 shrink-0">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none tracking-tight">
                        {isPartnerView ? 'Partner Activity Sync' : 'Consistency Grid'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        {isPartnerView ? '🟦 Me lead • 🟪 Partner lead • 🟨 Perfectly synced' : `Yearly activity trends for ${selectedYear}`}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Legend */}
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Less</span>
                        <div className="flex gap-0.5">
                            {isPartnerView ? (
                                <>
                                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-[#000000] border border-slate-200 dark:border-white/10"></span>
                                    <span className="w-2.5 h-2.5 rounded-sm bg-yellow-400"></span>
                                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                                    <span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span>
                                </>
                            ) : (
                                <>
                                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-[#000000] border border-slate-200 dark:border-white/10"></span>
                                    <span className="w-2.5 h-2.5 rounded-sm bg-primary/20"></span>
                                    <span className="w-2.5 h-2.5 rounded-sm bg-primary/40"></span>
                                    <span className="w-2.5 h-2.5 rounded-sm bg-primary/70"></span>
                                    <span className="w-2.5 h-2.5 rounded-sm bg-primary"></span>
                                </>
                            )}
                        </div>
                        <span>More</span>
                    </div>

                    {/* Year Selector */}
                    <div className="relative z-30">
                        <button
                            onClick={() => setIsYearOpen(!isYearOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-[#000000] text-[10px] font-black rounded-lg border border-slate-200 dark:border-white/10 transition-all hover:bg-slate-100 dark:hover:bg-[#121212]"
                        >
                            <span>{selectedYear}</span>
                            <span className={`material-symbols-outlined text-xs transition-transform ${isYearOpen ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                        {isYearOpen && (
                            <div className="absolute top-full right-0 mt-2 w-24 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-[60] overflow-hidden">
                                {years.map(y => (
                                    <button
                                        key={y}
                                        onClick={() => { setSelectedYear(y); setIsYearOpen(false); }}
                                        className={`w-full px-4 py-2 text-[10px] font-bold text-left hover:bg-slate-50 dark:hover:bg-[#000000] transition-colors ${selectedYear === y ? 'text-primary' : 'text-slate-500'}`}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══ MOBILE: Original portrait grid (weeks scroll vertically) ══ */}
            <div className="flex-1 overflow-y-auto md:hidden custom-scrollbar relative">
                {/* Sticky day-of-week header */}
                <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#121212]/95 backdrop-blur pt-1 pb-2 pl-12 pr-2">
                    <div className="grid grid-cols-7 gap-1">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                            <span key={idx} className="flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">{day}</span>
                        ))}
                    </div>
                </div>

                <div className="flex relative pl-2 pr-2">
                    {/* Month labels (Y-axis) */}
                    <div className="w-10 shrink-0 relative border-r border-slate-100 dark:border-white/10/50 mr-2">
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
                    <div className="grid grid-cols-7 gap-1 flex-1 pb-6 w-full h-max">
                        {[...Array(totalCells)].map((_, i) => {
                            const { date, isFuture, isWrongYear, myCount, partnerCount } = getCellData(i);
                            const cellClass = getCellClass(myCount, partnerCount, isFuture, isWrongYear);
                            const statusText = getStatusText(myCount, partnerCount, isFuture);
                            const rowIndex = Math.floor(i / 7);
                            const colIndex = i % 7;
                            const xAlign = colIndex < 3 ? 'left-0' : colIndex > 3 ? 'right-0' : 'left-1/2 -translate-x-1/2';
                            const yAlign = rowIndex < 4 ? 'top-full mt-2' : 'bottom-full mb-2';

                            return (
                                <div
                                    key={i}
                                    className={`w-full aspect-square min-h-[20px] max-h-[36px] rounded-md border-[0.5px] ${cellClass} transition-all duration-200 relative group cursor-pointer ${isWrongYear ? 'opacity-0 pointer-events-none' : isFuture ? 'opacity-20 cursor-not-allowed' : ''}`}
                                >
                                    {!isWrongYear && (
                                        <div className={`absolute ${yAlign} ${xAlign} px-2 py-1 bg-[#121212] dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] whitespace-nowrap font-bold shadow-xl`}>
                                            <div className="font-black">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                            {!isFuture && <div className="text-slate-400 dark:text-slate-500">{statusText}</div>}
                                            {isFuture && <div className="text-slate-400 italic">Future</div>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ══ DESKTOP: GitHub-style horizontal grid ══ */}
            <div className="hidden md:flex overflow-x-auto custom-scrollbar pb-2 items-start">
                <div className="flex w-max">
                    {/* Day labels */}
                    <div className="grid grid-rows-7 gap-[3px] pr-2 shrink-0 pt-6">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                            <span key={idx} className="flex items-center justify-end text-[9px] font-bold text-slate-400 uppercase h-3">
                                {idx % 2 === 1 ? day : ''}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-col">
                        {/* Month labels */}
                        <div className="relative h-5 flex shrink-0 mb-1">
                            {monthLabels.map((l, i) => (
                                <div
                                    key={i}
                                    className="absolute text-[9px] font-black text-slate-400 uppercase tracking-tight"
                                    style={{ left: `calc(${(l.index / totalWeeks) * 100}%)` }}
                                >
                                    {l.month}
                                </div>
                            ))}
                        </div>

                        {/* Cells */}
                        <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
                            {[...Array(totalCells)].map((_, i) => {
                                const { date, isFuture, isWrongYear, myCount, partnerCount, colIndex } = getCellData(i);
                                const cellClass = getCellClass(myCount, partnerCount, isFuture, isWrongYear);
                                const statusText = getStatusText(myCount, partnerCount, isFuture);
                                const tooltipLeft = colIndex < totalWeeks - 6 ? 'left-0' : 'right-0';

                                return (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-sm border-[0.5px] ${cellClass} transition-all duration-200 relative group cursor-pointer ${isWrongYear ? 'opacity-0 pointer-events-none' : isFuture ? 'opacity-20 cursor-default' : 'hover:scale-125 hover:z-10'}`}
                                    >
                                        {!isWrongYear && (
                                            <div className={`absolute bottom-full mb-2 ${tooltipLeft} px-2 py-1 bg-[#121212] dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] whitespace-nowrap font-bold shadow-xl`}>
                                                <div className="font-black">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                <div className="text-slate-400 dark:text-slate-500">{statusText}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsistencyGrid;
