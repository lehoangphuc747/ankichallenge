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

const userMap = JSON.parse(fs.readFileSync('discord-export/user-map.json', 'utf8'));

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

async function analyzeThread(threadId, label) {
  const msgs = await getThreadMessages(threadId);
  console.log(`\n=============================`);
  console.log(`=== ${label} (${msgs.length} messages) ===`);
  console.log(`=============================`);

  const checkins = [];

  for (const m of msgs) {
    // Check if it's a checkin reply or user message
    let userId = null;
    let userName = null;
    let manualCards = null;
    let manualMinutes = null;
    let imageUrl = null;
    let text = m.content || '';

    // If bot response
    if (m.author.id === '1532000627121721516') {
      const matchTag = text.match(/<@(\d+)>/);
      if (matchTag) {
        userId = matchTag[1];
        userName = userMap[userId] || m.interaction?.user?.username || userId;
      }
      const matchCards = text.match(/(\d+)\s+thẻ/);
      if (matchCards) manualCards = Number(matchCards[1]);
      const matchMins = text.match(/(\d+(?:\.\d+)?)\s+phút/);
      if (matchMins) manualMinutes = Number(matchMins[1]);
      if (m.attachments && m.attachments.length > 0) {
        imageUrl = m.attachments[0].url;
      }
      if (m.embeds && m.embeds.length > 0) {
        for (const emb of m.embeds) {
          if (emb.image?.url) imageUrl = emb.image.url;
        }
      }
      if (text.includes('check-in ngày') && text.includes('thành công')) {
        checkins.push({
          msgId: m.id,
          userId,
          userName,
          manualCards,
          manualMinutes,
          imageUrl,
          timestamp: m.timestamp,
          type: 'bot_checkin_success',
          raw: text
        });
      } else if (text.includes('GIẤY BÁO NỢ')) {
        console.log(`[Debt Ledger] ${text.slice(0, 100)}...`);
      }
    } else {
      // User direct message
      userId = m.author.id;
      userName = userMap[userId] || m.author.global_name || m.author.username;
      const imgs = (m.attachments || []).map(a => a.url);
      checkins.push({
        msgId: m.id,
        userId,
        userName,
        manualCards: null,
        manualMinutes: null,
        imageUrl: imgs[0] || null,
        timestamp: m.timestamp,
        type: 'user_message',
        raw: text
      });
    }
  }

  console.log(`Found ${checkins.length} checkins/messages:`);
  for (const c of checkins) {
    console.log(`- [${c.userName}] (${c.userId}): cards=${c.manualCards}, mins=${c.manualMinutes}, img=${c.imageUrl ? 'YES' : 'NO'}, time=${c.timestamp}`);
    console.log(`  Preview: ${c.raw.replace(/\n/g, ' ')}`);
  }

  return checkins;
}

async function main() {
  const d15 = await analyzeThread('1549159263291572325', 'D15-15/09');
  const d16 = await analyzeThread('1549510735774744587', 'D16-16/09');
}

main().catch(console.error);
