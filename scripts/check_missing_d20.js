import fs from 'node:fs';

const stats = JSON.parse(fs.readFileSync('src/data/ac11_stats.json', 'utf8'));
const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

const day20Data = ocr['day20'] || {};
const checkedIds = new Set(Object.keys(day20Data));

const enrolled = stats.userRankings;
const notChecked = enrolled.filter(u => !checkedIds.has(u.discordId));

console.log(`=== DAY 20 MISSING CHECKINS (${notChecked.length}/${enrolled.length}) ===`);
notChecked.forEach(u => {
  console.log(`- ${u.user} (<@${u.discordId}>) - Total: ${u.totalCards} cards, Days: ${u.daysCount}/20`);
});
