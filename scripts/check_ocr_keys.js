import fs from 'node:fs';
const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));
const entries = Object.entries(ocr);
console.log('Total OCR entries:', entries.length);
console.log('First 3 entries:', entries.slice(0, 3));
console.log('Last 3 entries:', entries.slice(-3));
