import fs from 'node:fs';
import path from 'node:path';

const ocrResults = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

const days = ['day20', 'day21', 'day22', 'day23', 'day24'];
const pending = [];

for (const day of days) {
  const chatFile = path.join('discord-export', day, 'chat.json');
  if (!fs.existsSync(chatFile)) continue;
  const chat = JSON.parse(fs.readFileSync(chatFile, 'utf8'));

  for (const msg of chat) {
    const checkin = msg.checkinInfo;
    const author = msg.author;
    const authorId = msg.authorId;
    const discordId = checkin ? checkin.targetDiscordId : authorId;

    if (msg.images && msg.images.length > 0) {
      for (const img of msg.images) {
        if (!img.localFile) continue;
        const fullRelPath = path.join('discord-export', day, img.localFile).replace(/\\/g, '/');

        // Check if already in ocrResults
        let existing = null;
        if (ocrResults[msg.id]) {
          existing = ocrResults[msg.id];
        } else {
          // Check by file or (day + discordId)
          for (const [k, v] of Object.entries(ocrResults)) {
            if (v.file === fullRelPath || (v.msgId === msg.id && v.day === day)) {
              existing = v;
              break;
            }
          }
        }

        if (!existing) {
          pending.push({
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
}

console.log(`Total pending images needing OCR: ${pending.length}`);
console.log(JSON.stringify(pending, null, 2));

fs.writeFileSync('discord-export/pending_ocr_d20_d24.json', JSON.stringify(pending, null, 2), 'utf8');
