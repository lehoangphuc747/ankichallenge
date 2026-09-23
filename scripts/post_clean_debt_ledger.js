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

const messageContent = `📋 **[GIẤY BÁO NỢ ANKI — CẬP NHẬT CHẶNG 22 NGÀY]**

Kính gửi hai "con nợ VIP Pro" của server <@1410392551634112640> và <@895672321916960838>:
Tổ thu hồi nợ Anki Challenge xin gửi bảng tổng kết công nợ chặng 22 ngày (KPI cam kết: **500 thẻ / ngày** ➔ Chỉ tiêu 22 ngày = **11.000 thẻ**):

═════════════════════════
👤 **1. CON NỢ SUNNY** (<@1410392551634112640>) — *"Màn trả nợ thần tốc & suýt sạch nợ trắng án!"*
• 📅 **Chuyên cần:** **19 / 22 ngày** (86%)
• 📚 **Tổng thẻ đã học:** **10.581 thẻ** *(Đã đuổi sát nút chỉ tiêu 11.000 thẻ)*
• 📈 **Diễn biến chấn động:**
  - Sau khi bị réo tên ở Day 20, bà đã làm một cú bão thẻ "trả thù số phận", nộp bài bù liền tù tì từ Day 16 đến Day 21 (trong đó D20 cày **1.029 thẻ**, D21 cày tiếp **1.386 thẻ**)!
  - Từ đỉnh nợ gần **4.000 thẻ**, bà đã gạch nợ thành công tới **96%** tổng số nợ cũ!
• 💸 **TỔNG NỢ HIỆN TẠI:** **CHỈ CÒN 419 THẺ!** 🎉📉
👉 Chỉ cần bấm thêm 400 thẻ nữa là chính thức nhận danh hiệu "Công dân gương mẫu sạch nợ", giữ vững phong độ nhé bà ơi!

═════════════════════════
👤 **2. CON NỢ AVA** (<@895672321916960838>) — *"Kỷ lục 1.055 thẻ & màn lội ngược dòng ấn tượng"*
• 📅 **Chuyên cần:** **18 / 22 ngày** (82%)
• 📚 **Tổng thẻ đã học:** **5.498 thẻ**
• 📈 **Diễn biến bứt phá:**
  - Sau những ngày đầu nợ tích luỹ chạm đỉnh **6.060 thẻ** ở Day 20, Ava đã bắt đầu bước vào giai đoạn tăng tốc mạnh mẽ: Day 21 học chắc tay **398 thẻ**, sang Day 22 bùng nổ cày bão **1.055 THẺ**!
  - Đây là ngày học vượt mốc 1.000 thẻ đầu tiên và cũng là kỷ lục cá nhân cao nhất của Ava từ đầu mùa giải, vượt chỉ tiêu ngày tới **+555 thẻ**!
  - Cú bứt phá ngoạn mục này đã giúp Ava gạch ngay hơn nửa nghìn thẻ nợ cũ, kéo tổng nợ từ đỉnh lịch sử rơi thẳng xuống mốc **5.502 thẻ**.
• 💸 **TỔNG NỢ HIỆN TẠI:** **5.502 THẺ** 📉🔥
👉 Phong độ cày 4 chữ số đang lên rất cao, hành trình 100 ngày còn dài phía trước, cứ giữ đà này thì chẳng mấy chốc nợ sẽ tan biến!`;

const threadId = '1552047103868411915'; // Day 23 thread (D23-23/09)

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
      console.log('Successfully posted clean debt ledger to Day 23 thread!');
    } else {
      console.error('Failed to post message:', d);
    }
  });
});

req.on('error', err => console.error('Request error:', err));
req.write(payload);
req.end();
