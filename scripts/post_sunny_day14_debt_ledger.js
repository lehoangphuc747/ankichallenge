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
  console.error('No DISCORD_TOKEN found in .env');
  process.exit(1);
}

const messageContent = `📋 **[GIẤY BÁO NỢ ANKI - SUNNY (CẬP NHẬT HẾT DAY 14)]**

Kính gửi con nợ <@1410392551634112640>:
Tổ thu hồi nợ xin ngả mũ thán phục trước màn "quay xe trả nợ" chấn động lịch sử Anki Challenge 11! 😱🔥

Tưởng rằng sau khi bỏ học Day 12 và chỉ học 21 thẻ ở Day 13 khiến nợ chạm mốc **3.944 thẻ**, bà tính rủ bác <@895672321916960838> lập hội "bùng nợ"... thì đùng một cái sang **Day 14**, bà cày một hơi **2.025 THẺ** trong ngày khiến cả server ngỡ ngàng, con bot đòi nợ cũng muốn rớt hàm! 👏✨

📊 **BẢNG THEO DÕI NỢ (Mục tiêu: 500 thẻ / ngày):**

• 📌 **Nợ cũ tính đến hết Day 12:** nợ **3.465 thẻ** *(Mục tiêu 6.000 thẻ - Mới học 2.535 thẻ)*

• 🔴 **Day 13 (13/09):** Học 21 thẻ *(thiếu 479 thẻ)* ➔ Nợ tăng lên đỉnh điểm: **3.944 thẻ** 🚨

• 🟢 **Day 14 (14/09):** Cày **2.025 thẻ** 🚀💥 ➔ **VƯỢT 1.525 THẺ**, trừ thẳng vào nợ cũ!

═════════════════════════

🎯 **TỔNG KẾT SỔ NỢ ĐẾN HẾT DAY 14:**

• 📅 **Số ngày có học:** **12 / 14 ngày** (Đạt 86% chuyên cần)

• 🎯 **Tổng chỉ tiêu 14 ngày:** 14 ngày × 500 thẻ = **7.000 thẻ**

• 📚 **Tổng thẻ thực tế đã học:** **4.581 thẻ**

• 💸 **SỐ THẺ CÒN NỢ:** **2.419 THẺ** *(Đã gạch nợ thành công 1.525 thẻ từ đỉnh 3.944!)* 🎉📉

👉 Đúng là "con nợ vip pro"! Một ngày cày thẻ bằng người ta học cả tuần, trả cái rụp hơn 1.500 thẻ nợ. Cứ giữ đà này thêm 1 - 2 hôm nữa là sạch nợ trắng án, bác <@895672321916960838> nhìn mà học tập nha bà ơiii! 🔥💪`;

// Thread Day 14 ID
const threadId = '1548773428314775673';

const payload = JSON.stringify({
  content: messageContent,
  allowed_mentions: { users: ['1410392551634112640', '895672321916960838'] }
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
    console.log('Status code:', res.statusCode);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Đã gửi Giấy báo nợ Day 14 cho Sunny vào thread Day 14 thành công!');
      const resJson = JSON.parse(d);
      console.log('Message ID:', resJson.id);
    } else {
      console.error('❌ Lỗi gửi tin nhắn:', d);
    }
  });
});

req.on('error', err => console.error('Request error:', err));
req.write(payload);
req.end();
