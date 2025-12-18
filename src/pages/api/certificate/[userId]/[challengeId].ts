import type { APIRoute } from 'astro';

// Không pre-render API này - chỉ chạy server-side khi dev
export const prerender = false;

interface User {
  id: number;
  name: string;
  challengeId?: number;
  challengeIds?: number[];
}

interface Challenge {
  name: string;
  start: string;
  end: string;
  description: string;
}

interface StudyRecords {
  [date: string]: {
    [userId: string]: boolean;
  };
}

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const userId = params.userId;
    const challengeId = params.challengeId;

    if (!userId || !challengeId) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Cloudflare Workers không có filesystem -> đọc JSON tĩnh qua fetch (cùng origin)
    const base = request.url;
    const [usersRes, challengesRes, recordsRes] = await Promise.all([
      fetch(new URL('/data/users.json', base), { cache: 'force-cache' }),
      fetch(new URL('/data/challenges.json', base), { cache: 'force-cache' }),
      fetch(new URL('/data/studyRecords.json', base), { cache: 'force-cache' })
    ]);

    if (!usersRes.ok || !challengesRes.ok || !recordsRes.ok) {
      return new Response(JSON.stringify({ error: 'Missing data files' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const usersData = await usersRes.json();
    const challengesData = await challengesRes.json();
    const studyRecordsData: StudyRecords = await recordsRes.json();

    // Find user
    const user = usersData.data.find((u: User) => u.id === parseInt(userId));
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find challenge
    const challenge: Challenge = challengesData[challengeId];
    if (!challenge) {
      return new Response(JSON.stringify({ error: 'Challenge not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user participated in this challenge
    const userChallenges = user.challengeIds || (user.challengeId ? [user.challengeId] : []);
    if (!userChallenges.includes(parseInt(challengeId))) {
      return new Response(JSON.stringify({ error: 'User did not participate in this challenge' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Calculate stats
    const startDate = new Date(challenge.start);
    const endDate = new Date(challenge.end);
    
    let totalDays = 0;
    let studyDays = 0;
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      totalDays++;
      const dateStr = d.toISOString().split('T')[0];
      if (studyRecordsData[dateStr] && studyRecordsData[dateStr][userId]) {
        studyDays++;
      }
    }

    const attendanceRate = totalDays > 0 ? Math.round((studyDays / totalDays) * 100) : 0;
    
    // Get completion date (end date or today, whichever is earlier)
    const today = new Date();
    const completionDate = endDate < today ? endDate : today;
    const formattedDate = completionDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const certificateData = {
      userName: user.name,
      challengeName: challenge.name,
      studyDays,
      totalDays,
      attendanceRate,
      completionDate: formattedDate,
      userId: user.id,
      challengeId: parseInt(challengeId)
    };

    return new Response(JSON.stringify(certificateData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
