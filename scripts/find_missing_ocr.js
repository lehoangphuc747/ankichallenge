import fs from 'node:fs';
import path from 'node:path';

const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

// Find all check-ins across all days that are NOT yet in ocr-results.json
const missing = [];

const dayDirs = [
  'day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7_extra',
  'day8', 'day9', 'day10', 'day11', 'day12', 'day13', 'day14', 'day15', 'day16'
];

for (const dir of dayDirs) {
  const chatFile = path.join('discord-export', dir, 'chat.json');
  if (!fs.existsSync(chatFile)) continue;

  const chat = JSON.parse(fs.readFileSync(chatFile, 'utf8'));
  for (const m of chat) {
    // Only bot check-in success messages
    if (m.authorId === '1532000627121721516' && m.checkinInfo && m.images && m.images.length > 0) {
      const info = m.checkinInfo;
      const targetId = info.targetDiscordId;
      
      // Determine which day this checkin belongs to
      // date format: "DD/MM/YYYY"
      let dayNum = null;
      if (info.checkinDate) {
        const [d, mo] = info.checkinDate.split('/').map(Number);
        if (mo === 9) dayNum = d; // Sept 1 = Day 1
      }
      if (!dayNum) {
        // Fallback to dir
        const mDay = dir.match(/day(\d+)/);
        if (mDay) dayNum = parseInt(mDay[1], 10);
      }

      const dayKey = `day${dayNum}`;
      const existing = ocr[dayKey] && ocr[dayKey][targetId];

      if (!existing) {
        // Not yet OCR'd in this day!
        missing.push({
          threadDir: dir,
          dayKey,
          targetDiscordId: targetId,
          msgId: m.id,
          checkinDate: info.checkinDate,
          claimedCards: info.claimedCards,
          claimedMinutes: info.claimedMinutes,
          streak: info.streak,
          image: m.images[0]?.localFile ? path.join('discord-export', dir, m.images[0].localFile) : null,
          imageUrl: m.images[0]?.url
        });
      }
    }
  }
}

console.log(`Total missing / un-OCR'd checkins: ${missing.length}`);
console.log(JSON.stringify(missing, null, 2));

fs.writeFileSync('discord-export/missing_ocr.json', JSON.stringify(missing, null, 2), 'utf8');
