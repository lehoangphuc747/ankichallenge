import fs from 'node:fs';

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

// Day 12 Thread ID: 1548052644205957230
const threadId = '1548052644205957230';

async function postMessage(content, mentionUser) {
  const payload = {
    content,
    allowed_mentions: { users: [mentionUser] }
  };

  const res = await fetch(`https://discord.com/api/v10/channels/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
      'User-Agent': 'DiscordBot (https://ankichallenge.pages.dev, 1.0)'
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  console.log(`Response status for ${mentionUser}:`, res.status);
  if (!res.ok) {
    throw new Error(`Discord API error (${res.status}): ${text}`);
  }
  const data = JSON.parse(text);
  console.log(`Message created successfully! ID: ${data.id}`);
  return data;
}

const avaMessage = `📋 **[GIẤY BÁO NỢ ANKI - AVA (CẬP NHẬT ĐẾN HẾT DAY 12)]**

Kính gửi con nợ <@895672321916960838>:
Tổ thu hồi nợ xin ghi nhận tinh thần kiên cường của bà khi đã kịp "quay xe" check-in ở phút 89 của **Day 12** với **15 thẻ** ôn tập, xuất sắc bảo toàn chuỗi chuyên cần **12/12 ngày** (100%)! 👏✨

Tuy nhiên, định mức KPI **500 thẻ / ngày** thì vẫn phải tính sòng phẳng theo quy định nha. Dưới đây là bảng đối soát sổ nợ toàn diện từ **Day 1 đến Day 12**:

📊 **CHI TIẾT ĐỐI SOÁT TỪNG NGÀY:**
• **Day 1 (01/09):** Học 162 thẻ ➔ 🔴 Nợ **338 thẻ**
• **Day 2 (02/09):** Học 1.036 thẻ 🔥 ➔ 🟢 Trừ sạch nợ Day 1, còn dư **+198 thẻ**
• **Day 3 (03/09):** Học 6 thẻ ➔ Cấn trừ phần dư, 🔴 Nợ luỹ kế: **296 thẻ**
• **Day 4 (04/09):** Học 159 thẻ ➔ 🔴 Nợ luỹ kế: **637 thẻ**
• **Day 5 (05/09):** Học 67 thẻ ➔ 🔴 Nợ luỹ kế: **1.070 thẻ**
• **Day 6 (06/09):** Học 4 thẻ ➔ 🔴 Nợ luỹ kế: **1.566 thẻ**
• **Day 7 (07/09):** Học 131 thẻ ➔ 🔴 Nợ luỹ kế: **1.935 thẻ**
• **Day 8 (08/09):** Học 90 thẻ ➔ 🔴 Nợ luỹ kế: **2.345 thẻ**
• **Day 9 (09/09):** Học 290 thẻ ➔ 🔴 Nợ luỹ kế: **2.555 thẻ**
• **Day 10 (10/09):** Học 1 thẻ ➔ 🔴 Nợ luỹ kế: **3.054 thẻ**
• **Day 11 (11/09):** Học 64 thẻ ➔ 🔴 Nợ luỹ kế: **3.490 thẻ**
• **Day 12 (12/09):** Học 15 thẻ ➔ Thiếu 485 thẻ, 🔴 Nợ luỹ kế vọt lên: **3.975 thẻ**! 📈😱

═════════════════════════
🎯 **TỔNG KẾT SỔ NỢ ĐẾN HẾT DAY 12:**
• 📅 **Chuyên cần:** **12/12 ngày** (100% chuyên cần, chưa vắng ngày nào) 🌟
• 🎯 **Hạn mức KPI 12 ngày:** 12 × 500 = **6.000 thẻ**
• 📚 **Tổng thẻ thực tế đã học:** **2.025 thẻ**
• 💸 **TỔNG SỐ THẺ NỢ LUỸ KẾ CÒN LẠI:** **3.975 THẺ** 🚨⚠️

👉 Cục nợ đang áp sát ngưỡng **4.000 thẻ** rồi bà ơiii! Sang **Day 13** làm một cú bứt phá như Day 2 (1.000+ thẻ) để vừa cắt nợ vừa giật lại phong độ nhé! Chúc bà tiếp tục giữ vững chuỗi chuyên cần! 🔥💪`;

const nguyenMessage = `👑 **[VINH DANH TOP 1 NGÀY 12 & CỘT MỐC 20.000 THẺ]** 👑

Nhiệt liệt chúc mừng chiến thần <@871321277858725958>! 🎉✨

Trong khi cả server đang dần đuối sức về cuối chặng Day 12, Nguyen đã có màn "chốt hạ" cực kỳ mãn nhãn:
🌟 **Thành tích Day 12:** Cày quét **1.183 thẻ** ôn tập — xuất sắc vươn lên vị trí **TOP 1 Day 12**!
🔥 **Streak:** Giữ vững chuỗi **12/12 ngày** chuyên cần tuyệt đối!
🏆 **KỶ LỤC TOÀN GIẢI:** Chính thức cán mốc **20.405 THẺ** — là thành viên **ĐẦU TIÊN** trong toàn bộ 40 chiến binh của Anki Challenge 11 phá vỡ cột mốc siêu khủng **20.000 thẻ**!

Tốc độ và sự bền bỉ của bạn thực sự là nguồn cảm hứng lớn cho toàn bộ anh em trong cộng đồng Anki Việt Nam. Chúc bạn tiếp tục giữ vững phong độ đỉnh cao này trong các chặng tiếp theo nhé! 🚀🔥`;

async function main() {
  console.log('Sending Ava debt ledger to Day 12 thread...');
  await postMessage(avaMessage, '895672321916960838');
  console.log('Done Ava!');

  console.log('Waiting 2 seconds...');
  await new Promise(r => setTimeout(r, 2000));

  console.log('Sending Nguyen congratulation to Day 12 thread...');
  await postMessage(nguyenMessage, '871321277858725958');
  console.log('Done Nguyen!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
