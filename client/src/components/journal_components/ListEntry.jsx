import React, { useState } from 'react';
import { ChevronLeft, Plus, Trash2, CheckSquare, Square } from 'lucide-react';

const ListEntry = ({ onSave, onBack, initialList }) => {
    const [title, setTitle] = useState(initialList ? initialList.title : '');
    const [items, setItems] = useState(initialList ? initialList.items : []);
    const [newItemText, setNewItemText] = useState('');

    const handleAddItem = (e) => {
        e?.preventDefault();
        if (!newItemText.trim()) return;
        setItems([...items, { id: Date.now().toString(), text: newItemText.trim(), done: false }]);
        setNewItemText('');
    };

    const handleToggleItem = (id) => {
        setItems(items.map(item => item.id === id ? { ...item, done: !item.done } : item));
    };

    const handleDeleteItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleClear = () => {
        setTitle('');
        setItems([]);
        setNewItemText('');
    };

    const handleConfirm = () => {
        if (!title.trim() && items.length === 0) return;
        onSave?.({
            title: title.trim() || 'UNTITLED_CHECKLIST',
            items
        });
        handleClear();
    };

    return (
        <div className="border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden flex flex-col bg-slate-50 dark:bg-[#1f293a] transition-shadow shadow-none text-left">
            {/* Top Bar: Navigation Back button */}
            <div className="bg-white dark:bg-[#121212] px-6 pt-6 flex justify-between items-center gap-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">CREATE LIST</span>
            </div>

            {/* Title Input Area */}
            <div className="bg-white dark:bg-[#121212] px-6 pt-4 pb-2 flex items-center gap-3">
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Checklist Title"
                    className="bg-transparent border-none focus:ring-0 text-2xl md:text-3xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 w-full p-0 tracking-tight outline-none"
                />
            </div>

            {/* Interactive Items Roster */}
            <div className="w-full bg-white dark:bg-[#121212] px-6 py-4 flex flex-col min-h-[220px] justify-between">
                <div className="flex flex-col gap-2">
                    {items.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4">No items added yet. Add items below.</p>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex items-center justify-between group/item py-2 px-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                <button 
                                    type="button"
                                    onClick={() => handleToggleItem(item.id)}
                                    className="flex items-center gap-3 text-left flex-1 min-w-0"
                                >
                                    {item.done ? (
                                        <CheckSquare className="size-4 text-primary shrink-0" />
                                    ) : (
                                        <Square className="size-4 text-slate-400 shrink-0" />
                                    )}
                                    <span className={`text-lg font-medium truncate ${item.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {item.text}
                                    </span>
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="opacity-0 group-hover/item:opacity-100 transition-opacity text-slate-400 hover:text-red-500 p-1"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Subform Input Row */}
                <form onSubmit={handleAddItem} className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
                    <input 
                        type="text" 
                        placeholder="Add an item..." 
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        className="flex-1 bg-transparent border-b border-slate-200 dark:border-white/10 px-2 py-1.5 text-sm outline-none text-slate-800 dark:text-slate-200 focus:border-primary font-medium"
                    />
                    <button 
                        type="submit"
                        className="text-[10px] font-black tracking-wider uppercase bg-primary/10 text-primary px-3 py-1.5 hover:bg-primary/20 rounded-lg transition-colors shrink-0"
                    >
                        <Plus className="size-3.5 inline mr-1" /> Add
                    </button>
                </form>
            </div>

            {/* Confirm/Clear Bottom Toolbar */}
            <div className="bg-white dark:bg-[#121212] p-4 px-6 border-t border-slate-100 dark:border-white/10 flex items-center justify-end">
                <div className="flex items-center gap-2">
                    <button 
                        type="button"
                        onClick={onBack}
                        className="px-6 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                    >
                        Back
                    </button>
                    <button 
                        type="button"
                        onClick={handleConfirm}
                        disabled={!title.trim() && items.length === 0}
                        className="px-8 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all disabled:opacity-30 shadow-xl shadow-black/10 active:scale-95"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListEntry;
