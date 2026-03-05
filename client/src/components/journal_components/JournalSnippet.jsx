import React from 'react';

function JournalSnippet() {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-4 shadow-sm flex flex-col flex-1 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Mood Tracker</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">How are you feeling?</p>
                </div>
                <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                    <span className="material-symbols-outlined text-base">more_horiz</span>
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
