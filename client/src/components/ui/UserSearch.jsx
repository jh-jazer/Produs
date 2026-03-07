import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Avatar from './Avatar';

const UserSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
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
        <div className="relative w-full mb-6" ref={searchRef}>
            <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setShowResults(true)}
                    placeholder="Search users to follow..."
                    className="w-full bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
                {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto p-2">
                        {results.map((user) => (
                            <button
                                key={user._id}
                                onClick={() => {
                                    navigate(`/u/${user.username}`);
                                    setShowResults(false);
                                    setQuery('');
                                }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors text-left"
                            >
                                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                    <Avatar config={user.avatar} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                                    <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 text-lg">chevron_right</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {showResults && query.length >= 2 && results.length === 0 && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-6 text-center">
                    <p className="text-sm font-medium text-slate-500">No users found for "{query}"</p>
                </div>
            )}
        </div>
    );
};

export default UserSearch;
