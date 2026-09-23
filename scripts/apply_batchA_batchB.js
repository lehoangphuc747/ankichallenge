import fs from 'node:fs';
import path from 'node:path';

const ocrResultsPath = 'discord-export/ocr-results.json';
const ocrResults = JSON.parse(fs.readFileSync(ocrResultsPath, 'utf8'));

const bAPath = 'discord-export/ocr_results_batchA.json';
const bBPath = 'discord-export/ocr_results_batchB.json';

const allItems = [];
if (fs.existsSync(bAPath)) {
  const bA = JSON.parse(fs.readFileSync(bAPath, 'utf8'));
  allItems.push(...(Array.isArray(bA) ? bA : Object.values(bA)));
}
if (fs.existsSync(bBPath)) {
  const bB = JSON.parse(fs.readFileSync(bBPath, 'utf8'));
  allItems.push(...(Array.isArray(bB) ? bB : Object.values(bB)));
}

console.log(`Total items to apply: ${allItems.length}`);

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

// Ensure Ava specific dates
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

ocrResults.meta = {
  source: "Antigravity Gemini Vision OCR read from Day 1 to Day 23 checkin screenshots",
  lastUpdated: new Date().toISOString(),
  note: "Cập nhật check-in đến Day 23, đối soát chính xác ngày check-in của Ava (D20: 105 thẻ, D21: 398 thẻ, D22: 1.055 thẻ)."
};

fs.writeFileSync(ocrResultsPath, JSON.stringify(ocrResults, null, 2), 'utf8');
console.log('Successfully updated discord-export/ocr-results.json up to Day 23!');
