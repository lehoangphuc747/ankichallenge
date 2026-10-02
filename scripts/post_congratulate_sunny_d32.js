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

// Thread Day 32 ID: 1555332254031413521
const THREAD_ID = '1555332254031413521';

const messageContent = `🎉 **[CHÚC MỪNG CHIẾN THẦN TRẢ NỢ SUNNY]** ☀️👑

Cả server xin nghiêng mình thán phục trước tốc độ thanh toán nợ nần siêu tốc của chị đẹp <@1410392551634112640>! 💸⚡

Vừa rạng sáng nghe tin bị tổ thu hồi nợ réo tên nhắc nhẹ số dư nợ 284 thẻ, đến chiều chị đã:
• ⏱️ **Bù liền tay Day 31:** 10 thẻ giữ streak.
• 🚀 **Xả đạn Day 32:** Giã luôn một phát **1.028 thẻ** không trượt phát nào!

📊 **BẢNG KÊ TÀI CHÍNH MỚI NHẤT (D1 – D32):**
• 🎯 **Chỉ tiêu KPI 32 ngày:** **16.000 thẻ** (500 thẻ/ngày)
• ⚡ **Tổng thẻ thực cày:** **16.254 thẻ** (28/32 ngày chuyên cần)
• 🟢 **Trạng thái:** **SẠCH BÓNG NỢ NẦN & ĐANG DƯ +254 THẺ!** 🎊✨

Đúng là phong độ của dân chơi thứ thiệt: nợ bao nhiêu cũng chỉ cần 1 phiên là xóa sổ! Chúc mừng chị Sunny đã xuất sắc trở lại hàng ngũ "Đại gia thẻ học", tiếp tục giữ vững phong độ đỉnh cao này nhé chị ơi! 🥳💪📚🔥`;

const payload = JSON.stringify({
  content: messageContent,
  allowed_mentions: { users: ['1410392551634112640'] }
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
      console.log('Successfully posted congratulations message to Day 32 thread!');
    } else {
      console.error('Failed to post message:', d);
    }
  });
});

req.on('error', e => console.error('Request error:', e));
req.write(payload);
req.end();
