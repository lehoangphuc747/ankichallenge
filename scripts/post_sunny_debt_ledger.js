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

const messageContent = `📋 **[BẢNG TỔNG HỢP SỔ NỢ ANKI - SUNNY (CẬP NHẬT ĐẾN DAY 11)]**

Kính gửi con nợ <@1410392551634112640>:
Sau màn "lội ngược dòng" xuất sắc cày **812 thẻ** vào phút chót của **Day 11**, tổ thu hồi nợ xin gửi bảng đối soát sổ nợ toàn diện từ **Day 1 đến Day 11** theo định mức KPI **500 thẻ / ngày**:

📊 **CHI TIẾT ĐỐI SOÁT TỪNG NGÀY:**
• **Day 1 (01/09):** Học 274 thẻ ➔ 🔴 Nợ **226 thẻ**
• **Day 2 (02/09):** Học 431 thẻ ➔ 🔴 Nợ 69 thẻ (Nợ luỹ kế: **295 thẻ**)
• **Day 3 (03/09):** Học 3 thẻ ➔ 🔴 Nợ 497 thẻ (Nợ luỹ kế: **792 thẻ**)
• **Day 4 (04/09):** Vắng học (0 thẻ) ➔ 🔴 Nợ 500 thẻ (Nợ luỹ kế: **1.292 thẻ**) ⚠️ *Xác nhận vắng không học*
• **Day 5 (05/09):** Học 178 thẻ ➔ 🔴 Nợ 322 thẻ (Nợ luỹ kế: **1.614 thẻ**)
• **Day 6 (06/09):** Học 189 thẻ ➔ 🔴 Nợ 311 thẻ (Nợ luỹ kế: **1.925 thẻ**)
• **Day 7 (07/09):** Học 132 thẻ ➔ 🔴 Nợ 368 thẻ (Nợ luỹ kế: **2.293 thẻ**)
• **Day 8 (08/09):** Học 9 thẻ ➔ 🔴 Nợ 491 thẻ (Nợ luỹ kế: **2.784 thẻ**)
• **Day 9 (09/09):** Học 442 thẻ ➔ 🔴 Nợ 58 thẻ (Nợ luỹ kế: **2.842 thẻ**)
• **Day 10 (10/09):** Học 65 thẻ ➔ 🔴 Nợ 435 thẻ (Nợ luỹ kế: **3.277 thẻ**)
• **Day 11 (11/09):** Học 812 thẻ 🔥 ➔ 🟢 **VƯỢT +312 THẺ**, trừ nợ trực tiếp xuống còn **2.965 thẻ**!

═════════════════════════
🎯 **TỔNG KẾT SỔ NỢ ĐẾN HẾT DAY 11:**
• 📅 **Chuyên cần:** **10/11 ngày** (91% chuyên cần — *đã ghi nhận vắng Day 4, bảo lưu 10 ngày đã học*)
• 🎯 **Hạn mức KPI 11 ngày:** 11 × 500 = **5.500 thẻ**
• 📚 **Tổng thẻ thực tế đã cày:** **2.535 thẻ** (chính thức lọt **Top 10** toàn mùa thử thách 👏)
• 💸 **TỔNG THẺ NỢ CÒN LẠI:** **2.965 THẺ** 📉

👉 Day 11 cày 812 thẻ rất uy tín! Giữ vững phong độ này trong Day 12 để tiếp tục bào mòn cục nợ 2.965 thẻ nhé bà ơiii! 🔥💪`;

const payload = JSON.stringify({
  content: messageContent,
  allowed_mentions: { users: ['1410392551634112640'] }
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
