import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Zap, Palette, ChevronRight, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import DashboardPanel from '../components/ui/DashboardPanel';
import Logo from '../components/brand/Logo';
import CoinDisplay from '../components/ui/CoinDisplay';

const Shop = () => {
    const { user, syncUser } = useAuthStore();
    const [purchasing, setPurchasing] = useState(null);
    const [message, setMessage] = useState(null);

    const CATALOG = [
        {
            id: 'theme_midnight',
            name: 'Midnight Protocol',
            description: 'Elite high-contrast nocturnal interface for deep operation.',
            price: 500,
            category: 'Theme',
            icon: <Palette size={20} />,
            themeId: 'midnight',
            color: 'bg-indigo-500'
        },
        {
            id: 'theme_forest',
            name: 'Forest Protocol',
            description: 'Organic verdant aesthetics for focused mental growth.',
            price: 500,
            category: 'Theme',
            icon: <Palette size={20} />,
            themeId: 'forest',
            color: 'bg-emerald-500'
        },
        {
            id: 'theme_rose',
            name: 'Rose Protocol',
            description: 'Vibrant frequency for high-velocity tactical activity.',
            price: 500,
            category: 'Theme',
            icon: <Palette size={20} />,
            themeId: 'rose',
            color: 'bg-rose-500'
        },
        {
            id: 'theme_amber',
            name: 'Amber Protocol',
            description: 'Industrial glow for deep engineering and focus sessions.',
            price: 500,
            category: 'Theme',
            icon: <Palette size={20} />,
            themeId: 'amber',
            color: 'bg-amber-500'
        },
        {
            id: 'booster_xp_2x',
            name: 'Metabolic Override',
            description: 'Synchronize 2x EXP gain across all pillars for 24 hours.',
            price: 1000,
            category: 'Booster',
            icon: <Zap size={20} />,
            color: 'bg-cyan-500'
        }
    ];

    const handlePurchase = async (item) => {
        setPurchasing(item.id);
        try {
            const { data } = await api.post('/rpg/purchase', { itemId: item.id });
            syncUser(data.user);
            setMessage({ type: 'success', text: data.message });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Operational Failure' });
            setTimeout(() => setMessage(null), 3000);
        } finally {
            setPurchasing(null);
        }
    };

    const isOwned = (item) => {
        if (item.category === 'Theme') {
            return user?.rpg?.inventory?.themes?.includes(item.themeId);
        }
        return false;
    };

    return (
        <div className="w-full text-left">
            <DashboardPanel 
                title="TERMINAL_SHOP" 
                subtitle="ACQUISITION_INTERFACE" 
                icon={ShoppingBag} 
                showZap
            >
                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="p-6 rounded-3xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-center justify-between group overflow-hidden relative">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Available Capital</p>
                            <CoinDisplay amount={user?.rpg?.prodCoins || 0} />
                        </div>
                        <div className="absolute right-0 top-0 size-32 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
                    </div>

                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={`p-6 rounded-3xl border flex items-center gap-4 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}
                            >
                                <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
                                <p className="font-black uppercase tracking-widest text-xs">{message.text}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Categories */}
                <div className="space-y-12">
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Palette size={18} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Visual Protocols</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {CATALOG.filter(i => i.category === 'Theme').map(item => (
                                <ShopCard 
                                    key={item.id} 
                                    item={item} 
                                    onPurchase={() => handlePurchase(item)}
                                    owned={isOwned(item)}
                                    purchasing={purchasing === item.id}
                                    canAfford={user?.rpg?.prodCoins >= item.price}
                                />
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                                <Zap size={18} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Metabolic Boosters</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {CATALOG.filter(i => i.category === 'Booster').map(item => (
                                <ShopCard 
                                    key={item.id} 
                                    item={item} 
                                    onPurchase={() => handlePurchase(item)}
                                    owned={false}
                                    purchasing={purchasing === item.id}
                                    canAfford={user?.rpg?.prodCoins >= item.price}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </DashboardPanel>
        </div>
    );
};

const ShopCard = ({ item, onPurchase, owned, purchasing, canAfford }) => {
    return (
        <div className={`relative group rounded-3xl bg-white dark:bg-[#121212]/40 border ${owned ? 'border-primary/20' : 'border-slate-100 dark:border-white/5'} overflow-hidden flex flex-col transition-all hover:border-primary/30`}>
            {/* Preview Area */}
            <div className={`h-24 ${item.color} opacity-20 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <div className="absolute -bottom-4 -right-4 size-20 bg-white/20 blur-2xl rounded-full" />
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center`}>
                        {item.icon}
                    </div>
                    {owned ? (
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase border border-emerald-500/20">
                            <CheckCircle2 size={12} /> Owned
                        </span>
                    ) : (
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5">
                                <Logo className="size-3" glow={false} />
                                <span className={`font-mono font-bold text-sm ${!canAfford ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                                    {item.price}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <h4 className="font-black text-xs uppercase tracking-tight text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{item.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed flex-1">{item.description}</p>

                <button
                    disabled={owned || purchasing || !canAfford}
                    onClick={onPurchase}
                    className={`mt-4 w-full py-2.5 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95
                        ${owned 
                            ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-default' 
                            : !canAfford
                                ? 'bg-rose-500/5 text-rose-500/50 cursor-not-allowed border border-rose-500/10'
                                : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95'
                        }
                    `}
                >
                    {purchasing ? (
                        <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : owned ? (
                        'UNLOCKED'
                    ) : !canAfford ? (
                        'INSUFFICIENT_FUNDS'
                    ) : (
                        <>ACQUIRE <ChevronRight size={14} /></>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Shop;
