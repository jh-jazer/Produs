import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    X, 
    Target, 
    Book, 
    Calendar, 
    FileText, 
    CreditCard, 
    ListChecks 
} from 'lucide-react';
import { DashboardContext } from '../../context/DashboardContext';
import ChippedBorder from './ChippedBorder';

const QuickActionModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { 
        setIsAddGoalModalOpen, 
        setIsAddEventModalOpen, 
        setIsAddTransactionModalOpen 
    } = useContext(DashboardContext);

    const actions = [
        { id: 'goal', label: 'Goal', icon: Target, onClick: () => setIsAddGoalModalOpen(true) },
        { id: 'journal', label: 'Journal', icon: Book, onClick: () => navigate('/dashboard/writing/journal') },
        { id: 'event', label: 'Event', icon: Calendar, onClick: () => setIsAddEventModalOpen(true) },
        { id: 'note', label: 'Note', icon: FileText, onClick: () => navigate('/dashboard/writing/notes') },
        { id: 'transaction', label: 'Transaction', icon: CreditCard, onClick: () => setIsAddTransactionModalOpen(true) },
        { id: 'list', label: 'List', icon: ListChecks, onClick: () => navigate('/dashboard/writing/lists') },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-2xl bg-white dark:bg-[#080808] p-10 rounded-sm overflow-hidden border border-black dark:border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]"
                    >
                        <ChippedBorder opacity={0.3} />
                        
                        {/* Header */}
                        <div className="relative z-10 mb-12 flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-[14px] font-black uppercase tracking-[0.4em] text-black dark:text-white leading-none italic">
                                    Operation_Central
                                </h3>
                                <p className="text-[9px] font-mono uppercase tracking-widest text-black/40 dark:text-white/40">
                                    Execute Tactical Entry
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-8 flex items-center justify-center rounded-sm bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-all active:scale-90"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Action Grid */}
                        <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-6">
                            {actions.map((action, index) => (
                                <motion.button
                                    key={action.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => {
                                        action.onClick();
                                        onClose();
                                    }}
                                    className="group flex flex-col items-center gap-4 p-6 rounded-sm border border-black/5 dark:border-white/5 hover:border-black dark:hover:border-white/20 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all"
                                >
                                    <div className="size-16 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xl shadow-black/10 transition-transform group-hover:scale-110 group-active:scale-95">
                                        <action.icon size={28} strokeWidth={1.5} />
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white transition-colors group-hover:text-primary">
                                            {action.label}
                                        </span>
                                        <div className="w-4 h-[1px] bg-black/10 dark:bg-white/10 group-hover:w-8 transition-all" />
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="relative z-10 mt-12 pt-8 border-t border-black/5 dark:border-white/5 flex justify-center">
                            <button
                                onClick={onClose}
                                className="text-[9px] font-black uppercase tracking-[0.5em] text-black/20 dark:text-white/20 hover:text-black dark:hover:text-white transition-all"
                            >
                                ABORT_HUB_LINK
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default QuickActionModal;
