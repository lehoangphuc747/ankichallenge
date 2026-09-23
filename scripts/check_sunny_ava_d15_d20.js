import fs from 'node:fs';
import path from 'node:path';

const sunnyId = '1410392551634112640';
const avaId = '895672321916960838';

for (let d = 15; d <= 20; d++) {
  const p = path.join('discord-export', `day${d}`, 'chat.json');
  if (!fs.existsSync(p)) continue;
  const chat = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const m of chat) {
    const isSunny = m.authorId === sunnyId || m.checkinInfo?.targetDiscordId === sunnyId || m.content.includes(sunnyId);
    const isAva = m.authorId === avaId || m.checkinInfo?.targetDiscordId === avaId || m.content.includes(avaId);
    if (isSunny || isAva) {
      console.log(`[Day ${d}] ${m.author} (${m.authorId}): "${m.content.slice(0, 100)}" | target: ${m.checkinInfo?.targetDiscordId}`);
    }
  }
}
