import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import ConfirmDialog from '../ui/ConfirmDialog';

const WISHLIST_CATEGORIES = [
    { label: 'General', color: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10' },
    { label: 'Tech', color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10' },
    { label: 'Home', color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/10' },
    { label: 'Fashion', color: 'bg-pink-100 text-pink-600 dark:bg-pink-500/10' },
    { label: 'Hobby', color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/10' },
    { label: 'Fitness', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' },
    { label: 'Wellness', color: 'bg-rose-100 text-rose-600 dark:bg-rose-500/10' },
    { label: 'Education', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10' },
    { label: 'Travel', color: 'bg-sky-100 text-sky-600 dark:bg-sky-500/10' },
    { label: 'Entertainment', color: 'bg-orange-100 text-orange-600 dark:bg-orange-500/10' },
    { label: 'Vehicles', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-500/10' },
    { label: 'Gifts', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/10' },
    { label: 'Pets', color: 'bg-teal-100 text-teal-600 dark:bg-teal-500/10' },
];

const Wishlist = ({ items, budgets = [], currencySymbol, onAction, addFinanceItem, updateFinanceItem, deleteFinanceItem }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');
    const [loading, setLoading] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        budgetPrice: '',
        priority: 'Medium',
        category: 'General',
        link: '',
        imageUrl: ''
    });
    const [buyingItem, setBuyingItem] = useState(null);
    const [actualPrice, setActualPrice] = useState('');

    const handleAdd = async (e) => {
        e.preventDefault();
        const wishlistData = {
            ...newItem,
            budgetPrice: parseFloat(newItem.budgetPrice),
            price: parseFloat(newItem.budgetPrice)
        };

        await addFinanceItem('wishlist', wishlistData);
        if (onAction) onAction();
        setIsAdding(false);
        setNewItem({ title: '', budgetPrice: '', priority: 'Medium', category: 'General', link: '', imageUrl: '' });
    };

    const handleBought = async (e) => {
        e.preventDefault();
        if (!buyingItem) return;

        const actual = parseFloat(actualPrice);
        const savingsAmount = (buyingItem.budgetPrice || buyingItem.price) - actual;

        // 1. Mark wishlist item as purchased
        await updateFinanceItem(buyingItem._id, 'wishlist', {
            purchased: true,
            actualPrice: actual,
            savings: savingsAmount
        });

        // 2. Add as transaction
        await addFinanceItem('transaction', {
            title: buyingItem.title,
            amount: actual,
            type: 'expense',
            category: buyingItem.category || 'General',
            date: new Date().toISOString().split('T')[0]
        });

        // 3. Add savings transaction if saved money
        if (savingsAmount > 0) {
            await addFinanceItem('transaction', {
                title: `Saved on: ${buyingItem.title}`,
                amount: savingsAmount,
                type: 'savings',
                category: 'Savings',
                date: new Date().toISOString().split('T')[0]
            });
        }

        if (onAction) onAction();
        setBuyingItem(null);
        setActualPrice('');
    };

    const togglePurchased = async (item) => {
        await updateFinanceItem(item._id, 'wishlist', { purchased: !item.purchased });
        if (onAction) onAction();
    };

    const [confirmDelete, setConfirmDelete] = useState(null);

    const handleDelete = async (id) => {
        await deleteFinanceItem(id);
        if (onAction) onAction();
    };

    const filteredItems = items?.filter(item => 
        (filterCategory === 'All' || item.category === filterCategory) &&
        (filterStatus === 'All' || (filterStatus === 'Bought' ? item.purchased : !item.purchased)) &&
        (filterPriority === 'All' || item.priority === filterPriority)
    ) || [];

    const totalBudget = filteredItems.reduce((sum, item) => sum + (item.purchased ? 0 : (item.budgetPrice || item.price)), 0);
    const totalSavings = filteredItems.reduce((sum, item) => sum + (item.purchased ? (item.savings || 0) : 0), 0);
    const totalActualPaid = filteredItems.reduce((sum, item) => sum + (item.purchased ? (item.actualPrice || 0) : 0), 0);

    const getCategoryStyles = (categoryName) => {
        const cat = WISHLIST_CATEGORIES.find(c => c.label === categoryName);
        return cat?.color || 'bg-slate-100 text-slate-600 dark:bg-slate-500/10';
    };

    return (
        <>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="Remove from Wishlist"
                message="Are you sure you want to remove this item from your wishlist?"
                confirmLabel="Remove"
                onConfirm={() => { handleDelete(confirmDelete); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none min-h-[350px]">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">shopping_bag</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Wishlist</h3>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="size-8 rounded-lg bg-slate-100 dark:bg-[#000000] text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                </button>
            </div>

            {/* Filters Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 pb-4 border-b border-slate-50 dark:border-white/10/50">
                {/* Category Filter */}
                <div className="flex flex-col gap-1.5 focus-within:z-10 relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select
                        className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold appearance-none cursor-pointer"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        {WISHLIST_CATEGORIES.map(cat => (
                            <option key={cat.label} value={cat.label}>{cat.label}</option>
                        ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 bottom-2.5 text-slate-400 pointer-events-none">expand_more</span>
                </div>
                
                <div className="flex flex-col gap-1.5 focus-within:z-10 relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select
                        className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold appearance-none cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Unbought">Unbought</option>
                        <option value="Bought">Bought</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 bottom-2.5 text-slate-400 pointer-events-none">expand_more</span>
                </div>

                <div className="flex flex-col gap-1.5 focus-within:z-10 relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                    <select
                        className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold appearance-none cursor-pointer"
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                    >
                        <option value="All">All Priorities</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 bottom-2.5 text-slate-400 pointer-events-none">expand_more</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#000000]/50 border border-slate-100 dark:border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Projected</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{currencySymbol}{totalBudget.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Actual Paid</p>
                    <p className="text-lg font-black text-emerald-600">{currencySymbol}{totalActualPaid.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Total Saved</p>
                    <p className="text-lg font-black text-blue-600">{currencySymbol}{totalSavings.toLocaleString()}</p>
                </div>
            </div>

            <div className="space-y-2">
                {!filteredItems.length && (
                    <div className="text-center py-6 bg-slate-50/50 dark:bg-[#000000]/30 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                        <p className="text-xs text-slate-500 font-medium">No items found in this category.</p>
                    </div>
                )}

                {filteredItems.map((item) => (
                    <motion.div
                        layout
                        key={item._id}
                        className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${item.purchased
                            ? 'bg-slate-50 dark:bg-[#000000]/30 border-slate-100 dark:border-white/10/50 opacity-80'
                            : 'bg-white dark:bg-[#000000]/40 border-slate-100 dark:border-white/10/50 hover:border-slate-200 dark:hover:border-slate-600 shadow-none'
                            }`}
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative group/img">
                                {item.imageUrl ? (
                                    <div className="size-16 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-none flex-shrink-0">
                                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                                    </div>
                                ) : (
                                    <div className="size-16 rounded-xl bg-slate-100 dark:bg-[#000000] border border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-2xl">image</span>
                                    </div>
                                )}
                                
                                {item.purchased && (
                                    <div className="absolute -top-1 -right-1 size-6 bg-emerald-500 rounded-full border-2 border-white dark:border-[#192233] flex items-center justify-center shadow-none">
                                        <span className="material-symbols-outlined text-white text-[12px] font-black">check</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <h4 className={`text-sm font-bold truncate ${item.purchased ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                        {item.title}
                                    </h4>
                                    {item.isPending && (
                                        <span className="flex-shrink-0 animate-spin material-symbols-outlined text-[12px] text-amber-500">sync</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${getCategoryStyles(item.category)}`}>
                                        {item.category || 'General'}
                                    </span>
                                    {!item.purchased ? (
                                        <span className="text-xs font-black text-slate-900 dark:text-slate-200">
                                            {currencySymbol}{(item.budgetPrice || item.price).toLocaleString()}
                                        </span>
                                    ) : (
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="text-xs font-black text-slate-400 truncate">
                                                Paid {currencySymbol}{item.actualPrice?.toLocaleString()}
                                            </span>
                                            {item.savings > 0 && (
                                                <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded flex-shrink-0">
                                                    Saved {currencySymbol}{item.savings.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {!item.purchased && (
                                <button
                                    onClick={() => {
                                        setBuyingItem(item);
                                        setActualPrice(item.budgetPrice || item.price);
                                    }}
                                    title="Mark as Bought"
                                    className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">shopping_cart</span>
                                </button>
                            )}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.link && (
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all">
                                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                                </a>
                            )}
                            <button
                                onClick={() => setConfirmDelete(item._id)}
                                className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
                ))}
            </div>

            {isAdding && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#121212]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsAdding(false)}></div>
                    <form 
                        onSubmit={handleAdd} 
                        className="relative w-full max-w-md bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-200 flex flex-col gap-6"
                    >
                        <div className="flex justify-between items-center mb-1">
                            <div>
                                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">New Wishlist Item</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">What are you dreaming of?</p>
                            </div>
                            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                <input
                                    required type="text" placeholder="e.g. Mechanical Keyboard"
                                    className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                    value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Budget Price</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{currencySymbol}</span>
                                        <input
                                            required type="number" placeholder="0.00"
                                            className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                            value={newItem.budgetPrice} onChange={e => setNewItem({ ...newItem, budgetPrice: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold appearance-none"
                                        value={newItem.priority} onChange={e => setNewItem({ ...newItem, priority: e.target.value })}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL</label>
                                <input
                                    type="text" placeholder="https://image-link.com/..."
                                    className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                    value={newItem.imageUrl} onChange={e => setNewItem({ ...newItem, imageUrl: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold appearance-none"
                                    value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                >
                                    {WISHLIST_CATEGORIES.map(cat => (
                                        <option key={cat.label} value={cat.label}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-2 disabled:opacity-50">
                            {loading ? 'Adding...' : 'Add to Wishlist'}
                        </button>
                    </form>
                </div>,
                document.body
            )}

            {buyingItem && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#121212]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setBuyingItem(null)}></div>
                    <form 
                        onSubmit={handleBought} 
                        className="relative w-full max-w-sm bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-200 flex flex-col gap-6"
                    >
                        <div className="text-center">
                            <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">Complete Purchase</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Confirming payment for {buyingItem.title}</p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center">Actual Price Paid</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{currencySymbol}</span>
                                <input
                                    autoFocus
                                    required type="number" step="0.01"
                                    className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl pl-9 pr-4 py-3 text-lg focus:ring-2 focus:ring-primary outline-none dark:text-white font-black text-center"
                                    value={actualPrice} onChange={e => setActualPrice(e.target.value)}
                                />
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase text-center mt-1">
                                Budget was {currencySymbol}{(buyingItem.budgetPrice || buyingItem.price).toLocaleString()}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setBuyingItem(null)} className="flex-1 py-3 bg-slate-100 dark:bg-[#000000] text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-xl">Cancel</button>
                            <button type="submit" className="flex-2 py-3 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20">Confirm</button>
                        </div>
                    </form>
                </div>,
                document.body
            )}
            </div>
        </>
    );
};

export default Wishlist;
