import fs from 'node:fs';

const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

const avaId = '895672321916960838';
const sunnyId = '1410392551634112640';

function getStats(uid, name) {
  let totalCards = 0;
  let checkinDays = 0;
  const history = [];

  for (let i = 1; i <= 22; i++) {
    const dKey = `day${i}`;
    const dayData = ocr[dKey] || {};
    const item = dayData[uid];
    const cards = item ? (Number(item.cards) || 0) : 0;
    const hasCheckin = !!item && cards > 0;
    if (hasCheckin) checkinDays++;
    totalCards += cards;
    history.push({ day: i, cards, hasCheckin });
  }

  const kpi22 = 22 * 500;
  const debt = kpi22 - totalCards;

  return { name, totalCards, checkinDays, debt, history };
}

console.log('SUNNY:', getStats(sunnyId, 'Sunny'));
console.log('AVA:', getStats(avaId, 'Ava'));
