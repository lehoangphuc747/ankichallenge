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
  console.error('Missing DISCORD_TOKEN');
  process.exit(1);
}

const THREAD_ID = '1563632291496853555'; // D55-25/10

const MADBEAR_ID = '438960335983083530';
const SUNNY_ID = '1410392551634112640';
const AVA_ID = '895672321916960838';
const PAUL_ID = '871985158151106571';

const messages = [
  {
    target: 'Madbear',
    userId: MADBEAR_ID,
    content: `🚨 **[SỔ NỢ ĐẶC BIỆT — RÉO NỢ ĐỒNG CHÍ MADBEAR THEO YÊU CẦU]** 🐻⚡

Thực hiện đúng di huấn lịch sử từ Day 31: *"Hôm nào ko đủ 2k réo t"*, Tổ thu hồi nợ xin gửi giấy réo nợ nóng đến đồng chí <@${MADBEAR_ID}> chặng **Day 31 ➔ Day 55** (25 ngày hoá thú):

📊 **TỔNG KẾT CAM KẾT 2.000 THẺ/NGÀY:**
• 🎯 **Chỉ tiêu cam kết (25 ngày):** 25 × 2.000 = **50.000 thẻ**
• ⚡ **Thực tế đã cày (D31–D55):** **28.010 thẻ** (Bình quân gắt: ~1.120 thẻ/ngày!)
• 💸 **TỔNG NỢ THIẾU CHỈ TIÊU 2K:** **21.990 THẺ** 😱💥
• 📌 **Số ngày đạt chuẩn 2k:** **5 / 25 ngày** (D31: 2.309, D32: 2.026, D41: 2.709, D52: 2.338, D54: 2.858).

📜 **BẢNG THEO DÕI NỢ 10 NGÀY GẦN NHẤT (DAY 46 – DAY 55):**
\`\`\`
 Ngày | Thực tế | Chỉ tiêu 2k | Biến động | Trạng thái réo
──────┼─────────┼─────────────┼───────────┼──────────────────────────────────
 D46  |  1.292  |    2.000    |   -708    | RÉO NHẸ! Bứt phá 118 phút 🚀
 D47  |  1.042  |    2.000    |   -958    | RÉO! Đều đặn chạm mốc 1k
 D48  |   748   |    2.000    |  -1.252   | RÉO! Chậm lại cuối tuần
 D49  |  1.184  |    2.000    |   -816    | RÉO NHẸ! Ổn định phong độ 1k
 D50  |   766   |    2.000    |  -1.234   | RÉO! Cày 95 phút
 D51  |  1.031  |    2.000    |   -969    | RÉO! Cán mốc 1k thẻ
 D52  |  2.338  |    2.000    |   +338    | ĐẠT! Bùng nổ 164 phút 💥
 D53  |   819   |    2.000    |  -1.181   | RÉO! Dư chấn D52
 D54  |  2.858  |    2.000    |   +858    | ĐẠT! Lập đỉnh mới gần 3k thẻ 🔥
 D55  |    0    |    2.000    |  -2.000   | RÉO CĂNG! Chưa thấy nộp bài D55 🪫
\`\`\`

---
💡 **LỜI NHẮN TỪ TỔ THU HỒI NỢ:**
• 👑 **Nghịch lý siêu đẳng:** Dù đang "ôm cục nợ" **21.990 thẻ** so với chỉ tiêu tự ép 2k, nhưng với tổng **42.508 thẻ** toàn mùa, bác vẫn đang chễm chệ ở ngôi **TOP 1 TOÀN SERVER**, bỏ xa Top 2 gần 20.000 thẻ! 😂
• Nhưng hôm nay Day 55 bác đang để trống 0 thẻ kìa! Mau nộp bài check-in Day 55 để xóa bớt 2.000 thẻ nợ hôm nay nhé bác ơiii! 🏃💨⚡`
  },
  {
    target: 'Sunny',
    userId: SUNNY_ID,
    content: `📢 **[GIẤY ĐÒI NỢ KHẨN CẤP — TỔ THU HỒI NỢ GỌI TÊN SUNNY]** 🚨💸

Alo alo chị <@${SUNNY_ID}> ơiii! Đang ở phương trời nào mau về nộp bài check-in gấp! 🏃‍♀️💨

Tổ thu hồi nợ tiếp tục cập nhật sổ tính đến hết **Day 55 (25/10)**:
• 👑 **Đỉnh cao Day 33 (03/10):** Từng bứt phá cày 803 thẻ, xóa sạch nợ cũ và **DƯ TẬN +557 THẺ** khiến cả server ngả mũ!
• 😴 **Thực tế từ Day 34 đến Day 55:** Chị đã "ngủ đông" liên tiếp **22 ngày tròn** không một dấu vết...
• 📉 **Hậu quả:** 22 ngày × 500 thẻ KPI = 11.000 thẻ nợ mới phát sinh! Trừ đi 557 thẻ dư cũ, hiện tại **KHOẢN NỢ ĐÃ CHẠM MỐC 10.443 THẺ** rồi bà ơiii! 😱💥

Thử thách 100 ngày đã đi qua hơn nửa chặng đường (55%)! Chị có đang ủ mưu làm một quả bão thẻ chấn động như mọi khi không? Mau mau mở Anki lên check-in hoặc chụp bảng Heatmap gửi đối soát để giải cứu khoản nợ 10k thẻ nhé chị Sunny ơi! 🔥📚✨`
  },
  {
    target: 'Ava',
    userId: AVA_ID,
    content: `🚨 **[SỔ NỢ ĐỐI SOÁT ANKI — BÁO ĐỘNG ĐỎ KHOẢN NỢ AVA]** 📑💸

Tổ thu hồi nợ kính gửi Giấy đòi nợ đặc biệt tới con nợ VIP Pro **Ava** (<@${AVA_ID}>):
*Hạn mức cam kết: **500 thẻ / ngày** · Mốc chuẩn Day 55: **55 × 500 = 27.500 thẻ***

══════════════════════════════════
👤 **CON NỢ AVA (<@${AVA_ID}>):**
• 🎯 **Mốc KPI 55 ngày:** **27.500 thẻ**
• ⚡ **Tổng thẻ đã học thực tế:** **7.687 thẻ** (Chuyên cần: **23/55 ngày** ➔ chỉ còn **41,8%**)
• 🛌 **Số ngày ngủ đông liên tiếp:** **28 ngày tròn** (từ Day 28 đến hết Day 55)!
• 💸 **Số dư nợ hiện tại:** **19.813 THẺ** 😱💥 *(sắp cán mốc 20.000 thẻ — kỷ lục nợ vô tiền khoáng hậu của server)*

---
💡 **TỔ THU HỒI NỢ CẢNH BÁO:**
• Khoản nợ **19.813 thẻ** tương đương gần **40 ngày KPI** cày liên tục không nghỉ!
• Thử thách đã đi qua hơn nửa chặng đường (55 ngày). Nếu không sớm tái xuất giang hồ thì khoản nợ sẽ chạm mốc 20k ngay ngày mai!
• 📢 **YÊU CẦU ĐỒNG CHÍ AVA:** Lập tức mở Anki, cứu lấy streak và nộp ảnh check-in đối soát ngay hôm nay nhéee! 🏃‍♀️💨📚`
  },
  {
    target: 'Paul',
    userId: PAUL_ID,
    content: `🚨 **[SỔ NỢ CHUYÊN CẦN — DÍ CHÚ HẢI CẨU PAUL]** 🦭🔍

Tổ thu hồi nợ Anki Challenge kính gửi Giấy triệu tập lần 2 tới chú hải cẩu **Paul** (<@${PAUL_ID}>):

🎯 **Cam kết đầu mùa:**
• 🏆 **Mục tiêu chuyên cần:** **99%**
• ⏱️ **Mục tiêu thời gian:** *"Vượt qua mùa trước là 83 giờ (4.980 phút)"*
• 💬 **Châm ngôn:** *"Đừng cố gắng chạy theo bướm, hãy xây một vườn hoa. Dù bướm có không tới, bạn vẫn có vườn hoa."*
• 🥀 **Thực tế:** Hoa vừa chớm nở ở chặng D39-D47 thì chú lại tiếp tục lặn biển sâu **8 ngày liên tiếp** (từ D48 đến D55)!

══════════════════════════════════
📊 **ĐỐI SOÁT CHUYÊN CẦN HẾT DAY 55 (25/10):**
• 📅 **Số ngày thử thách đã qua:** **55 ngày**
• ⚡ **Số ngày thực tế check-in:** **28 / 55 ngày** (Chuyên cần: **50,9%** ➔ sắp tụt xuống dưới 50%, cách mục tiêu 99% một trời một vực!)
• 📚 **Tổng số thẻ đã học:** **4.056 thẻ**
• ⏱️ **Tổng thời gian học:** **~70 phút** (Mới đạt **1,4%** so với mục tiêu 83 giờ!)
• 🌊 **Trạng thái hiện tại:** Lặn mất tăm từ sau Day 47 (17/10) đến nay tròn 8 ngày!

---
💡 **TỔ THU HỒI NỢ NHẮC NHỞ:**
• Vườn hoa Thụy Điển & Tiếng Anh đang khô hạn đợi chú về tưới nước kìa! 🌺🦭
• Mau ngoi lên mặt nước, mở Anki và nộp ảnh check-in bù ngay hôm nay để kéo tỷ lệ chuyên cần lên trên 50% nhé chú Paul ơiii! 🏃‍♂️💨📚✨`
  }
];

function postToDiscord(channelId, content, userMentions = []) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      content,
      allowed_mentions: { users: userMentions }
    });

    const req = https.request({
      hostname: 'discord.com',
      path: `/api/v10/channels/${channelId}/messages`,
      method: 'POST',
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'DiscordBot (https://ankichallenge.pages.dev, 1.0)'
      }
    }, res => {
      let b = [];
      res.on('data', chunk => b.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(b).toString('utf8');
        try {
          const json = JSON.parse(raw);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, json });
          } else {
            reject(new Error(`Discord API error ${res.statusCode}: ${raw}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${raw}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log(`Starting to post 4 debt ledgers to Thread ${THREAD_ID}...`);
  for (const m of messages) {
    try {
      console.log(`Posting debt reminder for ${m.target} (<@${m.userId}>)...`);
      const res = await postToDiscord(THREAD_ID, m.content, [m.userId]);
      console.log(`✅ Success for ${m.target}! Message ID: ${res.json.id}`);
      // Sleep 1.5s between messages to avoid Discord rate limit
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.error(`❌ Failed to post for ${m.target}:`, err.message);
    }
  }
  console.log('Finished posting all debt reminders!');
}

main().catch(console.error);
