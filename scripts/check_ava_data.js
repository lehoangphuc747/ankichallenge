import fs from 'node:fs';

const avaId = '895672321916960838';

// 1. Check previous post_ava_debt_ledger.js
if (fs.existsSync('scripts/post_ava_debt_ledger.js')) {
  console.log('=== PREVIOUS AVA SCRIPT ===');
  console.log(fs.readFileSync('scripts/post_ava_debt_ledger.js', 'utf8').slice(0, 1000));
}

// 2. Check ocr-results.json for Ava
const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));
console.log('\n=== AVA IN OCR RESULTS (DAY 1 - 14) ===');
for (let d = 1; d <= 14; d++) {
  const dayKey = `day${d}`;
  const dayData = ocr[dayKey] || {};
  const userEntry = dayData[avaId];
  if (userEntry) {
    console.log(`${dayKey.toUpperCase()}:`, JSON.stringify(userEntry));
  } else {
    console.log(`${dayKey.toUpperCase()}: [KHÔNG CÓ CHECK-IN / VẮNG]`);
  }
}

// 3. Check chat.json in Day 13 and Day 14
const d13Chat = JSON.parse(fs.readFileSync('discord-export/day13/chat.json', 'utf8'));
const avaD13 = d13Chat.filter(m => m.authorId === avaId || (m.checkinInfo && m.checkinInfo.targetDiscordId === avaId));
console.log('\n=== AVA IN DAY 13 CHAT ===', JSON.stringify(avaD13, null, 2));

const d14Chat = JSON.parse(fs.readFileSync('discord-export/day14/chat.json', 'utf8'));
const avaD14 = d14Chat.filter(m => m.authorId === avaId || (m.checkinInfo && m.checkinInfo.targetDiscordId === avaId));
console.log('\n=== AVA IN DAY 14 CHAT ===', JSON.stringify(avaD14, null, 2));
