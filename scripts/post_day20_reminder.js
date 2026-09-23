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

const messageContent = `⏰ **[LOA PHƯỜNG ANKI DAY 20] — ĐÃ 5 NGÀY KHÔNG AI BỊ RÉO NÊN CẢ SERVER TÍNH 'NGỦ ĐÔNG' HẾT RỒI ĐÚNG HÔNG?!** 📢⚡

Đồng hồ đã điểm cuối ngày **Day 20**, chỉ còn 10 ngày nữa là hết mùa, mà bảng điểm danh hôm nay mới le lói có **7 người** nộp bài! 27 con người còn lại mau về điểm danh ngay:

👑 **Hội "Chiến Thần Ngủ Say Trên Đỉnh":**
• <@871321277858725958> & <@1340307678215405710>: Hai cỗ máy cày khủng nhất server (22k & 19k thẻ) tính cày trước cho cả mùa rồi chia tay sớm bớt đau khổ hay sao mà mấy hôm nay im ắng quá dạ hai bác ơiii? Về bấm nhẹ vài thẻ giữ top nào!

💸 **Hội "Con Nợ Nghìn Thẻ Đang Trốn Nợ":**
• <@1410392551634112640>: Suýt trắng án ở Day 15 xong lặn mất tăm 5 ngày liên tiếp, nợ lại phình to lên **3.100 thẻ** rồi bà ơi!
• <@895672321916960838>: Day 19 vừa gỡ gạc 750 thẻ xong Day 20 lại tính xả hơi hả bạn? Mau nộp bài không cục nợ **6.000 thẻ** nó đè xỉu á!

🧘 **Hội "Nữ Hoàng Phong Thủy / Giữ Chuỗi Tối Giản":**
• <@567311737464946703>: Hôm nay chưa thấy lên sóng chấm nhẹ 1 thẻ lên heatmap để giữ chuỗi kìa bà ơiii, bấm lẹ 1 thẻ cũng được miễn có nộp bài nha! 😂

🎯 **Hội "Chiến Binh Chăm Chỉ Sắp Cán Đích 20/20":**
• <@870187268692906014>, <@438960335983083530>, <@711153532392308767>, <@883936057878536222>, <@1465133555574243348>, <@790859151734996992>, <@1393440400038957157>, <@1503052423390957772>, <@534726411521490956>: Chuyên cần gần như tuyệt đối, đừng để lỡ nhịp ngày 20 này uổng công 3 tuần cày cuốc nha!

🏃‍♂️ **Và các đồng chí còn lại mau vào điểm danh gấp:**
<@894143041298894859> <@1315027452430516246> <@1011294951201570887> <@1128985878367318116> <@792983013340086293> <@1353193643866984490> <@756776493685669940> <@838271094170583120> <@963399002466955314> <@928998165770825728> <@1446702112347127869> <@770311204396466198> <@1488741701823500390>

👉👉 Gõ lệnh \`/checkin\` kèm ảnh screenshot ngay kẻo bị tính vắng nhé cả nhà! 🔥🚀`;

console.log('Character count:', messageContent.length);

const threadId = '1550947554156478535'; // Day 20 thread

const payload = JSON.stringify({
  content: messageContent,
  allowed_mentions: { parse: ['users'] }
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
      console.log('Successfully posted Day 20 reminder message!');
    } else {
      console.error('Failed to post message:', d);
    }
  });
});

req.on('error', err => console.error('Request error:', err));
req.write(payload);
req.end();
