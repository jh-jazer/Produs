import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardModal from './DashboardModal';
import { Search, Download, Book, Zap, LayoutGrid, Box, Cpu } from 'lucide-react';

const ToolsMarketplaceModal = ({ isOpen, onClose, category = 'all' }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const allTools = [
        // Spiritual
        { id: 'journal', name: 'Neural Journal', category: 'Spiritual', icon: <Book className="w-5 h-5" />, description: 'Cognitive reflection and neural logging.', path: '/dashboard/spiritual', tabId: 'journal' },
        
        // Intellectual
        { id: 'tracker', name: 'Habit Matrix', category: 'Intellectual', icon: <Zap className="w-5 h-5" />, description: 'Neuroplasticity reinforcement via habit loops.', path: '/dashboard/intellectual', tabId: 'tracker' },
        { id: 'planner', name: 'Tactical Planner', category: 'Intellectual', icon: <LayoutGrid className="w-5 h-5" />, description: 'Daily block scheduling and task prioritization.', path: '/dashboard/intellectual', tabId: 'planner' },
        { id: 'calendar', name: 'Event Calendar', category: 'Intellectual', icon: <Box className="w-5 h-5" />, description: 'Full-spectrum calendar and event management.', path: '/dashboard/intellectual', tabId: 'calendar' },
        { id: 'goals', name: 'Goal Setter', category: 'Intellectual', icon: <Cpu className="w-5 h-5" />, description: 'Long-term mission parameters and key goals.', path: '/dashboard/intellectual', tabId: 'goals' },
        { id: 'priority', name: 'Priority HUD', category: 'Intellectual', icon: <Zap className="w-5 h-5" />, description: 'High-density daily focus objectives.', path: '/dashboard/intellectual', tabId: 'priority' },

        // Physical
        { id: 'workout', name: 'Kinetix Tracker', category: 'Physical', icon: <Zap className="w-5 h-5" />, description: 'Biometric physical activity and workout logging.', path: '/dashboard/physical', tabId: 'workout' },
        { id: 'nutrition', name: 'Metabolic Log', category: 'Physical', icon: <Box className="w-5 h-5" />, description: 'Dietary intake and metabolic tracking.', path: '/dashboard/physical', tabId: 'nutrition' },
        { id: 'bmi', name: 'Vitals Monitor', category: 'Physical', icon: <Cpu className="w-5 h-5" />, description: 'Body metrics and vital sign analysis.', path: '/dashboard/physical', tabId: 'bmi' },
        { id: 'water', name: 'Hydration Link', category: 'Physical', icon: <Zap className="w-5 h-5" />, description: 'Real-time hydration and fluid tracking.', path: '/dashboard/physical', tabId: 'water' },
        { id: 'sleep', name: 'Circadian Sync', category: 'Physical', icon: <Box className="w-5 h-5" />, description: 'Sleep cycle and recovery optimization.', path: '/dashboard/physical', tabId: 'sleep' },

        // Financial
        { id: 'summary', name: 'Ledger Prime', category: 'Financial', icon: <LayoutGrid className="w-5 h-5" />, description: 'Universal financial overview and net worth.', path: '/dashboard/financial', tabId: 'summary' },
        { id: 'budget', name: 'Asset Allocator', category: 'Financial', icon: <Cpu className="w-5 h-5" />, description: 'Monthly budget and spending management.', path: '/dashboard/financial', tabId: 'budget' },
        { id: 'savings', name: 'Vault Security', category: 'Financial', icon: <Book className="w-5 h-5" />, description: 'Savings goals and secure asset storage.', path: '/dashboard/financial', tabId: 'savings' },
        { id: 'wishlist', name: 'Target Acquisition', category: 'Financial', icon: <Box className="w-5 h-5" />, description: 'Purchase planning and acquisition targets.', path: '/dashboard/financial', tabId: 'wishlist' },
        { id: 'debts', name: 'Flow Manager', category: 'Financial', icon: <Zap className="w-5 h-5" />, description: 'Debt reduction and cash flow tracking.', path: '/dashboard/financial', tabId: 'debts' },

        // Emotional & Social (Placeholders)
        { id: 'mood', name: 'Mood Pulse', category: 'Emotional', icon: <Cpu className="w-5 h-5" />, description: 'Emotional state monitoring and analysis.', path: '/dashboard', tabId: 'mood' },
        { id: 'contacts', name: 'Node Network', category: 'Social', icon: <LayoutGrid className="w-5 h-5" />, description: 'Relationship management and social nodes.', path: '/dashboard', tabId: 'contacts' },
    ];

    const filteredTools = allTools.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = category === 'all' || tool.category.toLowerCase() === category.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    return (
        <DashboardModal
            isOpen={isOpen}
            onClose={onClose}
            title={`${category.toUpperCase()}_MARKETPLACE`}
            maxWidth="max-w-2xl"
        >
            <div className="flex flex-col gap-6">
                {/* Search HUD */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder={`SEARCH_IN_${category.toUpperCase()}...`} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-sm py-4 pl-12 pr-4 text-[10px] font-mono uppercase tracking-widest outline-none focus:border-primary/40 focus:bg-primary/[0.02] transition-all"
                        />
                    </div>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                        {filteredTools.map((tool) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={tool.id}
                                className="group p-4 rounded-sm border border-foreground/5 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all flex items-start gap-4"
                            >
                                <div className="size-12 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 border border-foreground/10">
                                    <span className="material-symbols-outlined text-xl text-foreground/60">{tool.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest truncate">{tool.name}</h4>
                                        <span className="text-[7px] font-mono text-primary/60 uppercase shrink-0">{tool.category}</span>
                                    </div>
                                    <p className="text-[9px] text-foreground/40 font-mono uppercase tracking-tight line-clamp-2 leading-relaxed mb-3">
                                        {tool.description}
                                    </p>
                                    <button className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 hover:bg-foreground hover:text-background transition-all rounded-sm">
                                        <Download size={10} />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Install</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {filteredTools.length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center gap-3 opacity-20">
                            <span className="material-symbols-outlined text-4xl">search_off</span>
                            <span className="text-[10px] font-mono uppercase tracking-[0.4em]">NO_DATA_FOUND</span>
                        </div>
                    )}
                </div>

                {/* Marketplace Disclaimer */}
                <div className="pt-4 border-t border-foreground/5">
                    <p className="text-[7px] font-mono text-foreground/20 uppercase tracking-[0.2em] text-center italic">
                        All modules are verified for cognitive safety and neural compatibility.
                    </p>
                </div>
            </div>
        </DashboardModal>
    );
};

export default ToolsMarketplaceModal;
