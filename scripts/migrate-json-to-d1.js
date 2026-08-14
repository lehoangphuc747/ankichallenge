import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  return `'${String(val).replace(/'/g, "''")}'`;
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function generateMigrationSql() {
  const sqlStatements = [];

  // 1. Challenges
  const challengesFile = path.join(rootDir, 'public/data/challenges.json');
  if (fs.existsSync(challengesFile)) {
    const challenges = JSON.parse(fs.readFileSync(challengesFile, 'utf8'));
    for (const [idStr, ch] of Object.entries(challenges)) {
      const id = parseInt(idStr);
      sqlStatements.push(`INSERT OR REPLACE INTO challenges (id, name, start_date, end_date, cert_end, total_days, description) VALUES (${id}, ${escapeSql(ch.name)}, ${escapeSql(ch.start)}, ${escapeSql(ch.end)}, ${escapeSql(ch.certEnd || null)}, ${ch.totalDays || 100}, ${escapeSql(ch.description || null)});`);
    }
  }

  // 2. Users (Batching)
  const usersFile = path.join(rootDir, 'public/data/users.json');
  if (fs.existsSync(usersFile)) {
    const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    const userList = Array.isArray(usersData.data) ? usersData.data : (Array.isArray(usersData) ? usersData : []);
    
    const userRows = [];
    for (const u of userList) {
      if (!u.id) continue;
      const challengeIds = JSON.stringify(u.challengeIds || []);
      userRows.push(`(${u.id}, ${escapeSql(u.name || '')}, ${escapeSql(u.email || null)}, ${escapeSql(u.discordId || null)}, ${escapeSql(u.discordNickname || null)}, ${escapeSql(u.avatar || null)}, ${escapeSql(u.role || 'member')}, ${escapeSql(challengeIds)}, ${escapeSql(u.bio || null)}, ${escapeSql(u.learning || u.learningLanguage || null)}, ${escapeSql(u.major || null)}, ${escapeSql(u.facebookUrl || null)}, ${escapeSql(u.zaloUrl || null)}, ${u.birthYear || 'NULL'}, ${escapeSql(u.place || null)}, ${escapeSql(u.goals || null)}, ${escapeSql(u.quotes || null)}, ${u.hidden ? 1 : 0}, ${u.previousRank || 'NULL'}, ${u.streak || 0})`);
    }

    const userChunks = chunkArray(userRows, 30);
    for (const chunk of userChunks) {
      sqlStatements.push(`INSERT OR REPLACE INTO users (id, name, email, discord_id, discord_nickname, avatar, role, challenge_ids, bio, learning, major, facebook_url, zalo_url, birth_year, place, goals, quotes, hidden, previous_rank, streak) VALUES \n${chunk.join(',\n')};`);
    }
  }

  // 3. Checkins for Challenge 8, 9, 10 (Batching)
  const recordMap = {
    1: 'public/data/challenge_08_records.json',
    2: 'public/data/challenge_09_records.json',
    3: 'public/data/challenge_10_records.json',
  };

  const checkinRows = [];
  for (const [challengeIdStr, relPath] of Object.entries(recordMap)) {
    const challengeId = parseInt(challengeIdStr);
    const recFile = path.join(rootDir, relPath);
    if (!fs.existsSync(recFile)) continue;

    const records = JSON.parse(fs.readFileSync(recFile, 'utf8'));
    for (const [date, userMap] of Object.entries(records)) {
      if (!userMap || typeof userMap !== 'object') continue;
      for (const [userIdStr, isChecked] of Object.entries(userMap)) {
        if (!isChecked) continue;
        const userId = parseInt(userIdStr);
        if (isNaN(userId)) continue;
        checkinRows.push(`(${challengeId}, ${userId}, ${escapeSql(date)})`);
      }
    }
  }

  const checkinChunks = chunkArray(checkinRows, 80);
  for (const chunk of checkinChunks) {
    sqlStatements.push(`INSERT OR IGNORE INTO checkins (challenge_id, user_id, date) VALUES \n${chunk.join(',\n')};`);
  }

  const tmpDir = path.join(rootDir, 'tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const outPath = path.join(tmpDir, 'data_import.sql');
  fs.writeFileSync(outPath, sqlStatements.join('\n'), 'utf8');
  console.log(`✅ Generated batched SQL with ${sqlStatements.length} multi-row statements in ${outPath} (${checkinRows.length} checkins)`);
  return outPath;
}

generateMigrationSql();
