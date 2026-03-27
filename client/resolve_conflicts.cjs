const fs = require('fs');
const files = [
    'c:/Users/LENOVO/Desktop/Produs/client/src/pages/Planner.jsx',
    'c:/Users/LENOVO/Desktop/Produs/client/src/components/planner_components/DailySchedule.jsx',
    'c:/Users/LENOVO/Desktop/Produs/client/src/components/Layout.jsx',
    'c:/Users/LENOVO/Desktop/Produs/client/src/components/finance_components/Wishlist.jsx',
    'c:/Users/LENOVO/Desktop/Produs/client/src/components/finance_components/SavingsPanel.jsx',
    'c:/Users/LENOVO/Desktop/Produs/client/src/components/finance_components/RecentTransactions.jsx',
    'c:/Users/LENOVO/Desktop/Produs/client/src/components/journal_components/JournalEntry.jsx',
    'c:/Users/LENOVO/Desktop/Produs/client/src/components/habit_components/HabitTracker.jsx'
];

files.forEach(f => {
    if (!fs.existsSync(f)) return;
    const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
    let outputLines = [];
    let state = 'NORMAL'; // NORMAL, IN_HEAD, IN_INCOMING

    lines.forEach(line => {
        if (line.startsWith('<<<<<<< HEAD')) {
            state = 'IN_HEAD';
        } else if (line.startsWith('=======')) {
            state = 'IN_INCOMING';
        } else if (line.startsWith('>>>>>>>')) {
            state = 'NORMAL';
        } else {
            if (state === 'NORMAL') {
                outputLines.push(line);
            } else if (state === 'IN_INCOMING') {
                outputLines.push(line);
            }
            // If IN_HEAD, we ignore the line (dropping our version in favor of incoming)
        }
    });

    const newContent = outputLines.join('\n');
    if (lines.length !== outputLines.length) {
        fs.writeFileSync(f, newContent);
        console.log('Fixed ' + f);
    }
});
