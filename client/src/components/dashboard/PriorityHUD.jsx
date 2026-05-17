import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../hooks/usePlanner';
import { useGoals } from '../../hooks/useGoals';
import { useFinance } from '../../hooks/useFinance';

const ChippedBorder = ({ opacity = 0.8 }) => (
  <div
    className="absolute inset-[-2px] rounded-sm pointer-events-none z-0"
    style={{
      border: '4px solid currentColor',
      opacity,
      clipPath:
        'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)',
    }}
  />
);

export default function PriorityHUD() {
  const today = new Date();
  const { tasks, toggleComplete, isLoading: plannerLoading } = usePlanner(today);
  const { goals: allGoals, toggleGoal: toggleGoalStatus, isLoading: goalsLoading } = useGoals();
  const { debts = [], isLoading: financeLoading } = useFinance();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // --- PART 1: Upcoming Activities Calculation (Double) ---
  const todayTasks = tasks || [];
  const upcomingTasks = [
    ...todayTasks.filter(t => !t.completed),
    ...todayTasks.filter(t => t.completed)
  ].slice(0, 2);

  const handleToggleTask = async (taskId) => {
    await toggleComplete(taskId);
  };

  // --- PART 2: Goals Column Filtering (Double - Max 2 each) ---
  const getPeriodGoals = (period) => {
    const list = allGoals.filter(g => g.period === period);
    return [
      ...list.filter(g => !g.completed),
      ...list.filter(g => g.completed)
    ].slice(0, 2);
  };

  const weeklyGoals = getPeriodGoals('weekly');
  const monthlyGoals = getPeriodGoals('monthly');
  const yearlyGoals = getPeriodGoals('yearly');

  // --- PART 3: Finance Closest Due Side-by-Side (Double - Max 2 each) ---
  const todayTime = new Date().setHours(0, 0, 0, 0);

  const getDaysRemaining = (dueDateStr) => {
    if (!dueDateStr) return Infinity;
    const dueDate = new Date(dueDateStr).setHours(0, 0, 0, 0);
    const diffTime = dueDate - todayTime;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const activeDebtsList = debts.filter(d => d.nature === 'debt' || !d.nature);
  const activeReceivablesList = debts.filter(d => d.nature === 'income');

  const sortedDebts = [...activeDebtsList].sort((a, b) => {
    const daysA = getDaysRemaining(a.dueDate);
    const daysB = getDaysRemaining(b.dueDate);
    return daysA - daysB;
  });

  const sortedReceivables = [...activeReceivablesList].sort((a, b) => {
    const daysA = getDaysRemaining(a.dueDate);
    const daysB = getDaysRemaining(b.dueDate);
    return daysA - daysB;
  });

  const closestDebts = sortedDebts.slice(0, 2);
  const closestReceivables = sortedReceivables.slice(0, 2);

  // Helper renderers
  const renderGoalColumn = (header, goals = [], onToggle) => {
    return (
      <div className="flex flex-col gap-2 text-left w-full">
        <span className="text-[7.5px] font-black text-foreground/30 uppercase tracking-[0.25em] font-mono">{header}</span>
        {goals.length > 0 ? (
          <div className="flex flex-col gap-3 w-full">
            {goals.map((goal) => (
              <div 
                key={goal._id}
                onClick={() => onToggle && onToggle(goal._id)}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-sm border transition-all cursor-pointer w-full min-h-[72px] ${
                  goal.completed 
                    ? 'bg-foreground/[0.04] border-foreground/10 opacity-70' 
                    : 'bg-foreground/[0.01] border-foreground/5 hover:border-foreground/10 hover:bg-foreground/[0.02]'
                }`}
              >
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className={`text-[10px] font-black uppercase tracking-wide leading-snug break-words ${goal.completed ? 'line-through opacity-40 text-emerald-500/60' : 'text-white/80'}`}>
                    {goal.title}
                  </span>
                  <span className={`text-[7px] font-mono font-black uppercase tracking-widest ${goal.completed ? 'text-emerald-500/50' : 'text-amber-500/50'}`}>
                    {goal.completed ? 'SECURED' : 'ACTIVE'}
                  </span>
                </div>
                <div className={`size-4.5 border rounded-sm shrink-0 flex items-center justify-center transition-all ${
                  goal.completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 bg-white/5'
                }`}>
                  {goal.completed && (
                    <span className="material-symbols-outlined text-black text-[9px] font-bold">check</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 rounded-sm border border-dashed border-foreground/5 bg-foreground/[0.005] w-full min-h-[72px] text-center">
            <span className="text-[8px] font-mono opacity-20 uppercase tracking-widest">NO TARGET REGISTERED</span>
          </div>
        )}
      </div>
    );
  };

  const renderFinanceColumn = (header, items = [], isDebt) => {
    const symbol = isDebt ? '-' : '+';
    const color = isDebt ? 'text-rose-500' : 'text-emerald-500';

    return (
      <div className="flex flex-col gap-2 text-left w-full">
        <span className="text-[7.5px] font-black text-foreground/30 uppercase tracking-[0.25em] font-mono">{header}</span>
        {items.length > 0 ? (
          <div className="flex flex-col gap-3 w-full">
            {items.map((item) => {
              let dateLabel = 'NO DUE DATE';
              let daysLabel = '';
              let daysRemaining = Infinity;

              const targetDate = item.dueDate || item.createdAt;
              if (item && targetDate) {
                const d = new Date(targetDate);
                dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
                daysRemaining = getDaysRemaining(targetDate);
                if (daysRemaining < 0) {
                  daysLabel = `${Math.abs(daysRemaining)}D OVERDUE`;
                } else if (daysRemaining === 0) {
                  daysLabel = 'DUE TODAY';
                } else if (daysRemaining === 1) {
                  daysLabel = '1D LEFT';
                } else {
                  daysLabel = `${daysRemaining}D LEFT`;
                }
              }

              return (
                <div key={item._id} className="p-3.5 rounded-sm border border-foreground/5 bg-foreground/[0.01] hover:border-foreground/10 hover:bg-foreground/[0.02] transition-all min-h-[72px] flex items-center justify-between gap-3 w-full">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white truncate w-full">{item.title}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[7.5px] font-mono opacity-40 uppercase tracking-widest">{dateLabel}</span>
                      {daysLabel && (
                        <span className={`text-[6.5px] font-mono font-black uppercase tracking-wider px-1.5 py-0.2 rounded-sm ${
                          daysRemaining < 0 ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                          daysRemaining === 0 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          'bg-white/10 text-white/60 border border-white/5'
                        }`}>
                          {daysLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[11px] font-black font-mono shrink-0 ${color}`}>
                    {symbol}${parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 rounded-sm border border-dashed border-foreground/5 bg-foreground/[0.005] w-full min-h-[72px] text-center">
            <span className="text-[8px] font-mono opacity-20 uppercase tracking-widest">
              {isDebt ? 'NO DEBTS REGISTERED' : 'NO RECEIVABLES REGISTERED'}
            </span>
          </div>
        )}
      </div>
    );
  };

  const isHUDLoading = plannerLoading || goalsLoading || financeLoading;

  return (
    <div className="flex md:col-span-5 w-full flex-col md:bg-foreground/[0.02] rounded-sm px-0 py-2 md:py-8 md:px-0 min-h-[500px] md:hover:bg-foreground/[0.04] transition-all group relative overflow-hidden">
      <div className="hidden md:block">
        <ChippedBorder opacity={0.7} />
      </div>

      {/* Header */}
      <div className="mb-8 hidden md:flex justify-between items-start relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground">PRIORITY LIST</span>
          <span className="text-[8px] font-mono uppercase tracking-widest text-foreground/40">HUD CONTROL CENTER</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[14px] font-black tracking-tighter leading-none">{formattedTime}</span>
          <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">{formattedDate}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative flex flex-col z-10 overflow-hidden space-y-8">
        {isHUDLoading ? (
          /* Loading skeleton */
          <div className="space-y-6 opacity-20 animate-pulse">
            <div className="h-16 bg-white/10 rounded-sm w-full" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 bg-white/10 rounded-sm" />
              <div className="h-20 bg-white/10 rounded-sm" />
              <div className="h-20 bg-white/10 rounded-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-white/10 rounded-sm" />
              <div className="h-24 bg-white/10 rounded-sm" />
            </div>
          </div>
        ) : (
          /* Active Interactive Panels */
          <div className="space-y-8 flex flex-col justify-between flex-1 w-full">
            
            {/* PART 1: UPCOMING SCHEDULED ACTIVITIES (DOUBLE) */}
            <div className="flex flex-col gap-2 text-left w-full">
              <span className="text-[7.5px] font-black text-foreground/30 uppercase tracking-[0.25em] font-mono">UPCOMING SCHEDULED ACTIVITIES</span>
              {upcomingTasks.length > 0 ? (
                <div className="flex flex-col gap-3 w-full">
                  {upcomingTasks.map((task) => (
                    <div 
                      key={task._id}
                      className={`flex items-center gap-4 p-3.5 w-full min-h-[64px] transition-all duration-200 group/upcoming ${
                        task.completed
                          ? 'bg-foreground/[0.04] opacity-70'
                          : 'bg-foreground/[0.01]'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[7px] font-mono font-black uppercase tracking-wider px-1.5 py-0.2 rounded-sm border ${
                            task.completed 
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                            {task.completed ? 'SECURED' : 'ACTIVE'}
                          </span>
                          <span className="text-[7.5px] font-mono opacity-40 tracking-widest uppercase">
                            {task.startTime && task.endTime ? `${task.startTime} - ${task.endTime}` : 'NO SCHEDULE'}
                          </span>
                        </div>
                        <span className={`text-[11.5px] font-black uppercase tracking-wider truncate mt-0.5 ${task.completed ? 'line-through opacity-40 text-emerald-500/60' : 'text-white'}`}>
                          {task.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 rounded-sm bg-foreground/[0.005] min-h-[64px] text-center w-full">
                  <span className="text-[8px] font-mono opacity-20 uppercase tracking-widest">ALL OBJECTIVES SECURED</span>
                </div>
              )}
            </div>

            {/* PART 2: THREE COLUMNS OF GOALS (DOUBLE) */}
            <div className="grid grid-cols-3 gap-4 w-full">
              {renderGoalColumn("WEEKLY TARGETS", weeklyGoals, toggleGoalStatus)}
              {renderGoalColumn("MONTHLY TARGETS", monthlyGoals, toggleGoalStatus)}
              {renderGoalColumn("ANNUAL TARGETS", yearlyGoals, toggleGoalStatus)}
            </div>

            {/* PART 3: SIDE TO SIDE CLOSEST DEBT / RECEIVABLE (DOUBLE) */}
            <div className="grid grid-cols-2 gap-4 w-full">
              {renderFinanceColumn("CLOSEST DEBT LIABILITIES", closestDebts, true)}
              {renderFinanceColumn("CLOSEST RECEIVABLE ASSETS", closestReceivables, false)}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
