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

const threadId = '1550947554156478535'; // Day 20 thread
const wrongMsgId = '1552001017044930640'; // First checkin msg with wrong image

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
        resolve({ status: res.statusCode, data, json });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function main() {
  console.log(`Deleting wrong checkin message ${wrongMsgId} in thread ${threadId}...`);
  const delRes = await discordRequest('DELETE', `/channels/${threadId}/messages/${wrongMsgId}`);
  console.log('Delete status:', delRes.status);

  if (delRes.status === 204 || (delRes.status >= 200 && delRes.status < 300)) {
    console.log('Successfully deleted the wrong checkin message on Discord!');
  } else {
    console.log('Delete response:', delRes.data);
  }

  // Reply to Ava in thread Day 20
  const replyContent = `Đã xoá tin check-in nhầm đầu tiên của ngày 20/09 cho bà <@895672321916960838> rồi nhé! Bot chạy bằng cơm thật nhưng phản hồi siêu tốc nha 😂✨\nSố thẻ ngày 20/09 của bà đã được chốt chuẩn 105 thẻ, ngày 21/09 là 398 thẻ, và ngày 22/09 cày bão 1.055 thẻ quá đỉnh! 🔥`;

  console.log('Posting response to Ava...');
  const postRes = await discordRequest('POST', `/channels/${threadId}/messages`, {
    content: replyContent,
    allowed_mentions: { users: ['895672321916960838'] }
  });
  console.log('Post status:', postRes.status, postRes.json?.id);
}

main().catch(console.error);
