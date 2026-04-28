import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Avatar from './Avatar';
import ProfileModal from './ProfileModal';

const UserSearch = ({ onSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [profileModalUser, setProfileModalUser] = useState(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length >= 2) {
                setIsSearching(true);
                try {
                    const res = await api.get(`/auth/search?q=${query}`);
                    setResults(res.data);
                    setShowResults(true);
                } catch (err) {
                    console.error('Search failed:', err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="w-full flex w-full flex-col relative" ref={searchRef}>
            <div className="relative p-2 shrink-0">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setShowResults(true)}
                    placeholder="Search users by name or username..."
                    autoFocus
                    className="w-full bg-slate-50 dark:bg-[#000000]/50 border-none rounded-xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-base font-medium"
                />
                {isSearching && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                        <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {showResults && results.length > 0 && (
                <div className="w-full flex-1 overflow-hidden flex flex-col border-t border-slate-100 dark:border-white/10">
                    <div className="overflow-y-auto p-2 custom-scrollbar">
                        {results.map((user) => (
                            <button
                                key={user._id}
                                onClick={() => {
                                    setProfileModalUser(user.username);
                                    setShowResults(false);
                                    setQuery('');
                                    if (onSelect) onSelect(user);
                                    // Let parent component know a selection was made if needed
                                    const event = new CustomEvent('user-selected', { detail: user });
                                    window.dispatchEvent(event);
                                }}
                                className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-[#000000]/50 rounded-2xl transition-all text-left group active:scale-[0.98]"
                            >
                                <div className="size-12 rounded-full bg-slate-100 dark:bg-[#121212] overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 shadow-none flex items-center justify-center">
                                    <Avatar config={user.avatar} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors flex items-center gap-2">
                                        {user.name}
                                        {user.name.toLowerCase().includes(query.toLowerCase()) && !user.username.toLowerCase().includes(query.toLowerCase()) && (
                                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#000000] text-[9px] font-black text-slate-400 uppercase tracking-tighter">Name Match</span>
                                        )}
                                    </p>
                                    <p className="text-sm font-medium text-slate-500 truncate flex items-center gap-1">
                                        @{user.username.split('#')[0].replace(/\d+/g, '')}
                                        {user.username.toLowerCase().includes(query.toLowerCase()) && (
                                            <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-[9px] font-black text-primary uppercase tracking-tighter">Username Match</span>
                                        )}
                                        {user._id === query && (
                                            <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-[9px] font-black text-blue-500 uppercase tracking-tighter">Exact ID Match</span>
                                        )}
                                    </p>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {showResults && query.length >= 2 && results.length === 0 && !isSearching && (
                <div className="p-8 text-center flex-1 flex flex-col items-center justify-center border-t border-slate-100 dark:border-white/10">
                    <span className="material-symbols-outlined text-4xl text-slate-200 dark:text-slate-800 mb-3 block">person_search</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No users found</p>
                    <p className="text-xs text-slate-500 mt-1">Try searching for a different name.</p>
                </div>
            )}
            {/* Profile Overlay Modal */}
            <AnimatePresence>
                {profileModalUser && (
                    <ProfileModal
                        username={profileModalUser}
                        onClose={() => setProfileModalUser(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserSearch;
