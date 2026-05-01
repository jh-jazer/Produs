import React, { useState } from 'react';

const WaterTracker = ({ metrics, addHealthLog, deleteHealthLog }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [waterAmount, setWaterAmount] = useState('');

    const latest = metrics
        .filter(m => m.details?.metricType === 'water')
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!waterAmount) return;

        addHealthLog('metric', {
            title: 'Water Intake',
            date: new Date().toISOString().split('T')[0],
            details: {
                metricType: 'water',
                value: parseFloat(waterAmount),
                unit: 'L'
            }
        });

        setWaterAmount('');
        setIsAdding(false);
    };

    return (
        <div className="flex flex-col gap-4 relative group">
            <div className="flex justify-between items-center relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">WATER INTAKE</span>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="size-8 rounded-sm border border-white/10 text-white/40 hover:bg-white hover:text-black transition-all flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-lg">{isAdding ? 'close' : 'add'}</span>
                </button>
            </div>

            {isAdding ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 relative z-10 animate-in fade-in slide-in-from-top-2">
                    <div className="relative">
                        <input
                            type="number"
                            step="0.1"
                            value={waterAmount}
                            onChange={(e) => setWaterAmount(e.target.value)}
                            placeholder="LITERS..."
                            autoFocus
                            className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm text-white outline-none focus:border-white/40 transition-all font-black uppercase tracking-widest placeholder:opacity-20"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 uppercase tracking-widest">L</span>
                    </div>
                    <button type="submit" className="w-full py-3 bg-white text-black rounded-sm text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/90 active:scale-[0.98] transition-all">
                        SAVE LOG
                    </button>
                </form>
            ) : (
                <div className="flex items-baseline gap-4 relative z-10">
                    <span className="text-6xl font-black text-white tracking-tighter italic">
                        {latest?.details?.value || '0.0'}
                    </span>
                    <span className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">LITERS TOTAL</span>
                </div>
            )}
        </div>
    );
};

export default WaterTracker;
