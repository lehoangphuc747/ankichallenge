import fs from 'node:fs';

const ocrData = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

const batch1Path = 'discord-export/ocr_batch_d50_d55_1_results.json';
const batch2Path = 'discord-export/ocr_batch_d50_d55_2_results.json';
const batch3Path = 'discord-export/ocr_batch_d50_d55_3_results.json';

const allResults = [];
if (fs.existsSync(batch1Path)) allResults.push(...JSON.parse(fs.readFileSync(batch1Path, 'utf8')));
if (fs.existsSync(batch2Path)) allResults.push(...JSON.parse(fs.readFileSync(batch2Path, 'utf8')));
if (fs.existsSync(batch3Path)) allResults.push(...JSON.parse(fs.readFileSync(batch3Path, 'utf8')));

console.log(`Loaded ${allResults.length} records from batches.`);

let added = 0;
let updated = 0;

for (const res of allResults) {
  const dayKey = res.dayKey || `day${res.day}`;
  ocrData[dayKey] = ocrData[dayKey] || {};
  
  if (ocrData[dayKey][res.discordId]) {
    // If existing has fewer cards, update
    const existing = ocrData[dayKey][res.discordId];
    if (res.cards >= (existing.cards || 0)) {
      ocrData[dayKey][res.discordId] = {
        user: res.user,
        cards: Number(res.cards) || 0,
        minutes: res.minutes != null ? Number(res.minutes) : existing.minutes,
        streak: res.streak != null ? Number(res.streak) : existing.streak,
        deck: res.deck || existing.deck || null,
        detail: res.detail || existing.detail || '',
        image_content_desc: res.image_content_desc || existing.image_content_desc || ''
      };
      updated++;
    }
  } else {
    ocrData[dayKey][res.discordId] = {
      user: res.user,
      cards: Number(res.cards) || 0,
      minutes: res.minutes != null ? Number(res.minutes) : null,
      streak: res.streak != null ? Number(res.streak) : null,
      deck: res.deck || null,
      detail: res.detail || '',
      image_content_desc: res.image_content_desc || ''
    };
    added++;
  }
}

ocrData.meta = {
  source: 'Antigravity Gemini Vision OCR read from Day 1 to Day 55 checkin screenshots',
  updated_at: new Date().toISOString()
};

fs.writeFileSync('discord-export/ocr-results.json', JSON.stringify(ocrData, null, 2), 'utf8');
console.log(`Merged ${allResults.length} records (${added} new, ${updated} updated) into ocr-results.json!`);

// Print check-in count for Day 49 to 55
for (const d of [49, 50, 51, 52, 53, 54, 55]) {
  const k = `day${d}`;
  const count = ocrData[k] ? Object.keys(ocrData[k]).length : 0;
  console.log(`Day ${d}: ${count} users recorded in OCR`);
}
