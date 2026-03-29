import React from 'react';

export default function LevelDisplay({ 
  level = 1, 
  exp = 0, 
  totalRequired = 0, 
  nextLevelExp = 100, 
  className = "", 
  onClick 
}) {
  const currentLevelProgress = exp - totalRequired;
  const progress = Math.min(100, Math.max(0, (currentLevelProgress / nextLevelExp) * 100));

  if (level === 0) return null;

  return (
    <div 
        className={`flex flex-col gap-1.5 min-w-[100px] cursor-pointer group/lvl transition-all active:scale-95 pointer-events-auto relative z-[20] ${className}`}
        onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40">
          LVL {level}
        </span>
        <span className="text-[9px] font-bold text-electric-blue uppercase tracking-wider">
          {currentLevelProgress} / {nextLevelExp} XP
        </span>
      </div>
      
      {/* Progress Bar Container */}
      <div className="h-1 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden relative">
        {/* Glow effect */}
        <div 
          className="absolute inset-0 bg-electric-blue/20 blur-[2px]"
          style={{ width: `${progress}%` }}
        />
        {/* Actual Progress */}
        <div 
          className="h-full bg-electric-blue transition-all duration-1000 ease-[0.16,1,0.3,1] relative z-10"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
