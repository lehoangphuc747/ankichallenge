import fs from 'node:fs';

const items = JSON.parse(fs.readFileSync('discord-export/pending_ocr_d20_d23.json', 'utf8'));

const bA = items.slice(0, 15);
const bB = items.slice(15);

fs.writeFileSync('discord-export/batch_d20_d23_A.json', JSON.stringify(bA, null, 2), 'utf8');
fs.writeFileSync('discord-export/batch_d20_d23_B.json', JSON.stringify(bB, null, 2), 'utf8');

console.log(`Saved batch A (${bA.length} items) and batch B (${bB.length} items)`);
