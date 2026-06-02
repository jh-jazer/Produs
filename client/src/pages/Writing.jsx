import React, { useEffect, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JournalHub from '../components/journal_components/JournalHub';
import JournalEntry from '../components/journal_components/JournalEntry';
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';
import { useJournal } from '../hooks/useJournal';
import { DashboardContext } from '../context/DashboardContext';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, CheckSquare, Square, FileText, List as ListIcon, ChevronLeft, BookOpen } from 'lucide-react';
import NoteEntry from '../components/journal_components/NoteEntry';
import ListEntry from '../components/journal_components/ListEntry';

const ChippedBorder = ({ opacity = 0.8 }) => (
  <div 
    className="absolute inset-[-2px] rounded-sm pointer-events-none z-0"
    style={{
      border: '4px solid currentColor',
      opacity,
      clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
    }}
  />
);

const HUDPanel = ({ title, subtitle, children, headerExtra, className = "" }) => (
  <div className={`relative border border-transparent md:border-black/10 dark:md:border-white/10 bg-transparent md:bg-white/20 dark:md:bg-black/20 backdrop-blur-none md:backdrop-blur-md px-0 md:px-8 py-2 md:py-4 rounded-sm overflow-hidden ${className}`}>
    <div className="hidden md:block">
      <ChippedBorder opacity={0.6} />
    </div>
    <div className="relative z-10">
      {title && (
        <div className="mb-4 hidden md:flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-foreground/95">{title}</span>
          </div>
          {headerExtra && <div className="flex gap-2">{headerExtra}</div>}
        </div>
      )}
      {children}
    </div>
  </div>
);

const CountBadge = ({ count }) => (
    <span className="absolute top-3 right-3 z-20 min-w-[24px] h-6 px-1.5 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black text-[10px] font-black font-mono rounded-sm shadow-sm border border-black/10 dark:border-white/10">
        {count}
    </span>
);

const HubModule = ({ onSelect, journalCount = 0, notesCount = 0, listsCount = 0 }) => {
    return (
        <div className="flex flex-col md:flex-row gap-6 w-full">
            <button
                onClick={() => onSelect('journal')}
                className="flex-1 group relative rounded-sm bg-white/10 dark:bg-white/[0.02] border border-black/10 dark:border-white/10 hover:border-primary/40 transition-all shadow-none hover:shadow-[0_0_20px_rgba(0,102,255,0.15)] hover:bg-white/20 dark:hover:bg-white/[0.05] backdrop-blur-sm cursor-pointer overflow-hidden flex flex-col items-center justify-center min-h-[140px] text-center p-6"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none" />
                <div className="absolute inset-0 text-black dark:text-white opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <ChippedBorder opacity={1} />
                </div>
                <CountBadge count={journalCount} />
                <BookOpen className="relative z-10 size-8 text-black/60 dark:text-white/60 group-hover:scale-110 group-hover:text-primary transition-all mb-3" />
                <h4 className="relative z-10 text-lg font-black text-black dark:text-white uppercase tracking-tighter italic">JOURNAL</h4>
                <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.3em] text-black/35 dark:text-white/20 mt-1.5">Daily Reflections</span>
            </button>

            <div className="w-full h-[2px] md:w-[2px] md:h-32 bg-black/10 dark:bg-white/10 shrink-0 self-center rounded-full" />

            <button
                onClick={() => onSelect('notes')}
                className="flex-1 group relative rounded-sm bg-white/10 dark:bg-white/[0.02] border border-black/10 dark:border-white/10 hover:border-primary/40 transition-all shadow-none hover:shadow-[0_0_20px_rgba(0,102,255,0.15)] hover:bg-white/20 dark:hover:bg-white/[0.05] backdrop-blur-sm cursor-pointer overflow-hidden flex flex-col items-center justify-center min-h-[140px] text-center p-6"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none" />
                <div className="absolute inset-0 text-black dark:text-white opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <ChippedBorder opacity={1} />
                </div>
                <CountBadge count={notesCount} />
                <FileText className="relative z-10 size-8 text-black/60 dark:text-white/60 group-hover:scale-110 group-hover:text-primary transition-all mb-3" />
                <h4 className="relative z-10 text-lg font-black text-black dark:text-white uppercase tracking-tighter italic">NOTES</h4>
                <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.3em] text-black/35 dark:text-white/20 mt-1.5">Scratchpad Memos</span>
            </button>

            <div className="w-full h-[2px] md:w-[2px] md:h-32 bg-black/10 dark:bg-white/10 shrink-0 self-center rounded-full" />

            <button
                onClick={() => onSelect('lists')}
                className="flex-1 group relative rounded-sm bg-white/10 dark:bg-white/[0.02] border border-black/10 dark:border-white/10 hover:border-primary/40 transition-all shadow-none hover:shadow-[0_0_20px_rgba(0,102,255,0.15)] hover:bg-white/20 dark:hover:bg-white/[0.05] backdrop-blur-sm cursor-pointer overflow-hidden flex flex-col items-center justify-center min-h-[140px] text-center p-6"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none" />
                <div className="absolute inset-0 text-black dark:text-white opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <ChippedBorder opacity={1} />
                </div>
                <CountBadge count={listsCount} />
                <ListIcon className="relative z-10 size-8 text-black/60 dark:text-white/60 group-hover:scale-110 group-hover:text-primary transition-all mb-3" />
                <h4 className="relative z-10 text-lg font-black text-black dark:text-white uppercase tracking-tighter italic">LISTS</h4>
                <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.3em] text-black/35 dark:text-white/20 mt-1.5">Task Tracking</span>
            </button>
        </div>
    );
};

const NotesModule = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem('produs_notes_store');
        return saved ? JSON.parse(saved) : [
            { id: '1', title: 'Welcome to Notes', content: 'Jot down your ideas, reminders, and thoughts here.', category: 'blue', date: 'TODAY' }
        ];
    });
    const [isWriting, setIsWriting] = useState(() => location.state?.openWriteNote || false);

    useEffect(() => {
        if (location.state?.openWriteNote) {
            setIsWriting(true);
        }
    }, [location.state]);

    useEffect(() => {
        localStorage.setItem('produs_notes_store', JSON.stringify(notes));
    }, [notes]);

    const handleDeleteNote = (id) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    const colors = {
        blue: 'border-primary text-primary',
        gray: 'border-foreground/30 text-foreground',
        white: 'border-white text-white'
    };

    return (
        <div className="flex flex-col gap-8 w-full">
                <button
                    onClick={() => navigate('/dashboard/writing/notes/new')}
                    className="group relative rounded-sm bg-white/10 dark:bg-white/[0.02] border border-black/10 dark:border-white/10 hover:border-black/40 dark:hover:border-white/40 transition-all shadow-none hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] hover:bg-white/20 dark:hover:bg-white/[0.05] backdrop-blur-sm cursor-pointer overflow-hidden flex min-h-[100px] md:min-h-[160px] w-full mb-4 text-left"
                >
                    {/* Left Side: Image (1/4) */}
                    <div className="w-1/4 relative shrink-0 overflow-hidden bg-black border-r border-black/10 dark:border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <img 
                            src="/assets/journal_default_cover.png" 
                            alt="Write Note" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 pointer-events-none" />
                    </div>

                    {/* Right Side: Content (3/4) */}
                    <div className="flex-1 p-4 md:p-8 flex flex-col justify-between">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex justify-between items-start mb-2 md:mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="size-8 md:size-10 rounded-sm bg-black dark:bg-white flex items-center justify-center text-white/60 dark:text-black/60 group-hover:rotate-12 transition-transform border border-black/10 dark:border-white/10 shrink-0">
                                        <FileText className="size-4 md:size-5" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black/35 dark:text-white/20 truncate block">NOTES</span>
                                    </div>
                                </div>
                            </div>

                            {/* Entry Title */}
                            <h4 className="text-base md:text-xl font-black text-black dark:text-white uppercase tracking-tighter italic mt-1 md:mt-4 truncate">
                                WRITE NEW NOTE
                            </h4>
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-black/35 dark:text-white/20 truncate block">CREATE A NEW NOTE</span>
                        </div>

                        {/* Footer Decor */}
                        <div className="flex items-center justify-end mt-1 md:mt-2 opacity-30 group-hover:opacity-100 transition-opacity">
                            <div className="h-[2px] w-8 md:w-12 bg-black dark:bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_8px_white]" />
                        </div>
                    </div>
                </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notes.map(note => (
                    <motion.div 
                        key={note.id} 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        onClick={() => navigate(`/dashboard/writing/notes/${note.id}`)}
                        className={`relative p-6 bg-white/10 dark:bg-white/[0.01] hover:bg-white/20 dark:hover:bg-white/[0.03] backdrop-blur-sm border border-black/10 dark:border-white/10 border-l-4 rounded-r-sm flex flex-col justify-between min-h-[120px] group cursor-pointer ${colors[note.category] || colors.gray}`}
                    >
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-black tracking-widest uppercase font-mono line-clamp-1">{note.title}</span>
                                <button 
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/40 hover:text-red-500 p-1"
                                >
                                    <Trash2 className="size-3" />
                                </button>
                            </div>
                            <p className="text-xs text-foreground/80 font-sans whitespace-pre-wrap leading-relaxed mt-1">{note.content}</p>
                        </div>
                        <span className="text-[8px] font-mono text-foreground/30 mt-4 tracking-wider">{note.date}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const ListsModule = ({ focusListId } = {}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [lists, setLists] = useState(() => {
        const saved = localStorage.getItem('produs_lists_store');
        return saved ? JSON.parse(saved) : [
            { 
                id: '1', 
                title: 'DAILY GOALS', 
                items: [
                    { id: 'i1', text: 'Morning workout', done: true },
                    { id: 'i2', text: 'Read a chapter of a book', done: true },
                    { id: 'i3', text: 'Plan tomorrow', done: false }
                ] 
            }
        ];
    });
    const [newItemTexts, setNewItemTexts] = useState({});
    const [isWriting, setIsWriting] = useState(() => location.state?.openWriteList || false);

    useEffect(() => {
        if (location.state?.openWriteList) {
            setIsWriting(true);
        }
    }, [location.state]);

    useEffect(() => {
        localStorage.setItem('produs_lists_store', JSON.stringify(lists));
    }, [lists]);

    const handleDeleteList = (listId) => {
        setLists(lists.filter(l => l.id !== listId));
    };

    const handleAddItem = (listId) => {
        const text = newItemTexts[listId];
        if (!text || !text.trim()) return;
        setLists(lists.map(l => {
            if (l.id === listId) {
                return {
                    ...l,
                    items: [...l.items, { id: Date.now().toString(), text: text.trim(), done: false }]
                };
            }
            return l;
        }));
        setNewItemTexts({ ...newItemTexts, [listId]: '' });
    };

    const handleToggleItem = (listId, itemId) => {
        setLists(lists.map(l => {
            if (l.id === listId) {
                return {
                    ...l,
                    items: l.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i)
                };
            }
            return l;
        }));
    };

    const handleDeleteItem = (listId, itemId) => {
        setLists(lists.map(l => {
            if (l.id === listId) {
                return {
                    ...l,
                    items: l.items.filter(i => i.id !== itemId)
                };
            }
            return l;
        }));
    };

    return (
        <div className="flex flex-col gap-8 w-full">
                <button
                    onClick={() => navigate('/dashboard/writing/lists/new')}
                    className="group relative rounded-sm bg-white/10 dark:bg-white/[0.02] border border-black/10 dark:border-white/10 hover:border-black/40 dark:hover:border-white/40 transition-all shadow-none hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] hover:bg-white/20 dark:hover:bg-white/[0.05] backdrop-blur-sm cursor-pointer overflow-hidden flex min-h-[100px] md:min-h-[160px] w-full mb-4 text-left"
                >
                    {/* Left Side: Image (1/4) */}
                    <div className="w-1/4 relative shrink-0 overflow-hidden bg-black border-r border-black/10 dark:border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <img 
                            src="/assets/journal_default_cover.png" 
                            alt="Write List" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 pointer-events-none" />
                    </div>

                    {/* Right Side: Content (3/4) */}
                    <div className="flex-1 p-4 md:p-8 flex flex-col justify-between">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex justify-between items-start mb-2 md:mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="size-8 md:size-10 rounded-sm bg-black dark:bg-white flex items-center justify-center text-white/60 dark:text-black/60 group-hover:rotate-12 transition-transform border border-black/10 dark:border-white/10 shrink-0">
                                        <ListIcon className="size-4 md:size-5" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black/35 dark:text-white/20 truncate block">LISTS</span>
                                    </div>
                                </div>
                            </div>

                            {/* Entry Title */}
                            <h4 className="text-base md:text-xl font-black text-black dark:text-white uppercase tracking-tighter italic mt-1 md:mt-4 truncate">
                                WRITE NEW LIST
                            </h4>
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-black/35 dark:text-white/20 truncate block">CREATE A NEW LIST</span>
                        </div>

                        {/* Footer Decor */}
                        <div className="flex items-center justify-end mt-1 md:mt-2 opacity-30 group-hover:opacity-100 transition-opacity">
                            <div className="h-[2px] w-8 md:w-12 bg-black dark:bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_8px_white]" />
                        </div>
                    </div>
                </button>

            <div className="grid grid-cols-1 gap-8">
                {lists.map(list => {
                    const completedCount = list.items.filter(i => i.done).length;
                    const totalCount = list.items.length;
                    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

                    return (
                        <div 
                            key={list.id} 
                            onClick={() => navigate(`/dashboard/writing/lists/${list.id}`)}
                            className="bg-white/10 dark:bg-white/[0.01] hover:bg-white/20 dark:hover:bg-white/[0.03] border border-black/10 dark:border-white/10 backdrop-blur-sm p-6 rounded-sm flex flex-col gap-4 cursor-pointer transition-all">
                            <div className="flex justify-between items-center border-b border-foreground/10 pb-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-black tracking-widest uppercase font-mono text-foreground">{list.title}</span>
                                    <span className="text-[8px] font-mono text-foreground/40">{completedCount}/{totalCount} TASKS COMPLETED</span>
                                </div>
                                <button 
                                    onClick={() => handleDeleteList(list.id)}
                                    className="text-foreground/30 hover:text-red-500 transition-colors p-1.5"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            </div>

                            <div className="w-full h-1 bg-foreground/5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>

                            <div className="flex flex-col gap-2 mt-2">
                                {list.items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between group/item py-1.5 px-2 hover:bg-foreground/[0.02] rounded-sm transition-colors">
                                        <button 
                                            onClick={() => handleToggleItem(list.id, item.id)}
                                            className="flex items-center gap-3 text-left flex-1"
                                        >
                                            {item.done ? (
                                                <CheckSquare className="size-4 text-primary shrink-0" />
                                            ) : (
                                                <Square className="size-4 text-foreground/30 shrink-0" />
                                            )}
                                            <span className={`text-xs font-sans ${item.done ? 'line-through text-foreground/40' : 'text-foreground/90'}`}>
                                                {item.text}
                                            </span>
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteItem(list.id, item.id)}
                                            className="opacity-0 group-hover/item:opacity-100 transition-opacity text-foreground/30 hover:text-red-500 p-1"
                                        >
                                            <Trash2 className="size-3" />
                                        </button>
                                    </div>
                                ))}

                                <div className="flex gap-2 mt-3 pt-2 border-t border-foreground/5">
                                    <input 
                                        type="text" 
                                        placeholder="Add task item..." 
                                        value={newItemTexts[list.id] || ''}
                                        onChange={(e) => setNewItemTexts({ ...newItemTexts, [list.id]: e.target.value })}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddItem(list.id);
                                            }
                                        }}
                                        className="flex-1 bg-transparent border-b border-foreground/10 px-2 py-1 text-xs outline-none text-foreground/80 focus:border-primary font-sans"
                                    />
                                    <button 
                                        onClick={() => handleAddItem(list.id)}
                                        className="text-[9px] font-black tracking-wider uppercase text-primary px-3 py-1 hover:bg-primary/10 rounded-sm transition-colors shrink-0 font-mono"
                                    >
                                        ADD
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const Writing = () => {
    const { entries, isLoading } = useJournal();
    const location = useLocation();
    const navigate = useNavigate();
    const { entryId, noteId, listId } = useParams();

    // Derive active tab from the URL path
    const getTabFromPath = () => {
        if (entryId) return 'journal_entry';
        if (noteId) return 'note_detail';
        if (listId) return 'list_detail';
        if (location.pathname.endsWith('/journal')) return 'journal';
        if (location.pathname.endsWith('/notes')) return 'notes';
        if (location.pathname.endsWith('/lists')) return 'lists';
        if (location.state?.activeTab && location.state.activeTab !== 'hub') return location.state.activeTab;
        return 'hub';
    };

    const activeTab = getTabFromPath();

    // Find the specific entry/note/list if on a detail route
    const selectedEntry = entryId ? entries.find(e => e._id === entryId) : null;

    const allNotes = React.useMemo(() => {
        try { return JSON.parse(localStorage.getItem('produs_notes_store') || '[]'); } catch { return []; }
    }, [noteId, activeTab]);
    const selectedNote = noteId ? allNotes.find(n => n.id === noteId) : null;

    const allLists = React.useMemo(() => {
        try { return JSON.parse(localStorage.getItem('produs_lists_store') || '[]'); } catch { return []; }
    }, [listId, activeTab]);
    const selectedList = listId ? allLists.find(l => l.id === listId) : null;

    const handleSelect = (tab) => {
        navigate(`/dashboard/writing/${tab}`);
    };

    const handleBack = () => {
        navigate('/dashboard/writing');
    };

    if (isLoading && entries.length === 0) return <WorkspaceSkeleton />;

    return (
        <div className="w-full bg-transparent text-foreground px-0 md:px-12 pt-24 md:pt-20 pb-8 font-sans overflow-x-hidden flex flex-col items-center">
            <div className="w-full max-w-7xl mt-12 md:mt-8 flex flex-col gap-6">

                {activeTab !== 'hub' && activeTab !== 'journal_entry' && activeTab !== 'note_detail' && activeTab !== 'list_detail' && (
                    <button 
                        onClick={
                            activeTab === 'journal_entry' ? () => navigate('/dashboard/writing/journal') :
                            activeTab === 'note_detail' ? () => navigate('/dashboard/writing/notes') :
                            activeTab === 'list_detail' ? () => navigate('/dashboard/writing/lists') :
                            handleBack
                        }
                        className="self-start flex items-center gap-2 text-foreground/40 hover:text-foreground transition-colors mb-1 px-4 md:px-0"
                    >
                        <ChevronLeft className="size-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                            {activeTab === 'journal_entry' ? 'BACK' :
                             activeTab === 'note_detail' ? 'BACK' :
                             activeTab === 'list_detail' ? 'BACK' :
                             'BACK'}
                        </span>
                    </button>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        {activeTab === 'hub' && (
                            <HUDPanel title="WRITE HUB" subtitle="SELECT MODULE">
                                <HubModule 
                                    onSelect={handleSelect}
                                    journalCount={entries?.length || 0}
                                    notesCount={allNotes?.length || 0}
                                    listsCount={allLists?.length || 0}
                                />
                            </HUDPanel>
                        )}

                        {activeTab === 'journal_entry' && (
                            <HUDPanel title={entryId === 'new' ? "NEW ENTRY" : "JOURNAL ENTRY"} subtitle="PERSONAL REFLECTIONS">
                                <JournalEntry
                                    onAction={() => navigate('/dashboard/writing/journal')}
                                    onBack={() => navigate('/dashboard/writing/journal')}
                                    initialEntry={selectedEntry}
                                />
                            </HUDPanel>
                        )}

                        {activeTab === 'journal' && (
                            <HUDPanel title="DAILY JOURNAL" subtitle="PERSONAL REFLECTIONS">
                                <JournalHub entries={entries} onAction={() => {}} />
                            </HUDPanel>
                        )}

                        {activeTab === 'notes' && (
                            <HUDPanel title="SCRATCHPAD" subtitle="PERSISTENT OPERATIVE MEMOS">
                                <NotesModule />
                            </HUDPanel>
                        )}

                        {activeTab === 'note_detail' && (
                            <HUDPanel title={noteId === 'new' ? "NEW NOTE" : (selectedNote?.title || "EDIT NOTE")} subtitle="SCRATCHPAD">
                                <NoteEntry 
                                    initialNote={selectedNote}
                                    onSave={(newNoteData) => {
                                        const saved = JSON.parse(localStorage.getItem('produs_notes_store') || '[]');
                                        let updated;
                                        if (noteId === 'new') {
                                            const note = {
                                                id: Date.now().toString(),
                                                ...newNoteData,
                                                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
                                            };
                                            updated = [note, ...saved];
                                        } else {
                                            updated = saved.map(n => n.id === noteId ? { ...n, ...newNoteData } : n);
                                        }
                                        localStorage.setItem('produs_notes_store', JSON.stringify(updated));
                                        navigate('/dashboard/writing/notes');
                                    }}
                                    onBack={() => navigate('/dashboard/writing/notes')}
                                />
                            </HUDPanel>
                        )}

                        {activeTab === 'lists' && (
                            <HUDPanel title="CHECKLISTS" subtitle="DYNAMIC TASK TRACKING">
                                <ListsModule />
                            </HUDPanel>
                        )}

                        {activeTab === 'list_detail' && (
                            <HUDPanel title={listId === 'new' ? "NEW LIST" : (selectedList?.title || "EDIT LIST")} subtitle="CHECKLISTS">
                                <ListEntry 
                                    initialList={selectedList}
                                    onSave={(newListData) => {
                                        const saved = JSON.parse(localStorage.getItem('produs_lists_store') || '[]');
                                        let updated;
                                        if (listId === 'new') {
                                            const newList = {
                                                id: Date.now().toString(),
                                                title: newListData.title.toUpperCase(),
                                                items: newListData.items
                                            };
                                            updated = [newList, ...saved];
                                        } else {
                                            updated = saved.map(l => l.id === listId ? { ...l, title: newListData.title.toUpperCase(), items: newListData.items } : l);
                                        }
                                        localStorage.setItem('produs_lists_store', JSON.stringify(updated));
                                        navigate('/dashboard/writing/lists');
                                    }}
                                    onBack={() => navigate('/dashboard/writing/lists')}
                                />
                            </HUDPanel>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Writing;

