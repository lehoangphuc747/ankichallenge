import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '../discord-export/ocr-results.json'), 'utf8'));

let userMap = {};
const userMapPath = path.join(__dirname, '../discord-export/user-map.json');
if (fs.existsSync(userMapPath)) {
  userMap = JSON.parse(fs.readFileSync(userMapPath, 'utf8'));
}

const days = ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7', 'day8', 'day9'];
const dates = {
  day1: '01/09/2026',
  day2: '02/09/2026',
  day3: '03/09/2026',
  day4: '04/09/2026',
  day5: '05/09/2026',
  day6: '06/09/2026',
  day7: '07/09/2026',
  day8: '08/09/2026',
  day9: '09/09/2026'
};

const userAgg = {};
const singleDayRecords = [];
const dailySummary = [];

let grandTotalCards = 0;
let grandTotalCheckins = 0;

for (const d of days) {
  const dayData = raw[d] || {};
  const entries = Object.entries(dayData);
  
  // Deduplicate per user per day
  const userBestEntry = new Map();

  for (const [key, item] of entries) {
    if (key === '1532000627121721516' || item.user === '(bot)' || item.detail === 'bot / admin message') continue;
    const discordId = item.discordId || (userMap[key] ? key : null);
    let userName = item.user || (discordId ? userMap[discordId] : null) || `User ${key}`;
    if (discordId && userMap[discordId]) {
      userName = userMap[discordId];
    }
    if (userName === 'Check-in') continue;
    // Clean up any trailing discord tags like #8722 if wanted, or keep consistent
    userName = userName.replace(/#\d{4}$/, '').trim();

    const cards = Number(item.cards) || 0;
    const minutes = Number(item.minutes) || 0;
    const streak = item.streak != null ? Number(item.streak) : null;
    const deck = item.deck || null;
    const detail = item.detail || '';
    const imageDesc = item.image_content_desc || '';

    const entryObj = {
      id: key,
      discordId: discordId || key,
      day: d,
      date: dates[d],
      user: userName,
      cards,
      minutes,
      streak,
      deck,
      detail,
      imageDesc
    };

    const existing = userBestEntry.get(userName);
    if (!existing || cards > existing.cards) {
      userBestEntry.set(userName, entryObj);
    }
  }

  const dayRecords = Array.from(userBestEntry.values());
  let dayCards = 0;
  let dayMinutes = 0;

  for (const entry of dayRecords) {
    dayCards += entry.cards;
    dayMinutes += entry.minutes;
    singleDayRecords.push(entry);

    if (!userAgg[entry.user]) {
      userAgg[entry.user] = {
        user: entry.user,
        discordId: entry.discordId,
        totalCards: 0,
        daysCount: 0,
        totalMinutes: 0,
        maxStreak: 0,
        maxSingleDay: 0,
        daysJoined: [],
        decks: new Set()
      };
    }

    userAgg[entry.user].totalCards += entry.cards;
    userAgg[entry.user].daysCount += 1;
    userAgg[entry.user].totalMinutes += entry.minutes;
    if (entry.streak && entry.streak > userAgg[entry.user].maxStreak) {
      userAgg[entry.user].maxStreak = entry.streak;
    }
    if (entry.cards > userAgg[entry.user].maxSingleDay) {
      userAgg[entry.user].maxSingleDay = entry.cards;
    }
    userAgg[entry.user].daysJoined.push(d);
    if (entry.deck) {
      userAgg[entry.user].decks.add(entry.deck);
    }
  }

  grandTotalCards += dayCards;
  grandTotalCheckins += dayRecords.length;

  dayRecords.sort((a, b) => b.cards - a.cards);

  dailySummary.push({
    day: d,
    dayLabel: d.toUpperCase().replace('DAY', 'Day '),
    date: dates[d],
    totalCards: dayCards,
    totalUsers: dayRecords.length,
    totalMinutes: Math.round(dayMinutes),
    avgCardsPerUser: dayRecords.length > 0 ? Math.round(dayCards / dayRecords.length) : 0,
    records: dayRecords
  });
}

// Convert decks Set to Array
const userRankings = Object.values(userAgg).map(u => ({
  ...u,
  decks: Array.from(u.decks),
  avgMinutesPerDay: u.daysCount > 0 ? Math.round((u.totalMinutes / u.daysCount) * 10) / 10 : 0
}));

userRankings.sort((a, b) => b.totalCards - a.totalCards);
singleDayRecords.sort((a, b) => b.cards - a.cards);

// Calculate Deck Categories
let japaneseCount = 0;
let englishCount = 0;
let medicalCount = 0;
let otherCount = 0;

for (const r of singleDayRecords) {
  const txt = `${r.deck || ''} ${r.detail || ''} ${r.user || ''} ${r.imageDesc || ''}`.toLowerCase();
  if (txt.includes('n1') || txt.includes('n2') || txt.includes('n3') || txt.includes('kanji') || txt.includes('nhật') || txt.includes('hsk') || txt.includes('hàn') || txt.includes('topik') || txt.includes('chinese') || txt.includes('japanese') || txt.includes('tango')) {
    japaneseCount++;
  } else if (txt.includes('ielts') || txt.includes('toeic') || txt.includes('english') || txt.includes('anh') || txt.includes('oxford') || txt.includes('vocab')) {
    englishCount++;
  } else if (txt.includes('y') || txt.includes('sản') || txt.includes('med') || txt.includes('dược') || txt.includes('anatomy') || txt.includes('bệnh') || txt.includes('thuốc')) {
    medicalCount++;
  } else {
    otherCount++;
  }
}

const statsData = {
  meta: {
    title: 'Thống Kê Anki Challenge 11 (Day 1 - Day 9)',
    generatedAt: new Date().toISOString(),
    daysAvailable: days.map(d => d.toUpperCase().replace('DAY', 'Day '))
  },
  kpi: {
    totalCards: grandTotalCards,
    totalCheckins: grandTotalCheckins,
    uniqueUsers: Object.keys(userAgg).length,
    maxSingleDayCards: singleDayRecords.length > 0 ? singleDayRecords[0].cards : 0,
    topSingleUser: singleDayRecords.length > 0 ? singleDayRecords[0].user : '',
    topAggregateUser: userRankings.length > 0 ? userRankings[0].user : '',
    topAggregateCards: userRankings.length > 0 ? userRankings[0].totalCards : 0
  },
  deckCategories: {
    japanese: japaneseCount,
    english: englishCount,
    medical: medicalCount,
    other: otherCount
  },
  dailySummary,
  userRankings,
  topSingleDayRecords: singleDayRecords.slice(0, 30)
};

const srcDir = path.join(__dirname, '../src/data');
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir, { recursive: true });
}

fs.writeFileSync(path.join(srcDir, 'ac11_stats.json'), JSON.stringify(statsData, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/data/ac11_stats.json'), JSON.stringify(statsData, null, 2), 'utf8');

console.log('Successfully generated src/data/ac11_stats.json and public/data/ac11_stats.json!');
console.log('KPI:', JSON.stringify(statsData.kpi, null, 2));
console.log('Daily Summary:');
for (const ds of dailySummary) {
  console.log(`- ${ds.dayLabel} (${ds.date}): ${ds.totalCards.toLocaleString()} cards, ${ds.totalUsers} users, ${ds.totalMinutes} mins, avg ${ds.avgCardsPerUser} cards/user`);
}
