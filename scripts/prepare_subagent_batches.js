import fs from 'node:fs';
import path from 'node:path';

const pending = JSON.parse(fs.readFileSync('discord-export/d16_d20_pending.json', 'utf8'));

const b16 = pending.filter(p => p.day === 'day16');
const b17 = pending.filter(p => p.day === 'day17');
const b18 = pending.filter(p => p.day === 'day18');
const b19_20 = pending.filter(p => p.day === 'day19' || p.day === 'day20');

fs.writeFileSync('discord-export/batch_d16.json', JSON.stringify(b16, null, 2), 'utf8');
fs.writeFileSync('discord-export/batch_d17.json', JSON.stringify(b17, null, 2), 'utf8');
fs.writeFileSync('discord-export/batch_d18.json', JSON.stringify(b18, null, 2), 'utf8');
fs.writeFileSync('discord-export/batch_d19_d20.json', JSON.stringify(b19_20, null, 2), 'utf8');

console.log(`Created batches:
- Day 16: ${b16.length} items
- Day 17: ${b17.length} items
- Day 18: ${b18.length} items
- Day 19 & 20: ${b19_20.length} items`);
