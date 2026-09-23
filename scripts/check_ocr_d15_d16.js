import fs from 'node:fs';

const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));
const stats = JSON.parse(fs.readFileSync('src/data/ac11_stats.json', 'utf8'));

console.log('Days in OCR:', Object.keys(ocr));
if (ocr.day15) {
  console.log('day15 entries count:', Object.keys(ocr.day15).length);
  for (const [k, v] of Object.entries(ocr.day15)) {
    console.log(`  day15: ${v.user} -> cards: ${v.cards}, minutes: ${v.minutes}`);
  }
} else {
  console.log('day15 not in ocr');
}

if (ocr.day16) {
  console.log('day16 entries count:', Object.keys(ocr.day16).length);
  for (const [k, v] of Object.entries(ocr.day16)) {
    console.log(`  day16: ${v.user} -> cards: ${v.cards}, minutes: ${v.minutes}`);
  }
} else {
  console.log('day16 not in ocr');
}
