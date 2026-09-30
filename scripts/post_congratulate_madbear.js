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

const messageContent = `🎉 **[BẢN TIN VINH DANH ĐẶC BIỆT — SỰ TRỞ LẠI CỦA ÔNG TRÙM MADBEAR]** 👑🐻

Loa loa loa! Toàn thể thần dân Anki Challenge xin hãy nghiêng mình trước màn "lật kèo thế kỷ" đến từ vị trí của Admin <@438960335983083530> (\`Gai Hàn TOPIK 6 xin vía\`)! 📢🔥

Tưởng đâu "sếp" đã bỏ cuộc chơi theo tiếng gọi của sự lười, để "Tổ thu hồi nợ" réo tên rát cả cổ suốt 6 ngày trời... Ai dè đây lại là một cú **"giả vờ ngã ngựa để tích tụ nội công"** đỉnh cao chưa từng có! 🌪️

📊 **TỔNG KẾT MÀN "BÃI CÔNG" THẦN THÁNH CHẶNG 6 NGÀY:**
• 🌪️ **Nộp bài thần tốc bù 6 ngày liên tiếp:**
  - Day 19: **536 thẻ**
  - Day 20: **479 thẻ**
  - Day 21: **22 thẻ** *(bấm vội trước khi ngủ)*
  - Day 22: **2 thẻ** *(duy trì sự sống)*
  - Day 23: **786 thẻ** *(bắt đầu nóng máy)*
  - Day 24: **1.320 THẺ** *(bão cấp 15 càn quét cả server!)*
• 🚀 **Tổng số thẻ nộp bù một phát:** **3.145 THẺ**!
• 📅 **Chuyên cần:** Phục hồi thần kỳ từ 75% lên thẳng **100% TUYỆT ĐỐI (24 / 24 NGÀY)**!
• 🏆 **Thứ hạng:** Chính thức vượt mặt Sunny để **GIÀNH LẠI NGÔI VỊ TOP 3 TOÀN SERVER** với tổng cộng **13.606 thẻ**!
• 💸 **Xóa sổ toàn bộ công nợ:** Từ "con nợ bị truy nã gắt gao nhất server" biến hình thành **"đại gia thặng dư +1.606 thẻ"** vượt cả chỉ tiêu KPI!

Xin chúc mừng Admin <@438960335983083530> đã có màn "comeback" chấn động địa cầu, vừa giữ vững phong độ TOP đầu vừa cứu vớt danh dự admin một cách không thể thuyết phục hơn! Cả nhà cho một tràng pháo tay nào! 👏👏👏🎉🎉`;

const threadId = '1552408839817531503'; // Day 24 thread (D24-24/09)

const payload = JSON.stringify({
  content: messageContent,
  allowed_mentions: { users: ['438960335983083530'] }
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
      console.log('Successfully posted congratulatory ping to Day 24 thread!');
    } else {
      console.error('Failed to post message:', d);
    }
  });
});

req.on('error', err => console.error('Request error:', err));
req.write(payload);
req.end();
