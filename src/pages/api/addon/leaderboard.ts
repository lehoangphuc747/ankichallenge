import type { APIRoute } from 'astro';
import { 
  getUsersFromDB, 
  getRecordsFromDB, 
  getChallengesFromDB, 
  getLiveStudySessions,
  getUserByAddonToken,
  getUserById,
  getUserByDiscordId
} from '../../../utils/db';
import { verifySession } from '../../../utils/session';

export const prerender = false;

// Helper lấy ngày tháng theo múi giờ GMT+7
function getVietnamDateRanges() {
  const now = new Date();
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const today = vnTime.toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(vnTime.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + '-01';
  return { today, sevenDaysAgo, monthStart };
}

async function getDiscordVoiceChannels(): Promise<any[]> {
  try {
    const res = await fetch('https://discord.com/api/v10/guilds/867268399687663616/widget.json', {
      headers: { 'User-Agent': 'AnkiVnLeaderboardAddon/1.0' },
    });
    if (!res.ok) return [];
    const data: any = await res.json();
    const channels = data.channels || [];
    const members = data.members || [];
    const memberCounts: Record<string, number> = {};
    for (const m of members) {
      if (m.channel_id) {
        memberCounts[m.channel_id] = (memberCounts[m.channel_id] || 0) + 1;
      }
    }
    channels.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
    return channels.map((ch: any) => ({
      id: ch.id,
      name: ch.name,
      userCount: memberCounts[ch.id] || 0,
      url: `https://discord.com/channels/867268399687663616/${ch.id}`,
      deepLink: `discord://discord.com/channels/867268399687663616/${ch.id}`,
    }));
  } catch {
    return [];
  }
}

export const GET: APIRoute = async ({ request, url, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  const db = env.DB;
  const sessionSecret = import.meta.env.SESSION_SECRET || env.SESSION_SECRET || 'ankivn-secret-default-key-change-in-prod';

  if (!db) {
    return new Response(
      JSON.stringify({ error: 'Hệ thống cơ sở dữ liệu D1 chưa sẵn sàng.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const challengeId = Number(url.searchParams.get('challengeId')) || 3;
  const requestedTimeframe = url.searchParams.get('timeframe') || 'season'; // 'day' | 'week' | 'month' | 'season'

  // Kiểm tra nếu có Bearer Token truyền vào
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  let callerUser: any = null;
  if (token) {
    const tokenPayload = await verifySession<any>(token, sessionSecret);
    if (tokenPayload?.userId) {
      callerUser = await getUserById(db, Number(tokenPayload.userId));
    }
    if (!callerUser && tokenPayload?.discordId) {
      callerUser = await getUserByDiscordId(db, String(tokenPayload.discordId));
    }
    if (!callerUser) {
      callerUser = await getUserByAddonToken(db, token);
    }
  }

  const { today, sevenDaysAgo, monthStart } = getVietnamDateRanges();

  try {
    // 1. Truy vấn song song dữ liệu từ D1 SQLite và Discord Widget API
    const [usersRes, checkinsMap, challengesMap, liveSessions, addonStatsRows, discordVoiceChannels] = await Promise.all([
      getUsersFromDB(db),
      getRecordsFromDB(db, challengeId),
      getChallengesFromDB(db),
      getLiveStudySessions(db, 15),
      db.prepare(
        `SELECT 
           user_id,
           SUM(CASE WHEN date = ? THEN cards_reviewed ELSE 0 END) as cards_today,
           SUM(CASE WHEN date >= ? THEN cards_reviewed ELSE 0 END) as cards_week,
           SUM(CASE WHEN date >= ? THEN cards_reviewed ELSE 0 END) as cards_month,
           SUM(cards_reviewed) as cards_total,
           SUM(CASE WHEN date = ? THEN time_spent_seconds ELSE 0 END) as time_today,
           SUM(time_spent_seconds) as time_total,
           AVG(CASE WHEN retention_rate IS NOT NULL AND retention_rate > 0 THEN retention_rate ELSE NULL END) as avg_retention
         FROM addon_stats
         WHERE challenge_id = ?
         GROUP BY user_id`
      )
      .bind(today, sevenDaysAgo, monthStart, today, challengeId)
      .all()
      .then((res: any) => res?.results || [])
      .catch(() => []),
      getDiscordVoiceChannels(),
    ]);

    const activeChallenge = challengesMap[String(challengeId)] || { totalDays: 100, name: `Anki Challenge ${challengeId}` };
    const totalDaysPossible = activeChallenge.totalDays || 100;

    // Tạo Map thống kê số thẻ theo user_id
    const statsMap: Record<number, any> = {};
    for (const row of addonStatsRows) {
      statsMap[Number(row.user_id)] = {
        cardsToday: Number(row.cards_today || 0),
        cardsWeek: Number(row.cards_week || 0),
        cardsMonth: Number(row.cards_month || 0),
        cardsTotal: Number(row.cards_total || 0),
        timeToday: Number(row.time_today || 0),
        timeTotal: Number(row.time_total || 0),
        retentionRate: row.avg_retention ? Math.round(Number(row.avg_retention) * 10) / 10 : 0,
      };
    }

    // Kết hợp thêm số thẻ realtime từ study_sessions nếu có
    for (const session of liveSessions) {
      const uid = Number(session.userId);
      if (!statsMap[uid]) {
        statsMap[uid] = { cardsToday: 0, cardsWeek: 0, cardsMonth: 0, cardsTotal: 0, timeToday: 0, timeTotal: 0, retentionRate: 0 };
      }
      if (session.cardsToday > statsMap[uid].cardsToday) {
        const diff = session.cardsToday - statsMap[uid].cardsToday;
        statsMap[uid].cardsToday = session.cardsToday;
        statsMap[uid].cardsWeek += diff;
        statsMap[uid].cardsMonth += diff;
        statsMap[uid].cardsTotal += diff;
        statsMap[uid].timeTotal += (session.timeTodaySeconds - statsMap[uid].timeToday);
        statsMap[uid].timeToday = session.timeTodaySeconds;
      }
    }

    // Lọc thành viên tham gia mùa này
    const members = usersRes.data.filter((u: any) => {
      const cIds = u.challengeIds || [];
      return cIds.includes(challengeId) && !u.hidden;
    });

    // 2. Tính toán các chỉ số cho từng thành viên
    const fullMembers = members.map((member: any) => {
      const studyDays = Object.values(checkinsMap).filter((dateMap) => Boolean(dateMap[member.id])).length;
      const disciplinePercentage = Math.min(100, Math.round((studyDays / totalDaysPossible) * 100));
      const uStats = statsMap[member.id] || { cardsToday: 0, cardsWeek: 0, cardsMonth: 0, cardsTotal: 0, timeToday: 0, timeTotal: 0, retentionRate: 0 };

      return {
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        discordNickname: member.discordNickname,
        studyDays: studyDays,
        disciplinePercentage: disciplinePercentage,
        streak: member.streak || 0,
        cardsToday: uStats.cardsToday,
        cardsWeek: uStats.cardsWeek,
        cardsMonth: uStats.cardsMonth,
        cardsTotal: uStats.cardsTotal,
        timeToday: uStats.timeToday,
        timeTotal: uStats.timeTotal,
        retentionRate: uStats.retentionRate,
      };
    });

    // 3. Hàm sắp xếp và gán thứ hạng chuẩn
    function rankList(list: any[], compareFn: (a: any, b: any) => number, keyProp: string) {
      const sorted = [...list].sort(compareFn);
      let curRank = 1;
      return sorted.map((m, idx) => {
        if (idx > 0 && compareFn(m, sorted[idx - 1]) !== 0) {
          curRank = idx + 1;
        }
        return {
          rank: curRank,
          ...m,
        };
      });
    }

    // Bảng xếp hạng Ngày (Hôm nay - xếp theo số thẻ hôm nay)
    const dayRanking = rankList(
      fullMembers,
      (a, b) => b.cardsToday - a.cardsToday || b.streak - a.streak || b.studyDays - a.studyDays,
      'cardsToday'
    );

    // Bảng xếp hạng Tuần (7 ngày - xếp theo số thẻ tuần)
    const weekRanking = rankList(
      fullMembers,
      (a, b) => b.cardsWeek - a.cardsWeek || b.streak - a.streak || b.disciplinePercentage - a.disciplinePercentage,
      'cardsWeek'
    );

    // Bảng xếp hạng Tháng (Tháng này - xếp theo số thẻ tháng)
    const monthRanking = rankList(
      fullMembers,
      (a, b) => b.cardsMonth - a.cardsMonth || b.disciplinePercentage - a.disciplinePercentage || b.streak - a.streak,
      'cardsMonth'
    );

    // Bảng xếp hạng Chuỗi Streak (xếp theo số ngày liên tục)
    const streakRanking = rankList(
      fullMembers,
      (a, b) => b.streak - a.streak || b.disciplinePercentage - a.disciplinePercentage || b.cardsTotal - a.cardsTotal,
      'streak'
    );

    // Bảng xếp hạng Tổng Thẻ (xếp theo tổng số thẻ đã học)
    const cardsRanking = rankList(
      fullMembers,
      (a, b) => b.cardsTotal - a.cardsTotal || b.disciplinePercentage - a.disciplinePercentage || b.streak - a.streak,
      'cardsTotal'
    );

    // Bảng xếp hạng Thời Gian Học (xếp theo tổng thời gian học tích lũy)
    const timeRanking = rankList(
      fullMembers,
      (a, b) => b.timeTotal - a.timeTotal || b.cardsTotal - a.cardsTotal || b.disciplinePercentage - a.disciplinePercentage,
      'timeTotal'
    );

    // Bảng xếp hạng Tỷ Lệ Ghi Nhớ (xếp theo % Retention)
    const retentionRanking = rankList(
      fullMembers,
      (a, b) => b.retentionRate - a.retentionRate || b.cardsTotal - a.cardsTotal || b.disciplinePercentage - a.disciplinePercentage,
      'retentionRate'
    );

    // Bảng xếp hạng Mùa giải (Kỷ luật % tổng thể)
    const seasonRanking = rankList(
      fullMembers,
      (a, b) => b.disciplinePercentage - a.disciplinePercentage || b.streak - a.streak || b.cardsTotal - a.cardsTotal || b.studyDays - a.studyDays,
      'disciplinePercentage'
    );

    // Xác định bảng xếp hạng chính trả về theo timeframe
    let activeLeaderboard = seasonRanking;
    if (requestedTimeframe === 'day') activeLeaderboard = dayRanking;
    else if (requestedTimeframe === 'week') activeLeaderboard = weekRanking;
    else if (requestedTimeframe === 'month') activeLeaderboard = monthRanking;
    else if (requestedTimeframe === 'streak') activeLeaderboard = streakRanking;
    else if (requestedTimeframe === 'cards') activeLeaderboard = cardsRanking;
    else if (requestedTimeframe === 'time') activeLeaderboard = timeRanking;
    else if (requestedTimeframe === 'retention') activeLeaderboard = retentionRanking;

    // Tìm thứ hạng của người gọi
    let myRankInfo: any = null;
    if (callerUser) {
      const foundInSeason = seasonRanking.find((m) => m.id === callerUser.id);
      const foundInActive = activeLeaderboard.find((m) => m.id === callerUser.id);
      if (foundInActive) {
        myRankInfo = {
          ...foundInActive,
          seasonRank: foundInSeason?.rank || 1,
        };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        challenge: {
          id: challengeId,
          name: activeChallenge.name,
          totalDays: totalDaysPossible,
        },
        timeframe: requestedTimeframe,
        leaderboard: activeLeaderboard.slice(0, 20), // Top 20
        rankings: {
          day: dayRanking.slice(0, 15),
          week: weekRanking.slice(0, 15),
          month: monthRanking.slice(0, 15),
          streak: streakRanking.slice(0, 15),
          cards: cardsRanking.slice(0, 15),
          time: timeRanking.slice(0, 15),
          retention: retentionRanking.slice(0, 15),
          season: seasonRanking.slice(0, 15),
        },
        myRank: myRankInfo,
        activeStudyMembers: liveSessions.length,
        liveSessions: liveSessions.slice(0, 10),
        voiceChannels: discordVoiceChannels,
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30, s-maxage=60'
        } 
      }
    );
  } catch (err: any) {
    console.error('[Addon Leaderboard Exception]', err);
    return new Response(
      JSON.stringify({ error: `Lỗi tải bảng xếp hạng: ${err.message || err}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
