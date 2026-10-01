import fs from 'node:fs';
import https from 'node:https';

const envFile = fs.readFileSync('.env', 'utf8');
let token = '';
for (const line of envFile.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (trimmed.startsWith('DISCORD_TOKEN=')) {
    token = trimmed.substring('DISCORD_TOKEN='.length).trim().replace(/^['"]|['"]$/g, '');
  }
}

if (!token) {
  console.error('No DISCORD_TOKEN found');
  process.exit(1);
}

// Thread Day 31 ID: 1554964800109412426
const THREAD_ID = '1554964800109412426';

const messageContent = `📋 **[SỔ NỢ ANKI — CẬP NHẬT CHẶNG 31 NGÀY (ĐẾN HẾT 01/10)]**

Tổ thu hồi nợ xin kính gửi giấy đối soát KPI tới hai "con nợ VIP Pro" của server <@1410392551634112640> và <@895672321916960838>:
*Đã tròn 8 ngày trôi qua kể từ lần chốt sổ gần nhất, tình hình tài chính thẻ học đã có những biến động lịch sử!*

══════════════════════════════════
1️⃣ **CON NỢ SUNNY (<@1410392551634112640>):**
• 🎯 **Mốc KPI 31 ngày:** **15.500 thẻ** (500 thẻ/ngày)
• ⚡ **Tổng thẻ thực học:** **15.216 thẻ** (Chuyên cần: **27/31 ngày**)
• 🌟 **Cú lội ngược dòng Day 30:** Ở chặng 30 ngày, bả đã hoá chao giã **1.304 thẻ** trong ngày cuối cùng, chính thức **XOÁ SẠCH NỢ & DƯ +216 THẺ** đúng như lời hẹn!
• ⚠️ **Hiện trạng Day 31:** Do hôm qua nghỉ xả hơi chưa check-in nên tạm thời phát sinh nợ lại nhẹ:
👉 **Số dư nợ hiện tại:** **284 thẻ** (chỉ cần 1 hiệp nhẹ 284 thẻ là lập tức sạch nợ đón cúp trở lại! 🏃‍♀️✨)

══════════════════════════════════
2️⃣ **CON NỢ AVA (<@895672321916960838>):**
• 🎯 **Mốc KPI 31 ngày:** **15.500 thẻ** (500 thẻ/ngày)
• ⚡ **Tổng thẻ thực học:** **7.852 thẻ** (Chuyên cần: **25/31 ngày**)
• 🧊 **Hiện trạng:** Đang có dấu hiệu "lặn không sủi tăm" ở Day 30 và Day 31. Khoản nợ đang phình to theo cấp số cộng mỗi ngày trôi qua!
👉 **Tổng số dư nợ hiện tại:** **7.648 thẻ** (tương đương ~15,3 ngày KPI đang chờ thanh toán! 😱💸📚)

══════════════════════════════════
🔥 **LỜI NHẮC NHẸ TỪ BAN QUẢN LÝ:**
Chặng đường 100 ngày của AC11 đã đi được gần 1/3 chặng đường! Đề nghị hai quý cô mau chóng gom thẻ, bật Anki lên cày để duy trì phong độ và kéo chuỗi streak nhé! 🚀💪`;

const payload = JSON.stringify({
  content: messageContent,
  allowed_mentions: { users: ['1410392551634112640', '895672321916960838'] }
});

const req = https.request({
  hostname: 'discord.com',
  path: `/api/v10/channels/${THREAD_ID}/messages`,
  method: 'POST',
  headers: {
    'Authorization': 'Bot ' + token,
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'User-Agent': 'DiscordBot (https://ankichallenge.pages.dev, 1.0)'
  }
}, res => {
  let d = '';
  res.on('data', chunk => d += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('Successfully posted debt ledger to Day 31 thread!');
    } else {
      console.error('Failed to post message:', d);
    }
  });
});

req.on('error', e => console.error('Request error:', e));
req.write(payload);
req.end();
