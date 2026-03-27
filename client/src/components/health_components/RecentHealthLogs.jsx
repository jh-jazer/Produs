import React from 'react';

const RecentHealthLogs = ({ metrics, deleteHealthLog }) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">History</h4>
            </div>
            
            <div className="flex flex-col gap-2">
                {metrics.length > 0 ? metrics.slice(0, 10).map(metric => (
                     <div key={metric._id} className="flex items-center justify-between p-4 rounded-[20px] bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 group hover:border-electric-blue/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined text-lg">
                                    {metric.details?.metricType === 'weight' ? 'monitor_weight' :
                                     metric.details?.metricType === 'sleep' ? 'bedtime' :
                                     metric.details?.metricType === 'water' ? 'water_drop' :
                                     metric.details?.metricType === 'bmi' ? 'monitor_heart' : 'analytics'}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{metric.title}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{metric.date}</span>
                            </div>
                        </div>
                        
                         <div className="flex items-center gap-6">
                                 <div className="flex flex-col gap-0.5 items-end">
                                    <div className="text-right flex items-baseline gap-1">
                                        <span className="text-base font-black text-electric-blue">{metric.details?.value || metric.value}</span>
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{metric.details?.unit || metric.unit}</span>
                                    </div>
                                    {metric.details?.metricType === 'sleep' && metric.details?.sleepStart && (
                                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-black tracking-widest uppercase">
                                            {metric.details.sleepStart} - {metric.details.sleepEnd}
                                        </span>
                                    )}
                                 </div>
                             <button
                                onClick={() => deleteHealthLog(metric._id)}
                                className="opacity-0 group-hover:opacity-100 size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                         </div>
                     </div>
                )) : (
                     <div className="p-12 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-slate-300">history</span>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No metrics recorded yet.</p>
                     </div>
                )}
            </div>
        </div>
    );
};

export default RecentHealthLogs;
