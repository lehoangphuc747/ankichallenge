import fs from 'node:fs';

const d3Chat = JSON.parse(fs.readFileSync('discord-export/day3/chat.json', 'utf8'));
const sunnyId = '1410392551634112640';
const sunnyD3 = d3Chat.filter(m => m.authorId === sunnyId || (m.checkinInfo && m.checkinInfo.targetDiscordId === sunnyId));
console.log('Sunny in Day 3:', JSON.stringify(sunnyD3, null, 2));

const d4Chat = JSON.parse(fs.readFileSync('discord-export/day4/chat.json', 'utf8'));
const sunnyD4 = d4Chat.filter(m => m.authorId === sunnyId || (m.checkinInfo && m.checkinInfo.targetDiscordId === sunnyId));
console.log('Sunny in Day 4:', JSON.stringify(sunnyD4, null, 2));
