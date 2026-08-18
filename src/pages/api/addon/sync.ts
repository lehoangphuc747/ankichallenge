import type { APIRoute } from 'astro';
import { 
  getUserByAddonToken, 
  recordCheckinInDB, 
  upsertAddonDailyStats, 
  upsertStudySession, 
  getLiveStudySessions,
  getRecordsFromDB,
  getChallengesFromDB,
  getUsersFromDB
} from '../../../utils/db';

export const prerender = false;

// Helper lấy ngày hiện tại định dạng YYYY-MM-DD theo múi giờ GMT+7 (Việt Nam)
function getVietnamDateString(): string {
  const now = new Date();
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return vnTime.toISOString().slice(0, 10);
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  const db = env.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ error: 'Hệ thống cơ sở dữ liệu D1 chưa sẵn sàng trên môi trường này.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 1. Xác thực Bearer Token từ Header
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Yêu cầu mã xác thực Authorization Bearer token.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Tìm kiếm người dùng trong D1 SQLite
  const user = await getUserByAddonToken(db, token);
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Mã xác thực Addon không hợp lệ hoặc đã bị thu hồi.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 3. Đọc dữ liệu payload từ Addon
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const challengeId = Number(body.challengeId) || 3;
  const cardsReviewed = Number(body.cardsReviewed) || 0;
  const timeSpentSeconds = Number(body.timeSpentSeconds) || 0;
  const retentionRate = typeof body.retentionRate === 'number' ? body.retentionRate : undefined;
  const todayDate = body.date || getVietnamDateString();

  try {
    // 4. Ghi nhận check-in vào D1 (Tự động điểm danh khi có review thẻ)
    if (cardsReviewed > 0) {
      await recordCheckinInDB(db, challengeId, user.id, todayDate, user.discordId, 'anki_addon');
    }

    // 5. Cập nhật thống kê chi tiết vào bảng addon_stats (100% D1 SQLite)
    await upsertAddonDailyStats(db, {
      userId: user.id,
      challengeId: challengeId,
      date: todayDate,
      cardsReviewed: cardsReviewed,
      timeSpentSeconds: timeSpentSeconds,
      retentionRate: retentionRate,
    });

    // 6. Cập nhật phiên học trực tuyến (Study Together)
    await upsertStudySession(db, {
      userId: user.id,
      discordId: user.discordId,
      displayName: user.name,
      avatar: user.avatar,
      cardsToday: cardsReviewed,
      timeTodaySeconds: timeSpentSeconds,
    });

    // 7. Lấy danh sách thành viên đang cùng học (active trong 15 phút)
    const liveSessions = await getLiveStudySessions(db, 15);

    // 8. Tính toán thứ hạng và điểm kỷ luật hiện tại của người dùng
    const checkinsMap = await getRecordsFromDB(db, challengeId);
    const challengesMap = await getChallengesFromDB(db);
    const usersRes = await getUsersFromDB(db);
    
    const activeChallenge = challengesMap[String(challengeId)] || { totalDays: 100 };
    const userStudyDays = Object.values(checkinsMap).filter((dateMap) => Boolean(dateMap[user.id])).length;
    const disciplinePercentage = Math.min(100, Math.round((userStudyDays / (activeChallenge.totalDays || 100)) * 100));

    // Lấy top 10 thành viên học nhiều thẻ nhất hôm nay từ study_sessions
    const topToday = liveSessions.slice(0, 10).map((s, idx) => ({
      rank: idx + 1,
      name: s.displayName,
      avatar: s.avatar,
      cardsToday: s.cardsToday,
      timeToday: s.timeTodaySeconds,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          discordId: user.discordId,
          studyDays: userStudyDays,
          disciplinePercentage: disciplinePercentage,
          streak: user.streak || 0,
        },
        today: {
          date: todayDate,
          cardsReviewed: cardsReviewed,
          timeSpentSeconds: timeSpentSeconds,
          checkedIn: true,
        },
        community: {
          activeStudyMembers: liveSessions.length,
          topToday: topToday,
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[Addon Sync Exception]', err);
    return new Response(
      JSON.stringify({ error: `Lỗi đồng bộ dữ liệu: ${err.message || err}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
