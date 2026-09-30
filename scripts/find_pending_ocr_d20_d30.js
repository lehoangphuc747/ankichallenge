import fs from 'node:fs';
import path from 'node:path';

const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

// Enrich with user name from users.json
let usersMap = {};
if (fs.existsSync('public/data/users.json')) {
  const uData = JSON.parse(fs.readFileSync('public/data/users.json', 'utf8'));
  const list = uData.data || uData;
  list.forEach(u => {
    usersMap[u.discordId] = u.name;
  });
}
if (fs.existsSync('discord-export/user-map.json')) {
  const um = JSON.parse(fs.readFileSync('discord-export/user-map.json', 'utf8'));
  usersMap = { ...usersMap, ...um };
}

const days = ['day20', 'day21', 'day22', 'day23', 'day24', 'day25', 'day26', 'day27', 'day28', 'day29', 'day30'];
const pending = [];

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

    // Check if user already processed in this day
    if (existingInDay[discordId]) {
      continue;
    }

    if (msg.images && msg.images.length > 0) {
      for (const img of msg.images) {
        if (!img.localFile) continue;
        const fullRelPath = path.join('discord-export', day, img.localFile).replace(/\\/g, '/');

        pending.push({
          msgId: msg.id,
          day,
          author,
          discordId,
          userName: usersMap[discordId] || author,
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

console.log(`Total pending items needing OCR: ${pending.length}`);
const countByDay = {};
for (const p of pending) {
  countByDay[p.day] = (countByDay[p.day] || 0) + 1;
}
console.log('Pending by day:', countByDay);

fs.writeFileSync('discord-export/pending_ocr_d20_d30.json', JSON.stringify(pending, null, 2), 'utf8');
