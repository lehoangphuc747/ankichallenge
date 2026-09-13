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

const messageContent = `📋 **[GIẤY BÁO NỢ ANKI - SUNNY (CẬP NHẬT ĐẾN HẾT DAY 12)]**

Kính gửi con nợ <@1410392551634112640>:
Sau màn "lội ngược dòng" xuất sắc cày **812 thẻ** ở **Day 11** khiến cả server nể phục, thì sang **Day 12** bà lại... "lặn mất tăm" và quên học, khiến tổ thu hồi nợ phải kích hoạt chuông báo động khẩn cấp! 🚨📢

Tổ thu hồi nợ xin gửi bảng đối soát sổ nợ toàn diện từ **Day 1 đến Day 12** theo định mức KPI **500 thẻ / ngày**:

📊 **CHI TIẾT ĐỐI SOÁT TỪNG NGÀY:**
• **Day 1 (01/09):** Học 274 thẻ ➔ 🔴 Nợ **226 thẻ**
• **Day 2 (02/09):** Học 431 thẻ ➔ 🔴 Nợ 69 thẻ (Nợ luỹ kế: **295 thẻ**)
• **Day 3 (03/09):** Học 3 thẻ ➔ 🔴 Nợ 497 thẻ (Nợ luỹ kế: **792 thẻ**)
• **Day 4 (04/09):** Vắng học (0 thẻ) ➔ 🔴 Nợ 500 thẻ (Nợ luỹ kế: **1.292 thẻ**) ⚠️ *Xác nhận vắng có phép*
• **Day 5 (05/09):** Học 178 thẻ ➔ 🔴 Nợ 322 thẻ (Nợ luỹ kế: **1.614 thẻ**)
• **Day 6 (06/09):** Học 189 thẻ ➔ 🔴 Nợ 311 thẻ (Nợ luỹ kế: **1.925 thẻ**)
• **Day 7 (07/09):** Học 132 thẻ ➔ 🔴 Nợ 368 thẻ (Nợ luỹ kế: **2.293 thẻ**)
• **Day 8 (08/09):** Học 9 thẻ ➔ 🔴 Nợ 491 thẻ (Nợ luỹ kế: **2.784 thẻ**)
• **Day 9 (09/09):** Học 442 thẻ ➔ 🔴 Nợ 58 thẻ (Nợ luỹ kế: **2.842 thẻ**)
• **Day 10 (10/09):** Học 65 thẻ ➔ 🔴 Nợ 435 thẻ (Nợ luỹ kế: **3.277 thẻ**)
• **Day 11 (11/09):** Học 812 thẻ 🔥 ➔ 🟢 **VƯỢT +312 THẺ**, kéo nợ xuống còn **2.965 thẻ**!
• **Day 12 (12/09):** Quên học (0 thẻ) ➔ 🔴 **CỘNG THÊM 500 THẺ NỢ**, đẩy nợ luỹ kế vọt lên **3.465 THẺ**! 📈😱

═════════════════════════
🎯 **TỔNG KẾT SỔ NỢ ĐẾN HẾT DAY 12:**
• 📅 **Chuyên cần:** **10/12 ngày** (83% chuyên cần)
• 🎯 **Hạn mức KPI 12 ngày:** 12 × 500 = **6.000 thẻ**
• 📚 **Tổng thẻ thực tế đã cày:** **2.535 thẻ**
• 💸 **TỔNG SỐ THẺ NỢ LUỸ KẾ CÒN LẠI:** **3.465 THẺ** 🚨⚠️

👉 Đang trên đà trả nợ đẹp như mơ thì Day 12 lại đứt gánh giữa đường! Hôm nay **Day 13** mở Anki lên cày bù gấp, vừa thanh toán bớt nợ Day 12 vừa hoàn thành KPI hôm nay nha bà ơiii! Đừng để cục nợ chạm mốc 4.000 thẻ nhé! 🔥💪`;

// Target: Thread Day 13 (1548407515258167480)
const threadId = '1548407515258167480';

const payload = JSON.stringify({
  content: messageContent,
  allowed_mentions: { users: ['1410392551634112640'] }
});

const req = https.request({
  hostname: 'discord.com',
  path: `/api/v10/channels/${threadId}/messages`,
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
      console.log('Successfully posted Day 12 debt ledger for Sunny to Day 13 thread!');
    } else {
      console.error('Failed to post:', d);
    }
  });
});

req.on('error', err => console.error('Request error:', err));
req.write(payload);
req.end();
