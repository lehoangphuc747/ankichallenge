import fs from 'node:fs';

const sunnyId = '1410392551634112640';

// 1. Check previous post_sunny_debt_ledger scripts
const scriptsDir = fs.readdirSync('scripts');
console.log('Scripts mentioning sunny:', scriptsDir.filter(s => s.toLowerCase().includes('sunny')));

// 2. Check stats json structure
const stats = JSON.parse(fs.readFileSync('src/data/ac11_stats.json', 'utf8'));
console.log('Stats top keys:', Object.keys(stats));
if (stats.users) {
  const u = stats.users.find(x => x.discordId === sunnyId || (x.name && x.name.toLowerCase().includes('sunny')));
  console.log('Sunny in stats.users:', u);
}
if (stats.leaderboard) {
  const u = stats.leaderboard.find(x => x.discordId === sunnyId || (x.name && x.name.toLowerCase().includes('sunny')));
  console.log('Sunny in stats.leaderboard:', u);
}

// 3. Check ocr-results.json
if (fs.existsSync('discord-export/ocr-results.json')) {
  const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));
  console.log('\n=== SUNNY IN OCR RESULTS ===');
  for (const [key, val] of Object.entries(ocr)) {
    if (key.includes(sunnyId) || (val.user && val.user.toLowerCase().includes('sunny')) || val.discordId === sunnyId) {
      console.log(key, '->', val);
    }
  }
}
