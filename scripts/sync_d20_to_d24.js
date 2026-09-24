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

const TARGET_THREADS = [
  { id: '1550588972646932571', dayDir: 'day19', label: 'Day 19 (19/09)' },
  { id: '1550947554156478535', dayDir: 'day20', label: 'Day 20 (20/09)' },
  { id: '1551311218726281339', dayDir: 'day21', label: 'Day 21 (21/09)' },
  { id: '1551696795011387473', dayDir: 'day22', label: 'Day 22 (22/09)' },
  { id: '1552047103868411915', dayDir: 'day23', label: 'Day 23 (23/09)' },
  { id: '1552408839817531503', dayDir: 'day24', label: 'Day 24 (24/09)' },
];

function api(urlPath) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'discord.com',
      path: `/api/v10${urlPath}`,
      method: 'GET',
      headers: {
        'Authorization': `Bot ${token}`,
        'User-Agent': 'DiscordBot (https://ankichallenge.pages.dev, 1.0)'
      }
    };
    const req = https.request(opts, res => {
      let b = [];
      res.on('data', d => b.push(d));
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

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 15000 }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP status ${res.statusCode}`));
      }
      const ws = fs.createWriteStream(dest);
      res.pipe(ws);
      ws.on('finish', () => ws.close(resolve));
      ws.on('error', reject);
    });
    req.on('timeout', () => {
      req.destroy(new Error('Download timed out'));
    });
    req.on('error', reject);
  });
}

function parseBotCheckin(content) {
  const userMatch = content.match(/<@(\d+)>/);
  const dateMatch = content.match(/ngày \*\*([^*]+)\*\*/);
  const cardsMatch = content.match(/(\d+)\s*thẻ/);
  const minsMatch = content.match(/(\d+(?:\.\d+)?)\s*phút/);
  const streakMatch = content.match(/🔥\s*(\d+)/);
  const rankMatch = content.match(/🏆\s*(\d+)\s*\/\s*(\d+)/);
  const pctMatch = content.match(/📈\s*(\d+)%/);

  return {
    targetDiscordId: userMatch ? userMatch[1] : null,
    checkinDate: dateMatch ? dateMatch[1] : null,
    claimedCards: cardsMatch ? parseInt(cardsMatch[1], 10) : null,
    claimedMinutes: minsMatch ? parseFloat(minsMatch[1]) : null,
    streak: streakMatch ? parseInt(streakMatch[1], 10) : null,
    rank: rankMatch ? parseInt(rankMatch[1], 10) : null,
    totalUsers: rankMatch ? parseInt(rankMatch[2], 10) : null,
    disciplinePercentage: pctMatch ? parseInt(pctMatch[1], 10) : null,
  };
}

async function exportThread(threadCfg) {
  const { id: threadId, dayDir, label } = threadCfg;
  console.log(`\n========================================`);
  console.log(`Syncing ${label} [Thread ID: ${threadId}] -> dir: ${dayDir}`);
  console.log(`========================================`);

  const outDir = path.join(process.cwd(), 'discord-export', dayDir);
  const imgDir = path.join(outDir, 'images');
  fs.mkdirSync(imgDir, { recursive: true });

  const allMsgs = [];
  let before;
  while (true) {
    const qs = new URLSearchParams({ limit: '100' });
    if (before) qs.set('before', before);
    const { status, json } = await api(`/channels/${threadId}/messages?${qs}`);
    if (status !== 200) {
      console.error(`Failed to fetch messages for thread ${threadId}: HTTP ${status}`, json);
      break;
    }
    if (!Array.isArray(json) || json.length === 0) break;
    allMsgs.push(...json);
    if (json.length < 100) break;
    before = json[json.length - 1].id;
  }

  allMsgs.reverse();
  console.log(`Total messages in thread: ${allMsgs.length}`);

  const rows = [];
  let downloadedCount = 0;
  let skippedCount = 0;

  for (const m of allMsgs) {
    const author = m.author?.global_name || m.author?.username || 'unknown';
    const authorId = m.author?.id || 'unknown';
    const authorAvatar = m.author?.avatar
      ? `https://cdn.discordapp.com/avatars/${authorId}/${m.author.avatar}.png?size=128`
      : null;
    const content = m.content || '';

    const savedAttachments = [];

    // Direct attachments
    const attachments = m.attachments || [];
    for (let i = 0; i < attachments.length; i++) {
      const a = attachments[i];
      const ext = path.extname(a.filename).toLowerCase() || '.png';
      const fname = `${authorId}_${i}${ext}`;
      const dest = path.join(imgDir, fname);

      if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
        skippedCount++;
        savedAttachments.push({
          source: 'attachment',
          id: a.id,
          filename: a.filename,
          localFile: `images/${fname}`,
          size: fs.statSync(dest).size,
          contentType: a.content_type,
          url: a.url
        });
      } else {
        try {
          await downloadFile(a.url, dest);
          downloadedCount++;
          savedAttachments.push({
            source: 'attachment',
            id: a.id,
            filename: a.filename,
            localFile: `images/${fname}`,
            size: fs.statSync(dest).size,
            contentType: a.content_type,
            url: a.url
          });
        } catch (err) {
          console.error(`  [Attachment] Failed ${a.url}:`, err.message);
          savedAttachments.push({ source: 'attachment', id: a.id, filename: a.filename, error: err.message, url: a.url });
        }
      }
    }

    // Bot checkin embed image
    const checkinInfo = (m.author?.username === 'Check-in' || m.author?.bot) && (content.includes('check-in ngày') || content.includes('thành công'))
      ? parseBotCheckin(content)
      : null;

    if (m.embeds && m.embeds.length > 0) {
      for (let i = 0; i < m.embeds.length; i++) {
        const emb = m.embeds[i];
        const embImgUrl = emb.image?.url || emb.thumbnail?.url;
        if (embImgUrl) {
          const targetId = checkinInfo?.targetDiscordId || authorId;
          const extMatch = embImgUrl.match(/\.(png|jpg|jpeg|webp|gif)/i);
          const ext = extMatch ? `.${extMatch[1].toLowerCase()}` : '.png';
          const fname = `bot_${targetId}_${m.id}_${i}${ext}`;
          const dest = path.join(imgDir, fname);

          if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
            skippedCount++;
            savedAttachments.push({
              source: 'embed',
              targetDiscordId: targetId,
              localFile: `images/${fname}`,
              size: fs.statSync(dest).size,
              url: embImgUrl
            });
          } else {
            try {
              await downloadFile(embImgUrl, dest);
              downloadedCount++;
              savedAttachments.push({
                source: 'embed',
                targetDiscordId: targetId,
                localFile: `images/${fname}`,
                size: fs.statSync(dest).size,
                url: embImgUrl
              });
            } catch (err) {
              console.error(`  [Embed] Failed ${embImgUrl}:`, err.message);
              savedAttachments.push({ source: 'embed', targetDiscordId: targetId, error: err.message, url: embImgUrl });
            }
          }
        }
      }
    }

    rows.push({
      id: m.id,
      author,
      authorId,
      authorAvatar,
      timestamp: m.timestamp,
      content,
      checkinInfo,
      embedsCount: m.embeds?.length || 0,
      images: savedAttachments
    });
  }

  const chatPath = path.join(outDir, 'chat.json');
  fs.writeFileSync(chatPath, JSON.stringify(rows, null, 2), 'utf8');
  console.log(`Saved ${rows.length} messages to ${chatPath}`);
  console.log(`Images: ${downloadedCount} downloaded, ${skippedCount} previously cached`);
}

async function main() {
  for (const thread of TARGET_THREADS) {
    await exportThread(thread);
  }
  console.log('\nThreads D20-D24 synced successfully!');
}

main().catch(console.error);
