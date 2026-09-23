import fs from 'node:fs';

const raw = fs.readFileSync('discord-export/non_checkin_messages.json', 'utf8');
const list = JSON.parse(raw);

// Filter only user messages (people chatting) and debt ledgers/bot announcements
const userChats = list.filter(item => item.type === 'user_message');

console.log(`\n================ TỔNG CỘNG ${userChats.length} TIN NHẮN TỪ THÀNH VIÊN TRONG CÁC THREAD ================`);

// Group by thread
const grouped = {};
for (const chat of userChats) {
  if (!grouped[chat.thread]) grouped[chat.thread] = [];
  grouped[chat.thread].push(chat);
}

for (const [thread, chats] of Object.entries(grouped)) {
  console.log(`\n================ THREAD: ${thread.toUpperCase()} (${chats.length} tin) ================`);
  for (const c of chats) {
    const d = new Date(c.timestamp);
    const vnTime = new Date(d.getTime() + 7 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19);
    const content = c.content ? c.content.replace(/\n/g, ' ') : '[Chỉ gửi ảnh đính kèm]';
    const imgs = c.hasImages ? ` [🖼 ${c.images.length} ảnh]` : '';
    console.log(`- [${vnTime}] ${c.author}: "${content}"${imgs}`);
  }
}
