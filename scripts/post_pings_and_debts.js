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

function discordRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const headers = {
      'Authorization': `Bot ${token}`,
      'User-Agent': 'DiscordBot (https://ankichallenge.pages.dev, 1.0)'
    };
    if (payload) {
      headers['Content-Type'] = 'application/json; charset=utf-8';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request({
      hostname: 'discord.com',
      path: `/api/v10${path}`,
      method: method,
      headers: headers
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          if (data) json = JSON.parse(data);
        } catch (e) {}
        resolve({ status: res.statusCode, data: data, json: json });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. Send Ping function
async function sendReminderPing(threadId, dateStr, notCheckedList, totalCount) {
  const mentions = notCheckedList.map(u => `<@${u.discordId}>`).join(' ');
  const content = `⏰ **Nhắc nhở check-in ${dateStr} — ${notCheckedList.length}/${totalCount} chưa check-in:**\n${mentions}\n\n👉 Gõ \`/checkin\` để điểm danh ngay nhé!`;

  console.log(`Sending reminder ping to thread ${threadId} for ${dateStr}...`);
  const res = await discordRequest('POST', `/channels/${threadId}/messages`, {
    content: content,
    allowed_mentions: { parse: ['users'] }
  });

  if (res.status >= 200 && res.status < 300) {
    console.log(`✅ Thành công ping ${dateStr}! Message ID: ${res.json?.id}`);
    return res.json?.id;
  } else {
    console.error(`❌ Lỗi ping ${dateStr}:`, res.status, res.data);
    return null;
  }
}

// 2. Add Reaction Harold
async function addHaroldReaction(threadId, messageId) {
  const emoji = encodeURIComponent('Harold:1453694472998359050');
  console.log(`Adding Harold reaction to message ${messageId} in thread ${threadId}...`);
  const res = await discordRequest('PUT', `/channels/${threadId}/messages/${messageId}/reactions/${emoji}/@me`);
  if (res.status === 204 || (res.status >= 200 && res.status < 300)) {
    console.log(`✅ Đã thả reaction <:Harold:1453694472998359050> thành công!`);
    return true;
  } else {
    console.error(`❌ Lỗi thả reaction:`, res.status, res.data);
    return false;
  }
}

async function main() {
  const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));
  const stats = JSON.parse(fs.readFileSync('public/data/ac11_stats.json', 'utf8'));
  const enrolled = stats.userRankings.map(u => ({
    discordId: u.discordId,
    name: u.user
  }));

  // ==================== BƯỚC 1: PING CÁC NGÀY CHƯA PING (Day 11, 12, 13, 15) ====================
  console.log('==================== BƯỚC 1: PING CÁC NGÀY CHƯA PING ====================');
  const pingTargets = [
    { dayNum: 11, dateStr: '11/09/2026', dayKey: 'day11', threadId: '1547690101578924072' },
    { dayNum: 12, dateStr: '12/09/2026', dayKey: 'day12', threadId: '1548052644205957230' },
    { dayNum: 13, dateStr: '13/09/2026', dayKey: 'day13', threadId: '1548407515258167480' },
    { dayNum: 15, dateStr: '15/09/2026', dayKey: 'day15', threadId: '1549159263291572325' },
  ];

  for (const t of pingTargets) {
    const dayData = ocr[t.dayKey] || {};
    const checkedIds = new Set(Object.keys(dayData));
    const notChecked = enrolled.filter(u => !checkedIds.has(u.discordId));
    
    await sendReminderPing(t.threadId, t.dateStr, notChecked, enrolled.length);
    await sleep(1500); // Rate-limit safety
  }

  // ==================== BƯỚC 2: GỬI GIẤY BÁO NỢ CHO SUNNY (HẾT DAY 15) ====================
  console.log('\n==================== BƯỚC 2: GỬI GIẤY BÁO NỢ CHO SUNNY ====================');
  const sunnyDebtContent = `📋 **[GIẤY BÁO NỢ ANKI - SUNNY (CẬP NHẬT HẾT DAY 15)]**

Kính gửi con nợ VIP <@1410392551634112640>:
Tổ thu hồi nợ xin chính thức tuyên bố: BÀ ĐÃ KHIẾN CON BOT NÀY SUÝT CHÁY CẢ SERVER VÌ BẢNG THỐNG KÊ! 😱💥

Vừa hôm trước quất một nhát **2.025 thẻ** ở Day 14 khiến cả server rớt hàm, thì sang **Day 15** bà lại tiếp tục làm một cú "nổ hũ kép" cày quét **2.314 THẺ** trong **205 phút**! Hai ngày liên tiếp thanh toán đứt hơn **4.300 thẻ**! 🚀🔥

📊 **BẢNG THEO DÕI NỢ (Mục tiêu: 500 thẻ / ngày):**

• 📌 **Nợ cũ chốt đến hết Day 14:** nợ **2.419 thẻ** *(Đã trừ cú nhảy 2.025 thẻ)*

• 🟢 **Day 15 (15/09):** Cày **2.314 thẻ** ➔ **VƯỢT CHỈ TIÊU +1.814 THẺ**, trừ thẳng vào nợ cũ!

═════════════════════════

🎯 **TỔNG KẾT SỔ NỢ ĐẾN HẾT DAY 15:**

• 📅 **Số ngày có học:** **13 / 15 ngày** (87% chuyên cần)

• 🎯 **Tổng chỉ tiêu 15 ngày:** 15 ngày × 500 thẻ = **7.500 thẻ**

• 📚 **Tổng thẻ thực tế đã học:** **6.895 thẻ** *(Leo thẳng lên Top 5 toàn server!)* 🌟

• 💸 **SỐ THẺ CÒN NỢ HIỆN TẠI:** **605 THẺ**! *(Từ đỉnh 3.944 thẻ giờ chỉ còn vỏn vẹn 605 thẻ!)* 🎉📉

👉 Đúng là đẳng cấp "con nợ siêu cấp vũ trụ"! Cục nợ khổng lồ gần 4.000 thẻ giờ chỉ còn đúng **605 thẻ**. Hôm nay làm một nháy nhẹ nhàng nữa là chính thức **SẠCH NỢ TRẮNG ÁN** và trở thành huyền thoại xoá nợ của Anki Việt Nam nhé bà ơiii! Bác <@895672321916960838> nhìn mà rơi nước mắt kìa! 🔥💪`;

  // Gửi vào thread Day 15
  const threadD15 = '1549159263291572325';
  console.log('Sending Sunny debt ledger to Day 15 thread...');
  const sunnyMsgRes = await discordRequest('POST', `/channels/${threadD15}/messages`, {
    content: sunnyDebtContent,
    allowed_mentions: { users: ['1410392551634112640', '895672321916960838'] }
  });

  if (sunnyMsgRes.status >= 200 && sunnyMsgRes.status < 300) {
    const sunnyMsgId = sunnyMsgRes.json?.id;
    console.log(`✅ Đã gửi Giấy báo nợ Sunny thành công! ID: ${sunnyMsgId}`);
    await sleep(1000);
    // Thả emoji Harold
    await addHaroldReaction(threadD15, sunnyMsgId);
  } else {
    console.error('❌ Lỗi gửi giấy nợ Sunny:', sunnyMsgRes.status, sunnyMsgRes.data);
  }

  await sleep(1500);

  // ==================== BƯỚC 3: GỬI GIẤY BÁO NỢ CHO AVA (HẾT DAY 15) ====================
  console.log('\n==================== BƯỚC 3: GỬI GIẤY BÁO NỢ CHO AVA ====================');
  const avaDebtContent = `📋 **[GIẤY BÁO NỢ ANKI - AVA (CẬP NHẬT HẾT DAY 15)]**

Kính gửi con nợ bền bỉ <@895672321916960838>:
Tổ thu hồi nợ xin gửi lời chia buồn sâu sắc khi chuỗi phong độ của bác đang có dấu hiệu "bất ổn định nghiêm trọng"! 🚨📢

Sau khi bùng nổ **515 thẻ** ở Day 13 để chứng minh bản lĩnh "tự ái thành công", thì sang **Day 14** và **Day 15** bác lại... "lặn mất tăm" 2 ngày liên tiếp không check-in, khiến chuỗi chuyên cần 100% chính thức bị đứt và cục nợ phi mã như tên lửa! 📈😱

📊 **BẢNG THEO DÕI NỢ (Mục tiêu: 500 thẻ / ngày):**

• 📌 **Nợ cũ chốt đến hết Day 13:** nợ **3.960 thẻ** *(Học 2.540 / KPI 6.500 thẻ)*

• 🔴 **Day 14 (14/09):** Vắng học (0 thẻ) ➔ Nợ thêm 500 thẻ, tăng lên: **4.460 thẻ**

• 🔴 **Day 15 (15/09):** Vắng học (0 thẻ) ➔ Nợ thêm 500 thẻ, chạm ngưỡng: **4.960 thẻ**! 🚨

═════════════════════════

🎯 **TỔNG KẾT SỔ NỢ ĐẾN HẾT DAY 15:**

• 📅 **Số ngày có học:** **13 / 15 ngày** (Tụt từ 100% xuống 87% chuyên cần)

• 🎯 **Tổng chỉ tiêu 15 ngày:** 15 ngày × 500 thẻ = **7.500 thẻ**

• 📚 **Tổng thẻ thực tế đã học:** **2.540 thẻ**

• 💸 **SỐ THẺ CÒN NỢ:** **4.960 THẺ**! *(Chạm sát nút ngưỡng lịch sử 5.000 THẺ NỢ!)* 🚨⚠️

👉 Trong khi người bạn cùng tiến <@1410392551634112640> cày một mạch 4.300 thẻ trong 2 ngày để kéo nợ xuống chỉ còn đúng **605 thẻ**, thì bác Ava lại sắp sửa trở thành người đầu tiên "phá vỡ kỷ lục 5.000 thẻ nợ" của giải đấu! Hôm nay Day 16 quay lại bàn học cày bù gấp nha bác ơiii, đừng để vỡ nợ thật sự nhé! 🔥💪`;

  console.log('Sending Ava debt ledger to Day 15 thread...');
  const avaMsgRes = await discordRequest('POST', `/channels/${threadD15}/messages`, {
    content: avaDebtContent,
    allowed_mentions: { users: ['895672321916960838', '1410392551634112640'] }
  });

  if (avaMsgRes.status >= 200 && avaMsgRes.status < 300) {
    const avaMsgId = avaMsgRes.json?.id;
    console.log(`✅ Đã gửi Giấy báo nợ Ava thành công! ID: ${avaMsgId}`);
    await sleep(1000);
    // Thả emoji Harold
    await addHaroldReaction(threadD15, avaMsgId);
  } else {
    console.error('❌ Lỗi gửi giấy nợ Ava:', avaMsgRes.status, avaMsgRes.data);
  }

  console.log('\n==================== HOÀN TẤT TẤT CẢ TÁC VỤ! ====================');
}

main().catch(console.error);
