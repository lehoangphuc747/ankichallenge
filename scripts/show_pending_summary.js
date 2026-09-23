import fs from 'node:fs';

const pending = JSON.parse(fs.readFileSync('discord-export/d16_d20_pending.json', 'utf8'));

const byDay = {};
for (const p of pending) {
  if (!byDay[p.day]) byDay[p.day] = [];
  byDay[p.day].push(p);
}

for (const [day, list] of Object.entries(byDay)) {
  console.log(`\n--- ${day.toUpperCase()} (${list.length} checkins) ---`);
  for (const item of list) {
    console.log(`- ${item.userName} (${item.discordId}): claimed=${item.claimedCards} cards, ${item.claimedMins} mins | img=${item.imageFile}`);
  }
}
