import { useNavigate } from 'react-router-dom';
import DashboardModal from './DashboardModal';
import LevelDisplay from './LevelDisplay';
import Avatar from './Avatar';

const UserMenuModal = ({ isOpen, onClose, user, unreadCount, hasAnyUnread, onOpenSettings, onOpenNotifications, onOpenBugReport, onOpenStats, onSignOut, onOpenMerchant }) => {
    const navigate = useNavigate();

    const exp = user?.guardianExp || 0;
    const totalRequired = user?.totalRequired || 0;
    const nextLevelExp = user?.nextLevelExp || 100;
    const progressPct = Math.min(100, Math.max(0, ((exp - totalRequired) / nextLevelExp) * 100));
    const circumference = 2 * Math.PI * 47;


    return (
        <DashboardModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="max-w-md"
        >
            <div className="flex flex-col gap-8 -mt-2">
                {/* User Identity Header */}
                <div className="flex items-center gap-5">
                    <div className="size-16 md:size-20 rounded-full p-1.5 flex items-center justify-center shrink-0 relative group">
                        {/* EXP Progress Ring */}
                        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90 pointer-events-none drop-shadow-md">
                            {/* Track */}
                            <circle cx="50" cy="50" r="47" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-foreground/10" />
                            {/* Progress Indicator */}
                            <circle 
                                cx="50" cy="50" r="47" 
                                fill="transparent" 
                                stroke="currentColor" 
                                strokeWidth="3" 
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference * (1 - progressPct / 100)}
                                className="text-foreground transition-all duration-1000 ease-[0.16,1,0.3,1]"
                            />
                        </svg>

                        <div className="size-full rounded-full overflow-hidden bg-foreground/10 relative z-10">
                            <Avatar config={user?.avatar} />
                        </div>
                        {/* Level badge anchored to avatar */}
                        <div className="absolute -bottom-1 -right-1 bg-foreground text-background text-[8px] font-black px-1 py-0.5 rounded-md shadow-lg border border-foreground/10 z-10">
                            {user?.guardianLevel || 0}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                        <h3 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-[0.2em] font-mono leading-none">
                            {user?.username?.replace(/[#\d]+/g, '') || 'OPERATOR'}
                        </h3>
                        <div className="flex flex-col gap-3 mt-1 w-full">
                            {/* Guardian Level */}
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[8px] font-black uppercase tracking-widest text-foreground/50 dark:text-slate-400">Guardian Protocol</span>
                                <LevelDisplay 
                                    level={user?.guardianLevel} 
                                    exp={user?.guardianExp} 
                                    totalRequired={user?.totalRequired} 
                                    nextLevelExp={user?.nextLevelExp} 
                                    showXP={true}
                                    variant="default"
                                    className="scale-[0.85] origin-left"
                                Aminochrome={false}
                                />
                            </div>

                            {/* Hero Level */}
                            <div className={`flex flex-col gap-0.5 transition-opacity ${!user?.hero?.level ? 'opacity-30 grayscale pointer-events-none' : 'opacity-90'}`}>
                                <span className="text-[8px] font-black uppercase tracking-widest text-foreground/50 dark:text-amber-500/80">
                                    Hero {user?.hero?.name && user.hero.name !== 'Unnamed Hero' ? `(${user.hero.name})` : '(Locked)'}
                                </span>
                                <LevelDisplay 
                                    level={Math.max(1, user?.hero?.level || 0)} 
                                    exp={user?.hero?.exp || 0} 
                                    totalRequired={0} 
                                    nextLevelExp={100} 
                                    showXP={true}
                                    variant="default"
                                    className="scale-[0.85] origin-left"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Actions */}
                <div className="flex flex-col gap-1">
                    <button onClick={() => { onClose(); onOpenSettings(); }} className="w-full px-5 py-4 text-left text-[8px] font-black uppercase tracking-[0.4em] text-foreground/60 hover:bg-foreground/5 rounded-2xl transition-all flex items-center gap-4 group">
                        <span className="material-symbols-outlined text-lg text-foreground opacity-40 group-hover:opacity-100 transition-all">settings</span>
                        <span>SETTINGS</span>
                    </button>

                    <button onClick={() => { onClose(); onOpenBugReport(); }} className="w-full px-5 py-4 text-left text-[8px] font-black uppercase tracking-[0.4em] text-foreground/60 hover:bg-foreground/5 rounded-2xl transition-all flex items-center gap-4 group">
                        <span className="material-symbols-outlined text-lg text-foreground opacity-40 group-hover:text-rose-500 group-hover:opacity-100 transition-all">bug_report</span>
                        <span>REPORT BUG</span>
                    </button>

                    <div className="my-2 border-t border-foreground/[0.05]" />

                    <button onClick={onSignOut} className="w-full px-5 py-4 text-left text-[8px] font-black uppercase tracking-[0.4em] text-rose-500 hover:bg-rose-500/5 rounded-2xl transition-all flex items-center gap-4 group">
                        <span className="material-symbols-outlined text-lg opacity-60 group-hover:opacity-100 transition-all">logout</span>
                        <span>SIGN OUT</span>
                    </button>

                    <div className="text-center pt-5 pb-1 text-[8px] font-mono font-black text-foreground/25 dark:text-white/20 uppercase tracking-[0.4em] pointer-events-none">
                        v1.0.0
                    </div>
                </div>
            </div>
        </DashboardModal>
    );
};

export default UserMenuModal;
