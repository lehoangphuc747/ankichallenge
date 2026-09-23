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

const channelId = '1541493820242264256'; // Daily thread channel

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

async function main() {
  console.log('=== 1. Active threads in channel ===');
  const active = await api(`/channels/${channelId}/threads/active`);
  if (active.json && active.json.threads) {
    for (const t of active.json.threads) {
      console.log(`- [${t.id}] ${t.name} (Archived: ${t.thread_metadata?.archived})`);
    }
  } else {
    console.log('Active response:', active);
  }

  console.log('\n=== 2. Archived public threads ===');
  const archived = await api(`/channels/${channelId}/threads/archived/public?limit=15`);
  if (archived.json && archived.json.threads) {
    for (const t of archived.json.threads) {
      console.log(`- [${t.id}] ${t.name} (Archived: ${t.thread_metadata?.archived})`);
    }
  } else {
    console.log('Archived response:', archived);
  }
}

main().catch(console.error);
