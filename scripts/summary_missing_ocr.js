import fs from 'node:fs';
const missing = JSON.parse(fs.readFileSync('discord-export/missing_ocr.json', 'utf8'));
console.log('Total missing count:', missing.length);

const byDay = {};
for (const m of missing) {
  byDay[m.dayKey] = (byDay[m.dayKey] || 0) + 1;
}
console.log('Missing by day:', byDay);
