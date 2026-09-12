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

const messageContent = `📋 **[BẢNG TỔNG HỢP SỔ NỢ ANKI - CẬP NHẬT TẤT CẢ CÁC NGÀY]**

Kính gửi con nợ <@895672321916960838>:
Sau đợt thanh toán check-in bù 7 ngày vừa qua, tổ thu hồi nợ đã kiểm kê và đối soát toàn diện sổ nợ từ **Day 1 đến Day 11** theo định mức KPI **500 thẻ / ngày**:

📊 **CHI TIẾT ĐỐI SOÁT TỪNG NGÀY:**
• **Day 1 (01/09):** Học 162 thẻ ➔ 🔴 Nợ **338 thẻ** (Nợ luỹ kế: 338)
• **Day 2 (02/09):** Học 1.036 thẻ ➔ 🟢 Trừ hết nợ Day 1, dư **+198 thẻ**
• **Day 3 (03/09):** Học 6 thẻ ➔ Cấn trừ 198 dư, 🔴 Nợ **296 thẻ**
• **Day 4 (04/09):** Học 159 thẻ ➔ Thiếu 341 thẻ, 🔴 Nợ luỹ kế: **637 thẻ**
• **Day 5 (05/09 - bù):** Học 67 thẻ ➔ Thiếu 433 thẻ, 🔴 Nợ luỹ kế: **1.070 thẻ**
• **Day 6 (06/09 - bù):** Học 4 thẻ ➔ Thiếu 496 thẻ, 🔴 Nợ luỹ kế: **1.566 thẻ**
• **Day 7 (07/09 - bù):** Học 131 thẻ ➔ Thiếu 369 thẻ, 🔴 Nợ luỹ kế: **1.935 thẻ**
• **Day 8 (08/09 - bù):** Học 90 thẻ ➔ Thiếu 410 thẻ, 🔴 Nợ luỹ kế: **2.345 thẻ**
• **Day 9 (09/09 - bù):** Học 290 thẻ ➔ Thiếu 210 thẻ, 🔴 Nợ luỹ kế: **2.555 thẻ**
• **Day 10 (10/09 - bù):** Học 1 thẻ ➔ Thiếu 499 thẻ, 🔴 Nợ luỹ kế: **3.054 thẻ**
• **Day 11 (11/09 - bù):** Học 64 thẻ ➔ Thiếu 436 thẻ, 🔴 Nợ luỹ kế: **3.490 thẻ**

═════════════════════════
🎯 **TỔNG KẾT SỔ NỢ ĐẾN HẾT DAY 11:**
• 📅 **Chuyên cần:** Đã cứu vớt thành công **11/11 ngày** (100% tỷ lệ học) 👏
• 🎯 **Hạn mức KPI 11 ngày:** 11 × 500 = **5.500 thẻ**
• 📚 **Tổng thẻ thực tế đã học:** **2.010 thẻ**
• 💸 **TỔNG THẺ NỢ LUỸ KẾ CÒN LẠI:** **3.490 THẺ** 🚨😱

👉 Chúc mừng bà đã thoát án treo chuyên cần, nhưng cục nợ **3.490 thẻ** vẫn đang chờ thanh toán nhé! Hôm nay Day 12 chuẩn bị tinh thần cày bù trả bớt đi nha bạn ơi! 🔥💪`;

const payload = JSON.stringify({
  content: messageContent,
  allowed_mentions: { users: ['895672321916960838'] }
});

const req = https.request({
  hostname: 'discord.com',
  path: '/api/v10/channels/1548052644205957230/messages',
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
      console.log('Successfully posted debt ledger to Day 12 thread!');
    } else {
      console.error('Failed to post:', d);
    }
  });
});

req.on('error', err => console.error('Request error:', err));
req.write(payload);
req.end();
