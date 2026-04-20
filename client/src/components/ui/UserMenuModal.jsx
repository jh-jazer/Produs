import { useNavigate } from 'react-router-dom';
import DashboardModal from './DashboardModal';
import CoinDisplay from './CoinDisplay';
import CoreDisplay from './CoreDisplay';

const UserMenuModal = ({ isOpen, onClose, user, unreadCount, onOpenSettings, onOpenNotifications, onOpenBugReport, onOpenStats, onSignOut }) => {
    const navigate = useNavigate();

    return (
        <DashboardModal
            isOpen={isOpen}
            onClose={onClose}
            title={user?.username}
            subtitle={
                <div className="flex flex-row items-center gap-4 mt-3">
                    <div onClick={() => { onClose(); navigate('/dashboard/shop'); }} className="inline-block cursor-pointer active:scale-95 transition-all w-fit">
                        <CoinDisplay amount={user?.rpg?.prodCoins || 0} variant="minimal" />
                    </div>
                    <div className="inline-block w-fit opacity-80 hover:opacity-100 transition-opacity">
                        <CoreDisplay amount={user?.rpg?.cores || 0} variant="minimal" />
                    </div>
                </div>
            }
            maxWidth="max-w-md"
        >
            <div className="flex flex-col gap-2 -mt-4">
                <div className="flex flex-col gap-1">
                    <button onClick={() => { onClose(); navigate('/dashboard/shop'); }} className="w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all flex items-center gap-4 group">
                        <span className="material-symbols-outlined text-xl opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">shopping_bag</span>
                        <span>Store</span>
                    </button>

                    <button onClick={() => { onClose(); navigate('/dashboard/classes'); }} className="w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all flex items-center gap-4 group">
                        <span className="material-symbols-outlined text-xl opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">school</span>
                        <span>Classes</span>
                    </button>

                    <button onClick={() => { onClose(); onOpenNotifications(); }} className="w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-xl opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">notifications</span>
                            <span>Notifications</span>
                        </div>
                        {unreadCount > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[9px] font-black animate-pulse">
                                <span className="size-1 rounded-full bg-rose-500" />
                                {unreadCount}
                            </div>
                        )}
                    </button>

                    <button onClick={() => { onClose(); onOpenSettings(); }} className="w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all flex items-center gap-4 group">
                        <span className="material-symbols-outlined text-xl opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">settings</span>
                        <span>Settings</span>
                    </button>

                    <button onClick={() => { onClose(); onOpenStats(); }} className="w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all flex items-center gap-4 group">
                        <span className="material-symbols-outlined text-xl opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">bar_chart</span>
                        <span>Statistics</span>
                    </button>

                    <div className="my-2 border-t border-black/[0.05] dark:border-white/[0.05]" />

                    <button onClick={onSignOut} className="w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 hover:bg-rose-500/5 rounded-2xl transition-all flex items-center gap-4 group">
                        <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">logout</span>
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </DashboardModal>
    );
};

export default UserMenuModal;
