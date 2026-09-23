import fs from 'node:fs';

const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));
const userMap = JSON.parse(fs.readFileSync('discord-export/user-map.json', 'utf8'));

// All approved AC11 members (about 33-34 users)
// Let's get the list of members from public/data/ac11_stats.json or user-map
const stats = JSON.parse(fs.readFileSync('public/data/ac11_stats.json', 'utf8'));
const enrolled = stats.userRankings.map(u => ({
  discordId: u.discordId,
  name: u.user
}));

console.log(`Total enrolled members in stats: ${enrolled.length}`);

// Check check-ins for Day 11, 12, 13, 15
const targetDays = [
  { dayNum: 11, dateStr: '11/09/2026', dayKey: 'day11', threadId: '1547690101578924072' },
  { dayNum: 12, dateStr: '12/09/2026', dayKey: 'day12', threadId: '1548052644205957230' },
  { dayNum: 13, dateStr: '13/09/2026', dayKey: 'day13', threadId: '1548407515258167480' },
  { dayNum: 15, dateStr: '15/09/2026', dayKey: 'day15', threadId: '1549159263291572325' },
];

for (const td of targetDays) {
  const dayData = ocr[td.dayKey] || {};
  const checkedIds = new Set(Object.keys(dayData));
  const notChecked = enrolled.filter(u => !checkedIds.has(u.discordId));
  console.log(`\n=== Day ${td.dayNum} (${td.dateStr}) [Thread: ${td.threadId}] ===`);
  console.log(`Checked: ${checkedIds.size} | Not checked: ${notChecked.length}`);
  console.log('Not checked users:', notChecked.map(u => `${u.name} (<@${u.discordId}>)`).join(', '));
}
