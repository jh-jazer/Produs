const levels = [];
let totalRequired = 0;
let xpToNext = 100;

for (let i = 0; i <= 50; i++) {
  let title = "Tier 1";
  if (i >= 41) title = "Tier 5";
  else if (i >= 31) title = "Tier 4";
  else if (i >= 21) title = "Tier 3";
  else if (i >= 11) title = "Tier 2";
  else if (i === 0) title = "Shut-in";

  levels.push({
    level: i,
    title,
    xpToNext: i === 50 ? 0 : xpToNext,
    totalRequired
  });

  totalRequired += xpToNext;
  
  // Growth curve
  if (i < 10) xpToNext = Math.round(xpToNext * 1.5);
  else if (i < 25) xpToNext = Math.round(xpToNext * 1.25);
  else if (i < 40) xpToNext = Math.round(xpToNext * 1.15);
  else xpToNext = Math.round(xpToNext * 1.1);
  
  // Round to nearest 50 for cleanliness
  xpToNext = Math.ceil(xpToNext / 50) * 50;
}

console.log(JSON.stringify(levels, null, 2));
