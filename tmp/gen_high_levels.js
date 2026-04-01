let totalRequired = 3003100; // Level 50 total
let xpToNext = 250000; // Starting point for L51 increment

const newLevels = [];
for (let i = 51; i <= 65; i++) {
  newLevels.push({
    level: i,
    title: 'Tier 5',
    xpToNext: i === 65 ? 0 : xpToNext,
    totalRequired: totalRequired
  });
  
  totalRequired += xpToNext;
  xpToNext = Math.round(xpToNext * 1.08); // 8% increase per level
  xpToNext = Math.ceil(xpToNext / 1000) * 1000; // Round to nearest 1000
}

console.log(JSON.stringify(newLevels, null, 2));
