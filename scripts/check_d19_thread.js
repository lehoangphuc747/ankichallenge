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

const threadId = '1550588972646932571'; // Day 19 thread
https.get({
  hostname: 'discord.com',
  path: `/api/v10/channels/${threadId}/messages?limit=100`,
  headers: {
    'Authorization': 'Bot ' + token,
    'User-Agent': 'DiscordBot (https://ankichallenge.pages.dev, 1.0)'
  }
}, res => {
  let d = '';
  res.on('data', chunk => d += chunk);
  res.on('end', () => {
    const msgs = JSON.parse(d);
    console.log('Day 19 total msgs:', msgs.length);
    const madbearMsgs = msgs.filter(m => m.content.includes('438960335983083530') || m.author?.id === '438960335983083530');
    console.log('Madbear in Day 19 msgs:', madbearMsgs.map(m => ({ id: m.id, content: m.content })));
  });
});
