// Update OCR results with new check-ins: Day 12 late check-ins + Day 13 full batch
// OCR read via Gemini Vision on the Discord thread screenshots (2026-09-13/14)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ocrPath = path.join(__dirname, '../discord-export/ocr-results.json');
const ocr = JSON.parse(fs.readFileSync(ocrPath, 'utf8'));

ocr.meta = {
  source: "Antigravity Gemini Vision OCR read from Day 1 to Day 13 checkin screenshots",
  lastUpdated: new Date().toISOString(),
  note: "Bổ sung 3 check-in bù Day 12 (Dulgi 145 thẻ, Gai con HaVy 33 thẻ, Minh may mắn 18 thẻ) và toàn bộ 10 check-in Day 13 còn thiếu (PhươngPhương, Paul, Aleye, .diffusion., Gai con HaVy, Minh may mắn, loipahm, Dulgi, Alan Le, Gai Hàn) — Day 13 hiện có 11 người check-in."
};

// ---------- Day 12 late check-ins ----------
if (!ocr.day12) ocr.day12 = {};

ocr.day12['792983013340086293'] = {
  user: "Dulgi",
  cards: 145,
  minutes: null,
  streak: 472,
  deck: null,
  detail: "Review Heatmap: 145 cards reviewed on Saturday September 12, 2026 · Current streak 472 days · Daily average 138 cards",
  image_content_desc: "Ảnh chụp Review Heatmap của Dulgi: 145 cards reviewed on Saturday September 12, 2026, Current streak 472 days, Daily average 138 cards"
};

ocr.day12['1465133555574243348'] = {
  user: "Gai con HaVy trộm ví a",
  cards: 33,
  minutes: null,
  streak: 12,
  deck: "1 Chinese (HSK9)::Từ vựng::HSK7-9::HSK7-9 (1-1000)",
  detail: "Chinese HSK 7-9 · Thứ Bảy, 12 tháng 9, 2026: 33 thẻ ôn tập · streak 12",
  image_content_desc: "Ảnh chụp màn hình AnkiDroid mục Lịch ôn tập bộ thẻ '1 Chinese (HSK9)::Từ vựng::HSK7-9' với tooltip 'Thứ Bảy, 12 tháng 9, 2026: 33 thẻ ôn tập'"
};

ocr.day12['705779271603322911'] = {
  user: "Minh may mắn",
  cards: 18,
  minutes: null,
  streak: 13,
  deck: null,
  detail: "Review Heatmap: 18 reviews on Saturday, September 12, 2026 · streak 13",
  image_content_desc: "Ảnh chụp Review Heatmap desktop của Minh may mắn: 18 reviews on Saturday, September 12, 2026"
};

// ---------- Day 13 new check-ins ----------
if (!ocr.day13) ocr.day13 = {};

ocr.day13['813419447150444554'] = {
  user: "PhươngPhương",
  cards: 114,
  minutes: 14.75,
  streak: 13,
  deck: null,
  detail: "Studied 114 cards in 14.75 minutes today (7.77s/card) · streak 13",
  image_content_desc: "Ảnh chụp thông báo Anki: Studied 114 cards in 14.75 minutes today (7.77s/card)"
};

ocr.day13['871985158151106571'] = {
  user: "Paul",
  cards: 120,
  minutes: null,
  streak: 2,
  deck: null,
  detail: "Review Heatmap: 120 cards reviewed on Sunday September 13, 2026 · Current streak 2 days",
  image_content_desc: "Ảnh chụp Review Heatmap của Paul: 120 cards reviewed on Sunday September 13, 2026, Longest streak 53 days, Current streak 2 days"
};

ocr.day13['616159212980011018'] = {
  user: "Aleye",
  cards: 253,
  minutes: null,
  streak: 13,
  deck: null,
  detail: "Lịch ôn tập: Chủ Nhật, 13 tháng 9, 2026 · 253 thẻ ôn tập · streak 13",
  image_content_desc: "Ảnh chụp màn hình Anki mục Lịch với tooltip 'Chủ Nhật, 13 tháng 9, 2026: 253 thẻ ôn tập'"
};

ocr.day13['1375756159834783755'] = {
  user: ".diffusion.",
  cards: 299,
  minutes: 44.91,
  streak: 14,
  deck: null,
  detail: "pktruong · Studied 299 cards in 44.91 minutes today (9.01s/card) · streak 14",
  image_content_desc: "Bảng xếp hạng Anki-Leaderboard: username pktruong, Studied 299 cards in 44.91 minutes today (9.01s/card), Streak 14"
};

ocr.day13['1465133555574243348'] = {
  user: "Gai con HaVy trộm ví a",
  cards: 113,
  minutes: null,
  streak: 13,
  deck: "1 Chinese (HSK9)::Từ vựng::HSK7-9::HSK7-9 (1-1000)",
  detail: "Chinese HSK 7-9 · Chủ Nhật, 13 tháng 9, 2026: 113 thẻ ôn tập · streak 13",
  image_content_desc: "Ảnh chụp màn hình AnkiDroid mục Lịch ôn tập bộ thẻ '1 Chinese (HSK9)::Từ vựng::HSK7-9' với tooltip 'Chủ Nhật, 13 tháng 9, 2026: 113 thẻ ôn tập'"
};

ocr.day13['705779271603322911'] = {
  user: "Minh may mắn",
  cards: 168,
  minutes: 55.0,
  streak: 37,
  deck: null,
  detail: "Die Trying!!! · Studied 168 cards · Time 55.0 min · 19.7 s/card · Retention 97% · 37 day streak",
  image_content_desc: "Ảnh thống kê Anki 'Die Trying!!!' của Minh may mắn: 168 cards, 55.0 min, 19.7 s/card, Retention 97%, 37 day streak"
};

ocr.day13['1011294951201570887'] = {
  user: "loipahm",
  cards: 468,
  minutes: 15.72,
  streak: 13,
  deck: "ANKI WITH NANA",
  detail: "Đã học 468 thẻ trong 15,72 phút hôm nay (2,01giây/thẻ) · ANKI WITH NANA · streak 13",
  image_content_desc: "Ảnh chụp Anki iOS bộ thẻ 'ANKI WITH NANA': Studied 468 cards in 15.72 minutes today (2.01s/card)"
};

ocr.day13['792983013340086293'] = {
  user: "Dulgi",
  cards: 5,
  minutes: null,
  streak: 472,
  deck: null,
  detail: "Review Heatmap: 5 cards reviewed on Sunday September 13, 2026 · Current streak 472 days · Daily average 138 cards",
  image_content_desc: "Ảnh chụp Review Heatmap của Dulgi: 5 cards reviewed on Sunday September 13, 2026, Current streak 472 days, Daily average 138 cards"
};

ocr.day13['711153532392308767'] = {
  user: "Alan Le",
  cards: 164,
  minutes: 41.66,
  streak: 13,
  deck: "ZHVI HSK 3.0::HSK 1::Bài tập luyện phản xạ",
  detail: "ZHVI HSK 3.0 · Đã học 164 thẻ trong 41,66 phút hôm nay (15,24giây/thẻ) · streak 13",
  image_content_desc: "Ảnh chụp màn hình Anki Android bộ thẻ ZHVI HSK 3.0: Đã học 164 thẻ trong 41,66 phút hôm nay (15,24giây/thẻ)"
};

ocr.day13['438960335983083530'] = {
  user: "Gai Hàn TOPIK 6 xin vía",
  cards: 1422,
  minutes: 70.09,
  streak: 13,
  deck: null,
  detail: "Studied 1422 cards in 70.09 minutes today (2.96s/card) · streak 13",
  image_content_desc: "Ảnh chụp màn hình Anki của Gai Hàn: Studied 1422 cards in 70.09 minutes today (2.96s/card)"
};

// Normalize display names from user-map.json (exact spelling/diacritics)
const userMapPath = path.join(__dirname, '../discord-export/user-map.json');
if (fs.existsSync(userMapPath)) {
  const userMap = JSON.parse(fs.readFileSync(userMapPath, 'utf8'));
  for (const day of ['day12', 'day13']) {
    for (const [key, item] of Object.entries(ocr[day] || {})) {
      if (userMap[key]) item.user = userMap[key];
    }
  }
}

fs.writeFileSync(ocrPath, JSON.stringify(ocr, null, 2), 'utf8');
console.log('Updated ocr-results.json successfully!');
console.log('Day 12 entries:', Object.keys(ocr.day12).length);
console.log('Day 13 entries:', Object.keys(ocr.day13).length);
