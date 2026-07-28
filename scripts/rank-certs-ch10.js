import { readFileSync, renameSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const users = JSON.parse(readFileSync(join(__dirname, '..', 'public/data/users.json'), 'utf8'));
const challenges = JSON.parse(readFileSync(join(__dirname, '..', 'public/data/challenges.json'), 'utf8'));
const records = JSON.parse(readFileSync(join(__dirname, '..', 'public/data/challenge_10_records.json'), 'utf8'));
const outDir = join(__dirname, '..', 'output', 'certs-ch10', 'individual');

const challenge = challenges['3'];
const start = new Date(challenge.start + 'T00:00:00Z');
const end = new Date(challenge.end + 'T00:00:00Z');
const today = new Date();
const effectiveEnd = end < today ? end : today;

let totalDays = 0;
for (let d = new Date(start); d <= effectiveEnd; d.setUTCDate(d.getUTCDate() + 1)) totalDays++;

const members = users.data.filter(u => u.challengeIds?.includes(3) && u.hidden !== true);

const stats = members.map(user => {
  let studyDays = 0;
  for (let d = new Date(start); d <= effectiveEnd; d.setUTCDate(d.getUTCDate() + 1)) {
    if (records[d.toISOString().split('T')[0]]?.[String(user.id)]) studyDays++;
  }
  const discipline = totalDays > 0 ? Math.round(studyDays / totalDays * 100) : 0;
  return { id: user.id, name: user.name, studyDays, discipline };
});

stats.sort((a, b) => b.discipline - a.discipline);

let currentRank = 1;
let prevDisc = stats[0]?.discipline;
stats.forEach((s, i) => {
  if (i > 0 && s.discipline < prevDisc) currentRank = i + 1;
  s.rank = currentRank;
  prevDisc = s.discipline;
});

function slugify(input) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'member';
}

// Build name->rank mapping
const nameToRank = {};
for (const s of stats) {
  nameToRank[s.name.toLowerCase()] = s.rank;
}

const oldToNew = {
  'ha-uyen-tam.png': 'drinkwaterpls',
  'gai-con-ten-cao.png': 'Gai Cáo',
  'nguyen-ngoc-quynh-tram.png': 'Tram',
  'nguyen-vu-nhu-bich.png': 'bichnguyen',
  'nguyen-nhat-minh.png': 'TheMink',
  'ha-luu-thanh-binh.png': 'Serene Flow',
  'ngo-minh-ang.png': 'Paul',
  'tieng-han-phuc-lee.png': 'Tiếng Hàn Phúc Lee',
};

console.log('=== RENAMING OLD FILES ===\n');
let count = 0;
for (const [oldFile, newName] of Object.entries(oldToNew)) {
  const oldPath = join(outDir, oldFile);
  if (!existsSync(oldPath)) {
    console.log('NOT FOUND: ' + oldFile);
    continue;
  }

  const rank = nameToRank[newName.toLowerCase()];
  if (rank) {
    const rankStr = String(rank).padStart(2, '0');
    const newFile = rankStr + '-' + slugify(newName) + '.png';
    const newPath = join(outDir, newFile);
    if (oldPath.toLowerCase() !== newPath.toLowerCase()) {
      renameSync(oldPath, newPath);
      console.log('Rank ' + rankStr + ': ' + oldFile + '  ->  ' + newFile);
      count++;
    } else {
      console.log('SKIP (same name): ' + oldFile);
      count++;
    }
  } else {
    console.log('NO RANK for "' + newName + '" (not in BXH) -> keep as ' + oldFile);
    count++;
  }
}

console.log('\n=== Renamed ' + count + ' files ===');
