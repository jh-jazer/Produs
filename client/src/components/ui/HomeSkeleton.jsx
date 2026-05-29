import React from 'react';

const HomeSkeleton = () => {
    return (
        <div className="w-full bg-transparent text-foreground font-sans animate-pulse relative h-full md:h-auto md:min-h-screen">
            {/* Simulation of the Reality Dashboard Layout */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-32 md:gap-8 w-full h-full md:h-auto mb-0 md:mb-24">
                
                {/* swinging ID assembly container simulation */}
                <div className="md:col-span-5 relative h-full md:min-h-[82vh] w-full flex flex-col items-center justify-center mb-0">
                    <div className="absolute inset-0 flex flex-col items-center">
                        
                        {/* Welcome container absolute positioning mirroring Home.jsx */}
                        <div className="absolute top-[7%] bottom-2 md:bottom-auto md:top-[0.5%] left-6 md:left-12 right-6 md:right-12 flex flex-col items-start text-left pointer-events-none">
                            
                            {/* Welcome Message Skeleton */}
                            <div className="flex flex-col gap-2.5 w-full max-w-xl mt-8 md:mt-[4.5vh] relative top-20 md:top-0">
                                {/* Huge "Welcome, Username" line */}
                                <div className="h-10 md:h-16 w-3/4 max-w-[480px] bg-black/10 dark:bg-white/10 rounded-sm" />
                                {/* Date line */}
                                <div className="h-3 md:h-4.5 w-1/3 max-w-[200px] bg-black/5 dark:bg-white/5 rounded-sm" />
                            </div>

                            {/* Start Focus Button Skeleton with exact spacing md:mt-[4vh] */}
                            <div className="flex flex-col-reverse md:flex-row md:items-center gap-3 md:gap-6 mt-2 md:mt-[4vh] shrink-0 w-full">
                                <div className="h-12 md:h-14 w-[55vw] max-w-[240px] md:w-48 bg-black/10 dark:bg-white/10 rounded-sm" />
                                <div className="h-4 w-40 bg-black/5 dark:bg-white/5 rounded-sm shrink-0" />
                            </div>

                            {/* Priorities Header Skeleton with exact spacing md:mt-[9vh] */}
                            <div className="mt-12 md:mt-[9vh] flex flex-col gap-1 items-start w-full">
                                <div className="h-7 md:h-9 w-48 bg-black/10 dark:bg-white/10 rounded-sm" />
                                <div className="h-3 w-32 bg-black/5 dark:bg-white/5 rounded-sm" />
                            </div>

                            {/* Horizontal Priority Card Carousel Skeleton */}
                            <div className="w-full max-w-[1060px] h-64 md:h-96 rounded-3xl border-2 border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] p-8 md:p-12 flex flex-col justify-between mt-6 relative overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <div className="h-4 w-28 bg-black/5 dark:bg-white/5 rounded-sm" />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="h-8 md:h-12 w-3/4 max-w-[420px] bg-black/10 dark:bg-white/10 rounded-sm" />
                                    <div className="h-3 w-24 bg-black/5 dark:bg-white/5 rounded-sm" />
                                </div>
                            </div>
                            
                            {/* Floating Right Side HUD Boxes: Rewards Skeleton (only on large displays) */}
                            <div className="hidden lg:flex flex-col gap-4 absolute right-14 top-0 w-72 pointer-events-none">
                                {/* Daily Reward Box Skeleton */}
                                <div className="border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-4 flex flex-col gap-3 rounded-sm">
                                    <div className="flex justify-between items-center">
                                        <div className="h-2 w-16 bg-black/5 dark:bg-white/5 rounded-sm opacity-50" />
                                        <div className="h-2.5 w-10 bg-black/10 dark:bg-white/10 rounded-sm opacity-40" />
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="size-8 bg-black/10 dark:bg-white/10 rounded-sm shrink-0" />
                                        <div className="flex flex-col gap-1.5 flex-1">
                                            <div className="h-3.5 w-28 bg-black/10 dark:bg-white/10 rounded-sm" />
                                            <div className="h-2 w-36 bg-black/5 dark:bg-white/5 rounded-sm opacity-50" />
                                        </div>
                                    </div>
                                </div>

                                {/* 365 Streak Reward Box Skeleton */}
                                <div className="border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-4 flex flex-col gap-3 rounded-sm">
                                    <div className="flex justify-between items-center">
                                        <div className="h-2 w-20 bg-black/5 dark:bg-white/5 rounded-sm opacity-50" />
                                        <div className="h-2.5 w-10 bg-black/10 dark:bg-white/10 rounded-sm opacity-40" />
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="size-8 bg-black/10 dark:bg-white/10 rounded-sm shrink-0" />
                                        <div className="flex flex-col gap-1.5 flex-1">
                                            <div className="h-3.5 w-24 bg-black/10 dark:bg-white/10 rounded-sm" />
                                            <div className="h-2 w-32 bg-black/5 dark:bg-white/5 rounded-sm opacity-50" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HomeSkeleton;
