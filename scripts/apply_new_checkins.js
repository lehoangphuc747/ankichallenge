import fs from 'node:fs';
import path from 'node:path';

const ocrResultsPath = 'discord-export/ocr-results.json';
const ocrResults = JSON.parse(fs.readFileSync(ocrResultsPath, 'utf8'));

const b1Path = 'discord-export/ocr_new_batch1.json';
const b2Path = 'discord-export/ocr_new_batch2.json';

const allNew = [];
if (fs.existsSync(b1Path)) {
  const b1 = JSON.parse(fs.readFileSync(b1Path, 'utf8'));
  allNew.push(...(Array.isArray(b1) ? b1 : Object.values(b1)));
}
if (fs.existsSync(b2Path)) {
  const b2 = JSON.parse(fs.readFileSync(b2Path, 'utf8'));
  allNew.push(...(Array.isArray(b2) ? b2 : Object.values(b2)));
}

console.log(`Total new checkin records to apply: ${allNew.length}`);

for (const item of allNew) {
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
  console.log(`- Applied [${item.day}] ${item.user}: ${item.cards} cards, ${item.minutes} mins`);
}

ocrResults.meta = {
  source: "Antigravity Gemini Vision OCR read from Day 1 to Day 21 checkin screenshots",
  lastUpdated: new Date().toISOString(),
  note: "Cập nhật bù đợt check-in đêm Day 20 của Sunny (D16-D21) và các thành viên khác."
};

fs.writeFileSync(ocrResultsPath, JSON.stringify(ocrResults, null, 2), 'utf8');
console.log('Successfully updated discord-export/ocr-results.json!');
