import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

// Read DISCORD_TOKEN from .env
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

// All target threads to export
const THREAD_CONFIGS = [
  { id: '1544031612549726208', dayDir: 'day1', label: 'Day 1 (01/09)' },
  { id: '1544396925833445528', dayDir: 'day2', label: 'Day 2 (02/09) - thread 1' },
  { id: '1544751086986985652', dayDir: 'day2_extra', label: 'Day 2 (02/09) - thread 2' },
  { id: '1544752162708652052', dayDir: 'day3', label: 'Day 3 (03/09)' },
  { id: '1545123177485832204', dayDir: 'day4', label: 'Day 4 (04/09)' },
  { id: '1545488464038990035', dayDir: 'day5', label: 'Day 5 (05/09)' },
  { id: '1545856494027804774', dayDir: 'day6', label: 'Day 6 (06/09) - thread 1' },
  { id: '1546166489353293979', dayDir: 'day6_extra', label: 'Day 6 (06/09) - thread 2' },
  { id: '1546165497014517781', dayDir: 'day7', label: 'Day 7 (07/09) - thread 1' },
  { id: '1546231844792705064', dayDir: 'day7_extra', label: 'Day 7 (07/09) - thread 2' },
  { id: '1546616658850750596', dayDir: 'day8', label: 'Day 8 (08/09)' },
  { id: '1546969670970507406', dayDir: 'day9', label: 'Day 9 (09/09)' },
  { id: '1547329911511842847', dayDir: 'day10', label: 'Day 10 (10/09)' },
  { id: '1547690101578924072', dayDir: 'day11', label: 'Day 11 (11/09)' },
  { id: '1548052644205957230', dayDir: 'day12', label: 'Day 12 (12/09)' },
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
    const req = https.get(url, { timeout: 10000 }, res => {
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

// Extract checkin info from bot message content
function parseBotCheckin(content) {
  // Format: ✅ <@1375756159834783755> check-in ngày **06/09/2026** thành công (cập nhật lần 2)!
  // 📊 **Bạn tự khai:** 572 thẻ trong 65 phút
  // 🏆 1 / 38 · 🔥 6 · 📈 100%
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
  console.log(`Processing ${label} [Thread ID: ${threadId}] -> dir: ${dayDir}`);
  console.log(`========================================`);

  const outDir = path.join(process.cwd(), 'discord-export', dayDir);
  const imgDir = path.join(outDir, 'images');
  fs.mkdirSync(imgDir, { recursive: true });

  // 1. Fetch all messages in thread with pagination
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

    // Case A: User uploaded direct attachments
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
          console.log(`  [Attachment] Downloaded image for ${author}: ${fname}`);
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

    // Case B: Bot checkin embed image
    const checkinInfo = m.author?.username === 'Check-in' && content.includes('check-in ngày')
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
          // Name with target user id + message id
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
              console.log(`  [Embed] Downloaded checkin image for <@${targetId}>: ${fname}`);
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

  // Write chat.json
  fs.writeFileSync(path.join(outDir, 'chat.json'), JSON.stringify(rows, null, 2), 'utf8');

  // Write chat.md
  const mdLines = rows.map(r => {
    let s = `- **${r.author}** (\`${r.authorId}\`) — ${r.timestamp}\n`;
    if (r.content) s += `  ${r.content.replace(/\r?\n/g, '\n  ')}\n`;
    for (const img of r.images) {
      if (img.localFile) {
        s += `  🖼 [${img.source}] \`${img.localFile}\`${img.targetDiscordId ? ` (User: <@${img.targetDiscordId}>)` : ''}\n`;
      } else if (img.error) {
        s += `  ⚠️ Failed: ${img.error}\n`;
      }
    }
    return s;
  });
  fs.writeFileSync(path.join(outDir, 'chat.md'), mdLines.join('\n'), 'utf8');

  console.log(`Done ${label}: ${rows.length} messages, ${downloadedCount} new images downloaded, ${skippedCount} skipped (already exists).`);
}

async function main() {
  for (const cfg of THREAD_CONFIGS) {
    try {
      await exportThread(cfg);
    } catch (e) {
      console.error(`Error processing ${cfg.label}:`, e);
    }
  }
  console.log('\nAll daily threads exported and images synchronized successfully!');
}

main().catch(console.error);
