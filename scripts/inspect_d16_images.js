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

async function main() {
  const msgs = await api('/channels/1549510735774744587/messages?limit=100');
  console.log('D16 Messages:');
  for (const m of msgs.json.reverse()) {
    const u = m.author.username;
    console.log(`\nMsg ${m.id} by ${u} (${m.author.id}) at ${m.timestamp}`);
    if (m.content) console.log(` Content: ${m.content}`);
    if (m.attachments) {
      for (const a of m.attachments) {
        console.log(` Attachment: ${a.filename} -> ${a.url}`);
      }
    }
    if (m.embeds) {
      for (const e of m.embeds) {
        if (e.image) console.log(` Embed image: ${e.image.url}`);
        if (e.description) console.log(` Embed desc: ${e.description}`);
      }
    }
  }
}

main().catch(console.error);
