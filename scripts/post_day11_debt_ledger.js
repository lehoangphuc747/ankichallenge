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

const messageContent = `📋 **[CHỐT SỔ NỢ ANKI - TỔNG KẾT DAY 11 (11/09)]**

Tổ thu hồi nợ xin thông báo chốt sổ nợ chính thức cho **Day 11 (11/09/2026)** theo hạn mức KPI **500 thẻ / ngày**:

1️⃣ **CON NỢ SUNNY (<@1410392551634112640>):**
• 🎯 Chỉ tiêu Day 11: **500 thẻ**
• ⚡ Thực tế học: **812 thẻ** (PomoVN 1h 27m)
• 🟢 **Kết quả:** **VƯỢT +312 THẺ!** Xuất sắc gạt bỏ bớt nợ luỹ kế cũ.
• 💸 **Tổng nợ thẻ còn lại:** **2.965 thẻ** (giảm ngoạn mục từ 3.277 thẻ).
• 📅 **Chuyên cần:** **10/11 ngày** (91% chuyên cần — *Xác nhận vắng Day 4 không học, bảo lưu 10 ngày đã học!*).

2️⃣ **CON NỢ AVA (<@895672321916960838>):**
• 🎯 Chỉ tiêu Day 11: **500 thẻ**
• ⚡ Thực tế học: **64 thẻ** (thiếu 436 thẻ)
• 👏 **Điểm sáng:** Đã thanh toán check-in bù thành công trọn vẹn **7 ngày liên tiếp** (D5 đến D11), khôi phục chuyên cần đạt **11/11 ngày (100%)**!
• 💸 **Tổng nợ luỹ kế 11 ngày:** **3.490 thẻ** (Hạn mức 5.500 - Đã học 2.010).

═════════════════════════
🔥 Cả 2 con nợ đã có những bước tiến vượt bậc trong Day 11! Sang **Day 12**, hãy tiếp tục phát huy tinh thần trả nợ để sớm sạch nợ đón cúp nhé! 🏃‍♀️💨📚`;

const payload = JSON.stringify({
  content: messageContent,
  allowed_mentions: { users: ['1410392551634112640', '895672321916960838'] }
});

const req = https.request({
  hostname: 'discord.com',
  path: '/api/v10/channels/1547690101578924072/messages',
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
      console.log('Successfully posted debt ledger to Day 11 thread!');
    } else {
      console.error('Failed to post:', d);
    }
  });
});

req.on('error', err => console.error('Request error:', err));
req.write(payload);
req.end();
