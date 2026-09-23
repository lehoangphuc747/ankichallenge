import fs from 'node:fs';

const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

const avaId = '895672321916960838';

let totalCards = 0;
let debt = 0;

console.log('=== AVA LEDGER (DAY 1 - DAY 22) ===');
for (let i = 1; i <= 22; i++) {
  const dKey = `day${i}`;
  const dayData = ocr[dKey] || {};
  const item = dayData[avaId];
  const cards = item ? (Number(item.cards) || 0) : 0;
  totalCards += cards;
  const diff = cards - 500;
  debt -= diff;
  console.log(`Day ${i}: ${cards} thẻ (${item ? 'checkin' : 'vắng'}) | diff: ${diff >= 0 ? '+' : ''}${diff} | nợ: ${debt}`);
}
console.log(`Ava Total: ${totalCards} / ${22 * 500} KPI -> Nợ: ${debt}`);
