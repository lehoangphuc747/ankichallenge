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

const messageContent = `📋 **[BẢNG TỔNG KẾT SỔ NỢ ANKI - CẬP NHẬT ĐẾN HẾT DAY 20]**

Kính gửi hai "con nợ VIP Pro" của server <@1410392551634112640> và <@895672321916960838>:
Tổ thu hồi nợ Anki Challenge xin gửi bảng đối soát công nợ chặng 20 ngày (KPI cam kết: **500 thẻ / ngày** ➔ Chỉ tiêu 20 ngày = **10.000 thẻ**):

═════════════════════════
👤 **1. CON NỢ SUNNY** (<@1410392551634112640>) — *Hiện tượng "suýt trắng án rồi lại lặn mất tăm"*
• 📅 **Chuyên cần:** **13 / 20 ngày** (65%)
• 📚 **Tổng thẻ đã học:** **6.892 thẻ**
• 📈 **Diễn biến ly kỳ:**
  - Day 14 cày **2.025 thẻ** (+1.525), Day 15 cày tiếp **2.314 thẻ** (+1.814) ➔ Kéo nợ từ đỉnh **3.947 thẻ** tụt dốc không phanh xuống chỉ còn **608 thẻ**! Cả server ngỡ ngàng ngơ ngác tưởng bà sắp sạch nợ vẻ vang.
  - Ai ngờ từ Day 16 đến Day 20 (5 ngày liên tiếp), bà "lặn mất tăm" không một dấu vết check-in! (+500 thẻ/ngày × 5 = +2.500 thẻ nợ).
• 💸 **TỔNG NỢ HIỆN TẠI:** **3.108 THẺ** 🚨 *(Nợ lại phình to gấp 5 lần so với đáy 608 thẻ rồi bà ơiii!)*

═════════════════════════
👤 **2. CON NỢ AVA** (<@895672321916960838>) — *Chúa nợ bền vững & kỷ lục mới*
• 📅 **Chuyên cần:** **15 / 20 ngày** (75%)
• 📚 **Tổng thẻ đã học:** **3.940 thẻ**
• 📈 **Diễn biến:**
  - Điểm danh khá chăm chỉ nhưng lượng thẻ cày hàng ngày chưa đủ gánh KPI 500 thẻ.
  - Đỉnh điểm Day 18 nợ chạm mốc **5.810 thẻ**.
  - Day 19 có màn bứt phá đáng khen ngợi khi cày **750 thẻ** (vượt chỉ tiêu **+250 thẻ**, kéo nợ xuống 5.560).
  - Sang Day 20 chưa thấy nộp bài (+500 thẻ).
• 💸 **TỔNG NỢ HIỆN TẠI:** **6.060 THẺ** 🚨😱 *(Chính thức lập kỷ lục lịch sử mới của server, cán mốc hơn 6.000 thẻ nợ!)*

═════════════════════════
🎯 **TỔNG KẾT LIÊN MINH NỢ:**
• Tổng nợ của 2 bạn cộng lại: **9.168 thẻ**!
👉 Thử thách chỉ còn 1/3 chặng đường (10 ngày nữa là về đích), đề nghị hai chiến thần bớt "lặn", mau mau quay trở lại cày cuốc trả bớt nợ để cuối mùa còn được cấp chứng chỉ tốt nghiệp vinh danh nhé! 🔥💪`;

// Post to Thread Day 20 (D20-20/09)
const threadId = '1550947554156478535';

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
      console.log('Successfully posted debt ledger to Discord Day 20 thread!');
    } else {
      console.error('Failed to post message:', d);
    }
  });
});

req.on('error', err => console.error('Request error:', err));
req.write(payload);
req.end();
