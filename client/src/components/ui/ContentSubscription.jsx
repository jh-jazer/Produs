import React, { useState } from 'react';
import { SUBSCRIPTION_TOPICS } from '../../data/subscriptions';
import SubscriptionModal from './SubscriptionModal';
import useAuthStore from '../../store/useAuthStore';

const ContentSubscription = ({ compact = false }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user = useAuthStore(state => state.user);
    const subscriptions = user?.settings?.subscriptions || [];

    const activeTopics = SUBSCRIPTION_TOPICS.filter(t => subscriptions.includes(t.id));

    if (compact) {
        return (
            <>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group"
                >
                    <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                    <span className="hidden md:inline">Subscriptions</span>
                    <div className="hidden md:block size-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    <span className="text-primary font-bold">{subscriptions.length}</span>
                </button>

                <SubscriptionModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    currentSubscriptions={subscriptions}
                />
            </>
        );
    }

    return (
        <div className="w-full">
            <div className="flex flex-col gap-4">
                <div 
                    onClick={() => setIsModalOpen(true)}
                    className="group relative overflow-hidden bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border-b-4 active:translate-y-0.5 active:border-b-0"
                >
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="size-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">auto_stories</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Content Subscriptions</h3>
                                <p className="text-sm font-medium text-slate-500">
                                    {subscriptions.length > 0 
                                        ? `Subscribed to ${subscriptions.length} topics`
                                        : "Get daily wisdom in your feed"}
                                </p>
                            </div>
                        </div>
                        <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">settings_suggest</span>
                        </div>
                    </div>

                    {activeTopics.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 relative z-10">
                            {activeTopics.map(topic => (
                                <span 
                                    key={topic.id}
                                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                                >
                                    {topic.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Fun decorative elements */}
                    <div className="absolute -right-6 -bottom-6 size-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                </div>
            </div>

            <SubscriptionModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentSubscriptions={subscriptions}
            />
        </div>
    );
};

export default ContentSubscription;
