import fs from 'node:fs';

const missing = JSON.parse(fs.readFileSync('discord-export/missing_ocr.json', 'utf8'));

// Filter out day 3 & 4 because day 3 and 4 were already processed in initial days
const newBatch = missing.filter(m => !['day3', 'day4'].includes(m.dayKey));

console.log(`New checkins to process (excluding old day 3/4): ${newBatch.length}`);

const byDay = {};
for (const b of newBatch) {
  if (!byDay[b.dayKey]) byDay[b.dayKey] = [];
  byDay[b.dayKey].push(b);
}

for (const [day, items] of Object.entries(byDay)) {
  console.log(`\n=== ${day.toUpperCase()} (${items.length} items) ===`);
  for (const it of items) {
    console.log(`- <@${it.targetDiscordId}> | Date: ${it.checkinDate} | Claimed: ${it.claimedCards} cards | File: ${it.image}`);
  }
}

fs.writeFileSync('discord-export/batch15_queue.json', JSON.stringify(newBatch, null, 2), 'utf8');
