import React from 'react';

const WorkspaceSkeleton = () => {
    return (
        <div className="w-full max-w-[1200px] lg:pt-12 flex flex-col gap-6 pb-28 md:pb-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-2 px-1">
                <div className="h-8 w-48 bg-black/5 dark:bg-white/5 rounded-lg" />
                <div className="h-3 w-64 bg-black/5 dark:bg-white/5 rounded-md" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Secondary Column Skeleton (Left on Desktop) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="h-64 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-black/[0.03] dark:border-white/5" />
                    <div className="h-48 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-black/[0.03] dark:border-white/5" />
                </div>

                {/* Main Column Skeleton (Right on Desktop) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="h-96 bg-black/5 dark:bg-white/5 rounded-[3rem] border border-black/[0.03] dark:border-white/5" />
                    <div className="h-64 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-black/[0.03] dark:border-white/5" />
                </div>
            </div>

            {/* Loading Indicator Pill */}
            <div className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-2 bg-white dark:bg-[#121212] rounded-full border border-black/[0.08] dark:border-white/10 shadow-xl">
                <div className="size-2 rounded-full bg-electric-blue animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40">Synchronizing HUD</span>
            </div>
        </div>
    );
};

export default WorkspaceSkeleton;
