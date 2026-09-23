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

function api(path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'discord.com',
      path: `/api/v10${path}`,
      method: 'GET',
      headers: {
        'Authorization': `Bot ${token}`,
        'User-Agent': 'DiscordBot (https://ankichallenge.pages.dev, 1.0)'
      }
    }, res => {
      let b = [];
      res.on('data', c => b.push(c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(Buffer.concat(b).toString('utf8')) });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function checkThread(threadId, name) {
  console.log(`\n=== Thread ${name} (${threadId}) ===`);
  const res = await api(`/channels/${threadId}/messages?limit=50`);
  if (!Array.isArray(res.json)) {
    console.log('Error:', res.status, res.json);
    return;
  }
  console.log(`Total messages fetched: ${res.json.length}`);
  for (const m of res.json) {
    const isBot = m.author?.bot || m.author?.username === 'Check-in';
    const firstLine = (m.content || '').split('\n')[0];
    const hasImgs = (m.attachments || []).length > 0 || (m.embeds || []).some(e => e.image || e.thumbnail);
    console.log(`[${m.timestamp}] ${m.author?.username} (${m.author?.id}): ${firstLine.slice(0, 80)} | hasImgs: ${hasImgs}`);
  }
}

async function main() {
  await checkThread('1550947554156478535', 'D20-20/09');
  await checkThread('1551311218726281339', 'D21-21/09');
}

main().catch(console.error);
