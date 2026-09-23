import fs from 'node:fs';
import path from 'node:path';

const dayDirs = [
  { dir: 'day1', label: 'Day 1 (01/09)' },
  { dir: 'day2', label: 'Day 2 (02/09)' },
  { dir: 'day3', label: 'Day 3 (03/09)' },
  { dir: 'day4', label: 'Day 4 (04/09)' },
  { dir: 'day5', label: 'Day 5 (05/09)' },
  { dir: 'day6', label: 'Day 6 (06/09)' },
  { dir: 'day7_extra', label: 'Day 7 (07/09)' },
  { dir: 'day8', label: 'Day 8 (08/09)' },
  { dir: 'day9', label: 'Day 9 (09/09)' },
  { dir: 'day10', label: 'Day 10 (10/09)' },
  { dir: 'day11', label: 'Day 11 (11/09)' },
  { dir: 'day12', label: 'Day 12 (12/09)' },
  { dir: 'day13', label: 'Day 13 (13/09)' },
  { dir: 'day14', label: 'Day 14 (14/09)' },
  { dir: 'day15', label: 'Day 15 (15/09)' },
  { dir: 'day16', label: 'Day 16 (16/09)' },
];

const debtLedgers = [];
const pingEvents = [];

for (const d of dayDirs) {
  const p = path.join('discord-export', d.dir, 'chat.json');
  if (!fs.existsSync(p)) continue;
  const chat = JSON.parse(fs.readFileSync(p, 'utf8'));

  let hasPingInDay = false;
  const pingsInThisDay = [];

  for (const m of chat) {
    const content = m.content || '';

    // Check debt ledgers
    if (content.includes('GIẤY BÁO NỢ') || content.includes('SỔ NỢ') || content.includes('GIẤY ĐÒI NỢ') || content.includes('BẢNG ĐỐI SOÁT') || content.includes('BẢNG TỔNG HỢP SỔ NỢ')) {
      debtLedgers.push({
        thread: d.label,
        msgId: m.id,
        timestamp: m.timestamp,
        author: m.author,
        contentFirstLine: content.split('\n')[0],
        targetUsers: content.match(/<@(\d+)>/g) || []
      });
    }

    // Check /ping or reminder messages
    // Usually contains: "Nhắc nhở check-in" or mentions list of un-checked-in users or "chưa check-in"
    const isReminder = content.includes('Nhắc nhở check-in') || 
                       content.includes('nhắc nhở check-in') ||
                       (content.includes('chưa check-in') && m.authorId === '1532000627121721516') ||
                       content.includes('/ping') ||
                       (content.includes('⏳') && content.includes('Chưa check-in') && content.includes('Hôm nay'));

    if (isReminder) {
      hasPingInDay = true;
      pingsInThisDay.push({
        id: m.id,
        timestamp: m.timestamp,
        content: content.slice(0, 150)
      });
    }
  }

  pingEvents.push({
    day: d.label,
    dir: d.dir,
    hasPing: hasPingInDay,
    pings: pingsInThisDay
  });
}

console.log('================ 1. DANH SÁCH GIẤY BÁO NỢ ĐÃ GỬI ================');
const now = new Date();
for (const dl of debtLedgers) {
  const dt = new Date(dl.timestamp);
  const vnTime = new Date(dt.getTime() + 7 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19);
  const diffHours = ((now.getTime() - dt.getTime()) / (1000 * 3600)).toFixed(1);
  console.log(`- [${dl.thread}] lúc ${vnTime} VN (${diffHours} giờ trước)`);
  console.log(`  Tiêu đề: ${dl.contentFirstLine}`);
  console.log(`  Tag: ${dl.targetUsers.join(', ')}`);
}

console.log('\n================ 2. KIỂM TRA LỆNH /PING / NHẮC NHỞ CHECK-IN ================');
for (const pe of pingEvents) {
  const status = pe.hasPing ? `✅ ĐÃ PING (${pe.pings.length} lần)` : `❌ CHƯA DÙNG /PING`;
  console.log(`- ${pe.day}: ${status}`);
  if (pe.hasPing) {
    for (const p of pe.pings) {
      const dt = new Date(p.timestamp);
      const vnTime = new Date(dt.getTime() + 7 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19);
      console.log(`   + [${vnTime} VN] ${p.content.replace(/\n/g, ' ')}...`);
    }
  }
}
