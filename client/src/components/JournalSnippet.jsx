/* eslint-disable */
import React from 'react';

function JournalSnippet() {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none flex flex-col flex-1 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out min-h-[180px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mood Tracker</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">Daily Reflection</p>
                </div>
                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#000000] text-slate-500 dark:text-slate-400 transition-colors">
                    <span className="material-symbols-outlined text-xl">more_horiz</span>
                </button>
            </div>
            <div className="flex-1 flex flex-col justify-center">

                <div>
                    <div className="flex justify-between items-center px-1">
                        <button className="text-3xl hover:scale-110 transition-transform grayscale hover:grayscale-0">😠</button>
                        <button className="text-3xl hover:scale-110 transition-transform grayscale hover:grayscale-0">🙁</button>
                        <button className="text-3xl hover:scale-110 transition-transform">😐</button>
                        <button className="text-3xl hover:scale-110 transition-transform grayscale hover:grayscale-0">🙂</button>
                        <button className="text-3xl hover:scale-110 transition-transform grayscale hover:grayscale-0">😊</button>
                    </div>
                </div>


            </div>
        </div>
    );
}

export default JournalSnippet;
