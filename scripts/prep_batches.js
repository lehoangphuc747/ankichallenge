import fs from 'node:fs';
import path from 'node:path';

const newBatch = JSON.parse(fs.readFileSync('discord-export/batch15_queue.json', 'utf8'));

// User mapping to get names
const userMap = JSON.parse(fs.readFileSync('discord-export/user-map.json', 'utf8'));

const batch1 = []; // Day 6, 10, 11, 12, 13
const batch2 = []; // Day 14
const batch3 = []; // Day 15, 16

for (const it of newBatch) {
  const absPath = path.resolve(it.image);
  const userName = userMap[it.targetDiscordId]?.name || userMap[it.targetDiscordId]?.discordNickname || it.targetDiscordId;
  const item = {
    dayKey: it.dayKey,
    discordId: it.targetDiscordId,
    user: userName,
    msgId: it.msgId,
    claimedCards: it.claimedCards,
    claimedMinutes: it.claimedMinutes,
    absPath: absPath
  };

  if (['day6', 'day10', 'day11', 'day12', 'day13'].includes(it.dayKey)) {
    batch1.push(item);
  } else if (it.dayKey === 'day14') {
    batch2.push(item);
  } else {
    batch3.push(item);
  }
}

console.log(`Batch 1 (Catch-up D6, D10-13): ${batch1.length} images`);
console.log(`Batch 2 (Day 14): ${batch2.length} images`);
console.log(`Batch 3 (Day 15 & 16): ${batch3.length} images`);

fs.writeFileSync('discord-export/subagent_batch1.json', JSON.stringify(batch1, null, 2), 'utf8');
fs.writeFileSync('discord-export/subagent_batch2.json', JSON.stringify(batch2, null, 2), 'utf8');
fs.writeFileSync('discord-export/subagent_batch3.json', JSON.stringify(batch3, null, 2), 'utf8');
