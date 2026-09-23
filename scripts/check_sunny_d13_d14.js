import fs from 'node:fs';

const sunnyId = '1410392551634112640';

// Check Day 13 chat.json
const d13Chat = JSON.parse(fs.readFileSync('discord-export/day13/chat.json', 'utf8'));
const sunnyD13 = d13Chat.filter(m => m.authorId === sunnyId || (m.checkinInfo && m.checkinInfo.targetDiscordId === sunnyId));
console.log('=== DAY 13 SUNNY MESSAGES / CHECKINS ===');
console.log(JSON.stringify(sunnyD13, null, 2));

// Check Day 14 chat.json
const d14Chat = JSON.parse(fs.readFileSync('discord-export/day14/chat.json', 'utf8'));
const sunnyD14 = d14Chat.filter(m => m.authorId === sunnyId || (m.checkinInfo && m.checkinInfo.targetDiscordId === sunnyId));
console.log('=== DAY 14 SUNNY MESSAGES / CHECKINS ===');
console.log(JSON.stringify(sunnyD14, null, 2));

// Check ac11_stats.json userRankings for Sunny
const stats = JSON.parse(fs.readFileSync('src/data/ac11_stats.json', 'utf8'));
const sunnyRank = stats.userRankings.find(u => u.discordId === sunnyId);
console.log('\n=== SUNNY RANKING OBJECT ===');
console.log(JSON.stringify(sunnyRank, null, 2));
