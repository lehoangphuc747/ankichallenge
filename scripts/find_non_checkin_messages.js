import fs from 'node:fs';
import path from 'node:path';

// Known bot IDs
const BOT_IDS = new Set([
  '1532000627121721516', // Anki Challenge Bot
  '1541493820242264256', // System / webhook
]);

const EXPORT_DIR = 'discord-export';
const dayDirs = fs.readdirSync(EXPORT_DIR)
  .filter(d => d.startsWith('day') && fs.statSync(path.join(EXPORT_DIR, d)).isDirectory())
  .sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });

console.log(`Found day directories: ${dayDirs.join(', ')}`);

const allNonCheckins = [];

for (const dir of dayDirs) {
  const chatJsonPath = path.join(EXPORT_DIR, dir, 'chat.json');
  if (!fs.existsSync(chatJsonPath)) continue;

  const raw = fs.readFileSync(chatJsonPath, 'utf8');
  let messages = [];
  try {
    messages = JSON.parse(raw);
  } catch (e) {
    console.error(`Error parsing ${chatJsonPath}:`, e.message);
    continue;
  }

  for (const m of messages) {
    const isBot = BOT_IDS.has(m.authorId);
    const content = m.content || '';

    // Check if this message is a user message OR a bot message that is NOT a standard checkin
    if (!isBot) {
      allNonCheckins.push({
        thread: dir,
        type: 'user_message',
        author: m.author,
        authorId: m.authorId,
        timestamp: m.timestamp,
        content: content,
        hasImages: (m.images && m.images.length > 0),
        images: m.images
      });
    } else {
      // It's a bot message. Is it something other than standard checkin success?
      const isStandardCheckin = content.includes('check-in ngày') && content.includes('thành công');
      const isDailyThreadIntro = content.includes('Thử thách') || content.includes('Chào mừng') || content.includes('Kỷ luật') || content.includes('TOP 3 TÍCH LUỸ');
      const isReminder = content.includes('Nhắc nhở check-in') || content.includes('đã check-in');
      const isDebtLedger = content.includes('SỔ NỢ') || content.includes('ĐỐI SOÁT') || content.includes('GIẤY ĐÒI NỢ') || content.includes('BẢNG ĐỐI SOÁT');

      if (!isStandardCheckin && !isDailyThreadIntro && !isReminder) {
        allNonCheckins.push({
          thread: dir,
          type: isDebtLedger ? 'debt_ledger' : 'bot_other',
          author: m.author,
          authorId: m.authorId,
          timestamp: m.timestamp,
          content: content,
          hasImages: (m.images && m.images.length > 0),
          images: m.images
        });
      }
    }
  }
}

console.log(`\n================ TOTAL NON-CHECKIN MESSAGES FOUND: ${allNonCheckins.length} ================\n`);

for (const item of allNonCheckins) {
  const d = new Date(item.timestamp);
  const vnTime = new Date(d.getTime() + 7 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19);
  console.log(`[${item.thread.toUpperCase()}] [${item.type}] ${item.author} (${item.authorId}) at ${vnTime}:`);
  console.log(`Content: ${item.content}`);
  if (item.hasImages) {
    console.log(`Images: ${JSON.stringify(item.images.map(img => img.localFile || img.url))}`);
  }
  console.log('------------------------------------------------------------');
}

fs.writeFileSync('discord-export/non_checkin_messages.json', JSON.stringify(allNonCheckins, null, 2), 'utf8');
console.log('Saved report to discord-export/non_checkin_messages.json');
