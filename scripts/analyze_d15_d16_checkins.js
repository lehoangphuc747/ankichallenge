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

async function getThreadMessages(threadId) {
  let all = [];
  let before = null;
  while (true) {
    let url = `/channels/${threadId}/messages?limit=100`;
    if (before) url += `&before=${before}`;
    const res = await api(url);
    if (res.status !== 200) break;
    all.push(...res.json);
    if (res.json.length < 100) break;
    before = res.json[res.json.length - 1].id;
  }
  return all.reverse();
}

async function main() {
  const d15Msgs = await getThreadMessages('1549159263291572325');
  const d16Msgs = await getThreadMessages('1549510735774744587');

  console.log('=== PARSING D15 (15/09) ===');
  for (const m of d15Msgs) {
    console.log(`[${m.id}] Author: ${m.author.username} | Content: ${m.content.replace(/\n/g, ' ')}`);
    if (m.embeds && m.embeds.length > 0) {
      for (const emb of m.embeds) {
        console.log(`   Embed: title="${emb.title}" desc="${emb.description?.slice(0, 100)}"`);
        if (emb.fields) console.log(`   Fields:`, emb.fields);
      }
    }
    if (m.interaction) {
      console.log(`   Interaction: user=${m.interaction.user?.username} (${m.interaction.user?.id}) name=${m.interaction.name}`);
    }
  }

  console.log('\n=== PARSING D16 (16/09) ===');
  for (const m of d16Msgs) {
    console.log(`[${m.id}] Author: ${m.author.username} | Content: ${m.content.replace(/\n/g, ' ')}`);
    if (m.embeds && m.embeds.length > 0) {
      for (const emb of m.embeds) {
        console.log(`   Embed: title="${emb.title}" desc="${emb.description?.slice(0, 100)}"`);
        if (emb.fields) console.log(`   Fields:`, emb.fields);
      }
    }
    if (m.interaction) {
      console.log(`   Interaction: user=${m.interaction.user?.username} (${m.interaction.user?.id}) name=${m.interaction.name}`);
    }
  }
}

main().catch(console.error);
