import { useNavigate } from 'react-router-dom';
import DashboardModal from './DashboardModal';
import CoinDisplay from './CoinDisplay';
import CoreDisplay from './CoreDisplay';
import EnergyDisplay from './EnergyDisplay';
import LevelDisplay from './LevelDisplay';
import Avatar from './Avatar';

const UserMenuModal = ({ isOpen, onClose, user, unreadCount, onOpenSettings, onOpenNotifications, onOpenBugReport, onOpenStats, onSignOut }) => {
    const navigate = useNavigate();

    return (
        <DashboardModal
            isOpen={isOpen}
            onClose={onClose}
            subtitle={
                <div className="flex items-center gap-5 mt-2">
                    <div className="size-16 md:size-20 rounded-full border-2 border-black/10 dark:border-white/10 p-1 flex items-center justify-center shrink-0 relative group">
                        <div className="size-full rounded-full overflow-hidden bg-black/5 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/10">
                            <Avatar config={user?.avatar} />
                        </div>
                        {/* Level badge anchored to avatar */}
                        <div className="absolute -bottom-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg border border-black/10 dark:border-white/10 z-10">
                            {user?.level || 0}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-xl md:text-2xl font-black text-black dark:text-white uppercase tracking-[0.2em] font-mono leading-none">
                            {user?.username?.replace(/[#\d]+/g, '') || 'OPERATOR'}
                        </h3>
                        <LevelDisplay 
                            level={user?.level} 
                            exp={user?.exp} 
                            totalRequired={user?.totalRequired} 
                            nextLevelExp={user?.nextLevelExp} 
                            showXP={true}
                            variant="monochrome"
                            className="scale-90 origin-left opacity-60"
                        />
                    </div>
                </div>
            }
            maxWidth="max-w-md"
        >
            <div className="flex flex-col gap-8 -mt-2">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-3xl">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Points</span>
                        <CoinDisplay amount={user?.rpg?.prodCoins || 0} variant="minimal" />
                    </div>
                    <div className="flex flex-col items-center gap-1 border-x border-black/10 dark:border-white/10">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Cores</span>
                        <CoreDisplay amount={user?.rpg?.cores || 0} variant="minimal" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Energy</span>
                        <EnergyDisplay 
                            current={user?.rpg?.energy?.current ?? (10 + (user?.level || 0))} 
                            max={10 + (user?.level || 0)} 
                            variant="minimal" 
                        />
                    </div>
                </div>

                {/* Navigation Actions */}
                <div className="flex flex-col gap-1">
                    <button onClick={() => { onClose(); navigate('/dashboard/merchant'); }} className="w-full px-5 py-4 text-left text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all flex items-center gap-4 group">
                        <span className="material-symbols-outlined text-lg opacity-40 group-hover:opacity-100 group-hover:text-black dark:group-hover:text-white transition-all">shopping_bag</span>
                        <span>MERCHANT</span>
                    </button>

                    <button onClick={() => { onClose(); onOpenNotifications(); }} className="w-full px-5 py-4 text-left text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-lg opacity-40 group-hover:opacity-100 group-hover:text-black dark:group-hover:text-white transition-all">notifications</span>
                            <span>NOTIFICATIONS</span>
                        </div>
                        {unreadCount > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white text-[8px] font-black border border-black/10 dark:border-white/10">
                                <span className="size-1 rounded-full bg-black dark:bg-white animate-pulse" />
                                {unreadCount}
                            </div>
                        )}
                    </button>

                    <button onClick={() => { onClose(); onOpenSettings(); }} className="w-full px-5 py-4 text-left text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all flex items-center gap-4 group">
                        <span className="material-symbols-outlined text-lg opacity-40 group-hover:opacity-100 group-hover:text-black dark:group-hover:text-white transition-all">settings</span>
                        <span>SETTINGS</span>
                    </button>

                    <div className="my-2 border-t border-black/[0.05] dark:border-white/[0.05]" />

                    <button onClick={onSignOut} className="w-full px-5 py-4 text-left text-[8px] font-black uppercase tracking-[0.4em] text-rose-500 hover:bg-rose-500/5 rounded-2xl transition-all flex items-center gap-4 group">
                        <span className="material-symbols-outlined text-lg opacity-60 group-hover:opacity-100 transition-all">logout</span>
                        <span>SIGN OUT</span>
                    </button>
                </div>
            </div>
        </DashboardModal>
    );
};

export default UserMenuModal;
