import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

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

export const GET: APIRoute = async ({ params }) => {
  try {
    const userId = params.userId;
    const challengeId = params.challengeId;

    if (!userId || !challengeId) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Load data files
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const usersData = JSON.parse(await fs.readFile(path.join(dataDir, 'users.json'), 'utf-8'));
    const challengesData = JSON.parse(await fs.readFile(path.join(dataDir, 'challenges.json'), 'utf-8'));
    const studyRecordsData: StudyRecords = JSON.parse(await fs.readFile(path.join(dataDir, 'studyRecords.json'), 'utf-8'));

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
