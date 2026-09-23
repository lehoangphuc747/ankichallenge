import fs from 'node:fs';

const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));
for (const [k, v] of Object.entries(ocr)) {
  if (v.user === 'Sunny' || (v.file && v.file.includes('sunny')) || (v.file && v.file.includes('1410392551634112640'))) {
    console.log(k, '->', JSON.stringify(v));
  }
}
