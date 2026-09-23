import fs from 'node:fs';
import path from 'node:path';

const userMap = JSON.parse(fs.readFileSync('discord-export/user-map.json', 'utf8'));

const days = ['day16', 'day17', 'day18', 'day19', 'day20'];

for (const d of days) {
  const p = path.join('discord-export', d, 'chat.json');
  if (!fs.existsSync(p)) continue;
  const chat = JSON.parse(fs.readFileSync(p, 'utf8'));
  console.log(`\n================== ${d.toUpperCase()} (Total msgs: ${chat.length}) ==================`);
  for (const m of chat) {
    if (m.checkinInfo && m.checkinInfo.targetDiscordId) {
      const uId = m.checkinInfo.targetDiscordId;
      const uName = userMap[uId] || uId;
      const imgs = (m.images || []).map(i => i.localFile || i.url).join(', ');
      console.log(`[BOT CHECKIN] User: ${uName} (<@${uId}>) | Date: ${m.checkinInfo.checkinDate} | Cards: ${m.checkinInfo.claimedCards} | Mins: ${m.checkinInfo.claimedMinutes} | Streak: ${m.checkinInfo.streak} | Image: ${imgs}`);
    } else if (m.author === 'Check-in' || m.content.includes('check-in')) {
      console.log(`[OTHER CHECKIN MSG] ${m.author}: ${m.content.slice(0, 100)}`);
    } else if (m.images && m.images.length > 0) {
      const uName = userMap[m.authorId] || m.author;
      const imgs = m.images.map(i => i.localFile || i.url).join(', ');
      console.log(`[USER WITH IMGS] ${uName} (<@${m.authorId}>): "${m.content.slice(0, 60)}" | Imgs: ${imgs}`);
    }
  }
}
