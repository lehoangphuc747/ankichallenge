import fs from 'node:fs';

const items = JSON.parse(fs.readFileSync('discord-export/new_checkins_pending.json', 'utf8'));

const b1 = items.slice(0, 10);
const b2 = items.slice(10);

fs.writeFileSync('discord-export/new_batch1.json', JSON.stringify(b1, null, 2), 'utf8');
fs.writeFileSync('discord-export/new_batch2.json', JSON.stringify(b2, null, 2), 'utf8');

console.log(`Created new_batch1 (${b1.length} items) and new_batch2 (${b2.length} items)`);
