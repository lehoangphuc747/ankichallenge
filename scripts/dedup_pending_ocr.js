import fs from 'node:fs';

const pending = JSON.parse(fs.readFileSync('discord-export/pending_ocr_d20_d30.json', 'utf8'));

// Deduplicate: If same user in same day has multiple items, let's see why
const byDayUser = {};
const deduped = [];

for (const p of pending) {
  const key = `${p.day}_${p.discordId}`;
  if (!byDayUser[key]) {
    byDayUser[key] = [];
  }
  byDayUser[key].push(p);
}

const multiple = Object.entries(byDayUser).filter(([k, v]) => v.length > 1);
console.log(`Unique (day, user) pairs: ${Object.keys(byDayUser).length}`);
console.log(`Users with multiple items in a single day: ${multiple.length}`);
for (const [k, v] of multiple) {
  console.log(`- ${k}: ${v.length} items. Sources: ${v.map(x => x.source + ' (' + x.author + ')').join(', ')}`);
}

// For each unique (day, user), pick the best item (prefer bot embed with checkinInfo claimedCards, or if bot embed is present)
const uniquePending = [];
for (const [k, items] of Object.entries(byDayUser)) {
  // If one item has checkinInfo with claimedCards, or source === 'embed'
  items.sort((a, b) => {
    // Prefer embed from bot
    if (a.source === 'embed' && b.source !== 'embed') return -1;
    if (b.source === 'embed' && a.source !== 'embed') return 1;
    // Prefer non-null claimedCards
    if (a.claimedCards && !b.claimedCards) return -1;
    if (b.claimedCards && !a.claimedCards) return 1;
    return 0;
  });
  uniquePending.push(items[0]);
}

console.log(`\nClean unique pending items needing OCR: ${uniquePending.length}`);
const cleanByDay = {};
for (const p of uniquePending) {
  cleanByDay[p.day] = (cleanByDay[p.day] || 0) + 1;
}
console.log('Clean pending by day:', cleanByDay);

fs.writeFileSync('discord-export/clean_unique_pending_ocr.json', JSON.stringify(uniquePending, null, 2), 'utf8');
