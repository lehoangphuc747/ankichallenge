import fs from 'node:fs';
import path from 'node:path';

const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

const days = ['day19', 'day20', 'day21', 'day22', 'day23', 'day24'];
const trulyPending = [];

for (const day of days) {
  const chatFile = path.join('discord-export', day, 'chat.json');
  if (!fs.existsSync(chatFile)) continue;
  const chat = JSON.parse(fs.readFileSync(chatFile, 'utf8'));

  const existingInDay = ocr[day] || {};

  for (const msg of chat) {
    const checkin = msg.checkinInfo;
    const author = msg.author;
    const authorId = msg.authorId;
    const discordId = checkin ? checkin.targetDiscordId : authorId;

    if (!discordId || discordId === 'unknown') continue;

    // Check if this user is already in ocr[day]
    if (existingInDay[discordId]) {
      continue;
    }

    if (msg.images && msg.images.length > 0) {
      for (const img of msg.images) {
        if (!img.localFile) continue;
        const fullRelPath = path.join('discord-export', day, img.localFile).replace(/\\/g, '/');

        trulyPending.push({
          msgId: msg.id,
          day,
          author,
          discordId,
          claimedCards: checkin?.claimedCards || null,
          claimedMinutes: checkin?.claimedMinutes || null,
          streak: checkin?.streak || null,
          imageFile: fullRelPath,
          source: img.source,
          content: msg.content
        });
      }
    }
  }
}

console.log(`Truly pending items needing OCR: ${trulyPending.length}`);
const countByDay = {};
for (const p of trulyPending) {
  countByDay[p.day] = (countByDay[p.day] || 0) + 1;
}
console.log('Truly pending by day:', countByDay);
console.log(JSON.stringify(trulyPending, null, 2));

fs.writeFileSync('discord-export/truly_pending_ocr.json', JSON.stringify(trulyPending, null, 2), 'utf8');
