import fs from 'fs';
import path from 'path';

const raw = JSON.parse(fs.readFileSync('discord-export/ocr-results.json', 'utf8'));

const days = ['day1', 'day2', 'day3', 'day4'];
const dates = {
  day1: '01/09/2026',
  day2: '02/09/2026',
  day3: '03/09/2026',
  day4: '04/09/2026'
};

const userAgg = {};
const singleDayRecords = [];
const dailySummary = [];

let grandTotalCards = 0;
let grandTotalCheckins = 0;

for (const d of days) {
  const dayData = raw[d] || {};
  const entries = Object.entries(dayData);
  let dayCards = 0;
  let dayUsers = entries.length;
  let dayMinutes = 0;
  const records = [];

  for (const [key, item] of entries) {
    const cards = Number(item.cards) || 0;
    const minutes = Number(item.minutes) || 0;
    const streak = item.streak != null ? Number(item.streak) : null;
    const userName = item.user || item.file || `User ${key}`;

    dayCards += cards;
    dayMinutes += minutes;

    const entryObj = {
      id: key,
      day: d,
      date: dates[d],
      user: userName,
      cards,
      minutes,
      streak,
      deck: item.deck || null,
      detail: item.detail || ''
    };

    records.push(entryObj);
    singleDayRecords.push(entryObj);

    if (!userAgg[userName]) {
      userAgg[userName] = {
        user: userName,
        totalCards: 0,
        daysCount: 0,
        totalMinutes: 0,
        maxStreak: 0,
        maxSingleDay: 0,
        daysJoined: [],
        decks: new Set()
      };
    }

    userAgg[userName].totalCards += cards;
    userAgg[userName].daysCount += 1;
    userAgg[userName].totalMinutes += minutes;
    if (streak && streak > userAgg[userName].maxStreak) {
      userAgg[userName].maxStreak = streak;
    }
    if (cards > userAgg[userName].maxSingleDay) {
      userAgg[userName].maxSingleDay = cards;
    }
    userAgg[userName].daysJoined.push(d);
    if (item.deck) {
      userAgg[userName].decks.add(item.deck);
    }
  }

  grandTotalCards += dayCards;
  grandTotalCheckins += dayUsers;

  records.sort((a, b) => b.cards - a.cards);

  dailySummary.push({
    day: d,
    dayLabel: d.toUpperCase().replace('DAY', 'Day '),
    date: dates[d],
    totalCards: dayCards,
    totalUsers: dayUsers,
    totalMinutes: Math.round(dayMinutes),
    avgCardsPerUser: dayUsers > 0 ? Math.round(dayCards / dayUsers) : 0,
    records
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
  const txt = `${r.deck || ''} ${r.detail || ''} ${r.user || ''}`.toLowerCase();
  if (txt.includes('n1') || txt.includes('n2') || txt.includes('n3') || txt.includes('kanji') || txt.includes('nhật') || txt.includes('hsk') || txt.includes('hàn') || txt.includes('japanese') || txt.includes('tango')) {
    japaneseCount++;
  } else if (txt.includes('ielts') || txt.includes('toeic') || txt.includes('english') || txt.includes('anh') || txt.includes('oxford') || txt.includes('vocab')) {
    englishCount++;
  } else if (txt.includes('y') || txt.includes('med') || txt.includes('dược') || txt.includes('anatomy') || txt.includes('bệnh') || txt.includes('thuốc')) {
    medicalCount++;
  } else {
    otherCount++;
  }
}

const statsData = {
  meta: {
    title: 'Thống Kê Anki Challenge 11 (Day 1 - Day 4)',
    generatedAt: new Date().toISOString(),
    daysAvailable: ['Day 1', 'Day 2', 'Day 3', 'Day 4']
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
  topSingleDayRecords: singleDayRecords.slice(0, 20)
};

if (!fs.existsSync('src/data')) {
  fs.mkdirSync('src/data', { recursive: true });
}

fs.writeFileSync('src/data/ac11_stats.json', JSON.stringify(statsData, null, 2), 'utf8');
fs.writeFileSync('public/data/ac11_stats.json', JSON.stringify(statsData, null, 2), 'utf8');

console.log('Successfully generated src/data/ac11_stats.json and public/data/ac11_stats.json');
console.log('KPI:', JSON.stringify(statsData.kpi));
