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

// Thread Day 36 ID: 1556804130675232789
const THREAD_ID = '1556804130675232789';

const messagePart1 = `📋 **[BẢNG TỔNG KẾT ĐỐI SOÁT SỔ NỢ ANKI — CHẶNG DAY 36 (06/10)]**

Tổ thu hồi nợ kính gửi giấy đối soát chi tiết từng ngày tới hai "con nợ VIP Pro" của server <@1410392551634112640> và <@895672321916960838>:
*Hạn mức cam kết: **500 thẻ / ngày** · Mốc chuẩn Day 36: **36 × 500 = 18.000 thẻ***

══════════════════════════════════
1️⃣ **CON NỢ SUNNY (<@1410392551634112640>):**
• 🎯 **Mốc KPI 36 ngày:** **18.000 thẻ**
• ⚡ **Tổng thẻ đã học:** **17.057 thẻ** (Chuyên cần: **30/36 ngày**)
• 💸 **Số dư nợ hiện tại:** **943 thẻ**

📜 **LỊCH SỬ BIẾN ĐỘNG NỢ GẦN ĐÂY (DAY 28 – DAY 36):**
\`\`\`
 Ngày  | Thực học | So KPI | Lũy kế thẻ | Trạng thái nợ
───────┼──────────┼────────┼────────────┼────────────────
  D28  |   604    |  +104  |   13.076   | Nợ 924 thẻ
  D29  |   836    |  +336  |   13.912   | Nợ 588 thẻ
  D30  |  1.304   |  +804  |   15.216   | SẠCH NỢ (Dư +216) 🎉
  D31  |    10    |  -490  |   15.226   | Nợ 274 thẻ
  D32  |  1.028   |  +528  |   16.254   | SẠCH NỢ (Dư +254) ✨
  D33  |   803    |  +303  |   17.057   | DƯ +557 thẻ 👑
  D34  |    0     |  -500  |   17.057   | DƯ +57 thẻ
  D35  |    0     |  -500  |   17.057   | Nợ 443 thẻ
  D36  |    0     |  -500  |   17.057   | Nợ 943 thẻ
\`\`\`
👉 **Ghi chú:** Chị Sunny đã có chuỗi bứt phá D30, D32, D33 cực kỳ mãn nhãn và vươn lên dư tận +557 thẻ! Tuy nhiên do nghỉ trọn 3 ngày cuối tuần (D34, D35, D36) nên nợ đang quay trở lại **943 thẻ**. Một phiên cày 1k thẻ là chị lại xóa nợ đẹp trai ngay! 🏃‍♀️💨`;

const messagePart2 = `══════════════════════════════════
2️⃣ **CON NỢ AVA (<@895672321916960838>):**
• 🎯 **Mốc KPI 36 ngày:** **18.000 thẻ**
• ⚡ **Tổng thẻ đã học:** **7.852 thẻ** (Chuyên cần: **25/36 ngày**)
• 💸 **Số dư nợ hiện tại:** **10.148 thẻ** 😱

📜 **DIỄN BIẾN PHÌNH TO CỦA KHOẢN NỢ (DAY 27 – DAY 36):**
\`\`\`
 Ngày  | Thực học | So KPI | Lũy kế thẻ | Trạng thái nợ
───────┼──────────┼────────┼────────────┼────────────────
  D27  |    4     |  -496  |   7.852    | Nợ 5.648 thẻ
  D28  |  VẮNG    |  -500  |   7.852    | Nợ 6.148 thẻ
  D29  |  VẮNG    |  -500  |   7.852    | Nợ 6.648 thẻ
  D30  |  VẮNG    |  -500  |   7.852    | Nợ 7.148 thẻ
  D31  |  VẮNG    |  -500  |   7.852    | Nợ 7.648 thẻ
  D32  |  VẮNG    |  -500  |   7.852    | Nợ 8.148 thẻ
  D33  |  VẮNG    |  -500  |   7.852    | Nợ 8.648 thẻ
  D34  |  VẮNG    |  -500  |   7.852    | Nợ 9.148 thẻ
  D35  |  VẮNG    |  -500  |   7.852    | Nợ 9.648 thẻ
  D36  |  VẮNG    |  -500  |   7.852    | Nợ 10.148 thẻ 💥
\`\`\`
👉 **Ghi chú:** Báo động đỏ mức cao nhất! Bà Ava đã "ngủ đông" liên tiếp **9 ngày tròn** (từ D28 đến D36). Khoản nợ đã chính thức gia nhập "Câu lạc bộ 5 chữ số" với **hơn 10.000 thẻ nợ** (~20,3 ngày KPI)! Đề nghị đồng chí Ava lập tức tái xuất giang hồ trước khi lãi mẹ đẻ lãi con! 🚨📚⏳

══════════════════════════════════
🔥 **THÔNG ĐIỆP BAN QUẢN LÝ:**
Server đang bước vào chặng cao điểm tháng thứ 2 của thử thách 100 ngày. Hãy mở Anki lên ngay hôm nay để chuỗi streak không bị đứt đoạn nhé! 💪✨`;

function postMessage(content) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      content,
      allowed_mentions: { users: ['1410392551634112640', '895672321916960838'] }
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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`Failed with status ${res.statusCode}: ${d}`));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('Posting Part 1 (Sunny & General)...');
  await postMessage(messagePart1);
  console.log('Part 1 posted!');

  await new Promise(r => setTimeout(r, 1000));

  console.log('Posting Part 2 (Ava & Reminder)...');
  await postMessage(messagePart2);
  console.log('Part 2 posted!');
}

main().catch(console.error);
