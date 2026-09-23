import fs from 'node:fs';

const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));
const sunnyId = '1410392551634112640';

console.log('=== SUNNY TOÀN DIỆN TỪ DAY 1 ĐẾN DAY 14 ===');

for (let d = 1; d <= 14; d++) {
  const dayKey = `day${d}`;
  const dayData = ocr[dayKey] || {};
  const userEntry = dayData[sunnyId];
  if (userEntry) {
    console.log(`${dayKey.toUpperCase()}:`, JSON.stringify(userEntry));
  } else {
    console.log(`${dayKey.toUpperCase()}: [KHÔNG CÓ CHECK-IN / VẮNG]`);
  }
}
