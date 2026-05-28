import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import ConfirmDialog from '../ui/ConfirmDialog';
import DashboardPanel from '../ui/DashboardPanel';

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
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const { data } = await api.post('/finance/wishlist/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewItem(prev => ({ ...prev, imageUrl: data.url }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

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
            <div className="min-h-[350px] flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/35 dark:text-white/20">WISHLIST TRACKER</span>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="size-8 rounded-sm border border-black/20 dark:border-white/10 text-black/45 dark:text-white/40 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                </div>

                {/* Filters Navigation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-black/10 dark:border-white/5">
                    {/* Category Filter */}
                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-black text-black/35 dark:text-white/20 uppercase tracking-widest ml-1">SELECT CATEGORY</label>
                        <select
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-sm px-4 py-2 text-[10px] outline-none text-black dark:text-white font-black uppercase tracking-wider appearance-none cursor-pointer hover:border-black/35 dark:hover:border-white/20 transition-all"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="All" className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white">ALL CATEGORIES</option>
                            {WISHLIST_CATEGORIES.map(cat => (
                                <option key={cat.label} value={cat.label} className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white">{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-black text-black/35 dark:text-white/20 uppercase tracking-widest ml-1">STATUS</label>
                        <select
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-sm px-4 py-2 text-[10px] outline-none text-black dark:text-white font-black uppercase tracking-wider appearance-none cursor-pointer hover:border-black/35 dark:hover:border-white/20 transition-all"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All" className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white">ALL STATUS</option>
                            <option value="Unbought" className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white">WISH</option>
                            <option value="Bought" className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white">BOUGHT</option>
                        </select>
                    </div>

                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-black text-black/35 dark:text-white/20 uppercase tracking-widest ml-1">PRIORITY</label>
                        <select
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/10 rounded-sm px-4 py-2 text-[10px] outline-none text-black dark:text-white font-black uppercase tracking-wider appearance-none cursor-pointer hover:border-black/35 dark:hover:border-white/20 transition-all"
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                        >
                            <option value="All" className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white">ALL LEVELS</option>
                            <option value="High" className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white">HIGH</option>
                            <option value="Medium" className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white">MEDIUM</option>
                            <option value="Low" className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white">LOW</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-6 rounded-sm bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/5">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/35 dark:text-white/20 mb-2">ESTIMATED TOTAL</p>
                        <p className="text-xl font-black text-black dark:text-white italic">{currencySymbol}{totalBudget.toLocaleString()}</p>
                    </div>
                    <div className="p-6 rounded-sm bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/5">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/35 dark:text-white/20 mb-2">TOTAL SPENT</p>
                        <p className="text-xl font-black text-black dark:text-white italic">{currencySymbol}{totalActualPaid.toLocaleString()}</p>
                    </div>
                    <div className="p-6 rounded-sm bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/5">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/35 dark:text-white/20 mb-2">TOTAL SAVED</p>
                        <p className="text-xl font-black text-black dark:text-white italic">{currencySymbol}{totalSavings.toLocaleString()}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {!filteredItems.length && (
                        <div className="text-center py-12 bg-black/[0.01] dark:bg-white/[0.02] rounded-sm border border-dashed border-black/10 dark:border-white/5 opacity-40">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/50 dark:text-white/40">NO ITEMS FOUND</p>
                        </div>
                    )}

                    {filteredItems.map((item) => (
                        <motion.div
                            layout
                            key={item._id}
                            className={`group flex items-center justify-between p-4 rounded-sm border transition-all ${item.purchased
                                ? 'bg-black/[0.01] dark:bg-white/[0.01] border-black/5 dark:border-white/5 opacity-40'
                                : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/5 hover:border-black/30 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/[0.04]'
                                }`}
                        >
                            <div className="flex items-center gap-6 flex-1">
                                <div className="relative">
                                    {item.imageUrl ? (
                                        <div className="size-16 rounded-sm overflow-hidden border border-black/10 dark:border-white/10 flex-shrink-0 grayscale group-hover:grayscale-0 transition-all">
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="size-16 rounded-sm bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-black/20 dark:text-white/20 text-2xl">image</span>
                                        </div>
                                    )}
                                    
                                    {item.purchased && (
                                        <div className="absolute -top-1 -right-1 size-5 bg-black text-white dark:bg-white dark:text-black rounded-sm flex items-center justify-center border border-black dark:border-white">
                                            <span className="material-symbols-outlined text-[10px] font-black">check</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-[11px] font-black uppercase tracking-wider text-black dark:text-white">
                                            {item.title}
                                        </h4>
                                        {item.isPending && (
                                            <span className="flex-shrink-0 animate-spin material-symbols-outlined text-[10px] text-black/20 dark:text-white/20">sync</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-1.5">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-black/45 dark:text-white/40">
                                            {item.category || 'General'}
                                        </span>
                                        {!item.purchased ? (
                                            <span className="text-[11px] font-black text-black dark:text-white italic">
                                                {currencySymbol}{(item.budgetPrice || item.price).toLocaleString()}
                                            </span>
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                <span className="text-[11px] font-black text-black/40 dark:text-white/40 italic">
                                                    PAID {currencySymbol}{item.actualPrice?.toLocaleString()}
                                                </span>
                                                {item.savings > 0 && (
                                                    <span className="text-[8px] font-black text-black/70 dark:text-white/60 bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-sm uppercase tracking-widest">
                                                        SAVED {currencySymbol}{item.savings.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {!item.purchased && (
                                    <button
                                        onClick={() => {
                                            setBuyingItem(item);
                                            setActualPrice(item.budgetPrice || item.price);
                                        }}
                                        className="size-8 rounded-sm border border-black/10 dark:border-white/5 flex items-center justify-center text-black/30 dark:text-white/20 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-lg">shopping_cart</span>
                                    </button>
                                )}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    {item.link && (
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="size-8 rounded-sm border border-black/10 dark:border-white/5 flex items-center justify-center text-black/30 dark:text-white/20 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10">
                                            <span className="material-symbols-outlined text-lg">open_in_new</span>
                                        </a>
                                    )}
                                    <button
                                        onClick={() => setConfirmDelete(item._id)}
                                        className="size-8 rounded-sm border border-black/10 dark:border-white/5 flex items-center justify-center text-black/30 dark:text-white/20 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
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
                        <DashboardPanel
                            className="w-full max-w-md z-10 animate-in zoom-in-95 duration-200"
                            title="New Wishlist Item"
                            subtitle="What are you dreaming of?"
                            headerExtra={
                                <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            }
                        >
                        <form 
                            onSubmit={handleAdd} 
                            className="flex flex-col gap-6"
                        >

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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Image</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {/* Upload Area */}
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`relative h-32 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                                                newItem.imageUrl ? 'border-primary/50' : 'border-slate-200 dark:border-white/10 hover:border-primary/50 bg-slate-50/50 dark:bg-white/5'
                                            }`}
                                        >
                                            {newItem.imageUrl ? (
                                                <>
                                                    <img src={newItem.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Preview" />
                                                    <div className="relative z-10 flex flex-col items-center gap-2">
                                                        <span className="material-symbols-outlined text-primary">check_circle</span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-white dark:bg-black px-3 py-1 rounded-full shadow-sm">Change Image</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    {uploading ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="size-6 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Uploading...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span className="material-symbols-outlined text-slate-400">upload_file</span>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Image</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                onChange={handleImageUpload} 
                                                className="hidden" 
                                                accept="image/*" 
                                            />
                                        </div>

                                        {/* URL Fallback */}
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-slate-400 text-sm">link</span>
                                            </div>
                                            <input
                                                type="text" placeholder="Or paste image URL..."
                                                className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-[10px] focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                                value={newItem.imageUrl} onChange={e => setNewItem({ ...newItem, imageUrl: e.target.value })}
                                            />
                                        </div>
                                    </div>
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
                        </DashboardPanel>
                    </div>,
                    document.body
                )}

                {buyingItem && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-[#121212]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setBuyingItem(null)}></div>
                        <DashboardPanel
                            className="w-full max-w-sm z-10 animate-in zoom-in-95 duration-200 text-center"
                            title="Complete Purchase"
                            subtitle={`Confirming payment for ${buyingItem.title}`}
                        >
                        <form 
                            onSubmit={handleBought} 
                            className="flex flex-col gap-6"
                        >

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
                        </DashboardPanel>
                    </div>,
                    document.body
                )}
            </div>
        </>
    );
};

export default Wishlist;
