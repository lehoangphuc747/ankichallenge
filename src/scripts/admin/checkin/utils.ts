// Utility functions cho checkin admin module
// Các hàm helper để xử lý date, challenge, và các tính toán khác

import { getCurrentDate, getCurrentChallengeId, getChallengeDateRanges } from './state';
import type { ChallengeDateRanges } from './types';

// Format date from YYYY-MM-DD to dd/mm/yyyy
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

// Parse date from dd/mm/yyyy to YYYY-MM-DD
export function parseDate(dateStr: string): string {
  if (!dateStr) return '';
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
}

// Calculate day number from challenge start
// Sep 3 = Day 1, Sep 4 = Day 2, Dec 16 = Day 105
export function calculateDayNumber(dateStr: string): number {
  const challengeDateRanges = getChallengeDateRanges();
  const currentChallengeId = getCurrentChallengeId();
  const challengeRange = challengeDateRanges[currentChallengeId];
  
  if (!challengeRange) return 0;
  
  const start = new Date(challengeRange.start);
  const current = new Date(dateStr);
  
  // Reset time to midnight to avoid timezone issues
  start.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);
  
  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Day 1 is the start date, so we add 1
  // Example: Sep 3 - Sep 3 = 0 days → Day 1
  //          Sep 4 - Sep 3 = 1 day → Day 2
  //          Dec 16 - Sep 3 = 104 days → Day 105
  return diffDays + 1;
}

// Tìm challenge đang diễn ra dựa vào ngày hiện tại
// Challenge đang diễn ra = ngày hiện tại nằm trong khoảng [start, end]
export function findActiveChallenge(dateStr: string, challengeDateRanges: ChallengeDateRanges): number | null {
  if (!dateStr || Object.keys(challengeDateRanges).length === 0) {
    return null;
  }

  const current = new Date(dateStr);
  current.setHours(0, 0, 0, 0);

  // Tìm challenge có ngày hiện tại nằm trong khoảng start và end
  for (const [id, range] of Object.entries(challengeDateRanges)) {
    const start = new Date(range.start);
    const end = new Date(range.end);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (current >= start && current <= end) {
      console.log('🎯 [DEBUG] Tìm thấy challenge đang diễn ra:', id, range.name);
      return parseInt(id);
    }
  }

  // Nếu không có challenge nào đang diễn ra, tìm challenge mới nhất (end date gần nhất trong tương lai)
  let latestChallengeId: number | null = null;
  let latestEndDate: Date | null = null;

  for (const [id, range] of Object.entries(challengeDateRanges)) {
    const end = new Date(range.end);
    end.setHours(0, 0, 0, 0);

    // Chỉ xét các challenge chưa kết thúc hoặc vừa kết thúc gần đây
    if (end >= current) {
      if (!latestEndDate || end < latestEndDate) {
        latestEndDate = end;
        latestChallengeId = parseInt(id);
      }
    }
  }

  // Nếu vẫn không có, lấy challenge có end date xa nhất (challenge mới nhất)
  if (!latestChallengeId) {
    latestEndDate = null;
    for (const [id, range] of Object.entries(challengeDateRanges)) {
      const end = new Date(range.end);
      if (!latestEndDate || end > latestEndDate) {
        latestEndDate = end;
        latestChallengeId = parseInt(id);
      }
    }
  }

  if (latestChallengeId) {
    console.log('🎯 [DEBUG] Không có challenge đang diễn ra, chọn challenge mới nhất:', latestChallengeId);
  }

  return latestChallengeId;
}

// Update day counter display
export function updateDayCounter(): void {
  const dayNumber = calculateDayNumber(getCurrentDate());
  const dayCounterEl = document.getElementById('dayCounter');
  if (dayCounterEl) {
    dayCounterEl.textContent = `DAY ${dayNumber}`;
  }
}
