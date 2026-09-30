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

const messageContent = `🏆 **[BẢNG VÀNG VINH DANH CHẶNG 30 NGÀY — GỌI TÊN 3 CHIẾN THẦN ANKI]** 🌟🎉

Khép lại chặng đường Tháng đầu tiên (Day 1 – Day 30) đầy rực rỡ với hơn **182.000 thẻ** toàn server, xin gửi lời chúc mừng nồng nhiệt và vinh danh đặc biệt tới 3 gương mặt xuất sắc nhất chặng đua vừa qua:

═════════════════════════
☀️ **1. CHIẾN THẦN SẠCH NỢ: SUNNY** (<@1410392551634112640>)
• 📚 **Tổng thẻ:** **15.216 thẻ** (Chuyên cần: **27 / 30 ngày** - 90%)
• 👑 **Kỳ tích:** Màn "rũ bùn đứng dậy sáng lòa" đẳng cấp nhất mùa giải! Từ con nợ bị dí sát nút, bà đã cày bão liên tục (D26 cày **1.194 thẻ**, D27 cày **530 thẻ**), chính thức **SẠCH BÓNG NỢ KPI 15.000 THẺ** và còn thặng dư **+216 thẻ**, xuất sắc đòi lại ngôi vị **TOP 3 TOÀN SERVER**!

═════════════════════════
🌸 **2. CHIẾN THẦN BỨT PHÁ: AVA** (<@895672321916960838>)
• 📚 **Tổng thẻ:** **7.852 thẻ** (Chuyên cần: **25 / 30 ngày** - 83%)
• 🔥 **Kỳ tích:** Cỗ máy tạo địa chấn với 2 ngày bão thẻ liên tiếp cày trên 1.000 thẻ (D22: **1.055 thẻ**, D23: **1.052 thẻ**)! Tinh thần chiến binh không bỏ cuộc đã giúp Ava gạch bay hơn một nửa số nợ tích lũy và vững vàng chốt tháng trong **Top 9 toàn server**!

═════════════════════════
🛡️ **3. CHIẾN THẦN BỀN BỈ: LÊ ĐỨC TUẤN** (<@870187268692906014>)
• 📚 **Tổng thẻ:** **10.196 thẻ** (Chuyên cần kỷ lục: **29 / 30 ngày** - 97%)
• ⭐ **Kỳ tích:** "Người sắt" của thử thách! Không cần ồn ào nhưng ngày nào cũng bền bỉ như kim đồng hồ, tích tiểu thành đại để chính thức vượt mốc **10.000 THẺ**, vững vàng chiếm trọn vị trí **TOP 5 TOÀN SERVER**!

Cả server hãy cùng nổ tràng pháo tay chúc mừng cho <@1410392551634112640>, <@895672321916960838> và <@870187268692906014>! Chúc mọi người giữ vững ngọn lửa nhiệt huyết này cho 70 ngày tiếp theo! 👏🔥🚀`;

const threadId = '1554602896505442377'; // Day 30 thread (D30-30/09)

const payload = JSON.stringify({
  content: messageContent,
  allowed_mentions: { users: ['1410392551634112640', '895672321916960838', '870187268692906014'] }
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
      console.log('Successfully posted congratulatory message for Sunny, Ava, and Le Duc Tuan to Day 30 thread!');
    } else {
      console.error('Failed to post message:', d);
    }
  });
});

req.on('error', err => console.error('Request error:', err));
req.write(payload);
req.end();
