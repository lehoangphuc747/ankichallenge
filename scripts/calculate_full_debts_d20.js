import fs from 'node:fs';

const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

const avaId = '895672321916960838';
const sunnyId = '1410392551634112640';

console.log('=== CHECKING AVA & SUNNY FROM DAY 1 TO DAY 20 ===');

const days = [];
for (let i = 1; i <= 20; i++) days.push(`day${i}`);

const avaRecords = [];
const sunnyRecords = [];

for (let i = 0; i < days.length; i++) {
  const d = days[i];
  const dayNum = i + 1;
  const dayData = ocr[d] || {};

  // Check Ava
  const ava = dayData[avaId];
  avaRecords.push({
    day: dayNum,
    cards: ava ? (Number(ava.cards) || 0) : 0,
    checkin: !!ava,
    detail: ava?.detail || ''
  });

  // Check Sunny
  const sunny = dayData[sunnyId];
  sunnyRecords.push({
    day: dayNum,
    cards: sunny ? (Number(sunny.cards) || 0) : 0,
    checkin: !!sunny,
    detail: sunny?.detail || ''
  });
}

console.log('\n--- AVA (KPI 500) ---');
let avaTotal = 0;
let avaDebt = 0;
for (const r of avaRecords) {
  avaTotal += r.cards;
  const diff = r.cards - 500;
  avaDebt -= diff;
  console.log(`Day ${r.day}: ${r.checkin ? 'Có' : 'KHÔNG'} checkin | ${r.cards} thẻ | diff: ${diff >= 0 ? '+' + diff : diff} | Nợ luỹ kế: ${avaDebt}`);
}
console.log(`Ava Total: ${avaTotal} thẻ / ${20 * 500} KPI -> Nợ: ${20 * 500 - avaTotal} thẻ`);

console.log('\n--- SUNNY (KPI 500) ---');
let sunnyTotal = 0;
let sunnyDebt = 0;
for (const r of sunnyRecords) {
  sunnyTotal += r.cards;
  const diff = r.cards - 500;
  sunnyDebt -= diff;
  console.log(`Day ${r.day}: ${r.checkin ? 'Có' : 'KHÔNG'} checkin | ${r.cards} thẻ | diff: ${diff >= 0 ? '+' + diff : diff} | Nợ luỹ kế: ${sunnyDebt}`);
}
console.log(`Sunny Total: ${sunnyTotal} thẻ / ${20 * 500} KPI -> Nợ: ${20 * 500 - sunnyTotal} thẻ`);
