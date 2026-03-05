import React, { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const fetcher = url => api.get(url).then(res => res.data);

const Wishlist = ({ items, currencySymbol, onAction }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        price: '',
        priority: 'Medium',
        category: 'General',
        link: ''
    });

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/finance/wishlist', newItem);
            onAction();
            setNewItem({ title: '', price: '', priority: 'Medium', category: 'General', link: '' });
            setIsAdding(false);
        } catch (err) {
            console.error('Error adding item:', err);
        }
    };

    const togglePurchased = async (item) => {
        try {
            await api.patch(`/finance/wishlist/${item._id}`,
                { purchased: !item.purchased }
            );
            onAction();
        } catch (err) {
            console.error('Error toggling purchased:', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/finance/wishlist/${id}`);
            onAction();
        } catch (err) {
            console.error('Error deleting item:', err);
        }
    };

    const totalCost = items?.reduce((sum, item) => sum + (item.purchased ? 0 : item.price), 0) || 0;
    const purchasedValue = items?.reduce((sum, item) => sum + (item.purchased ? item.price : 0), 0) || 0;


    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm min-h-[350px]">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">shopping_bag</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Wishlist</h3>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                >
                    <span className="material-symbols-outlined text-lg">{isAdding ? 'close' : 'add'}</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">To Save</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{currencySymbol}{totalCost.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Purchased</p>
                    <p className="text-lg font-black text-emerald-600">{currencySymbol}{purchasedValue.toLocaleString()}</p>
                </div>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        onSubmit={handleAdd}
                        className="space-y-3 overflow-hidden"
                    >
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="What do you want to buy?"
                                required
                                className="col-span-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-slate-900 dark:text-white"
                                value={newItem.title}
                                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Price"
                                required
                                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-slate-900 dark:text-white"
                                value={newItem.price}
                                onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                            />
                            <select
                                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-slate-900 dark:text-white"
                                value={newItem.priority}
                                onChange={e => setNewItem({ ...newItem, priority: e.target.value })}
                            >
                                <option value="Low">Low Priority</option>
                                <option value="Medium">Medium Priority</option>
                                <option value="High">High Priority</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
                            Add to Wishlist
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-2">
                {!items?.length && !isAdding && (
                    <div className="text-center py-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 font-medium">No items in your wishlist yet.</p>
                    </div>
                )}

                {items?.map((item) => (
                    <motion.div
                        layout
                        key={item._id}
                        className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${item.purchased
                            ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/50 opacity-60'
                            : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600 shadow-sm'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => togglePurchased(item)}
                                className={`size-5 rounded-md flex items-center justify-center transition-all ${item.purchased
                                    ? 'bg-emerald-500 text-white'
                                    : 'border-2 border-slate-200 dark:border-slate-600 text-transparent hover:border-primary'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[14px] font-black">check</span>
                            </button>
                            <div>
                                <h4 className={`text-sm font-bold ${item.purchased ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                    {item.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${item.priority === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-500/10' :
                                        item.priority === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10' :
                                            'bg-slate-100 text-slate-600 dark:bg-slate-500/10'
                                        }`}>
                                        {item.priority}
                                    </span>
                                    <span className="text-xs font-black text-slate-900 dark:text-slate-200">{currencySymbol}{item.price.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.link && (
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all">
                                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                                </a>
                            )}
                            <button
                                onClick={() => handleDelete(item._id)}
                                className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
