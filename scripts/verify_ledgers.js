import fs from 'node:fs';

const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

const avaId = '895672321916960838';
const sunnyId = '1410392551634112640';

function getLedger(userId, name, kpi = 500) {
  let totalCards = 0;
  let debt = 0;
  const history = [];

  for (let i = 1; i <= 20; i++) {
    const dKey = `day${i}`;
    const dayData = ocr[dKey] || {};
    const item = dayData[userId];
    const cards = item ? (Number(item.cards) || 0) : 0;
    const hasCheckin = !!item;

    totalCards += cards;
    const diff = cards - kpi;
    debt -= diff;

    history.push({
      day: i,
      cards,
      hasCheckin,
      diff,
      debt
    });
  }

  return { name, userId, kpi, totalCards, debt, history };
}

const sunny = getLedger(sunnyId, 'Sunny', 500);
const ava = getLedger(avaId, 'Ava', 500);

console.log('=== SUNNY DETAIL ===');
sunny.history.forEach(h => {
  console.log(`D${h.day}: ${h.cards} thẻ (${h.hasCheckin ? 'checkin' : 'vắng'}) | diff: ${h.diff >= 0 ? '+' : ''}${h.diff} | nợ: ${h.debt}`);
});
console.log(`Total learned: ${sunny.totalCards} / 10000 | Final debt: ${sunny.debt}`);

console.log('\n=== AVA DETAIL ===');
ava.history.forEach(h => {
  console.log(`D${h.day}: ${h.cards} thẻ (${h.hasCheckin ? 'checkin' : 'vắng'}) | diff: ${h.diff >= 0 ? '+' : ''}${h.diff} | nợ: ${h.debt}`);
});
console.log(`Total learned: ${ava.totalCards} / 10000 | Final debt: ${ava.debt}`);
