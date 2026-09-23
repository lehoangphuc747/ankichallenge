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

const avaId = '895672321916960838';
const threads = [
  { id: '1550947554156478535', name: 'D20-20/09' },
  { id: '1551311218726281339', name: 'D21-21/09' },
  { id: '1551696795011387473', name: 'D22-22/09' },
  { id: '1552047103868411915', name: 'D23-23/09' },
];

async function main() {
  for (const t of threads) {
    console.log(`\n=== Thread ${t.name} (${t.id}) ===`);
    const res = await api(`/channels/${t.id}/messages?limit=100`);
    if (!Array.isArray(res.json)) {
      console.log('Error fetching:', res.status, res.json);
      continue;
    }
    for (const m of res.json) {
      const isAva = m.author?.id === avaId || m.content?.includes(avaId);
      if (isAva) {
        console.log(`[${m.timestamp}] Author: ${m.author?.username} (${m.author?.id}): "${m.content}" | Attachments:`, (m.attachments || []).map(a => a.url), '| Embeds:', (m.embeds || []).map(e => e.image?.url || e.thumbnail?.url));
      }
    }
  }
}

main().catch(console.error);
