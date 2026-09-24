import fs from 'node:fs';

const ocrPath = 'discord-export/ocr-results.json';
const ocr = JSON.parse(fs.readFileSync(ocrPath, 'utf8'));

// 1. Gai con HaVy trộm vía Day 19
const haVyId = '1465133555574243348';
if (!ocr.day19) ocr.day19 = {};
ocr.day19[haVyId] = {
  user: 'Gai con HaVy trộm vía',
  cards: 53,
  minutes: null,
  streak: 19,
  deck: null,
  detail: 'Thứ Bảy, 19/09/2026: 53 thẻ ôn tập',
  image_content_desc: 'AnkiDroid stats tooltip Thứ Bảy, 19 tháng 9, 2026: 53 thẻ ôn tập'
};

// 2. Madbear (Gai Hàn TOPIK 6 xin vía) Day 19 - Day 24
const madbearId = '438960335983083530';
const madbearName = 'Gai Hàn TOPIK 6 xin vía';

ocr.day19[madbearId] = {
  user: madbearName,
  cards: 536,
  minutes: null,
  streak: 19,
  deck: null,
  detail: 'Saturday September 19, 2026: 536 cards reviewed',
  image_content_desc: 'Anki Heatmap tooltip: 536 cards reviewed on Saturday September 19, 2026'
};

if (!ocr.day20) ocr.day20 = {};
ocr.day20[madbearId] = {
  user: madbearName,
  cards: 479,
  minutes: null,
  streak: 20,
  deck: null,
  detail: 'Sunday September 20, 2026: 479 cards reviewed',
  image_content_desc: 'Anki Heatmap tooltip: 479 cards reviewed on Sunday September 20, 2026'
};

if (!ocr.day21) ocr.day21 = {};
ocr.day21[madbearId] = {
  user: madbearName,
  cards: 22,
  minutes: null,
  streak: 21,
  deck: null,
  detail: 'Monday September 21, 2026: 22 cards reviewed',
  image_content_desc: 'Anki Heatmap tooltip: 22 cards reviewed on Monday September 21, 2026'
};

if (!ocr.day22) ocr.day22 = {};
ocr.day22[madbearId] = {
  user: madbearName,
  cards: 2,
  minutes: null,
  streak: 22,
  deck: null,
  detail: 'Tuesday September 22, 2026: 2 cards reviewed',
  image_content_desc: 'Anki Heatmap tooltip: 2 cards reviewed on Tuesday September 22, 2026'
};

if (!ocr.day23) ocr.day23 = {};
ocr.day23[madbearId] = {
  user: madbearName,
  cards: 786,
  minutes: null,
  streak: 23,
  deck: null,
  detail: 'Wednesday September 23, 2026: 786 cards reviewed',
  image_content_desc: 'Anki Heatmap tooltip: 786 cards reviewed on Wednesday September 23, 2026'
};

if (!ocr.day24) ocr.day24 = {};
ocr.day24[madbearId] = {
  user: madbearName,
  cards: 1320,
  minutes: null,
  streak: 24,
  deck: null,
  detail: 'Thursday September 24, 2026: 1,320 cards reviewed',
  image_content_desc: 'Anki Heatmap tooltip: 1,320 cards reviewed on Thursday September 24, 2026'
};

ocr.meta = {
  source: 'Antigravity Gemini Vision OCR read from Day 1 to Day 24 checkin screenshots',
  lastUpdated: new Date().toISOString(),
  note: 'Madbear hoàn tất check-in bù Day 19 đến Day 24 (tổng 3.145 thẻ, khôi phục 100% chuyên cần) và Gai con HaVy trộm vía bù Day 19 (53 thẻ).'
};

fs.writeFileSync(ocrPath, JSON.stringify(ocr, null, 2), 'utf8');
console.log('Successfully updated ocr-results.json with Madbear and HaVy checkins!');
