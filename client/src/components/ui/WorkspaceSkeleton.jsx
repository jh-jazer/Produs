import React from 'react';

const ChippedBorder = ({ opacity = 0.8 }) => (
  <div 
    className="absolute inset-[-1px] rounded-sm pointer-events-none z-0"
    style={{
      border: '2px solid currentColor',
      opacity,
      clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
    }}
  />
);

const WorkspaceSkeleton = () => {
    return (
        <div className="w-full flex flex-col gap-12 pb-28 md:pb-8 animate-pulse overflow-hidden">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-2">
                <div className="h-4 w-48 bg-white/5 rounded-sm" />
                <div className="h-2 w-64 bg-white/5 rounded-sm opacity-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* ID Card / Secondary Column Skeleton */}
                <div className="lg:col-span-4 flex flex-col gap-12">
                    <div className="relative h-[450px] bg-white/[0.02] rounded-sm overflow-hidden border border-white/5">
                        <ChippedBorder opacity={0.1} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
                            <div className="size-32 bg-white/5 rounded-sm" />
                            <div className="h-4 w-32 bg-white/5 rounded-sm" />
                            <div className="h-2 w-48 bg-white/5 rounded-sm opacity-50" />
                        </div>
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="lg:col-span-8 flex flex-col gap-12">
                    <div className="relative h-[300px] bg-white/[0.02] rounded-sm overflow-hidden border border-white/5">
                        <ChippedBorder opacity={0.1} />
                        <div className="p-10">
                            <div className="h-3 w-40 bg-white/5 rounded-sm mb-8" />
                            <div className="flex flex-col gap-4">
                                <div className="h-12 w-full bg-white/5 rounded-sm" />
                                <div className="h-12 w-3/4 bg-white/5 rounded-sm opacity-50" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1,2,3].map(i => (
                            <div key={i} className="relative h-32 bg-white/[0.02] rounded-sm border border-white/5">
                                <ChippedBorder opacity={0.1} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default WorkspaceSkeleton;
