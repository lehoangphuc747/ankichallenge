import fs from 'node:fs';

const stats = JSON.parse(fs.readFileSync('src/data/ac11_stats.json', 'utf8'));
const ocr = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

// Build complete user attendance & cards matrix Day 1 to Day 16
const days = ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7', 'day8', 'day9', 'day10', 'day11', 'day12', 'day13', 'day14', 'day15', 'day16'];

// Map user to daily cards
const userMatrix = {};

for (const day of days) {
  const dayData = ocr[day] || {};
  for (const [key, item] of Object.entries(dayData)) {
    if (key === '1532000627121721516' || item.user === '(bot)' || item.detail === 'bot / admin message' || item.user === 'Check-in') continue;
    let u = item.user;
    if (!u) continue;
    u = u.replace(/#\d{4}$/, '').trim();
    if (!userMatrix[u]) {
      userMatrix[u] = {};
    }
    const cards = Number(item.cards) || 0;
    // keep max if multiple
    if (!userMatrix[u][day] || cards > userMatrix[u][day].cards) {
      userMatrix[u][day] = { cards, minutes: item.minutes, detail: item.detail };
    }
  }
}

// Analyze each user
const analysis = [];

for (const [userName, dayMap] of Object.entries(userMatrix)) {
  let d1_d14_days = 0;
  let d1_d14_cards = 0;
  for (let i = 1; i <= 14; i++) {
    const d = `day${i}`;
    if (dayMap[d]) {
      d1_d14_days++;
      d1_d14_cards += dayMap[d].cards;
    }
  }
  const avgCardsD1_D14 = d1_d14_days > 0 ? Math.round(d1_d14_cards / d1_d14_days) : 0;

  const d15_cards = dayMap.day15 ? dayMap.day15.cards : null;
  const d16_cards = dayMap.day16 ? dayMap.day16.cards : null;

  analysis.push({
    user: userName,
    d1_d14_days,
    d1_d14_attendance: Math.round((d1_d14_days / 14) * 100),
    avgCardsD1_D14,
    d15_cards,
    d16_cards
  });
}

// Filter users who studied regularly (at least 10/14 days or > 70% attendance)
const regularLearners = analysis.filter(u => u.d1_d14_days >= 9);

regularLearners.sort((a, b) => b.d1_d14_attendance - a.d1_d14_attendance || b.avgCardsD1_D14 - a.avgCardsD1_D14);

console.log('=== NHỮNG BẠN HỌC ĐỀU (D1 - D14 >= 9 ngày) VÀ TÌNH HÌNH D15, D16 ===');
for (const u of regularLearners) {
  console.log(
    `${u.user.padEnd(25)} | D1-D14: ${u.d1_d14_days}/14 ngày (${u.d1_d14_attendance}%), avg ${u.avgCardsD1_D14} thẻ/ngày | D15: ${u.d15_cards !== null ? u.d15_cards : 'VẮNG/CHƯA GHI'} | D16: ${u.d16_cards !== null ? u.d16_cards : 'VẮNG/CHƯA GHI'}`
  );
}
