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

async function fetchThread(threadId, name) {
  console.log(`\n=== Thread ${name} (${threadId}) ===`);
  let all = [];
  let before = null;
  while (true) {
    let url = `/channels/${threadId}/messages?limit=100`;
    if (before) url += `&before=${before}`;
    const res = await api(url);
    if (res.status !== 200) {
      console.log('Error fetching:', res.status, res.json);
      break;
    }
    all.push(...res.json);
    if (res.json.length < 100) break;
    before = res.json[res.json.length - 1].id;
  }
  console.log(`Total messages: ${all.length}`);
  const userMap = {};
  for (const m of all) {
    const author = m.author?.global_name || m.author?.username;
    const authorId = m.author?.id;
    if (!userMap[authorId]) {
      userMap[authorId] = { name: author, count: 0, attachments: 0, msgs: [] };
    }
    userMap[authorId].count++;
    userMap[authorId].attachments += (m.attachments || []).length;
    userMap[authorId].msgs.push({
      time: m.timestamp,
      content: m.content?.slice(0, 80),
      images: (m.attachments || []).map(a => a.url)
    });
  }
  console.log(`Unique authors: ${Object.keys(userMap).length}`);
  for (const [uid, u] of Object.entries(userMap)) {
    console.log(`  - [${u.name}] (${uid}): ${u.count} msgs, ${u.attachments} imgs`);
  }
  return { all, userMap };
}

async function main() {
  await fetchThread('1549159263291572325', 'D15-15/09');
  await fetchThread('1549510735774744587', 'D16-16/09');
}

main().catch(console.error);
