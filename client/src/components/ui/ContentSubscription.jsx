/* eslint-disable */
import React from 'react';
import feedData from '../../data/feed_mock_dataset_500_posts.json';
import useAuthStore from '../../store/useAuthStore';

const ContentSubscription = ({ compact = false }) => {
    const user = useAuthStore(state => state.user);
    const subscriptions = user?.settings?.subscriptions || [];

    const activeTopics = feedData.channels.filter(t => subscriptions.includes(t.channel_id));

    if (compact) {
        return (
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 group">
                <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                <span className="hidden md:inline">Topics</span>
                <div className="hidden md:block size-1 bg-slate-200 dark:bg-[#121212] rounded-full" />
                <span className="text-primary font-bold">{subscriptions.length}</span>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex flex-col gap-4">
                <div 
                    className="group relative overflow-hidden bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 shadow-none border-b-4"
                >
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="size-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary transition-transform">
                                <span className="material-symbols-outlined text-3xl">auto_stories</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Feed Topics</h3>
                                <p className="text-sm font-medium text-slate-500">
                                    {subscriptions.length > 0 
                                        ? `Exploring ${subscriptions.length} channels`
                                        : "Get daily wisdom in your feed"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {activeTopics.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 relative z-10">
                            {activeTopics.map(topic => (
                                <span 
                                    key={topic.channel_id}
                                    className="px-3 py-1 bg-slate-100 dark:bg-[#000000] rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10"
                                >
                                    {topic.name}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="absolute -right-6 -bottom-6 size-32 bg-primary/5 rounded-full blur-3xl opacity-50" />
                </div>
            </div>
        </div>
    );
};

export default ContentSubscription;
