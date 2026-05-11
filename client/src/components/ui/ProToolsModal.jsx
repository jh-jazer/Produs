import React from 'react';
import { motion } from 'framer-motion';
import DashboardModal from './DashboardModal';
import { useNavigate } from 'react-router-dom';
import { DashboardContext } from '../../context/DashboardContext';

const ProToolsModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { setIsMarketplaceModalOpen, setMarketplaceCategory } = React.useContext(DashboardContext);

    const categories = [
        { 
            id: 'spiritual', 
            name: 'Spiritual', 
            icon: 'auto_awesome', 
            tools: [
                { id: 'journal', name: 'Neural Journal', icon: 'edit_note', path: '/dashboard/spiritual', tabId: 'journal' },
            ] 
        },
        { 
            id: 'intellectual', 
            name: 'Intellectual', 
            icon: 'psychology', 
            tools: [
                { id: 'tracker', name: 'Habit Matrix', icon: 'task_alt', path: '/dashboard/intellectual', tabId: 'tracker' },
                { id: 'planner', name: 'Tactical Planner', icon: 'calendar_today', path: '/dashboard/intellectual', tabId: 'planner' },
                { id: 'calendar', name: 'Temporal Sync', icon: 'event', path: '/dashboard/intellectual', tabId: 'calendar' },
                { id: 'goals', name: 'Goal Setter', icon: 'flag', path: '/dashboard/intellectual', tabId: 'goals' },
                { id: 'priority', name: 'Priority HUD', icon: 'stars', path: '/dashboard/intellectual', tabId: 'priority' },
            ] 
        },
        { 
            id: 'physical', 
            name: 'Physical', 
            icon: 'monitor_heart', 
            tools: [
                { id: 'workout', name: 'Kinetix Tracker', icon: 'fitness_center', path: '/dashboard/physical', tabId: 'workout' },
                { id: 'nutrition', name: 'Metabolic Log', icon: 'restaurant', path: '/dashboard/physical', tabId: 'nutrition' },
                { id: 'bmi', name: 'Vitals Monitor', icon: 'monitor_weight', path: '/dashboard/physical', tabId: 'bmi' },
                { id: 'water', name: 'Hydration Link', icon: 'water_drop', path: '/dashboard/physical', tabId: 'water' },
                { id: 'sleep', name: 'Circadian Sync', icon: 'bedtime', path: '/dashboard/physical', tabId: 'sleep' },
            ] 
        },
        { id: 'emotional', name: 'Emotional', icon: 'favorite', tools: [] },
        { id: 'social', name: 'Social', icon: 'group', tools: [] },
        { 
            id: 'financial', 
            name: 'Financial', 
            icon: 'payments', 
            tools: [
                { id: 'summary', name: 'Ledger Prime', icon: 'account_balance', path: '/dashboard/financial', tabId: 'summary' },
                { id: 'budget', name: 'Asset Allocator', icon: 'pie_chart', path: '/dashboard/financial', tabId: 'budget' },
                { id: 'savings', name: 'Vault Security', icon: 'shield', path: '/dashboard/financial', tabId: 'savings' },
                { id: 'wishlist', name: 'Target Acquisition', icon: 'shopping_cart', path: '/dashboard/financial', tabId: 'wishlist' },
                { id: 'debts', name: 'Flow Manager', icon: 'trending_up', path: '/dashboard/financial', tabId: 'debts' },
            ] 
        },
    ];

    return (
        <DashboardModal
            isOpen={isOpen}
            onClose={onClose}
            title="PROTOOLS"
            maxWidth="max-w-md"
        >
            <div className="flex flex-col gap-8 py-4">
                {categories.map((cat) => (
                    <div key={cat.id} className="flex flex-col gap-3">
                        {/* Category Header Row */}
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/80 shrink-0 italic">
                                {cat.name}
                            </span>
                            <div className="flex-1 h-[1px] border-t border-dashed border-foreground/20" />
                        </div>

                        {/* Tools Horizontal List */}
                        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1">
                            {/* Render installed tools for this category (future use) */}
                            {cat.tools.map((tool) => (
                                <button
                                    key={tool.id}
                                    onClick={() => {
                                        navigate(tool.path, { state: { activeTab: tool.tabId } });
                                        onClose();
                                    }}
                                    className="size-12 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center shrink-0 hover:bg-foreground hover:text-background transition-all group"
                                    title={tool.name}
                                >
                                    <span className="material-symbols-outlined text-xl transition-transform group-hover:scale-110">{tool.icon}</span>
                                </button>
                            ))}

                            {/* Add Button - Always at the end */}
                            <button
                                onClick={() => {
                                    setMarketplaceCategory(cat.id);
                                    setIsMarketplaceModalOpen(true);
                                }}
                                className="size-12 rounded-full border-2 border-dashed border-foreground/10 flex items-center justify-center shrink-0 hover:border-primary hover:bg-primary/5 active:scale-95 group transition-all"
                                title={`Add ${cat.name} Tool`}
                            >
                                <span className="material-symbols-outlined text-xl text-foreground/20 group-hover:text-primary transition-colors">
                                    add
                                </span>
                            </button>

                            {/* Placeholder for empty space feel */}
                            <div className="flex-1" />
                        </div>
                    </div>
                ))}

            </div>
        </DashboardModal>
    );
};

export default ProToolsModal;
