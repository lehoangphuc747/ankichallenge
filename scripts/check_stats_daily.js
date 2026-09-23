import fs from 'node:fs';

const stats = JSON.parse(fs.readFileSync('src/data/ac11_stats.json', 'utf8'));
console.log('Stats meta:', stats.meta);
console.log('DailySummary keys:', Object.keys(stats.dailySummary));
for (const [day, data] of Object.entries(stats.dailySummary)) {
  console.log(`${day}: ${data.date} - ${data.totalCards} cards, ${data.checkinsCount} checkins`);
}
