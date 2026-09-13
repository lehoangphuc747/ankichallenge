import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Update user-map.json
const userMapPath = path.join(__dirname, '../discord-export/user-map.json');
const userMap = JSON.parse(fs.readFileSync(userMapPath, 'utf8'));
userMap['928998165770825728'] = 'linhkhanhahi';
fs.writeFileSync(userMapPath, JSON.stringify(userMap, null, 2), 'utf8');
console.log('Updated user-map.json with linhkhanhahi');

// 2. Update ocr-results.json
const ocrPath = path.join(__dirname, '../discord-export/ocr-results.json');
const ocr = JSON.parse(fs.readFileSync(ocrPath, 'utf8'));

ocr.meta = {
  source: "Antigravity Gemini Vision OCR read from Day 1 to Day 13 checkin screenshots",
  lastUpdated: new Date().toISOString(),
  note: "Cập nhật bổ sung đầy đủ check-in Day 11 (Danneee05, nothinn, Dan1elP), toàn bộ 19 check-in Day 12 (bổ sung Paul, linhkhanhahi, TheMink, Tuong Vie, Serene Flow, Danneee05, nothinn, Dan1elP, Ava, Lê Đức Tuấn, TaiTran, Nguyen) và mở bát Day 13 (Tram)."
};

// Day 11 additions
if (!ocr.day11) ocr.day11 = {};
ocr.day11['1503052423390957772'] = {
  user: "Danneee05",
  cards: 1,
  minutes: null,
  streak: 11,
  deck: null,
  detail: "Heatmap: 1 card reviewed on Friday September 11, 2026 · streak 11",
  image_content_desc: "Review Heatmap hiển thị tooltip 1 card on Friday September 11, streak 11"
};
ocr.day11['1446702112347127869'] = {
  user: "nothinn",
  cards: 12,
  minutes: 4,
  streak: 2,
  deck: null,
  detail: "Đã học 12 thẻ trong 4 phút hôm nay · Chuỗi ngày: 2 ngày",
  image_content_desc: "Màn hình Anki: Đã học 12 thẻ trong 4 phút hôm nay, chuỗi ngày 2 ngày"
};
ocr.day11['534726411521490956'] = {
  user: "Dan1elP",
  cards: 80,
  minutes: null,
  streak: 15,
  deck: null,
  detail: "Heatmap: 80 cards reviewed on Friday September 11, 2026 · streak 15",
  image_content_desc: "Review Heatmap hiển thị tooltip 80 cards on Friday September 11, streak 15"
};

// Day 12 additions
if (!ocr.day12) ocr.day12 = {};
ocr.day12['871985158151106571'] = {
  user: "Paul",
  cards: 1,
  minutes: null,
  streak: 1,
  deck: null,
  detail: "Review Heatmap: Chuỗi ngày 1 ngày (ô đỏ ngày 12 tháng 9)",
  image_content_desc: "Review Heatmap Sep 12: ô đỏ, chuỗi ngày 1 ngày"
};
ocr.day12['928998165770825728'] = {
  user: "linhkhanhahi",
  cards: 65,
  minutes: 12.27,
  streak: 4,
  deck: "B. VĂN BẰNG 2::02. HỌC KÌ 2::Từ vựng",
  detail: "Đã học 65 thẻ trong 12,27 phút hôm nay (11,33giây/thẻ) · streak 4",
  image_content_desc: "Bảng Anki: Đã học 65 thẻ trong 12,27 phút hôm nay, deck B. VĂN BẰNG 2"
};
ocr.day12['790859151734996992'] = {
  user: "TheMink",
  cards: 266,
  minutes: 55.3,
  streak: 12,
  deck: null,
  detail: "Đã học 266 thẻ trong 55,30 phút hôm nay (12,47giây/thẻ) · streak 12",
  image_content_desc: "Bảng Anki: Đã học 266 thẻ trong 55,30 phút hôm nay, streak 12"
};
ocr.day12['567311737464946703'] = {
  user: "Tuong Vie",
  cards: 1,
  minutes: null,
  streak: 12,
  deck: null,
  detail: "Review Heatmap: Sep 12 ô vuông có hoạt động ôn tập · streak 12",
  image_content_desc: "Review Heatmap Sep 12 có hoạt động, streak 12"
};
ocr.day12['1393440400038957157'] = {
  user: "Serene Flow",
  cards: 18,
  minutes: 2.38,
  streak: null,
  deck: null,
  detail: "Learn 18 trong 2,38 phút (7,93giây/thẻ) · Ôn 0 · streak hiện tại",
  image_content_desc: "Bảng Anki: Learn 18 cards in 2.38 mins, 7.93s/card"
};
ocr.day12['1503052423390957772'] = {
  user: "Danneee05",
  cards: 77,
  minutes: null,
  streak: 12,
  deck: null,
  detail: "Heatmap: 77 cards reviewed on Saturday September 12, 2026 · streak 12",
  image_content_desc: "Review Heatmap hiển thị tooltip 77 cards on Saturday September 12, streak 12"
};
ocr.day12['1446702112347127869'] = {
  user: "nothinn",
  cards: 13,
  minutes: 3,
  streak: 4,
  deck: null,
  detail: "Đã học 13 thẻ trong 3 phút hôm nay · Chuỗi ngày: 4 ngày",
  image_content_desc: "Màn hình Anki: Đã học 13 thẻ trong 3 phút hôm nay, chuỗi ngày 4 ngày"
};
ocr.day12['534726411521490956'] = {
  user: "Dan1elP",
  cards: 147,
  minutes: null,
  streak: 15,
  deck: null,
  detail: "Heatmap: 147 cards reviewed on Saturday September 12, 2026 · streak 15",
  image_content_desc: "Review Heatmap hiển thị tooltip 147 cards on Saturday September 12, streak 15"
};
ocr.day12['895672321916960838'] = {
  user: "Ava",
  cards: 15,
  minutes: null,
  streak: 12,
  deck: null,
  detail: "Lịch Anki: Thứ Bảy, 12 tháng 9, 2026: 15 thẻ ôn tập · streak 12",
  image_content_desc: "Lịch Anki Sep 12: 15 reviews, streak 12"
};
ocr.day12['870187268692906014'] = {
  user: "Lê Đức Tuấn",
  cards: 221,
  minutes: 50,
  streak: null,
  deck: null,
  detail: "Heatmap Sep 12: 221 REV, 21 NEW · Thời gian 50 phút",
  image_content_desc: "Review Heatmap Sep 12: 221 REV, 21 NEW, 50 mins"
};
ocr.day12['1424374539177164861'] = {
  user: "TaiTran",
  cards: 125,
  minutes: null,
  streak: 519,
  deck: null,
  detail: "Heatmap: 125 cards reviewed on Saturday September 12, 2026 · streak 519",
  image_content_desc: "Review Heatmap Sep 12: 125 cards reviewed, streak 519"
};
ocr.day12['871321277858725958'] = {
  user: "Nguyen",
  cards: 1183,
  minutes: null,
  streak: 12,
  deck: null,
  detail: "Heatmap: 1,183 cards reviewed on Saturday September 12, 2026 · streak 12",
  image_content_desc: "Review Heatmap tooltip: 1,183 cards reviewed on Saturday September 12, 2026"
};

// Day 13 additions
if (!ocr.day13) ocr.day13 = {};
ocr.day13['1446504123657748651'] = {
  user: "Tram",
  cards: 223,
  minutes: 3.17,
  streak: 13,
  deck: null,
  detail: "Đã học 223 thẻ trong 3,17 phút hôm nay (0,85giây/thẻ) · streak 13",
  image_content_desc: "Thông báo Anki của Tram: Đã học 223 thẻ trong 3,17 phút hôm nay (0,85giây/thẻ)"
};

fs.writeFileSync(ocrPath, JSON.stringify(ocr, null, 2), 'utf8');
console.log('Updated ocr-results.json successfully!');
console.log('Day 11 entries:', Object.keys(ocr.day11).length);
console.log('Day 12 entries:', Object.keys(ocr.day12).length);
console.log('Day 13 entries:', Object.keys(ocr.day13).length);
