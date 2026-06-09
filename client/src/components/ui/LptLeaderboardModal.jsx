import React from 'react';
import DashboardModal from './DashboardModal';
import Avatar from './Avatar';
import useSWR from 'swr';
import api from '../../services/api';
import { Trophy, Award, Medal } from 'lucide-react';

const LptLeaderboardModal = ({ isOpen, onClose, currentUser }) => {
    const fetcher = url => api.get(url).then(res => res.data);
    const { data: leaderboard, error, isLoading } = useSWR(isOpen ? '/rpg/leaderboard/lpt' : null, fetcher, {
        refreshInterval: 10000 // refresh every 10 seconds while open
    });

    const getRankIcon = (index) => {
        switch (index) {
            case 0:
                return <Trophy className="size-5 text-yellow-500 fill-yellow-500/10" />;
            case 1:
                return <Award className="size-5 text-slate-300 fill-slate-300/10" />;
            case 2:
                return <Medal className="size-5 text-amber-600 fill-amber-600/10" />;
            default:
                return <span className="text-[10px] font-mono font-black text-slate-400">#{(index + 1).toString().padStart(2, '0')}</span>;
        }
    };

    return (
        <DashboardModal
            isOpen={isOpen}
            onClose={onClose}
            title="LINK PTS LEADERBOARD"
            subtitle="Annual Accumulated Link Points Ranking"
            maxWidth="max-w-md"
        >
            <div className="flex flex-col gap-4 py-2 min-h-[300px]">
                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest leading-relaxed text-center max-w-[320px] mx-auto mb-2">
                    OPERATIONAL EFFICIENCY MATRIX: CORRELATING TOTAL ACCUMULATED LINK PTS OVER THE PAST YEAR.
                </p>

                {isLoading ? (
                    <div className="flex flex-col gap-3 flex-1 justify-center items-center py-12">
                        <span className="material-symbols-outlined text-3xl animate-spin text-blue-500">sync</span>
                        <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-slate-400 animate-pulse">Retrieving leader logs...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 font-mono text-rose-500 text-xs">
                        FAILED TO LOAD LEADERBOARD RECORDS.
                    </div>
                ) : !leaderboard || leaderboard.length === 0 ? (
                    <div className="text-center py-12 font-mono text-slate-400 text-[10px] uppercase tracking-wider">
                        NO LEADER RECORDS RECORDED YET.
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[380px] pr-1">
                        {leaderboard.map((item, idx) => {
                            const isCurrentUser = item.users?.some(u => u._id === currentUser?._id);
                            const itemKey = Array.isArray(item._id) ? item._id.join('-') : item._id;
                            const users = item.users || [];
                            return (
                                <div
                                    key={itemKey}
                                    className={`flex items-center justify-between p-3 rounded-sm border transition-all ${
                                        isCurrentUser
                                            ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                            : 'bg-black/5 dark:bg-white/[0.02] border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'
                                    }`}
                                >
                                    {/* Left section: Rank & User */}
                                    <div className="flex items-center gap-3">
                                        {/* Rank badge */}
                                        <div className="size-8 flex items-center justify-center shrink-0 bg-black/5 dark:bg-white/5 rounded-full border border-black/5 dark:border-white/5">
                                            {getRankIcon(idx)}
                                        </div>

                                        {/* Overlapping Avatars */}
                                        <div className="flex items-center -space-x-3 shrink-0">
                                            {users.map((u, i) => (
                                                <div key={u._id} className="size-8 rounded-full overflow-hidden border border-background bg-background shrink-0 relative" style={{ zIndex: 10 - i }}>
                                                    <Avatar config={u.avatar} />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Name / Username */}
                                        <div className="flex flex-col text-left">
                                            <span className={`text-[11px] font-black uppercase tracking-wider ${isCurrentUser ? 'text-blue-500' : 'text-black dark:text-white'}`}>
                                                {users.map(u => u.name).join(' & ')}
                                            </span>
                                            <span className="text-[9px] font-mono text-slate-400 leading-none">
                                                {users.map(u => `@${u.username?.split('#')[0] || 'operator'}`).join(' & ')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right section: LINK PTS Score */}
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-black font-mono text-black dark:text-white">
                                            {item.accumulatedLpt}
                                        </span>
                                        <span className="text-[7px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                                            TOTAL LINK PTS
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardModal>
    );
};

export default LptLeaderboardModal;
