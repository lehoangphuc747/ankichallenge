import fs from 'node:fs';

const stats = JSON.parse(fs.readFileSync('src/data/ac11_stats.json', 'utf8'));
const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

const enrolled = stats.userRankings;

for (let d = 15; d <= 19; d++) {
  const dKey = `day${d}`;
  const dayData = ocr[dKey] || {};
  const checkedIds = new Set(Object.keys(dayData));
  const checkedUsers = enrolled.filter(u => checkedIds.has(u.discordId));
  const missingUsers = enrolled.filter(u => !checkedIds.has(u.discordId));

  console.log(`\n================ DAY ${d} ================`);
  console.log(`Checked in: ${checkedUsers.length} users, Missing: ${missingUsers.length} users`);
  console.log(`Top performers:`, checkedUsers.map(u => `${u.user} (${dayData[u.discordId]?.cards} cards)`).slice(0, 5).join(', '));
  console.log(`Missing list:`, missingUsers.map(u => `${u.user} (<@${u.discordId}>)`).join(', '));
}
