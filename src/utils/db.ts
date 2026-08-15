// D1 Database helper cho Cloudflare Pages / Workers
// Cung cấp các hàm tương tác SQL với Cloudflare D1 và fallback về file JSON khi dev local không có binding D1

export interface D1Database {
  prepare(query: string): any;
  batch(statements: any[]): Promise<any[]>;
  exec(query: string): Promise<any>;
}

export interface UserRow {
  id: number;
  name: string;
  email?: string;
  discordId?: string;
  discordNickname?: string;
  avatar?: string;
  role?: string;
  challengeIds?: number[];
  bio?: string;
  learning?: string;
  major?: string;
  facebookUrl?: string;
  zaloUrl?: string;
  birthYear?: number;
  place?: string;
  goals?: string;
  quotes?: string;
  hidden?: boolean;
  previousRank?: number;
  streak?: number;
}

export interface ChallengeRow {
  id: number;
  name: string;
  start: string;
  end: string;
  certEnd?: string;
  totalDays: number;
  description?: string;
  isActive?: boolean;
}

/**
 * Format 1 user row từ DB thành format Object frontend quen thuộc
 */
function formatUserRow(row: any): UserRow {
  let challengeIds: number[] = [];
  try {
    if (row.challenge_ids) {
      challengeIds = JSON.parse(row.challenge_ids);
    }
  } catch {
    challengeIds = [];
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email || undefined,
    discordId: row.discord_id || undefined,
    discordNickname: row.discord_nickname || undefined,
    avatar: row.avatar || undefined,
    role: row.role || 'member',
    challengeIds,
    bio: row.bio || undefined,
    learning: row.learning || undefined,
    major: row.major || undefined,
    facebookUrl: row.facebook_url || undefined,
    zaloUrl: row.zalo_url || undefined,
    birthYear: row.birth_year ? Number(row.birth_year) : undefined,
    place: row.place || undefined,
    goals: row.goals || undefined,
    quotes: row.quotes || undefined,
    hidden: Boolean(row.hidden),
    previousRank: row.previous_rank ? Number(row.previous_rank) : undefined,
    streak: row.streak ? Number(row.streak) : 0,
  };
}

/**
 * Lấy danh sách users từ D1
 */
export async function getUsersFromDB(db: D1Database): Promise<{ data: UserRow[] }> {
  const { results } = await db.prepare('SELECT * FROM users ORDER BY id ASC').all();
  const users = (results || []).map(formatUserRow);
  return { data: users };
}

/**
 * Tìm user theo discord_id
 */
export async function getUserByDiscordId(db: D1Database, discordId: string): Promise<UserRow | null> {
  const user = await db
    .prepare('SELECT * FROM users WHERE discord_id = ? LIMIT 1')
    .bind(String(discordId))
    .first();
  if (!user) return null;
  return formatUserRow(user);
}

/**
 * Tìm user theo ID
 */
export async function getUserById(db: D1Database, id: number): Promise<UserRow | null> {
  const user = await db
    .prepare('SELECT * FROM users WHERE id = ? LIMIT 1')
    .bind(id)
    .first();
  if (!user) return null;
  return formatUserRow(user);
}

/**
 * Lấy danh sách challenges từ D1
 */
export async function getChallengesFromDB(db: D1Database): Promise<Record<string, ChallengeRow>> {
  const { results } = await db.prepare('SELECT * FROM challenges ORDER BY id ASC').all();
  const challenges: Record<string, ChallengeRow> = {};
  for (const ch of (results || [])) {
    challenges[String(ch.id)] = {
      id: ch.id,
      name: ch.name,
      start: ch.start_date,
      end: ch.end_date,
      certEnd: ch.cert_end || undefined,
      totalDays: ch.total_days,
      description: ch.description || undefined,
      isActive: Boolean(ch.is_active),
    };
  }
  return challenges;
}

/**
 * Lấy toàn bộ records điểm danh của 1 challenge (format { [date]: { [userId]: true } })
 */
export async function getRecordsFromDB(
  db: D1Database,
  challengeId: number
): Promise<Record<string, Record<string, boolean>>> {
  const { results } = await db
    .prepare('SELECT user_id, date FROM checkins WHERE challenge_id = ? ORDER BY date ASC')
    .bind(challengeId)
    .all();

  const records: Record<string, Record<string, boolean>> = {};
  for (const row of (results || [])) {
    const d = row.date as string;
    const uid = String(row.user_id);
    if (!records[d]) records[d] = {};
    records[d][uid] = true;
  }
  return records;
}

/**
 * Điểm danh (Check-in) vào D1 - sử dụng INSERT OR IGNORE để tránh race-condition
 */
export async function recordCheckinInDB(
  db: D1Database,
  data: {
    challengeId: number;
    userId: number;
    date: string;
    discordId?: string;
    channelId?: string;
  }
): Promise<boolean> {
  const result = await db
    .prepare(
      `INSERT INTO checkins (challenge_id, user_id, date, discord_id, channel_id) 
       VALUES (?, ?, ?, ?, ?) 
       ON CONFLICT(challenge_id, user_id, date) DO NOTHING`
    )
    .bind(
      data.challengeId,
      data.userId,
      data.date,
      data.discordId || null,
      data.channelId || null
    )
    .run();

  return (result?.meta?.changes ?? 0) > 0;
}

/**
 * Bỏ điểm danh (Uncheck) trong D1
 */
export async function removeCheckinFromDB(
  db: D1Database,
  challengeId: number,
  userId: number,
  date: string
): Promise<boolean> {
  const result = await db
    .prepare('DELETE FROM checkins WHERE challenge_id = ? AND user_id = ? AND date = ?')
    .bind(challengeId, userId, date)
    .run();

  return (result?.meta?.changes ?? 0) > 0;
}

/**
 * Cập nhật hoặc thêm mới User
 */
export async function upsertUserInDB(db: D1Database, u: UserRow): Promise<void> {
  const challengeIdsJson = JSON.stringify(u.challengeIds || []);
  await db
    .prepare(
      `INSERT INTO users (
        id, name, email, discord_id, discord_nickname, avatar, role, challenge_ids,
        bio, learning, major, facebook_url, zalo_url, birth_year, place, goals, quotes, hidden, previous_rank, streak, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        email = COALESCE(excluded.email, users.email),
        discord_id = COALESCE(excluded.discord_id, users.discord_id),
        discord_nickname = COALESCE(excluded.discord_nickname, users.discord_nickname),
        avatar = COALESCE(excluded.avatar, users.avatar),
        role = COALESCE(excluded.role, users.role),
        challenge_ids = excluded.challenge_ids,
        bio = COALESCE(excluded.bio, users.bio),
        learning = COALESCE(excluded.learning, users.learning),
        major = COALESCE(excluded.major, users.major),
        facebook_url = COALESCE(excluded.facebook_url, users.facebook_url),
        zalo_url = COALESCE(excluded.zalo_url, users.zalo_url),
        birth_year = COALESCE(excluded.birth_year, users.birth_year),
        place = COALESCE(excluded.place, users.place),
        goals = COALESCE(excluded.goals, users.goals),
        quotes = COALESCE(excluded.quotes, users.quotes),
        hidden = excluded.hidden,
        previous_rank = COALESCE(excluded.previous_rank, users.previous_rank),
        streak = excluded.streak,
        updated_at = CURRENT_TIMESTAMP`
    )
    .bind(
      u.id,
      u.name,
      u.email || null,
      u.discordId || null,
      u.discordNickname || null,
      u.avatar || null,
      u.role || 'member',
      challengeIdsJson,
      u.bio || null,
      u.learning || null,
      u.major || null,
      u.facebookUrl || null,
      u.zaloUrl || null,
      u.birthYear || null,
      u.place || null,
      u.goals || null,
      u.quotes || null,
      u.hidden ? 1 : 0,
      u.previousRank || null,
      u.streak || 0
    )
    .run();
}

/**
 * Ghi lại lịch sử đăng nhập
 */
export async function recordLoginHistoryInDB(
  db: D1Database,
  data: { userId?: number; discordId?: string; email?: string; ip?: string }
): Promise<void> {
  await db
    .prepare('INSERT INTO login_history (user_id, discord_id, email, ip) VALUES (?, ?, ?, ?)')
    .bind(data.userId || null, data.discordId || null, data.email || null, data.ip || null)
    .run();
}

/**
 * Lấy danh sách lịch sử đăng nhập từ D1 (tối đa 100 lượt gần nhất)
 */
export async function getLoginHistoryFromDB(db: D1Database): Promise<any[]> {
  const { results } = await db
    .prepare(`
      SELECT 
        lh.id,
        lh.user_id as memberId,
        u.name as memberName,
        lh.discord_id as discordId,
        COALESCE(u.discord_nickname, lh.discord_id, 'Discord User') as username,
        COALESCE(u.name, u.discord_nickname, lh.discord_id, 'Discord User') as displayName,
        COALESCE(lh.email, u.email) as email,
        COALESCE(u.avatar, 'https://cdn.discordapp.com/embed/avatars/0.png') as avatar,
        lh.logged_in_at as loggedAt
      FROM login_history lh
      LEFT JOIN users u ON lh.user_id = u.id OR lh.discord_id = u.discord_id
      ORDER BY lh.id DESC
      LIMIT 100
    `)
    .all();

  return results || [];
}

