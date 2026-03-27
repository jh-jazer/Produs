import React, { useState } from 'react';

const HealthMetrics = ({ metrics, addHealthLog, deleteHealthLog }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [metricType, setMetricType] = useState('weight');
    const [value, setValue] = useState('');
    
    // New detailed states
    const [sleepStart, setSleepStart] = useState('');
    const [sleepEnd, setSleepEnd] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [waterAmount, setWaterAmount] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let logValue = 0;
        let logUnit = '';
        let logTitle = '';
        const details = { metricType };

        if (metricType === 'sleep') {
            if (!sleepStart || !sleepEnd) return;
            const start = new Date(`1970-01-01T${sleepStart}`);
            let end = new Date(`1970-01-01T${sleepEnd}`);
            if (end < start) end.setDate(end.getDate() + 1);
            
            logValue = (end - start) / (1000 * 60 * 60); // hours
            logUnit = 'hrs';
            logTitle = 'Sleep';
            details.sleepStart = sleepStart;
            details.sleepEnd = sleepEnd;
            details.value = parseFloat(logValue.toFixed(1));
            details.unit = logUnit;
        } else if (metricType === 'bmi') {
            if (!weight || !height) return;
            const heightInMeters = parseFloat(height) / 100;
            logValue = parseFloat(weight) / (heightInMeters * heightInMeters);
            logUnit = 'BMI';
            logTitle = 'BMI Calculation';
            details.height = parseFloat(height);
            details.weight = parseFloat(weight);
            details.value = parseFloat(logValue.toFixed(1));
            details.unit = logUnit;
        } else if (metricType === 'water') {
            if (!waterAmount) return;
            logValue = parseFloat(waterAmount);
            logUnit = 'L';
            logTitle = 'Water Intake';
            details.value = logValue;
            details.unit = logUnit;
        } else {
            if (!value) return;
            logValue = parseFloat(value);
            logUnit = 'kg';
            logTitle = 'Body Weight';
            details.value = logValue;
            details.unit = logUnit;
        }

        addHealthLog('metric', {
            title: logTitle,
            date: new Date().toISOString().split('T')[0],
            details
        });
        
        setValue('');
        setSleepStart('');
        setSleepEnd('');
        setWeight('');
        setHeight('');
        setWaterAmount('');
        setIsAdding(false);
    };

    return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 flex flex-col gap-6 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Health Metrics</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">Track vital stats</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-2 rounded-lg bg-electric-blue/10 text-electric-blue hover:bg-electric-blue/20 transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[16px]">{isAdding ? 'close' : 'add'}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Log Metric</span>
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#000000]/50 border border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Metric</label>
                            <select
                                value={metricType}
                                onChange={(e) => setMetricType(e.target.value)}
                                className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-electric-blue/50"
                            >
                                <option value="weight">Weight (kg)</option>
                                <option value="sleep">Sleep Tracker</option>
                                <option value="water">Water Intake (L)</option>
                                <option value="bmi">Calculate BMI</option>
                            </select>
                        </div>
                        
                        {metricType === 'sleep' ? (
                            <>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Time of Sleep</label>
                                    <input
                                        type="time"
                                        value={sleepStart}
                                        onChange={(e) => setSleepStart(e.target.value)}
                                        className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-electric-blue/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Wake up Time</label>
                                    <input
                                        type="time"
                                        value={sleepEnd}
                                        onChange={(e) => setSleepEnd(e.target.value)}
                                        className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-electric-blue/50"
                                    />
                                </div>
                            </>
                        ) : metricType === 'bmi' ? (
                            <>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Weight (kg)</label>
                                    <input
                                        type="number" step="0.1" value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-electric-blue/50"
                                        placeholder="e.g. 70"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Height (cm)</label>
                                    <input
                                        type="number" step="1" value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-electric-blue/50"
                                        placeholder="e.g. 175"
                                    />
                                </div>
                            </>
                        ) : metricType === 'water' ? (
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Amount (Liters)</label>
                                <input
                                    type="number" step="0.1" value={waterAmount}
                                    onChange={(e) => setWaterAmount(e.target.value)}
                                    className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-electric-blue/50"
                                    placeholder="e.g., 2.5"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Value &lrm;(kg)</label>
                                <input
                                    type="number" step="0.1" value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-electric-blue/50"
                                    placeholder="e.g., 70.5"
                                />
                            </div>
                        )}
                    </div>
                    <button type="submit" className="w-full py-2 bg-electric-blue text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-electric-blue/90 transition-colors">
                        Save Metric
                    </button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {['water', 'sleep', 'weight', 'bmi'].map((type) => {
                    const typeMetrics = metrics.filter(m => m.details?.metricType === type).sort((a,b) => new Date(b.date) - new Date(a.date));
                    const latest = typeMetrics[0];

                    const iconMap = {
                        weight: 'monitor_weight',
                        sleep: 'bedtime',
                        water: 'water_drop',
                        bmi: 'monitor_heart'
                    };

                    return (
                        <div key={type} className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#000000]/20 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-electric-blue text-lg">
                                    {iconMap[type]}
                                </span>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{type}</h4>
                            </div>
                            {latest ? (
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-slate-900 dark:text-white">{latest.details?.value || latest.value}</span>
                                        <span className="text-xs text-slate-400 font-bold">{latest.details?.unit || latest.unit}</span>
                                    </div>
                                    {type === 'sleep' && latest.details?.sleepStart && (
                                        <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                                            {latest.details.sleepStart} - {latest.details.sleepEnd}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span className="text-xs text-slate-400 italic mt-auto">No data</span>
                            )}
                        </div>
                    );
                })}
            </div>
            </div>

             {/* Recent logs list */}
             <div className="mt-4 flex flex-col gap-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recent Logs</p>
                {metrics.length > 0 ? metrics.slice(0, 5).map(metric => (
                     <div key={metric._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#000000]/20 border border-slate-100 dark:border-white/5 group">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{metric.title}</span>
                            <span className="text-[10px] text-slate-400">{metric.date}</span>
                        </div>
                         <div className="flex items-center gap-4">
                                 <div className="flex flex-col gap-1 items-end">
                                    <div className="text-right flex items-baseline gap-1">
                                        <span className="text-sm font-black text-electric-blue">{metric.details?.value || metric.value}</span>
                                        <span className="text-[10px] text-slate-400">{metric.details?.unit || metric.unit}</span>
                                    </div>
                                    {metric.details?.metricType === 'sleep' && metric.details?.sleepStart && (
                                        <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                                            {metric.details.sleepStart} - {metric.details.sleepEnd}
                                        </span>
                                    )}
                                 </div>
                             <button
                                onClick={() => deleteHealthLog(metric._id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                         </div>
                     </div>
                )) : (
                     <p className="text-xs text-slate-400 italic text-center py-4">No metrics recorded yet.</p>
                )}
            </div>
        </div>
    );
};

export default HealthMetrics;
