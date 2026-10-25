import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

const envFile = fs.readFileSync('.env', 'utf8');
let token = '';
for (const line of envFile.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (trimmed.startsWith('DISCORD_TOKEN=')) {
    token = trimmed.substring('DISCORD_TOKEN='.length).trim().replace(/^['"]|['"]$/g, '');
  }
}

function request(apiPath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'discord.com',
      port: 443,
      path: apiPath,
      method: 'GET',
      headers: {
        'Authorization': `Bot ${token}`,
        'User-Agent': 'AnkiChallengeBot/1.0'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function getThreads() {
  const active = await request('/api/v10/guilds/867268399687663616/threads/active');
  const threads = [];
  if (active.threads) {
    for (const t of active.threads) {
      if (t.parent_id === '1541493820242264256' || t.name.startsWith('D')) {
        threads.push(t);
      }
    }
  }
  const archived = await request('/api/v10/channels/1541493820242264256/threads/archived/public');
  if (archived.threads) {
    for (const t of archived.threads) {
      threads.push(t);
    }
  }

  // Filter threads Day 49+
  const targetThreads = threads.filter(t => {
    const m = t.name.match(/^D(\d+)/i);
    return m && parseInt(m[1]) >= 49;
  });

  targetThreads.sort((a, b) => {
    const ma = parseInt(a.name.match(/^D(\d+)/i)[1]);
    const mb = parseInt(b.name.match(/^D(\d+)/i)[1]);
    return ma - mb;
  });

  return targetThreads;
}

async function main() {
  const ocrData = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));
  let userMap = {};
  if (fs.existsSync('discord-export/user-map.json')) {
    userMap = JSON.parse(fs.readFileSync('discord-export/user-map.json', 'utf8'));
  }

  const threads = await getThreads();
  console.log(`Found ${threads.length} threads from D49+:`, threads.map(t => `${t.name} (${t.id})`));

  const imgDir = 'discord-export/images_d50_d55';
  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

  const pending = [];
  const textMessages = [];

  for (const t of threads) {
    const dayNum = parseInt(t.name.match(/^D(\d+)/i)[1]);
    const dayKey = `day${dayNum}`;
    ocrData[dayKey] = ocrData[dayKey] || {};

    console.log(`\n================ Thread ${t.name} (${t.id}) ================`);
    const msgs = await request(`/api/v10/channels/${t.id}/messages?limit=100`);
    if (!Array.isArray(msgs)) {
      console.log('Error fetching msgs:', msgs);
      continue;
    }

    console.log(`Fetched ${msgs.length} messages.`);
    // Chronological order
    msgs.reverse();

    for (const m of msgs) {
      let userId = m.author.id;
      let userName = m.author.global_name || m.author.username;

      // Check if bot check-in confirmation message
      const botMatch = m.content.match(/<@(\d+)>\s+check-in\s+ngày\s+\*\*([0-9/]+)\*\*/i);
      if (botMatch) {
        userId = botMatch[1];
      }

      if (userMap[userId]) {
        userName = userMap[userId];
      }

      // Collect attachments or embeds
      const images = [];
      if (m.attachments?.length) {
        for (const a of m.attachments) {
          if (a.content_type?.startsWith('image/') || a.url.match(/\.(png|jpe?g|webp)/i)) {
            images.push({ url: a.url, filename: a.filename });
          }
        }
      }
      if (m.embeds?.length) {
        for (const emb of m.embeds) {
          if (emb.image?.url) {
            images.push({ url: emb.image.url, filename: 'embed.png' });
          }
        }
      }

      // Log text if user mentions cards, checkin or numbers
      if (m.content) {
        textMessages.push({
          day: dayNum,
          dayKey,
          msgId: m.id,
          userId,
          userName,
          content: m.content
        });
      }

      if (images.length === 0) continue;

      // Check if already in ocrData (for day49 or existing)
      const existing = ocrData[dayKey][userId];
      if (existing && existing.cards != null && existing.cards > 0 && dayNum < 50) {
        console.log(`- [ALREADY RECORDED] Day ${dayNum} | ${userName} (${userId}): ${existing.cards} cards`);
        continue;
      }

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const extMatch = img.url.match(/\.(png|jpe?g|webp)/i);
        const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
        const filename = `d${dayNum}_${userId}_${m.id}_${i}.${ext}`;
        const localPath = path.join(imgDir, filename);

        pending.push({
          day: dayNum,
          dayKey,
          msgId: m.id,
          userId,
          userName,
          content: m.content,
          imgUrl: img.url,
          filename,
          localPath
        });
      }
    }
  }

  console.log(`\nFound ${pending.length} check-in images to download.`);

  for (let i = 0; i < pending.length; i++) {
    const item = pending[i];
    if (!fs.existsSync(item.localPath)) {
      try {
        await download(item.imgUrl, item.localPath);
        console.log(`[${i + 1}/${pending.length}] Downloaded ${item.filename}`);
      } catch (err) {
        console.error(`Error downloading ${item.filename}: ${err.message}`);
      }
    } else {
      console.log(`[${i + 1}/${pending.length}] Exists ${item.filename}`);
    }
  }

  fs.writeFileSync('discord-export/pending_d50_d55.json', JSON.stringify(pending, null, 2), 'utf8');
  fs.writeFileSync('discord-export/messages_d50_d55.json', JSON.stringify(textMessages, null, 2), 'utf8');
  console.log('Saved pending list to discord-export/pending_d50_d55.json');
}

main().catch(console.error);
