import fs from 'node:fs';
import path from 'node:path';

const ocrResultsPath = 'discord-export/ocr-results.json';
const ocrResults = JSON.parse(fs.readFileSync(ocrResultsPath, 'utf8'));

// Check and load subagent output files
const d16Path = 'discord-export/ocr_results_d16.json';
const d17Path = 'discord-export/ocr_results_d17.json';
const d18Path = 'discord-export/ocr_results_d18.json';
const d19_20Path = 'discord-export/ocr_results_d19_d20.json';

if (fs.existsSync(d16Path)) {
  const d16 = JSON.parse(fs.readFileSync(d16Path, 'utf8'));
  ocrResults['day16'] = { ...(ocrResults['day16'] || {}), ...d16 };
  console.log(`Merged Day 16: ${Object.keys(d16).length} users`);
}

if (fs.existsSync(d17Path)) {
  const d17 = JSON.parse(fs.readFileSync(d17Path, 'utf8'));
  ocrResults['day17'] = { ...(ocrResults['day17'] || {}), ...d17 };
  console.log(`Merged Day 17: ${Object.keys(d17).length} users`);
}

if (fs.existsSync(d18Path)) {
  const d18 = JSON.parse(fs.readFileSync(d18Path, 'utf8'));
  ocrResults['day18'] = { ...(ocrResults['day18'] || {}), ...d18 };
  console.log(`Merged Day 18: ${Object.keys(d18).length} users`);
}

if (fs.existsSync(d19_20Path)) {
  const d19_20 = JSON.parse(fs.readFileSync(d19_20Path, 'utf8'));
  if (d19_20.day19) {
    ocrResults['day19'] = { ...(ocrResults['day19'] || {}), ...d19_20.day19 };
    console.log(`Merged Day 19: ${Object.keys(d19_20.day19).length} users`);
  }
  if (d19_20.day20) {
    ocrResults['day20'] = { ...(ocrResults['day20'] || {}), ...d19_20.day20 };
    console.log(`Merged Day 20: ${Object.keys(d19_20.day20).length} users`);
  }
}

ocrResults.meta = {
  source: "Antigravity Gemini Vision OCR read from Day 1 to Day 20 checkin screenshots",
  lastUpdated: new Date().toISOString(),
  note: "Cập nhật đầy đủ dữ liệu check-in Day 16 đến Day 20, hoàn thiện bộ dữ liệu 20 ngày liên tục."
};

fs.writeFileSync(ocrResultsPath, JSON.stringify(ocrResults, null, 2), 'utf8');
console.log('Successfully updated discord-export/ocr-results.json with Day 16 - Day 20!');
