// Utility function to calculate user statistics for Anki Challenge
// Can be imported and reused across different pages

export function calculateUserStats(users, studyRecordsData, selectedChallengeId, challengeDateRanges) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  console.log(`\n🔧 [calculateStats] Starting calculation for ${users.length} users`);
  console.log(`📅 [calculateStats] Today: ${todayStr}`);
  console.log(`🎯 [calculateStats] Selected Challenge: ${selectedChallengeId || 'ALL'}`);
  
  return users.map(user => {
    console.log(`\n👤 [calculateStats] Processing user: ${user.name} (ID: ${user.id})`);
    console.log(`🏆 [calculateStats] User's challengeIds:`, user.challengeIds);
    
    const stats = [];
    
    // If selectedChallengeId is provided, only calculate for that challenge
    // Otherwise calculate for all challenges the user is enrolled in
    const challengesToCalculate = selectedChallengeId 
      ? [parseInt(selectedChallengeId)]
      : (user.challengeIds || []);
    
    console.log(`🎯 [calculateStats] Will calculate for challenges:`, challengesToCalculate);
    
    // Calculate stats for each challenge
    challengesToCalculate.forEach(challengeId => {
      console.log(`\n  📊 [calculateStats] Calculating for Challenge ${challengeId}...`);
      const dateRange = challengeDateRanges[challengeId];
      if (!dateRange) {
        console.log(`  ⚠️ [calculateStats] No date range found for Challenge ${challengeId}`);
        return;
      }
      
      const startDate = dateRange.start;
      const endDate = dateRange.end;
      
      console.log(`  📆 [calculateStats] Challenge ${challengeId} date range: ${startDate} to ${endDate}`);
      
      // Get all dates user checked in for this challenge
      const userDates = Object.entries(studyRecordsData)
        .filter(([date, users]) => {
          return users && users[user.id] === true && date >= startDate && date <= endDate;
        })
        .map(([date]) => date)
        .sort();
      
      console.log(`  ✅ [calculateStats] Found ${userDates.length} check-in dates:`, userDates.slice(0, 5), '...', userDates.slice(-5));
      
      // Calculate current streak (counting backwards from last check-in date)
      let streak = 0;
      const streakDates = [];
      
      console.log(`  🔥 [calculateStats] Calculating current STREAK...`);
      
      if (userDates.length === 0) {
        console.log(`  ⚠️ [calculateStats] No check-in dates found`);
      } else {
        // Start from the LAST check-in date (most recent)
        const lastCheckinDate = userDates[userDates.length - 1];
        console.log(`  🔥 [calculateStats] Last check-in date: ${lastCheckinDate}`);
        console.log(`  🔥 [calculateStats] Today: ${todayStr}`);
        
        // Count consecutive days backwards from last check-in
        let countFromDate = new Date(lastCheckinDate);
        let currentCheckDateStr = lastCheckinDate;
        
        console.log(`  🔥 [calculateStats] Counting consecutive days backwards from ${currentCheckDateStr}...`);
        
        while (currentCheckDateStr >= startDate) {
          if (userDates.includes(currentCheckDateStr)) {
            streak++;
            streakDates.push(currentCheckDateStr);
            countFromDate.setDate(countFromDate.getDate() - 1);
            currentCheckDateStr = `${countFromDate.getFullYear()}-${String(countFromDate.getMonth() + 1).padStart(2, '0')}-${String(countFromDate.getDate()).padStart(2, '0')}`;
          } else {
            console.log(`  ⛔ [calculateStats] Gap found at ${currentCheckDateStr}`);
            break;
          }
        }
        
        console.log(`  🔥 [calculateStats] Current streak: ${streak} days`);
        if (streakDates.length > 0) {
          console.log(`  🔥 [calculateStats] Streak period: ${streakDates[streakDates.length - 1]} to ${streakDates[0]}`);
        }
      }
      
      // Calculate longest streak
      console.log(`  🏆 [calculateStats] Calculating LONGEST STREAK...`);
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
      
      console.log(`  🏆 [calculateStats] Longest streak: ${longestStreak} days (${longestStreakPeriod.start} to ${longestStreakPeriod.end})`);
      
      // Calculate discipline percentage based on days from start to today (or end date if challenge ended)
      const effectiveEndDate = todayStr < endDate ? todayStr : endDate;
      const daysSoFar = Math.ceil((new Date(effectiveEndDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
      const totalDays = userDates.length;
      const disciplinePercentage = Math.round((totalDays / daysSoFar) * 100);
      
      console.log(`  💪 [calculateStats] DISCIPLINE calculation:`);
      console.log(`  💪 [calculateStats]   - Effective end date: ${effectiveEndDate} (min of today and challenge end)`);
      console.log(`  💪 [calculateStats]   - Days so far: ${daysSoFar} (from ${startDate} to ${effectiveEndDate})`);
      console.log(`  💪 [calculateStats]   - Total checked days: ${totalDays}`);
      console.log(`  💪 [calculateStats]   - Discipline: ${disciplinePercentage}% = ${totalDays}/${daysSoFar}`);
      
      const statResult = {
        challengeId,
        dates: userDates,
        streak,
        longestStreak,
        totalDays,
        disciplinePercentage
      };
      
      console.log(`  ✅ [calculateStats] Final stats for Challenge ${challengeId}:`, statResult);
      
      stats.push(statResult);
    });
    
    console.log(`✅ [calculateStats] User ${user.name} has ${stats.length} challenge stats`);
    
    return {
      ...user,
      stats
    };
  })
  .map(user => {
    // Get stats for selected challenge if specified
    if (selectedChallengeId) {
      const challengeStat = user.stats.find(s => s.challengeId === parseInt(selectedChallengeId));
      console.log(`🎯 [calculateStats] Selected challenge ${selectedChallengeId} stat for ${user.name}:`, challengeStat ? 'FOUND' : 'NOT FOUND');
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
    // If no specific challenge selected, return all stats
    return user;
  });
}
