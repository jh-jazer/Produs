import React from 'react';

const ChippedBorder = ({ opacity = 0.8 }) => (
  <div 
    className="absolute inset-[-2px] rounded-sm pointer-events-none z-0"
    style={{
      border: '4px solid currentColor',
      opacity,
      clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
    }}
  />
);

const WorkspaceSkeleton = () => {
    return (
        <div className="w-full bg-transparent text-foreground px-0 pt-24 pb-12 md:pt-2 md:pb-16 font-sans overflow-x-hidden flex flex-col items-center animate-pulse">
            <div className="w-full max-w-7xl mt-4 md:mt-2 px-6 md:px-0 flex flex-col gap-8 md:gap-12">
                
                {/* Header Title Skeleton */}
                <div className="mb-2 flex flex-col gap-2 items-start">
                    <div className="h-8 md:h-10 w-64 bg-black/10 dark:bg-white/10 rounded-sm" />
                    <div className="h-3.5 w-40 bg-black/5 dark:bg-white/5 rounded-sm opacity-50" />
                </div>

                {/* Unified HUDPanel Skeleton */}
                <div className="relative border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] rounded-sm p-6 md:p-12 flex flex-col gap-8 md:gap-12 min-h-[500px] w-full overflow-hidden">
                    <div className="hidden md:block">
                        <ChippedBorder opacity={0.06} />
                    </div>
                    
                    {/* Inner content grid simulator */}
                    <div className="relative z-10 flex flex-col gap-8 md:gap-12 w-full">
                        
                        {/* Top KPI Cards (3 columns) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="relative border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.01] rounded-sm p-4 md:p-6 flex flex-col gap-3">
                                    <div className="h-3 w-20 bg-black/5 dark:bg-white/5 rounded-sm" />
                                    <div className="h-6 md:h-8 w-32 bg-black/10 dark:bg-white/10 rounded-sm" />
                                </div>
                            ))}
                        </div>

                        {/* List/Table Rows Section */}
                        <div className="flex flex-col gap-4 w-full mt-2">
                            <div className="h-4 w-40 bg-black/10 dark:bg-white/10 rounded-sm mb-2" />
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={`flex items-center justify-between py-3 border-b border-black/10 dark:border-white/10 ${i === 4 ? 'border-b-0' : ''}`}>
                                    <div className="flex items-center gap-3 md:gap-4 flex-1">
                                        <div className="size-4 rounded-full bg-black/10 dark:bg-white/10 shrink-0" />
                                        <div className="flex flex-col gap-1.5 flex-1">
                                            <div className="h-4 w-1/3 min-w-[120px] max-w-[280px] bg-black/10 dark:bg-white/10 rounded-sm" />
                                            <div className="h-3 w-24 bg-black/5 dark:bg-white/5 rounded-sm" />
                                        </div>
                                    </div>
                                    <div className="h-4 w-16 bg-black/10 dark:bg-white/10 rounded-sm shrink-0" />
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default WorkspaceSkeleton;
