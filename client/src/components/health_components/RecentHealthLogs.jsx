import React from 'react';

const RecentHealthLogs = ({ metrics, deleteHealthLog }) => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">HISTORY LOG</h4>
            </div>
            
            <div className="flex flex-col gap-3">
                {metrics.length > 0 ? metrics.slice(0, 10).map(metric => (
                     <div key={metric._id} className="flex items-center justify-between p-4 rounded-sm bg-white/[0.02] border border-white/5 group hover:border-white/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="size-8 rounded-sm bg-white/5 flex items-center justify-center text-white/40 border border-white/10 group-hover:rotate-12 transition-transform">
                                <span className="material-symbols-outlined text-sm">
                                    {metric.details?.metricType === 'weight' ? 'monitor_weight' :
                                     metric.details?.metricType === 'sleep' ? 'bedtime' :
                                     metric.details?.metricType === 'water' ? 'water_drop' :
                                     metric.details?.metricType === 'bmi' ? 'monitor_heart' : 'analytics'}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-white uppercase tracking-wider">{metric.title}</span>
                                <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em]">{metric.date}</span>
                            </div>
                        </div>
                        
                         <div className="flex items-center gap-6">
                                 <div className="flex flex-col gap-0.5 items-end">
                                    <div className="text-right flex items-baseline gap-2">
                                        <span className="text-lg font-black text-white italic">{metric.details?.value || metric.value}</span>
                                        <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">{metric.details?.unit || metric.unit}</span>
                                    </div>
                                    {metric.details?.metricType === 'sleep' && metric.details?.sleepStart && (
                                        <span className="text-[8px] text-white/10 font-black tracking-widest uppercase">
                                            {metric.details.sleepStart} - {metric.details.sleepEnd}
                                        </span>
                                    )}
                                 </div>
                             <button
                                onClick={() => deleteHealthLog(metric._id)}
                                className="opacity-0 group-hover:opacity-100 size-6 flex items-center justify-center rounded-sm text-white/20 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-white/5"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                         </div>
                     </div>
                )) : (
                     <div className="p-12 rounded-sm border border-dashed border-white/5 flex flex-col items-center justify-center text-center gap-4 opacity-20">
                        <span className="material-symbols-outlined text-3xl">history</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">NO RECENT ACTIVITY</p>
                     </div>
                )}
            </div>
        </div>
    );
};

export default RecentHealthLogs;
