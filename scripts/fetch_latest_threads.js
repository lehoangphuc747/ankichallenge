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

const channelId = '1541493820242264256';

function fetchThreads(path) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'discord.com',
      path: path,
      headers: {
        'Authorization': 'Bot ' + token,
        'User-Agent': 'DiscordBot (https://ankichallenge.pages.dev, 1.0)'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const active = await fetchThreads('/api/v10/guilds/867268399687663616/threads/active');
  const archived = await fetchThreads(`/api/v10/channels/${channelId}/threads/archived/public`);
  
  const allThreads = [...(active.threads || []), ...(archived.threads || [])];
  console.log('Total threads found:', allThreads.length);
  const relevant = allThreads.filter(t => t.parent_id === channelId || t.name.startsWith('D'));
  for (const t of relevant) {
    console.log(JSON.stringify({
      id: t.id,
      name: t.name,
      archived: t.thread_metadata ? t.thread_metadata.archived : false,
      msgCount: t.message_count
    }));
  }
}

run();
