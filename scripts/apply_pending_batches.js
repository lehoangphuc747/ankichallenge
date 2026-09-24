import fs from 'node:fs';

const ocrResultsPath = 'discord-export/ocr-results.json';
const ocrResults = JSON.parse(fs.readFileSync(ocrResultsPath, 'utf8'));

const b1Path = 'discord-export/ocr_results_batch_pending_1.json';
const b2Path = 'discord-export/ocr_results_batch_pending_2.json';

const allItems = [];
if (fs.existsSync(b1Path)) {
  const b1 = JSON.parse(fs.readFileSync(b1Path, 'utf8'));
  allItems.push(...(Array.isArray(b1) ? b1 : Object.values(b1)));
}
if (fs.existsSync(b2Path)) {
  const b2 = JSON.parse(fs.readFileSync(b2Path, 'utf8'));
  allItems.push(...(Array.isArray(b2) ? b2 : Object.values(b2)));
}

console.log(`Total new items to apply: ${allItems.length}`);

for (const item of allItems) {
  if (!item.day || !item.discordId) continue;
  if (!ocrResults[item.day]) ocrResults[item.day] = {};

  ocrResults[item.day][item.discordId] = {
    user: item.user,
    cards: item.cards,
    minutes: item.minutes,
    streak: item.streak,
    deck: item.deck,
    detail: item.detail,
    image_content_desc: item.image_content_desc
  };
  console.log(`Applied [${item.day}] ${item.user} (${item.discordId}): ${item.cards} cards, ${item.minutes} mins`);
}

// Preserve Ava historical & confirmed reviews
const avaId = '895672321916960838';
if (ocrResults['day20'] && ocrResults['day20'][avaId]) {
  ocrResults['day20'][avaId].cards = 105;
  ocrResults['day20'][avaId].detail = "Chủ Nhật, 20/09/2026: 105 reviews (đính chính lại do up nhầm ảnh)";
}
if (ocrResults['day21'] && ocrResults['day21'][avaId]) {
  ocrResults['day21'][avaId].cards = 398;
  ocrResults['day21'][avaId].detail = "Thứ Hai, 21/09/2026: 398 reviews";
}
if (ocrResults['day22'] && ocrResults['day22'][avaId]) {
  ocrResults['day22'][avaId].cards = 1055;
  ocrResults['day22'][avaId].detail = "Thứ Ba, 22/09/2026: 1,055 reviews";
}
if (ocrResults['day23'] && ocrResults['day23'][avaId]) {
  ocrResults['day23'][avaId].cards = 1052;
  ocrResults['day23'][avaId].detail = "Thứ Tư, 23/09/2026: 1,052 reviews";
}

ocrResults.meta = {
  source: "Antigravity Gemini Vision OCR read from Day 1 to Day 24 checkin screenshots",
  lastUpdated: new Date().toISOString(),
  note: "Cập nhật check-in đến Day 24 (24/09/2026), hoàn thiện đối soát Day 23 và các check-in bù."
};

fs.writeFileSync(ocrResultsPath, JSON.stringify(ocrResults, null, 2), 'utf8');
console.log('Successfully updated discord-export/ocr-results.json up to Day 24!');
