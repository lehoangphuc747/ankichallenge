import fs from 'node:fs';

const pending = JSON.parse(fs.readFileSync('discord-export/truly_pending_ocr.json', 'utf8'));

// Enrich with user name from users.json
let usersMap = {};
if (fs.existsSync('public/data/users.json')) {
  const uData = JSON.parse(fs.readFileSync('public/data/users.json', 'utf8'));
  const list = uData.data || uData;
  list.forEach(u => {
    usersMap[u.discordId] = u.name;
  });
}

const enriched = pending.map(p => ({
  ...p,
  userName: usersMap[p.discordId] || p.author
}));

const batch1 = enriched.slice(0, 13);
const batch2 = enriched.slice(13);

fs.writeFileSync('discord-export/batch_pending_1.json', JSON.stringify(batch1, null, 2), 'utf8');
fs.writeFileSync('discord-export/batch_pending_2.json', JSON.stringify(batch2, null, 2), 'utf8');

console.log(`Created batch 1 (${batch1.length} items) and batch 2 (${batch2.length} items)`);
