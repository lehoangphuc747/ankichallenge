import fs from 'node:fs';
import path from 'node:path';

const userMap = JSON.parse(fs.readFileSync('discord-export/user-map.json', 'utf8'));
const ocrResults = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

const days = ['day16', 'day17', 'day18', 'day19', 'day20'];
const pending = [];

for (const d of days) {
  const p = path.join('discord-export', d, 'chat.json');
  if (!fs.existsSync(p)) continue;
  const chat = JSON.parse(fs.readFileSync(p, 'utf8'));
  const dayOcr = ocrResults[d] || {};

  // Find all check-ins in chat
  const userEntries = new Map();

  for (const m of chat) {
    let discordId = null;
    let claimedCards = null;
    let claimedMins = null;
    let streak = null;
    let imageFile = null;

    if (m.checkinInfo && m.checkinInfo.targetDiscordId) {
      discordId = m.checkinInfo.targetDiscordId;
      claimedCards = m.checkinInfo.claimedCards;
      claimedMins = m.checkinInfo.claimedMinutes;
      streak = m.checkinInfo.streak;
      if (m.images && m.images.length > 0) {
        imageFile = m.images[0].localFile;
      }
    } else if (m.images && m.images.length > 0 && m.authorId !== '1532000627121721516') {
      discordId = m.authorId;
      imageFile = m.images[0].localFile;
    }

    if (discordId) {
      const userName = userMap[discordId] || m.author || discordId;
      // If we already have an entry for this user on this day, keep the best or latest
      userEntries.set(discordId, {
        day: d,
        discordId,
        userName,
        claimedCards,
        claimedMins,
        streak,
        imageFile: imageFile ? path.join('discord-export', d, imageFile) : null,
        existingOcr: dayOcr[discordId] || null
      });
    }
  }

  for (const entry of userEntries.values()) {
    pending.push(entry);
  }
}

console.log(`Total unique user check-ins across D16-D20: ${pending.length}`);
const needOcr = pending.filter(p => !p.existingOcr || (p.existingOcr.cards === null && p.imageFile));
console.log(`Need OCR / Verification: ${needOcr.length}`);
console.log(`Already has complete OCR: ${pending.length - needOcr.length}`);

fs.writeFileSync('discord-export/d16_d20_pending.json', JSON.stringify(pending, null, 2), 'utf8');
console.log('Saved to discord-export/d16_d20_pending.json');
