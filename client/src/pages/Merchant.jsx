import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Palette, ChevronRight, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import Logo from '../components/brand/Logo';
import CoinDisplay from '../components/ui/CoinDisplay';
import CoreDisplay from '../components/ui/CoreDisplay';
import EnergyDisplay from '../components/ui/EnergyDisplay';

const ChippedBorder = ({ opacity = 0.8, color = "currentColor" }) => (
    <div
        className="absolute inset-[-2px] rounded-sm pointer-events-none z-0"
        style={{
            border: `4px solid ${color}`,
            opacity,
            clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
        }}
    />
);

const HUDPanel = ({ title, subtitle, children, headerExtra, className = "" }) => (
    <div className={`relative bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all p-8 rounded-sm group overflow-hidden ${className}`}>
        <ChippedBorder opacity={0.6} />
        <div className="relative z-10">
            <div className="mb-8 flex justify-between items-start">
                <div className="flex flex-col gap-1">
                    <span className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-foreground/95">{title}</span>
                </div>
                {headerExtra && <div className="flex gap-2">{headerExtra}</div>}
            </div>
            {children}
        </div>
    </div>
);

const Merchant = () => {
    const { user, syncUser } = useAuthStore();
    const [purchasing, setPurchasing] = useState(null);
    const [message, setMessage] = useState(null);

    const CATALOG = [
        {
            id: 'theme_midnight',
            name: 'Midnight Theme',
            description: 'Elite high-contrast nocturnal interface for deep operation.',
            price: 500,
            category: 'Theme',
            icon: <Palette size={20} />,
            themeId: 'midnight',
            color: 'bg-indigo-500'
        },
        {
            id: 'theme_forest',
            name: 'Forest Theme',
            description: 'Organic verdant aesthetics for focused mental growth.',
            price: 500,
            category: 'Theme',
            icon: <Palette size={20} />,
            themeId: 'forest',
            color: 'bg-emerald-500'
        },
        {
            id: 'theme_rose',
            name: 'Rose Theme',
            description: 'Vibrant frequency for high-velocity tactical activity.',
            price: 500,
            category: 'Theme',
            icon: <Palette size={20} />,
            themeId: 'rose',
            color: 'bg-rose-500'
        },
        {
            id: 'theme_amber',
            name: 'Amber Theme',
            description: 'Industrial glow for deep engineering and focus sessions.',
            price: 500,
            category: 'Theme',
            icon: <Palette size={20} />,
            themeId: 'amber',
            color: 'bg-amber-500'
        },
        {
            id: 'booster_xp_2x',
            name: '2x XP Booster',
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
        <div className="w-full bg-transparent text-foreground p-8 pt-0 md:p-12 font-sans overflow-x-hidden flex flex-col md:flex-row items-start gap-8 md:gap-12">

            <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col gap-8 md:gap-12">
                <HUDPanel title="FUNDS" subtitle="AVAILABLE CAPITAL">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="relative group bg-foreground/[0.02] p-6 rounded-sm overflow-hidden flex items-center justify-between">
                            <ChippedBorder opacity={0.2} />
                            <div className="relative z-10 w-full">
                                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground/40 mb-2">PROD POINTS</p>
                                <CoinDisplay amount={user?.rpg?.prodCoins || 0} />
                            </div>
                            <div className="absolute right-0 top-0 size-32 bg-foreground/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
                        </div>

                        <div className="relative group bg-foreground/[0.02] p-6 rounded-sm overflow-hidden flex items-center justify-between">
                            <ChippedBorder opacity={0.2} />
                            <div className="relative z-10 w-full">
                                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground/40 mb-2">PROD CORES</p>
                                <CoreDisplay amount={user?.rpg?.cores || 0} />
                            </div>
                            <div className="absolute right-0 top-0 size-32 bg-foreground/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
                        </div>

                        <div className="relative group bg-foreground/[0.02] p-6 rounded-sm overflow-hidden flex items-center justify-between">
                            <ChippedBorder opacity={0.2} />
                            <div className="relative z-10 w-full">
                                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground/40 mb-2">PROD ENERGY</p>
                                <EnergyDisplay current={user?.rpg?.energy?.current ?? (10 + (user?.guardianLevel || 0))} max={10 + (user?.guardianLevel || 0)} />
                            </div>
                            <div className="absolute right-0 top-0 size-32 bg-foreground/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
                        </div>
                    </div>

                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`relative p-6 rounded-sm flex items-center gap-4 bg-foreground/[0.02]`}
                            >
                                <ChippedBorder color={message.type === 'success' ? '#10b981' : '#ef4444'} opacity={0.4} />
                                <span className="material-symbols-outlined z-10" style={{ color: message.type === 'success' ? '#10b981' : '#ef4444' }}>
                                    {message.type === 'success' ? 'check_circle' : 'error'}
                                </span>
                                <p className="font-black uppercase tracking-widest text-[8px] z-10" style={{ color: message.type === 'success' ? '#10b981' : '#ef4444' }}>
                                    {message.text}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </HUDPanel>

                <HUDPanel 
                    title="THEMES" 
                    subtitle="INTERFACE AESTHETICS"
                    headerExtra={
                        <div className="size-8 rounded-sm bg-foreground/5 flex items-center justify-center text-foreground/60">
                            <Palette size={18} />
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                </HUDPanel>

                <HUDPanel 
                    title="BOOSTERS" 
                    subtitle="TACTICAL MODIFIERS"
                    headerExtra={
                        <div className="size-8 rounded-sm bg-foreground/5 flex items-center justify-center text-foreground/60">
                            <Zap size={18} />
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </HUDPanel>

                {/* System Metadata Footer matching Intellectual */}
                <div className="mt-16 pt-8 border-t border-foreground/5 flex justify-between items-center opacity-20">
                    <span className="text-[8px] font-black uppercase tracking-[0.5em]">PRODUS MERCHANT PROTOCOL v0.2</span>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map(i => <div key={i} className="size-1 bg-foreground rounded-full" />)}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShopCard = ({ item, onPurchase, owned, purchasing, canAfford }) => {
    return (
        <div className={`relative group p-5 bg-foreground/[0.02] hover:bg-foreground/[0.05] rounded-sm overflow-hidden flex flex-col transition-all min-h-[200px]`}>
            <ChippedBorder opacity={owned ? 0.8 : 0.2} color={owned ? 'var(--primary)' : 'currentColor'} />

            {/* Tactical Color Accent Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${item.color} opacity-50 group-hover:opacity-100 transition-opacity z-0`} />

            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-40 h-40 ${item.color} opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-30 transition-opacity duration-700`} />

            <div className="relative z-10 flex-1 flex flex-col pl-2">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-2 rounded-sm ${item.color} flex items-center justify-center text-white shadow-lg shadow-black/20`}>
                        {item.icon}
                    </div>
                    {owned ? (
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-foreground/10 text-foreground text-[8px] font-black uppercase border border-foreground/20">
                            <CheckCircle2 size={12} /> Owned
                        </span>
                    ) : (
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                <Logo className="size-3" glow={false} />
                                <span className={`text-[8px] font-mono uppercase tracking-widest ${!canAfford ? 'text-rose-500' : 'text-foreground'}`}>
                                    {item.price}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1 flex-1 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground/40 truncate">{item.name}</span>
                    <span className="text-[8px] font-mono uppercase tracking-widest opacity-20 leading-relaxed">{item.description}</span>
                </div>

                <button
                    disabled={owned || purchasing || !canAfford}
                    onClick={onPurchase}
                    className={`mt-6 w-full py-3 rounded-sm flex items-center justify-center gap-2 font-black text-[8px] uppercase tracking-widest transition-all
                        ${owned
                            ? 'bg-foreground/5 text-foreground/20 cursor-default'
                            : !canAfford
                                ? 'bg-rose-500/10 text-rose-500/50 cursor-not-allowed border border-rose-500/20'
                                : 'bg-foreground text-background hover:bg-foreground/90 active:scale-95'
                        }
                    `}
                >
                    {purchasing ? (
                        <div className="size-3 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    ) : owned ? (
                        'UNLOCKED'
                    ) : !canAfford ? (
                        'FUNDS LOW'
                    ) : (
                        <>PURCHASE <ChevronRight size={14} /></>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Merchant;
