// Utility function to calculate user statistics for Anki Challenge
// Can be imported and reused across different pages

export function calculateUserStats(users, studyRecordsData, selectedChallengeId, challengeDateRanges) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  return users.map(user => {
    const stats = [];
    
    // If selectedChallengeId is provided, only calculate for that challenge
    // Otherwise calculate for all challenges the user is enrolled in
    const challengesToCalculate = selectedChallengeId 
      ? [parseInt(selectedChallengeId)]
      : (user.challengeIds || []);
    
    // Calculate stats for each challenge
    challengesToCalculate.forEach(challengeId => {
      const dateRange = challengeDateRanges[challengeId];
      if (!dateRange) {
        return;
      }
      
      const startDate = dateRange.start;
      const endDate = dateRange.end;
      
      // Get all dates user checked in for this challenge
      const userDates = Object.entries(studyRecordsData)
        .filter(([date, users]) => {
          return users && users[user.id] === true && date >= startDate && date <= endDate;
        })
        .map(([date]) => date)
        .sort();
      
      // Calculate current streak (counting backwards from last check-in date)
      let streak = 0;
      const streakDates = [];
      
      if (userDates.length > 0) {
        // Start from the LAST check-in date (most recent)
        const lastCheckinDate = userDates[userDates.length - 1];
        
        // Count consecutive days backwards from last check-in
        let countFromDate = new Date(lastCheckinDate);
        let currentCheckDateStr = lastCheckinDate;
        
        while (currentCheckDateStr >= startDate) {
          if (userDates.includes(currentCheckDateStr)) {
            streak++;
            streakDates.push(currentCheckDateStr);
            countFromDate.setDate(countFromDate.getDate() - 1);
            currentCheckDateStr = `${countFromDate.getFullYear()}-${String(countFromDate.getMonth() + 1).padStart(2, '0')}-${String(countFromDate.getDate()).padStart(2, '0')}`;
          } else {
            break;
          }
        }
      }
      
      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      let prevDate = null;
      let longestStreakPeriod = { start: null, end: null };
      let currentStreakStart = null;
      
      for (const date of userDates) {
        if (prevDate) {
          const diffDays = Math.floor((new Date(date) - new Date(prevDate)) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            tempStreak++;
          } else {
            if (tempStreak > longestStreak) {
              longestStreak = tempStreak;
              longestStreakPeriod = { start: currentStreakStart, end: prevDate };
            }
            tempStreak = 1;
            currentStreakStart = date;
          }
        } else {
          tempStreak = 1;
          currentStreakStart = date;
        }
        prevDate = date;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
        longestStreakPeriod = { start: currentStreakStart, end: prevDate };
      }
      
      // Calculate discipline percentage based on days from start to today (or end date if challenge ended)
      const effectiveEndDate = todayStr < endDate ? todayStr : endDate;
      const daysSoFar = Math.ceil((new Date(effectiveEndDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
      const totalDays = userDates.length;
      const disciplinePercentage = Math.round((totalDays / daysSoFar) * 100);
      
      const statResult = {
        challengeId,
        dates: userDates,
        streak,
        longestStreak,
        totalDays,
        disciplinePercentage
      };
      
      stats.push(statResult);
    });
    
    return {
      ...user,
      stats
    };
  })
  .map(user => {
    // Get stats for selected challenge if specified
    if (selectedChallengeId) {
      const challengeStat = user.stats.find(s => s.challengeId === parseInt(selectedChallengeId));
      return {
        ...user,
        currentStat: challengeStat || {
          challengeId: parseInt(selectedChallengeId),
          dates: [],
          streak: 0,
          longestStreak: 0,
          totalDays: 0,
          disciplinePercentage: 0
        }
      };
    }
    return user;
  });
}
