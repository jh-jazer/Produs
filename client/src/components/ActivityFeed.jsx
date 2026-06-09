import useSWR from 'swr';
import useSWRConfig from 'swr';
import Avatar from './ui/Avatar';

const typeConfig = {
    habit_check: {
        icon: 'check_circle',
        color: 'emerald',
        verb: 'completed a habit',
    },
    streak_milestone: {
        icon: 'local_fire_department',
        color: 'orange',
        verb: 'hit a streak milestone',
    },
};

function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function FeedCard({ entry }) {
    const cfg = typeConfig[entry.type] || typeConfig.habit_check;
    const colorMap = {
        emerald: 'text-emerald-500 bg-emerald-500/10',
        orange: 'text-orange-500 bg-orange-500/10',
    };

    return (
        <div className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-white/10 p-4 flex gap-4 hover:shadow-none transition-shadow">
            <div className="size-10 rounded-full bg-slate-100 dark:bg-[#000000] flex items-center justify-center shrink-0 overflow-hidden">
                <Avatar config={entry.user.avatar} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-black text-slate-900 dark:text-white truncate">{entry.user.username || entry.user.name}</span>
                        {entry.user.username && (
                            <span className="text-xs text-slate-400 font-medium truncate">@{entry.user.username}</span>
                        )}
                        {entry.isPartner && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-pink-500/10 text-pink-500 shrink-0">Partner</span>
                        )}
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(entry.timestamp)}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-base ${colorMap[cfg.color]?.split(' ')[0]}`}>{cfg.icon}</span>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                        {cfg.verb}{' '}
                        <span className="font-black text-slate-900 dark:text-white">{entry.data.habitName}</span>
                        {entry.type === 'streak_milestone' && (
                            <span className="text-orange-500 font-black"> · {entry.data.streak} days 🔥</span>
                        )}
                    </p>
                </div>

                {/* Habit chip */}
                <div className="mt-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${colorMap[cfg.color] || 'text-slate-500 bg-slate-100 dark:bg-[#000000]'}`}>
                        <span className="material-symbols-outlined text-[12px]">{entry.data.habitIcon}</span>
                        {entry.data.habitName}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function ActivityFeed() {
    const { data: feed = [], isLoading } = useSWR('/feed');

    return (
        <div className="flex flex-col gap-3">
            {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-white/10 p-4 h-20 animate-pulse" />
                ))
            ) : feed.length > 0 ? (
                feed.map(entry => <FeedCard key={entry.id} entry={entry} />)
            ) : (
                <div className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-white/10 p-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3 block">group</span>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No activity yet</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">Link a partner or follow public users to see their progress here.</p>
                </div>
            )}
        </div>
    );
}
