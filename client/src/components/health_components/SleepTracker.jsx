import React, { useState } from 'react';

const SleepTracker = ({ metrics, addHealthLog, deleteHealthLog }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [sleepStart, setSleepStart] = useState('');
    const [sleepEnd, setSleepEnd] = useState('');

    const latest = metrics
        .filter(m => m.details?.metricType === 'sleep')
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!sleepStart || !sleepEnd) return;

        const start = new Date(`1970-01-01T${sleepStart}`);
        let end = new Date(`1970-01-01T${sleepEnd}`);
        if (end < start) end.setDate(end.getDate() + 1);
        
        const logValue = (end - start) / (1000 * 60 * 60);

        addHealthLog('metric', {
            title: 'Sleep',
            date: new Date().toISOString().split('T')[0],
            details: {
                metricType: 'sleep',
                sleepStart,
                sleepEnd,
                value: parseFloat(logValue.toFixed(1)),
                unit: 'hrs'
            }
        });

        setIsAdding(false);
        setSleepStart('');
        setSleepEnd('');
    };

    return (
        <div className="flex flex-col gap-4 relative group">
            <div className="flex justify-between items-center relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">SLEEP TRACKER</span>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="size-8 rounded-sm border border-white/10 text-white/40 hover:bg-white hover:text-black transition-all flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-lg">{isAdding ? 'close' : 'add'}</span>
                </button>
            </div>

            {isAdding ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black text-white/20 uppercase tracking-widest px-1">START TIME</label>
                            <input
                                type="time"
                                value={sleepStart}
                                onChange={(e) => setSleepStart(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm text-white outline-none focus:border-white/40 transition-all font-black"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black text-white/20 uppercase tracking-widest px-1">END TIME</label>
                            <input
                                type="time"
                                value={sleepEnd}
                                onChange={(e) => setSleepEnd(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm text-white outline-none focus:border-white/40 transition-all font-black"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-white text-black rounded-sm text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/90 active:scale-[0.98] transition-all">
                        SAVE SLEEP
                    </button>
                </form>
            ) : (
                <div className="flex flex-col gap-4 relative z-10">
                    <div className="flex items-baseline gap-4">
                        <span className="text-6xl font-black text-white tracking-tighter italic">
                            {latest?.details?.value || '0.0'}
                        </span>
                        <span className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">HOURS SLEEP</span>
                    </div>
                    {latest?.details?.sleepStart && (
                        <div className="text-[9px] text-white/40 font-black tracking-[0.2em] uppercase border border-white/5 px-3 py-1 rounded-sm w-fit">
                            SLEEP: {latest.details.sleepStart} - {latest.details.sleepEnd}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SleepTracker;
