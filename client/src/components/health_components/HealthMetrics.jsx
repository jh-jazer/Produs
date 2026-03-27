import React, { useState } from 'react';

const HealthMetrics = ({ metrics, addHealthLog, deleteHealthLog }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [metricType, setMetricType] = useState('weight');
    const [value, setValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!value) return;

        addHealthLog('metric', {
            title: metricType === 'weight' ? 'Body Weight' : 'Sleep',
            date: new Date().toISOString().split('T')[0],
            details: {
                metricType,
                value: parseFloat(value),
                unit: metricType === 'weight' ? 'kg' : 'hrs'
            }
        });
        setValue('');
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
                                <option value="sleep">Sleep (hrs)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Value</label>
                            <input
                                type="number"
                                step="0.1"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-electric-blue/50"
                                placeholder={`e.g., ${metricType === 'weight' ? '70.5' : '8'}`}
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-2 bg-electric-blue text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-electric-blue/90 transition-colors">
                        Save Metric
                    </button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['weight', 'sleep'].map((type) => {
                    const typeMetrics = metrics.filter(m => m.details?.metricType === type).sort((a,b) => new Date(b.date) - new Date(a.date));
                    const latest = typeMetrics[0];

                    return (
                        <div key={type} className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#000000]/20 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-electric-blue text-lg">
                                    {type === 'weight' ? 'monitor_weight' : 'bedtime'}
                                </span>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{type}</h4>
                            </div>
                            {latest ? (
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-slate-900 dark:text-white">{latest.details.value}</span>
                                    <span className="text-xs text-slate-400 font-bold">{latest.details.unit}</span>
                                </div>
                            ) : (
                                <span className="text-xs text-slate-400 italic">No data</span>
                            )}
                        </div>
                    );
                })}
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
                             <div className="text-right flex items-baseline gap-1">
                                <span className="text-sm font-black text-electric-blue">{metric.details?.value}</span>
                                <span className="text-[10px] text-slate-400">{metric.details?.unit}</span>
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
