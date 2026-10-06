import fs from 'node:fs';

const ocrPath = 'discord-export/ocr-results.json';
const ocr = JSON.parse(fs.readFileSync(ocrPath, 'utf8'));

const batchFiles = [
  'discord-export/ocr_results_batch_d32_d36_1.json',
  'discord-export/ocr_results_batch_d32_d36_2.json',
  'discord-export/ocr_results_batch_d32_d36_3.json',
];

let totalApplied = 0;

for (const bf of batchFiles) {
  if (!fs.existsSync(bf)) {
    console.warn(`File ${bf} not found yet!`);
    continue;
  }
  const items = JSON.parse(fs.readFileSync(bf, 'utf8'));
  console.log(`Processing ${items.length} items from ${bf}...`);

  for (const item of items) {
    if (!item.day || !item.discordId) continue;
    if (!ocr[item.day]) ocr[item.day] = {};

    ocr[item.day][item.discordId] = {
      user: item.user,
      cards: Number(item.cards) || 0,
      minutes: item.minutes != null ? Number(item.minutes) : null,
      streak: item.streak != null ? Number(item.streak) : null,
      deck: item.deck || null,
      detail: item.detail || '',
      image_content_desc: item.image_content_desc || ''
    };
    totalApplied++;
  }
}

ocr.meta = {
  source: 'Antigravity Gemini Vision OCR read from Day 1 to Day 36 checkin screenshots',
  updated_at: new Date().toISOString()
};

fs.writeFileSync(ocrPath, JSON.stringify(ocr, null, 2), 'utf8');
console.log(`Successfully merged ${totalApplied} items into ${ocrPath}!`);
