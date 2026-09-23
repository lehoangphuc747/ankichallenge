import fs from 'node:fs';
import path from 'node:path';

const userMap = JSON.parse(fs.readFileSync('discord-export/user-map.json', 'utf8'));
const ocrResults = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

const days = ['day16', 'day17', 'day18', 'day19', 'day20', 'day21'];
const newEntries = [];

for (const d of days) {
  const p = path.join('discord-export', d, 'chat.json');
  if (!fs.existsSync(p)) continue;
  const chat = JSON.parse(fs.readFileSync(p, 'utf8'));
  const dayOcr = ocrResults[d] || {};

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
      const existing = dayOcr[discordId];
      if (!existing || existing.cards === null || existing.cards === 0) {
        newEntries.push({
          day: d,
          msgId: m.id,
          discordId,
          userName,
          claimedCards,
          claimedMins,
          streak,
          imageFile: imageFile ? path.join('discord-export', d, imageFile) : null,
          existing
        });
      }
    }
  }
}

console.log(`Total new / updated checkins found: ${newEntries.length}`);
for (const e of newEntries) {
  console.log(`[${e.day.toUpperCase()}] ${e.userName} (<@${e.discordId}>) | claimed: ${e.claimedCards} cards, ${e.claimedMins} mins | img: ${e.imageFile} | existing: ${JSON.stringify(e.existing || null)}`);
}

fs.writeFileSync('discord-export/new_checkins_pending.json', JSON.stringify(newEntries, null, 2), 'utf8');
