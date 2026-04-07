const fs = require('fs');
const glob = require('glob');

// We are going to target planner, health, finance, journal components
const targetDirs = [
    'c:/Users/LENOVO/Desktop/Produs/client/src/components/planner_components/*.jsx',
    'c:/Users/LENOVO/Desktop/Produs/client/src/components/finance_components/*.jsx',
    'c:/Users/LENOVO/Desktop/Produs/client/src/components/health_components/*.jsx',
    'c:/Users/LENOVO/Desktop/Produs/client/src/components/journal_components/*.jsx'
];

let files = [];
targetDirs.forEach(pattern => {
    files = files.concat(glob.sync(pattern));
});

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Look for className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] ... "
    // and strip bg, border, rounded and padding to prevent double-boxing.
    // It's safer to just replace standard outer wrap classes:
    const regex1 = /className="rounded-xl border border-slate-200 dark:border-white\/10 bg-white dark:bg-\[#121212\]/g;
    const regex2 = /className="glass-panel w-full p-6/g;
    const regex3 = /className={`rounded-xl border border-slate-200 dark:border-white\/10 bg-white dark:bg-\[#121212\]/g;
    const regex4 = /className="bg-white dark:bg-\[#121212\] rounded-xl border border-slate-200 dark:border-white\/10 p-6/g;
    
    let modified = content
        .replace(regex1, 'className="flex flex-col relative w-full h-full')
        .replace(regex2, 'className="flex flex-col w-full')
        .replace(regex3, 'className={`flex flex-col relative w-full h-full')
        .replace(regex4, 'className="flex flex-col relative w-full h-full');

    fs.writeFileSync(file, modified);
});
console.log('Class strippings complete.');
