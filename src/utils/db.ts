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
  realName?: string;
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
  attendanceGoal?: number;
  quotes?: string;
  ac11Approved?: boolean;
  hidden?: boolean;
  previousRank?: number;
  streak?: number;
  addonToken?: string;
  addonVerified?: boolean;
}

export interface AddonDailyStat {
  userId: number;
  challengeId: number;
  date: string;
  cardsReviewed: number;
  timeSpentSeconds: number;
  retentionRate?: number;
}

export interface StudySession {
  userId: number;
  discordId?: string;
  displayName: string;
  avatar?: string;
  cardsToday: number;
  timeTodaySeconds: number;
  lastPing?: string;
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
    realName: row.real_name || undefined,
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
    attendanceGoal: row.attendance_goal ? Number(row.attendance_goal) : undefined,
    quotes: row.quotes || undefined,
    ac11Approved: Boolean(row.ac11_approved),
    hidden: Boolean(row.hidden),
    previousRank: row.previous_rank ? Number(row.previous_rank) : undefined,
    streak: row.streak ? Number(row.streak) : 0,
    addonToken: row.addon_token || undefined,
    addonVerified: Boolean(row.addon_verified),
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
        id, name, real_name, email, discord_id, discord_nickname, avatar, role, challenge_ids,
        bio, learning, major, facebook_url, zalo_url, birth_year, place, goals, attendance_goal, quotes, hidden, previous_rank, streak, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        real_name = COALESCE(excluded.real_name, users.real_name),
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
        attendance_goal = COALESCE(excluded.attendance_goal, users.attendance_goal),
        quotes = COALESCE(excluded.quotes, users.quotes),
        hidden = excluded.hidden,
        previous_rank = COALESCE(excluded.previous_rank, users.previous_rank),
        streak = excluded.streak,
        updated_at = CURRENT_TIMESTAMP`
    )
    .bind(
      u.id,
      u.name,
      u.realName || null,
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
      u.attendanceGoal || null,
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

/**
 * Đánh dấu thành viên đã được admin duyệt đăng ký AC11 (challenge 4)
 */
export async function approveAc11InDB(db: D1Database, userId: number): Promise<boolean> {
  const result = await db
    .prepare('UPDATE users SET ac11_approved = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(userId)
    .run();
  return (result?.meta?.changes ?? 0) > 0;
}

/**
 * Đăng ký hoặc cập nhật hồ sơ người dùng tham gia thử thách trong D1
 */
export async function registerUserInDB(
  db: D1Database,
  userData: Partial<UserRow> & { name: string; discordId: string },
  challengeId: number = 3
): Promise<UserRow> {
  const existing = await getUserByDiscordId(db, userData.discordId);

  if (existing) {
    const challengeIds = new Set(existing.challengeIds || []);
    challengeIds.add(challengeId);

    const updatedUser: UserRow = {
      ...existing,
      name: userData.name || existing.name,
      realName: userData.realName !== undefined ? userData.realName : existing.realName,
      email: userData.email || existing.email,
      discordNickname: userData.discordNickname || existing.discordNickname,
      avatar: userData.avatar || existing.avatar,
      challengeIds: Array.from(challengeIds),
      bio: userData.bio !== undefined ? userData.bio : existing.bio,
      learning: userData.learning !== undefined ? userData.learning : existing.learning,
      major: userData.major !== undefined ? userData.major : existing.major,
      facebookUrl: userData.facebookUrl !== undefined ? userData.facebookUrl : existing.facebookUrl,
      zaloUrl: userData.zaloUrl !== undefined ? userData.zaloUrl : existing.zaloUrl,
      birthYear: userData.birthYear !== undefined ? userData.birthYear : existing.birthYear,
      place: userData.place !== undefined ? userData.place : existing.place,
      goals: userData.goals !== undefined ? userData.goals : existing.goals,
      attendanceGoal: userData.attendanceGoal !== undefined ? userData.attendanceGoal : existing.attendanceGoal,
      quotes: userData.quotes !== undefined ? userData.quotes : existing.quotes,
    };

    await upsertUserInDB(db, updatedUser);
    return updatedUser;
  }

  // Nếu là thành viên mới, tìm max ID hiện tại
  const maxRow = await db.prepare('SELECT MAX(id) as maxId FROM users').first();
  const nextId = (maxRow?.maxId ? Number(maxRow.maxId) : 0) + 1;

  const newUser: UserRow = {
    id: nextId,
    name: userData.name,
    realName: userData.realName,
    email: userData.email,
    discordId: userData.discordId,
    discordNickname: userData.discordNickname,
    avatar: userData.avatar,
    role: 'member',
    challengeIds: [challengeId],
    bio: userData.bio,
    learning: userData.learning,
    major: userData.major,
    facebookUrl: userData.facebookUrl,
    zaloUrl: userData.zaloUrl,
    birthYear: userData.birthYear,
    place: userData.place,
    goals: userData.goals,
    attendanceGoal: userData.attendanceGoal,
    quotes: userData.quotes,
    hidden: false,
    streak: 0,
  };

  await upsertUserInDB(db, newUser);
  return newUser;
}

/**
 * Tìm user theo Addon API Token
 */
export async function getUserByAddonToken(db: D1Database, token: string): Promise<UserRow | null> {
  if (!token) return null;
  const user = await db
    .prepare('SELECT * FROM users WHERE addon_token = ? LIMIT 1')
    .bind(token)
    .first();
  if (!user) return null;
  return formatUserRow(user);
}

/**
 * Cập nhật hoặc tạo mới Addon Token cho User
 */
export async function updateUserAddonToken(db: D1Database, userId: number, token: string): Promise<void> {
  await db
    .prepare('UPDATE users SET addon_token = ?, addon_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(token, userId)
    .run();
}

/**
 * Lưu / cập nhật thống kê học tập theo ngày từ Anki Desktop Addon (bảng addon_stats)
 */
export async function upsertAddonDailyStats(db: D1Database, stat: AddonDailyStat): Promise<void> {
  await db
    .prepare(
      `INSERT INTO addon_stats (user_id, challenge_id, date, cards_reviewed, time_spent_seconds, retention_rate, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, challenge_id, date) DO UPDATE SET
         cards_reviewed = excluded.cards_reviewed,
         time_spent_seconds = excluded.time_spent_seconds,
         retention_rate = COALESCE(excluded.retention_rate, addon_stats.retention_rate),
         updated_at = CURRENT_TIMESTAMP`
    )
    .bind(
      stat.userId,
      stat.challengeId,
      stat.date,
      stat.cardsReviewed,
      stat.timeSpentSeconds,
      stat.retentionRate || 0
    )
    .run();
}

export interface StudySession {
  userId: number;
  discordId?: string;
  displayName: string;
  avatar?: string;
  cardsToday: number;
  timeTodaySeconds: number;
  lastPing?: string;
  isFocusing?: boolean;
  pomodoroCount?: number;
  currentActivity?: string;
}

export interface CheerMessage {
  id: number;
  senderId: number;
  senderName: string;
  targetId: number;
  emoji: string;
  createdAt: number;
  isRead: boolean;
}

/**
 * Cập nhật heartbeat phiên học trực tuyến (bảng study_sessions)
 */
export async function upsertStudySession(db: D1Database, session: StudySession): Promise<void> {
  await db
    .prepare(
      `INSERT INTO study_sessions (user_id, discord_id, display_name, avatar, cards_today, time_today_seconds, is_focusing, pomodoro_count, current_activity, last_ping)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id) DO UPDATE SET
         discord_id = COALESCE(excluded.discord_id, study_sessions.discord_id),
         display_name = excluded.display_name,
         avatar = COALESCE(excluded.avatar, study_sessions.avatar),
         cards_today = excluded.cards_today,
         time_today_seconds = excluded.time_today_seconds,
         is_focusing = COALESCE(excluded.is_focusing, study_sessions.is_focusing),
         pomodoro_count = COALESCE(excluded.pomodoro_count, study_sessions.pomodoro_count),
         current_activity = COALESCE(excluded.current_activity, study_sessions.current_activity),
         last_ping = CURRENT_TIMESTAMP`
    )
    .bind(
      session.userId,
      session.discordId || null,
      session.displayName,
      session.avatar || null,
      session.cardsToday,
      session.timeTodaySeconds,
      session.isFocusing ? 1 : 0,
      session.pomodoroCount || 0,
      session.currentActivity || null
    )
    .run();
}

/**
 * Lấy danh sách thành viên đang học bài trực tuyến (active trong vòng X phút gần nhất)
 */
export async function getLiveStudySessions(db: D1Database, activeWithinMinutes: number = 15): Promise<StudySession[]> {
  try {
    const { results } = await db
      .prepare(
        `SELECT user_id, discord_id, display_name, avatar, cards_today, time_today_seconds, is_focusing, pomodoro_count, current_activity, last_ping
         FROM study_sessions
         WHERE datetime(last_ping) >= datetime('now', '-' || ? || ' minutes')
         ORDER BY cards_today DESC`
      )
      .bind(activeWithinMinutes)
      .all();

    return (results || []).map((r: any) => ({
      userId: Number(r.user_id),
      discordId: r.discord_id || undefined,
      displayName: r.display_name,
      avatar: r.avatar || undefined,
      cardsToday: Number(r.cards_today || 0),
      timeTodaySeconds: Number(r.time_today_seconds || 0),
      isFocusing: Boolean(r.is_focusing),
      pomodoroCount: Number(r.pomodoro_count || 0),
      currentActivity: r.current_activity || undefined,
      lastPing: r.last_ping,
    }));
  } catch (err) {
    console.warn('[D1 getLiveStudySessions warning]', err);
    return [];
  }
}

/**
 * Gửi một lượt cổ vũ (Cheer) đến bạn học
 */
export async function sendCheerInDB(
  db: D1Database,
  data: { senderId: number; senderName: string; targetId: number; emoji: string }
): Promise<void> {
  await db
    .prepare('INSERT INTO cheers (sender_id, sender_name, target_id, emoji, created_at, is_read) VALUES (?, ?, ?, ?, unixepoch(), 0)')
    .bind(data.senderId, data.senderName, data.targetId, data.emoji)
    .run();
}

/**
 * Lấy các lời cổ vũ chưa đọc gửi đến user
 */
export async function getUnreadCheersFromDB(db: D1Database, userId: number): Promise<CheerMessage[]> {
  try {
    const { results } = await db
      .prepare('SELECT id, sender_id, sender_name, target_id, emoji, created_at, is_read FROM cheers WHERE target_id = ? AND is_read = 0 ORDER BY id ASC LIMIT 20')
      .bind(userId)
      .all();

    return (results || []).map((r: any) => ({
      id: Number(r.id),
      senderId: Number(r.sender_id),
      senderName: r.sender_name,
      targetId: Number(r.target_id),
      emoji: r.emoji,
      createdAt: Number(r.created_at || 0),
      isRead: Boolean(r.is_read),
    }));
  } catch {
    return [];
  }
}

/**
 * Đánh dấu lời cổ vũ đã đọc
 */
export async function markCheersAsReadInDB(db: D1Database, cheerIds: number[]): Promise<void> {
  if (!cheerIds.length) return;
  const placeholders = cheerIds.map(() => '?').join(',');
  await db.prepare(`UPDATE cheers SET is_read = 1 WHERE id IN (${placeholders})`).bind(...cheerIds).run();
}

