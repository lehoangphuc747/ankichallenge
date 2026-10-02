import fs from 'node:fs';

const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

// 1. Update Day 31 with 4 late check-ins
if (!ocr.day31) ocr.day31 = {};

ocr.day31['928998165770825728'] = {
  user: 'linhkhanhahi',
  cards: 27,
  minutes: 3.74,
  streak: 14,
  deck: 'B. VĂN BẰNG 2::02. HỌC KÌ 2',
  detail: 'Đã học 27 thẻ trong 3,74 phút hôm nay (8,31 giây/thẻ)',
  image_content_desc: 'AnkiDroid thống kê bộ Văn Bằng 2: 27 thẻ trong 3,74 phút'
};

ocr.day31['838271094170583120'] = {
  user: 'stuna1604#8722',
  cards: 146,
  minutes: null,
  streak: 1,
  deck: 'SẢN 1::01. KHUNG CHẬU NỮ VỀ PHƯƠNG DIỆN SẢN KHOA',
  detail: 'Thứ Năm, 1 tháng 10, 2026: 146 thẻ ôn tập (Bộ thẻ Sản khoa)',
  image_content_desc: 'Thống kê Anki desktop Lịch 1/10/2026: 146 thẻ ôn tập bộ Sản'
};

ocr.day31['1410392551634112640'] = {
  user: 'Sunny',
  cards: 10,
  minutes: null,
  streak: 7,
  deck: 'Cambridge Vocabulary for IELTS',
  detail: 'Thứ Năm, ngày 1 tháng 10, 2026: 10 thẻ ôn tập',
  image_content_desc: 'Tooltip Lịch AnkiMobile iOS: Thứ Năm 1/10/2026 có 10 thẻ ôn tập'
};

ocr.day31['711153532392308767'] = {
  user: 'Alan Le',
  cards: 65,
  minutes: null,
  streak: 31,
  deck: 'ĐỜI NGẮN ĐỪNG NGỦ DÀI',
  detail: '65 reviews on Thursday, October 1, 2026 (streak 292 ngày)',
  image_content_desc: 'Heatmap custom theme Đời ngắn đừng ngủ dài: 65 reviews on Thursday Oct 1, 2026'
};

// 2. Add Day 32 entries
if (!ocr.day32) ocr.day32 = {};

ocr.day32['1446504123657748651'] = {
  user: 'Tram',
  cards: 447,
  minutes: 15.35,
  streak: 32,
  deck: null,
  detail: 'Đã học 447 thẻ trong 15,35 phút hôm nay (2,06 giây/thẻ)',
  image_content_desc: 'Anki stats thanh ngang báo đã học 447 thẻ trong 15,35 phút'
};

ocr.day32['1410392551634112640'] = {
  user: 'Sunny',
  cards: 1028,
  minutes: null,
  streak: 8,
  deck: 'Cambridge Vocabulary for IELTS',
  detail: 'Thứ Sáu, ngày 2 tháng 10, 2026: 1.028 thẻ ôn tập',
  image_content_desc: 'Tooltip Lịch AnkiMobile iOS: Thứ Sáu 2/10/2026 có 1.028 thẻ ôn tập'
};

ocr.meta = {
  source: 'Antigravity Gemini Vision OCR read from Day 1 to Day 32 checkin screenshots',
  updated_at: new Date().toISOString()
};

fs.writeFileSync('discord-export/ocr-results.json', JSON.stringify(ocr, null, 2), 'utf8');
console.log('Successfully updated ocr-results.json with Day 31 late check-ins and Day 32 entries!');
