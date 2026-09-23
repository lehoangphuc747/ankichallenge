import fs from 'node:fs';

for (let i = 1; i <= 3; i++) {
  const b = JSON.parse(fs.readFileSync(`discord-export/subagent_batch${i}.json`, 'utf8'));
  console.log(`\n================ BATCH ${i} (${b.length} items) ================`);
  b.forEach((item, idx) => {
    console.log(`${idx + 1}. [${item.dayKey}] ${item.user} (${item.discordId}): ${item.absPath}`);
  });
}
