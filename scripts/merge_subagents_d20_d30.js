import fs from 'node:fs';

const ocrPath = 'discord-export/ocr-results.json';
const ocr = JSON.parse(fs.readFileSync(ocrPath, 'utf8'));

const batchFiles = [
  'discord-export/ocr_results_subagent_1.json',
  'discord-export/ocr_results_subagent_2.json',
  'discord-export/ocr_results_subagent_3.json',
  'discord-export/ocr_results_subagent_4.json',
];

let totalApplied = 0;

for (const bf of batchFiles) {
  if (!fs.existsSync(bf)) {
    console.error(`File ${bf} not found!`);
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

// Preserve Ava historical & confirmed reviews
const avaId = '895672321916960838';
if (ocr['day20'] && ocr['day20'][avaId]) {
  ocr['day20'][avaId].cards = 105;
  ocr['day20'][avaId].detail = "Chủ Nhật, 20/09/2026: 105 reviews (đính chính lại do up nhầm ảnh)";
}
if (ocr['day21'] && ocr['day21'][avaId]) {
  ocr['day21'][avaId].cards = 398;
  ocr['day21'][avaId].detail = "Thứ Hai, 21/09/2026: 398 reviews";
}
if (ocr['day22'] && ocr['day22'][avaId]) {
  ocr['day22'][avaId].cards = 1055;
  ocr['day22'][avaId].detail = "Thứ Ba, 22/09/2026: 1,055 reviews";
}
if (ocr['day23'] && ocr['day23'][avaId]) {
  ocr['day23'][avaId].cards = 1052;
  ocr['day23'][avaId].detail = "Thứ Tư, 23/09/2026: 1,052 reviews";
}

ocr.meta = {
  source: 'Antigravity Gemini Vision OCR read from Day 1 to Day 30 checkin screenshots',
  lastUpdated: new Date().toISOString(),
  note: 'Cập nhật trọn vẹn 30 ngày (Day 1 - Day 30) Anki Challenge 11, chốt tháng đầu tiên với đầy đủ dữ liệu thị giác từ 122 lượt check-in mới.'
};

fs.writeFileSync(ocrPath, JSON.stringify(ocr, null, 2), 'utf8');
console.log(`\nSuccessfully applied ${totalApplied} OCR items to ${ocrPath}!`);
