import React from 'react';

const BalanceHistory = () => {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none min-h-[400px]">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Balance History</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Last 6 months performance</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Income</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Outcome</span>
                    </div>
                </div>
            </div>

            {/* Simulated Chart Container */}
            <div className="h-64 flex items-end gap-1 relative pt-4">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                    <div className="border-t border-slate-400 w-full"></div>
                    <div className="border-t border-slate-400 w-full"></div>
                    <div className="border-t border-slate-400 w-full"></div>
                    <div className="border-t border-slate-400 w-full"></div>
                </div>

                {/* Chart Columns map */}
                {[
                    { month: 'May', inc: '60%', out: '40%' },
                    { month: 'Jun', inc: '75%', out: '45%' },
                    { month: 'Jul', inc: '65%', out: '55%' },
                    { month: 'Aug', inc: '80%', out: '50%' },
                    { month: 'Sep', inc: '70%', out: '35%' },
                    { month: 'Oct', inc: '85%', out: '48%', current: true },
                ].map((col, idx) => (
                    <div key={idx} className="flex-1 flex flex-col justify-end gap-2 group cursor-pointer hover:bg-slate-50 dark:hover:bg-[#000000]/50 rounded-t-lg transition-colors pt-2">
                        <div className="w-full relative px-1 sm:px-4" style={{ height: '100%' }}>
                            <div className="flex gap-1 h-full items-end justify-center w-full">
                                <div className="bg-emerald-500/20 rounded-t-sm relative transition-all group-hover:bg-emerald-500/30 w-full max-w-8" style={{ height: col.inc }}>
                                    <div className="absolute top-0 w-full h-1 bg-emerald-500"></div>
                                </div>
                                <div className="bg-red-500/20 rounded-t-sm relative transition-all group-hover:bg-red-500/30 w-full max-w-8" style={{ height: col.out }}>
                                    <div className="absolute top-0 w-full h-1 bg-red-500"></div>
                                </div>
                            </div>
                        </div>
                        <span className={`text-[10px] text-center mt-2 uppercase ${col.current ? 'text-primary font-black' : 'text-slate-500 font-bold'}`}>
                            {col.month}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BalanceHistory;
