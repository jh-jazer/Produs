import React, { useState } from 'react';

const BMITracker = ({ metrics, addHealthLog, deleteHealthLog }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');

    const latest = metrics
        .filter(m => m.details?.metricType === 'bmi')
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!weight || !height) return;

        const heightInMeters = parseFloat(height) / 100;
        const bmiValue = parseFloat(weight) / (heightInMeters * heightInMeters);

        // 1. Log BMI Metric
        addHealthLog('metric', {
            title: 'BMI Calculation',
            date: new Date().toISOString().split('T')[0],
            details: {
                metricType: 'bmi',
                height: parseFloat(height),
                weight: parseFloat(weight),
                value: parseFloat(bmiValue.toFixed(1)),
                unit: 'BMI'
            }
        });

        // 2. Log Weight Metric Automatically
        addHealthLog('metric', {
            title: 'Body Weight',
            date: new Date().toISOString().split('T')[0],
            details: {
                metricType: 'weight',
                value: parseFloat(weight),
                unit: 'kg'
            }
        });

        setIsAdding(false);
        setWeight('');
        setHeight('');
    };

    const getStatus = (bmi) => {
        if (!bmi) return { label: 'Unknown', color: 'text-slate-400' };
        if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-500' };
        if (bmi < 25) return { label: 'Healthy', color: 'text-emerald-500' };
        if (bmi < 30) return { label: 'Overweight', color: 'text-orange-500' };
        return { label: 'Obese', color: 'text-rose-500' };
    };

    const status = getStatus(latest?.details?.value);

    return (
        <div className="flex flex-col gap-4 relative group">
            <div className="flex justify-between items-center relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">BMI TRACKER</span>
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
                            <label className="text-[9px] font-black text-white/20 uppercase tracking-widest px-1">WEIGHT (KG)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="KG"
                                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm text-white outline-none focus:border-white/40 transition-all font-black uppercase tracking-widest placeholder:opacity-20"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black text-white/20 uppercase tracking-widest px-1">HEIGHT (CM)</label>
                            <input
                                type="number"
                                step="1"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                placeholder="CM"
                                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm text-white outline-none focus:border-white/40 transition-all font-black uppercase tracking-widest placeholder:opacity-20"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-white text-black rounded-sm text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/90 active:scale-[0.98] transition-all">
                        SAVE BIOMETRICS
                    </button>
                </form>
            ) : (
                <div className="flex flex-col gap-4 relative z-10">
                    <div className="flex items-baseline gap-4">
                        <span className="text-6xl font-black text-white tracking-tighter italic">
                            {latest?.details?.value || '0.0'}
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-[0.4em] border border-white/10 px-3 py-1 rounded-sm ${status.color}`}>
                            {status.label}
                        </span>
                    </div>
                    {latest?.details?.weight && (
                        <div className="text-[9px] text-white/20 font-black tracking-[0.3em] uppercase">
                            WEIGHT: {latest.details.weight}KG // HEIGHT: {latest.details.height}CM
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BMITracker;
