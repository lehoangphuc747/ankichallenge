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

const guildId = '867268399687663616';
const channelId = '1541493820242264256';

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
  console.log('=== 1. Guild Active Threads ===');
  const guildThreads = await api(`/guilds/${guildId}/threads/active`);
  if (guildThreads.json && guildThreads.json.threads) {
    for (const t of guildThreads.json.threads) {
      if (t.parent_id === channelId || t.name.includes('D') || t.name.includes('Ngày')) {
        console.log(`- Thread [${t.id}] "${t.name}" (Parent: ${t.parent_id})`);
      }
    }
  } else {
    console.log('Guild threads response:', guildThreads.status, guildThreads.json);
  }

  console.log('\n=== 2. Messages in Daily Channel ===');
  const msgs = await api(`/channels/${channelId}/messages?limit=20`);
  if (Array.isArray(msgs.json)) {
    for (const m of msgs.json) {
      const threadInfo = m.thread ? `-> Thread [${m.thread.id}] "${m.thread.name}"` : 'No thread';
      const firstLine = m.content.split('\n')[0];
      console.log(`Msg [${m.id}] (${m.timestamp}): ${firstLine} | ${threadInfo}`);
    }
  } else {
    console.log('Channel msgs response:', msgs.status, msgs.json);
  }
}

main().catch(console.error);
