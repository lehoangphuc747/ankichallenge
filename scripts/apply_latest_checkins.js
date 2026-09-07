import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ocrPath = path.join(__dirname, '../discord-export/ocr-results.json');
const ocr = JSON.parse(fs.readFileSync(ocrPath, 'utf8'));

// Add Gai Hàn Day 6
if (!ocr.day6) ocr.day6 = {};
ocr.day6["438960335983083530"] = {
  "user": "Gai Hàn TOPIK 6 xin vía",
  "cards": 16,
  "minutes": null,
  "streak": 38,
  "deck": null,
  "detail": "16 cards reviewed on Sunday September 6, 2026 · streak 38 days · Daily avg 408 cards",
  "image_content_desc": "Review Heatmap cam/vàng/đỏ của Gai Hàn TOPIK 6: tooltip '16 cards reviewed on Sunday September 6, 2026', Current streak 38 days, Daily average 408 cards"
};

// Add thientrng Day 7
if (!ocr.day7) ocr.day7 = {};
ocr.day7["963399002466955314"] = {
  "user": "thientrng.if not now, then when?",
  "cards": 49,
  "minutes": null,
  "streak": 183,
  "deck": null,
  "detail": "49 cards reviewed on Monday September 7, 2026 · streak 183 days",
  "image_content_desc": "Heatmap tooltip của thientrng: 49 cards reviewed on Monday September 7, 2026, streak 183 days"
};

// Double check Gai Hàn Day 7
ocr.day7["438960335983083530"] = {
  "user": "Gai Hàn TOPIK 6 xin vía",
  "cards": 38,
  "minutes": 1.93,
  "streak": 38,
  "deck": null,
  "detail": "Studied 38 cards in 1.93 minutes today (3.05s/card) · streak 38 days [sửa typo tự nhập 193 thành 1.93]",
  "image_content_desc": "Bảng thống kê Anki: Studied 38 cards in 1.93 minutes today (sửa typo 193 thành 1.93m)"
};

fs.writeFileSync(ocrPath, JSON.stringify(ocr, null, 2), 'utf8');
console.log('Successfully updated discord-export/ocr-results.json with latest check-ins!');
