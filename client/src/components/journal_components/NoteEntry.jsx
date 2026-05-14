import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';

const NoteEntry = ({ onSave, onBack, initialNote }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('blue');
    const [activeFormats, setActiveFormats] = useState({});
    const [showSizeMenu, setShowSizeMenu] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (initialNote) {
            setTitle(initialNote.title || '');
            setContent(initialNote.content || '');
            setSelectedCategory(initialNote.category || 'blue');
            if (textareaRef.current) {
                textareaRef.current.innerHTML = initialNote.content || '';
            }
        } else {
            setTitle('');
            setContent('');
            setSelectedCategory('blue');
            if (textareaRef.current) {
                textareaRef.current.innerHTML = '';
            }
        }
    }, [initialNote]);

    const checkFormatting = () => {
        if (!textareaRef.current) return;
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        });
    };

    const handleFormat = (e, command, value = null) => {
        e.preventDefault();
        const editor = textareaRef.current;
        if (!editor) return;

        if (command === 'checkbox') {
            document.execCommand('insertHTML', false, '<div class="flex items-start gap-2 my-1"><span class="material-symbols-outlined text-slate-400 text-[16px] mt-0.5" contenteditable="false">check_box_outline_blank</span> <span contenteditable="true">&#8203;</span></div><br/>');
        } else {
            document.execCommand(command, false, value);
        }

        setContent(editor.innerHTML);
        editor.focus();
        checkFormatting();
    };

    const handleClear = () => {
        setTitle('');
        setContent('');
        if (textareaRef.current) textareaRef.current.innerHTML = '';
    };

    const handleConfirm = () => {
        if (!title.trim() && !content.trim()) return;
        onSave?.({
            title: title.trim() || 'UNTITLED_NOTE',
            content: content.trim(),
            category: selectedCategory
        });
        handleClear();
    };

    const getBtnClass = (cmd) => {
        return `p-1.5 rounded flex-shrink-0 transition-colors ${
            activeFormats[cmd] 
                ? 'bg-primary/20 text-primary dark:bg-primary/30' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#121212]'
        }`;
    };

    return (
        <div className="border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden flex flex-col bg-slate-50 dark:bg-[#1f293a] transition-shadow shadow-none text-left">
            {/* Top Bar: Category selectors on left, Back button on right */}
            <div className="bg-white dark:bg-[#121212] px-6 pt-6 flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">COLOR:</span>
                    {['blue', 'gray', 'white'].map(c => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setSelectedCategory(c)}
                            className={`size-4 rounded-full border-2 transition-all ${selectedCategory === c ? 'scale-125 ring-2 ring-primary/40' : 'opacity-40'} ${
                                c === 'blue' ? 'bg-primary border-primary' : c === 'gray' ? 'bg-slate-400 border-slate-500' : 'bg-white border-white'
                            }`}
                        />
                    ))}
                </div>
                {onBack && (
                    <button 
                        type="button"
                        onClick={onBack}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-[10px] font-black text-slate-600 dark:text-white hover:text-primary transition-all uppercase tracking-widest border border-slate-200 dark:border-white/10 active:scale-95 shadow-sm"
                    >
                        <ChevronLeft size={12} />
                        Back
                    </button>
                )}
            </div>

            {/* Title Input Area */}
            <div className="bg-white dark:bg-[#121212] px-6 pt-4 flex items-center gap-3">
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note Title"
                    className="bg-transparent border-none focus:ring-0 text-lg md:text-xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 w-full p-0 tracking-tight outline-none"
                />
            </div>

            {/* Rich Editor Canvas */}
            <div className="relative">
                <div 
                    ref={textareaRef}
                    className="w-full bg-white dark:bg-[#121212] border-none focus:ring-0 px-6 py-5 min-h-[260px] text-slate-700 dark:text-slate-300 outline-none font-medium leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 dark:empty:before:text-slate-600 cursor-text [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-1"
                    data-placeholder="Write your note here..."
                    contentEditable="true"
                    suppressContentEditableWarning={true}
                    onInput={(e) => {
                        setContent(e.currentTarget.innerHTML);
                        checkFormatting();
                    }}
                    onKeyUp={checkFormatting}
                    onMouseUp={checkFormatting}
                />
            </div>

            {/* Editor Toolbar */}
            <div className="bg-white dark:bg-[#121212] p-4 px-6 border-t border-slate-100 dark:border-white/10 flex flex-col gap-4">
                {/* Formatting Tools */}
                <div className="flex flex-wrap gap-1.5 items-center justify-start w-full">
                    <div className="relative flex-shrink-0">
                        <button 
                            onMouseDown={(e) => { e.preventDefault(); setShowSizeMenu(!showSizeMenu); }} 
                            title="Text Size" 
                            type="button" 
                            className="p-1 px-2 hover:bg-slate-200 dark:hover:bg-[#121212] rounded text-slate-600 dark:text-slate-400 flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[20px]">format_size</span>
                            <span className="material-symbols-outlined text-[14px]">expand_more</span>
                        </button>
                        
                        {showSizeMenu && (
                            <div className="absolute bottom-full mb-1 left-0 bg-white dark:bg-[#000000] border border-slate-100 dark:border-white/10 rounded-lg shadow-xl p-1.5 z-50 flex flex-col min-w-[120px]">
                                <button onMouseDown={(e) => { handleFormat(e, 'fontSize', '2'); setShowSizeMenu(false); }} className="px-3 py-1.5 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#121212] rounded font-medium">Small</button>
                                <button onMouseDown={(e) => { handleFormat(e, 'fontSize', '3'); setShowSizeMenu(false); }} className="px-3 py-1.5 text-sm text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#121212] rounded font-medium">Normal</button>
                                <button onMouseDown={(e) => { handleFormat(e, 'fontSize', '5'); setShowSizeMenu(false); }} className="px-3 py-1.5 text-lg text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#121212] rounded font-medium">Large</button>
                            </div>
                        )}
                    </div>
                    <div className="w-px bg-slate-200 dark:border-white/10 mx-1 h-5 flex-shrink-0"></div>
                    <button onMouseDown={(e) => handleFormat(e, 'bold')} title="Bold" type="button" className={getBtnClass('bold')}><span className="material-symbols-outlined text-[20px]">format_bold</span></button>
                    <button onMouseDown={(e) => handleFormat(e, 'italic')} title="Italic" type="button" className={getBtnClass('italic')}><span className="material-symbols-outlined text-[20px]">format_italic</span></button>
                    <button onMouseDown={(e) => handleFormat(e, 'insertUnorderedList')} title="Bullet List" type="button" className={getBtnClass('insertUnorderedList')}><span className="material-symbols-outlined text-[20px]">format_list_bulleted</span></button>
                    <button onMouseDown={(e) => handleFormat(e, 'checkbox')} title="Task List" type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#121212] rounded text-slate-600 dark:text-slate-400 flex-shrink-0"><span className="material-symbols-outlined text-[20px]">check_box</span></button>
                </div>

                {/* Confirm/Clear Row */}
                <div className="flex items-center justify-end pt-2 border-t border-slate-50 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <button 
                            type="button"
                            onClick={handleClear}
                            className="px-6 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                        >
                            Clear
                        </button>
                        <button 
                            type="button"
                            onClick={handleConfirm}
                            disabled={!title.trim() && !content.trim()}
                            className="px-8 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all disabled:opacity-30 shadow-xl shadow-black/10 active:scale-95"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoteEntry;
