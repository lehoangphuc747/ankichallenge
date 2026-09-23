import fs from 'node:fs';
import path from 'node:path';

const userMap = JSON.parse(fs.readFileSync('discord-export/user-map.json', 'utf8'));
const ocrResults = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

const days = ['day20', 'day21', 'day22', 'day23'];
const needOcr = [];

for (const d of days) {
  const p = path.join('discord-export', d, 'chat.json');
  if (!fs.existsSync(p)) continue;
  const chat = JSON.parse(fs.readFileSync(p, 'utf8'));
  const dayOcr = ocrResults[d] || {};

  // Map to deduplicate per user per day (keep latest check-in)
  const userMapDay = new Map();

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
      userMapDay.set(discordId, {
        day: d,
        discordId,
        userName,
        claimedCards,
        claimedMins,
        streak,
        imageFile: imageFile ? path.join('discord-export', d, imageFile) : null,
      });
    }
  }

  for (const [uid, item] of userMapDay.entries()) {
    const existing = dayOcr[uid];
    if (!existing || existing.cards === null || existing.cards === undefined) {
      needOcr.push(item);
    }
  }
}

console.log(`Total items needing OCR: ${needOcr.length}`);
needOcr.forEach(item => {
  console.log(`[${item.day}] ${item.userName} (<@${item.discordId}>) | claimed: ${item.claimedCards} | img: ${item.imageFile}`);
});

fs.writeFileSync('discord-export/pending_ocr_d20_d23.json', JSON.stringify(needOcr, null, 2), 'utf8');
