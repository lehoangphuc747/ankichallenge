import fs from 'node:fs';

const items = JSON.parse(fs.readFileSync('discord-export/clean_unique_pending_ocr.json', 'utf8'));
console.log(`Total items to split: ${items.length}`);

const b1 = items.slice(0, 33);
const b2 = items.slice(33, 63);
const b3 = items.slice(63, 92);
const b4 = items.slice(92);

console.log(`Batch 1: ${b1.length} items (${b1[0].day} -> ${b1[b1.length - 1].day})`);
console.log(`Batch 2: ${b2.length} items (${b2[0].day} -> ${b2[b2.length - 1].day})`);
console.log(`Batch 3: ${b3.length} items (${b3[0].day} -> ${b3[b3.length - 1].day})`);
console.log(`Batch 4: ${b4.length} items (${b4[0].day} -> ${b4[b4.length - 1].day})`);

fs.writeFileSync('discord-export/batch_subagent_1.json', JSON.stringify(b1, null, 2), 'utf8');
fs.writeFileSync('discord-export/batch_subagent_2.json', JSON.stringify(b2, null, 2), 'utf8');
fs.writeFileSync('discord-export/batch_subagent_3.json', JSON.stringify(b3, null, 2), 'utf8');
fs.writeFileSync('discord-export/batch_subagent_4.json', JSON.stringify(b4, null, 2), 'utf8');

console.log('Successfully wrote 4 subagent batch files!');
