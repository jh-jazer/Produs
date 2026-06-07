import React from 'react';

const HomeSkeleton = ({ variant = 'home' }) => {
    return (
        <div className="w-full bg-transparent text-foreground font-sans animate-pulse relative h-full md:h-auto md:min-h-screen">
            {/* Simulation of the Reality Dashboard Layout */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-32 md:gap-8 w-full h-full md:h-auto mb-0 md:mb-24">
                
                {/* swinging ID assembly container simulation */}
                <div className="md:col-span-5 relative h-full md:min-h-[82vh] w-full flex flex-col items-center justify-center mb-0">
                    <div className="absolute inset-0 flex flex-col items-center">
                        
                        {/* Welcome container absolute positioning mirroring Home.jsx & Link.jsx */}
                        <div className="absolute top-[7%] bottom-2 md:bottom-auto md:top-[0.5%] left-6 md:left-12 right-6 md:right-12 flex flex-col items-start text-left pointer-events-none">
                            
                            {/* Welcome Message Skeleton */}
                            {variant === 'home' ? (
                                <div className="flex flex-col gap-2.5 w-full max-w-xl mt-8 md:mt-[4.5vh] relative top-20 md:top-0">
                                    {/* Huge "Welcome, Username" line */}
                                    <div className="h-10 md:h-16 w-3/4 max-w-[480px] bg-black/10 dark:bg-white/10 rounded-sm" />
                                    {/* Date line */}
                                    <div className="h-3 md:h-4.5 w-1/3 max-w-[200px] bg-black/5 dark:bg-white/5 rounded-sm" />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2 w-full max-w-xl mt-8 md:mt-[4.5vh] relative top-20 md:top-0">
                                    {/* Three lines for Link Established */}
                                    <div className="h-10 md:h-14 w-1/2 max-w-[320px] bg-black/10 dark:bg-white/10 rounded-sm" />
                                    <div className="h-10 md:h-14 w-2/3 max-w-[400px] bg-black/10 dark:bg-white/10 rounded-sm" />
                                    <div className="h-10 md:h-14 w-3/4 max-w-[480px] bg-black/10 dark:bg-white/10 rounded-sm" />
                                    <div className="h-3 md:h-4.5 w-1/3 max-w-[200px] bg-black/5 dark:bg-white/5 rounded-sm mt-1" />
                                </div>
                            )}

                            {/* Buttons Spacing Container */}
                            {variant === 'home' ? (
                                <div className="flex flex-col-reverse md:flex-row md:items-center gap-3 md:gap-6 mt-2 md:mt-[4vh] shrink-0 w-full">
                                    <div className="h-[8vh] min-h-[44px] w-[55vw] max-w-[240px] md:w-48 bg-black/10 dark:bg-white/10 rounded-sm" />
                                    <div className="h-4 w-40 bg-black/5 dark:bg-white/5 rounded-sm shrink-0" />
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row gap-3 mt-2 md:mt-[4vh] shrink-0 w-full">
                                    <div className="h-[8vh] min-h-[44px] w-[55vw] max-w-[240px] md:w-48 bg-black/10 dark:bg-white/10 rounded-sm" />
                                    <div className="h-[8vh] min-h-[44px] w-[55vw] max-w-[240px] md:w-48 bg-black/10 dark:bg-white/10 rounded-sm" />
                                </div>
                            )}

                            {/* Priorities / Connection Tree Header Skeleton */}
                            <div className="mt-0 md:mt-[9vh] flex flex-col gap-1 items-start -translate-y-8 md:translate-y-0 w-full">
                                <div className="h-7 md:h-9 w-64 bg-black/10 dark:bg-white/10 rounded-sm" />
                                <div className="h-3 w-40 bg-black/5 dark:bg-white/5 rounded-sm mt-1" />
                            </div>

                            {/* Main Card Layout Section */}
                            {variant === 'home' ? (
                                <>
                                    {/* Mobile simulated carousel layout */}
                                    <div className="w-screen relative mt-3 -ml-12 md:hidden -translate-y-8 overflow-hidden">
                                        <div className="flex px-[7.5vw]">
                                            <div className="w-[85vw] h-64 rounded-3xl border-2 border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] backdrop-blur-md p-6 flex flex-col justify-end gap-4 scale-105 opacity-100 shrink-0 shadow-md">
                                                <div className="flex items-center gap-3">
                                                    <span className="shrink-0 w-3 h-3 rounded-full bg-black/10 dark:bg-white/10" />
                                                    <div className="h-6 w-48 bg-black/10 dark:bg-white/10 rounded-sm" />
                                                </div>
                                                <div className="h-3.5 w-24 bg-black/5 dark:bg-white/5 rounded-sm" />
                                                <div className="w-full h-[1px] bg-black/10 dark:bg-white/10 my-1" />
                                                <div className="flex items-center gap-3">
                                                    <span className="shrink-0 w-3 h-3 rounded-full bg-black/10 dark:bg-white/10" />
                                                    <div className="h-6 w-36 bg-black/10 dark:bg-white/10 rounded-sm" />
                                                </div>
                                                <div className="h-3.5 w-24 bg-black/5 dark:bg-white/5 rounded-sm" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop single card slider simulation */}
                                    <div className="hidden md:flex items-center gap-6 mt-6 w-full max-w-[1180px]">
                                        <div className="md:flex-1 md:max-w-[1060px] h-72 md:h-96 rounded-3xl border-2 border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] backdrop-blur-md p-8 md:p-12 flex flex-col justify-end gap-6 scale-105 opacity-100 shadow-md z-20">
                                            <div className="flex items-center gap-4">
                                                <span className="shrink-0 w-3.5 h-3.5 rounded-full bg-black/10 dark:bg-white/10" />
                                                <div className="h-8 w-64 bg-black/10 dark:bg-white/10 rounded-sm" />
                                            </div>
                                            <div className="h-4 w-32 bg-black/5 dark:bg-white/5 rounded-sm" />
                                            <div className="w-full h-[1px] bg-black/10 dark:bg-white/10 my-2" />
                                            <div className="flex items-center gap-4">
                                                <span className="shrink-0 w-3.5 h-3.5 rounded-full bg-black/10 dark:bg-white/10" />
                                                <div className="h-8 w-48 bg-black/10 dark:bg-white/10 rounded-sm" />
                                            </div>
                                            <div className="h-4 w-32 bg-black/5 dark:bg-white/5 rounded-sm" />
                                        </div>
                                        {/* chevron skeleton */}
                                        <div className="size-10 ml-10 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] shrink-0" />
                                    </div>
                                </>
                            ) : (
                                /* Link established: Single card scaled (mobile and desktop) */
                                <div className="w-[85vw] md:w-full md:flex-none md:max-w-[1060px] h-64 md:h-96 rounded-3xl border-2 border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] backdrop-blur-md p-8 md:p-12 flex flex-row items-center justify-between shadow-md mt-3 -translate-y-8 md:translate-y-0 gap-4 md:gap-6 relative overflow-hidden scale-105">
                                    {/* Left side: tree view */}
                                    <div className="relative w-[70%] flex flex-col justify-between border-r border-black/5 dark:border-white/5 pr-4 md:pr-6 h-full py-2">
                                        <div className="flex items-center justify-center p-2 flex-1">
                                            <div className="size-20 md:size-28 bg-black/10 dark:bg-white/10 rounded-full" />
                                        </div>
                                        {/* Progress bar simulation */}
                                        <div className="w-full flex flex-col gap-2 mt-auto">
                                            <div className="h-3 w-16 bg-black/10 dark:bg-white/10 rounded-sm" />
                                            <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full" />
                                        </div>
                                    </div>
                                    {/* Right side: stats */}
                                    <div className="w-[30%] flex flex-col justify-center items-center gap-4 pl-4 md:pl-6 h-full py-2">
                                        <div className="size-14 md:size-16 rounded-full bg-black/10 dark:bg-white/10" />
                                        <div className="h-3 w-12 bg-black/10 dark:bg-white/10 rounded-sm" />
                                        <div className="h-3.5 w-20 bg-black/5 dark:bg-white/5 rounded-sm mt-auto" />
                                    </div>
                                </div>
                            )}
                            
                            {/* Floating Right Side HUD Boxes: Rewards Skeleton (only on large displays) */}
                            {variant === 'home' ? (
                                <div className="hidden lg:flex flex-col gap-4 absolute right-14 top-0 w-72 pointer-events-none">
                                    {/* Daily Reward Box Skeleton */}
                                    <div className="border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-4 flex flex-col gap-2 rounded-sm">
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
                                    <div className="border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-4 flex flex-col gap-2 rounded-sm">
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
                            ) : (
                                <div className="hidden lg:flex flex-col gap-4 absolute right-14 top-0 w-72 pointer-events-none">
                                    {/* LPT Ranking Box Skeleton */}
                                    <div className="border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-4 flex flex-col gap-2 rounded-sm">
                                        <div className="flex justify-between items-center">
                                            <div className="h-2 w-16 bg-black/5 dark:bg-white/5 rounded-sm opacity-50" />
                                            <div className="h-2.5 w-10 bg-black/10 dark:bg-white/10 rounded-sm opacity-40" />
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="size-8 bg-black/10 dark:bg-white/10 rounded-sm shrink-0" />
                                            <div className="flex flex-col gap-1.5 flex-1">
                                                <div className="h-3.5 w-20 bg-black/10 dark:bg-white/10 rounded-sm" />
                                                <div className="h-2 w-32 bg-black/5 dark:bg-white/5 rounded-sm opacity-50" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Partner Streak Box Skeleton */}
                                    <div className="border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-4 flex flex-col gap-2 rounded-sm">
                                        <div className="flex justify-between items-center">
                                            <div className="h-2 w-20 bg-black/5 dark:bg-white/5 rounded-sm opacity-50" />
                                            <div className="h-2.5 w-10 bg-black/10 dark:bg-white/10 rounded-sm opacity-40" />
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="size-8 bg-black/10 dark:bg-white/10 rounded-sm shrink-0" />
                                            <div className="flex flex-col gap-1.5 flex-1">
                                                <div className="h-3.5 w-28 bg-black/10 dark:bg-white/10 rounded-sm" />
                                                <div className="h-2 w-32 bg-black/5 dark:bg-white/5 rounded-sm opacity-50" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                        
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HomeSkeleton;
