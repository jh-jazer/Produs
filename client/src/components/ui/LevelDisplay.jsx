import React from 'react';

export default function LevelDisplay({ 
  level = 1, 
  exp = 0, 
  totalRequired = 0, 
  nextLevelExp = 100, 
  className = "", 
  showXP = true,
  onClick 
}) {
  const currentLevelProgress = exp - totalRequired;
  const progress = Math.min(100, Math.max(0, (currentLevelProgress / nextLevelExp) * 100));

  if (level === 0) return null;

  return (
    <div 
        className={`flex items-center gap-3 min-w-[160px] cursor-pointer group/lvl transition-all active:scale-95 pointer-events-auto relative z-[20] ${className}`}
        onClick={onClick}
    >
      {/* 1. Level Identifier */}
      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40 whitespace-nowrap shrink-0">
          LVL {level}
      </span>

      {/* 2. Progress Bar */}
      <div className="flex-1 h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden relative">
        <div 
          className="absolute inset-0 bg-electric-blue/20 blur-[2px]"
          style={{ width: `${progress}%` }}
        />
        <div 
          className="h-full bg-electric-blue transition-all duration-1000 ease-[0.16,1,0.3,1] relative z-10"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 3. XP Metadata */}
      {showXP && (
        <span className="text-[9px] font-bold text-electric-blue uppercase tracking-wider whitespace-nowrap shrink-0">
          {currentLevelProgress} / {nextLevelExp} XP
        </span>
      )}
    </div>
  );
}
