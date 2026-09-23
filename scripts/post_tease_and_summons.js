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
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const d15ThreadId = '1549159263291572325';
  const d16ThreadId = '1549510735774744587';

  // 1. Tin kháy Tuong Vie ở Day 15
  const msgTuongVie = `Tui phát hiện hôm nay bà <@567311737464946703> học chỉ có đúng **1 thẻ** nha! 👀

Bị bắt quả tang rồi nhé, tính học qua loa bấm lẹ 1 thẻ để duy trì streak chứ gì! 😂 Chuyên cần thì vẫn tính đó nhưng mà lộ liễu quá nha bà ơiii, mai nhớ cày bù đàng hoàng nhe! 🔥`;

  console.log('Sending message to Tuong Vie in Day 15 thread...');
  const res1 = await postToDiscord(d15ThreadId, msgTuongVie, ['567311737464946703']);
  console.log('Successfully posted to Day 15! Message ID:', res1.json.id);

  console.log('Waiting 2 seconds...');
  await new Promise(r => setTimeout(r, 2000));

  // 2. Tin triệu hồi 2 chiến thần Nguyen & Ethan NP ở Day 16
  const msgSummons = `🚨 **[LỆNH TRIỆU HỒI HAI CHIẾN THẦN SERVER]** 📢⚡

Alo alo <@871321277858725958> và <@1340307678215405710> ơiii!

Hai cỗ máy cày thẻ khủng nhất server bỗng nhiên "lặn mất tăm" cả **Day 15 lẫn Day 16** luôn rồi! Bảng xếp hạng thiếu hai bác trầm hẳn đi ấy 📉😱

Hai bác bận việc hay đang ủ mưu làm một cú bão thẻ check-in bù thế ạ? Mau mau về nộp bài giữ chuỗi nha hai đại thần ơi! 🔥🚀`;

  console.log('Sending summons to Nguyen and Ethan NP in Day 16 thread...');
  const res2 = await postToDiscord(d16ThreadId, msgSummons, ['871321277858725958', '1340307678215405710']);
  console.log('Successfully posted to Day 16! Message ID:', res2.json.id);

  console.log('\nAll messages sent successfully!');
}

main().catch(err => {
  console.error('Failed to post messages:', err);
  process.exit(1);
});
