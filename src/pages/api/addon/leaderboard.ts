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

  try {
    const [usersRes, checkinsMap, challengesMap, liveSessions] = await Promise.all([
      getUsersFromDB(db),
      getRecordsFromDB(db, challengeId),
      getChallengesFromDB(db),
      getLiveStudySessions(db, 15)
    ]);

    const activeChallenge = challengesMap[String(challengeId)] || { totalDays: 100, name: `Anki Challenge ${challengeId}` };
    const totalDaysPossible = activeChallenge.totalDays || 100;

    // Lọc thành viên tham gia mùa này
    const members = usersRes.data.filter((u: any) => {
      const cIds = u.challengeIds || [];
      return cIds.includes(challengeId) && !u.hidden;
    });

    // Tính toán thống kê từng thành viên
    const rankedMembers = members.map((member: any) => {
      const studyDays = Object.values(checkinsMap).filter((dateMap) => Boolean(dateMap[member.id])).length;
      const disciplinePercentage = Math.min(100, Math.round((studyDays / totalDaysPossible) * 100));

      return {
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        discordNickname: member.discordNickname,
        studyDays: studyDays,
        disciplinePercentage: disciplinePercentage,
        streak: member.streak || 0,
      };
    });

    // Sắp xếp Bảng xếp hạng theo tỷ lệ kỷ luật và chuỗi streak
    rankedMembers.sort((a, b) => {
      if (b.disciplinePercentage !== a.disciplinePercentage) {
        return b.disciplinePercentage - a.disciplinePercentage;
      }
      if (b.streak !== a.streak) {
        return b.streak - a.streak;
      }
      return b.studyDays - a.studyDays;
    });

    // Gán thứ hạng chính xác (đồng hạng nếu cùng %)
    let currentRank = 1;
    const finalLeaderboard = rankedMembers.map((m, idx) => {
      if (idx > 0 && m.disciplinePercentage < rankedMembers[idx - 1].disciplinePercentage) {
        currentRank = idx + 1;
      }
      return {
        rank: currentRank,
        ...m
      };
    });

    // Tìm thứ hạng của người gọi
    let myRankInfo = null;
    if (callerUser) {
      const found = finalLeaderboard.find((m) => m.id === callerUser.id);
      if (found) {
        myRankInfo = found;
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
        leaderboard: finalLeaderboard.slice(0, 15), // Top 15 cho Addon
        myRank: myRankInfo,
        activeStudyMembers: liveSessions.length,
        liveSessions: liveSessions.slice(0, 10),
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, s-maxage=120'
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
