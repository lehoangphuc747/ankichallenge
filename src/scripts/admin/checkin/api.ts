// API calls cho checkin admin module
// Xử lý tất cả communication với server/API

import {
  setUsersData,
  setStudyRecordsData,
  setCurrentChallengeId,
  setChallengeDateRanges,
  getCurrentDate,
  getCurrentChallengeId,
  setIsSaving,
  getIsSaving
} from './state';
import { findActiveChallenge } from './utils';
import type { ChallengeDateRanges } from './types';

// Load data từ API và JSON files
// ⚠️ Hàm này chứa debug logs - KHÔNG XÓA mà không hỏi người dùng
export async function loadData(targetChallengeId?: number): Promise<void> {
  console.log('🔄 [DEBUG] loadData() được gọi!');
  try {
    // Load challenges, users and records
    // Thêm cache-busting
    const cb = '?v=' + Date.now();
    const [challengesRes, usersRes] = await Promise.all([
      fetch('/api/challenges' + cb),
      fetch('/data/users.json' + cb)
    ]);

    const challenges = await challengesRes.json();
    const usersData = await usersRes.json();
    
    // Convert challenges to format expected by rest of code
    const challengeDateRanges: ChallengeDateRanges = {};
    Object.entries(challenges).forEach(([id, data]: [string, any]) => {
      challengeDateRanges[parseInt(id)] = {
        start: data.start,
        end: data.end,
        name: data.name
      };
    });
    console.log('✅ Loaded challenges:', challengeDateRanges);
    
    // Tự động chọn challenge đang diễn ra dựa vào ngày hiện tại
    // currentDate đã được set trong init() trước khi gọi loadData()
    const currentDate = getCurrentDate();
    let activeChallengeId = targetChallengeId || findActiveChallenge(currentDate, challengeDateRanges) || getCurrentChallengeId();
    setCurrentChallengeId(activeChallengeId);

    let challengePrefix = '08';
    if (activeChallengeId === 1) challengePrefix = '08';
    if (activeChallengeId === 2) challengePrefix = '09';
    if (activeChallengeId === 3) challengePrefix = '10';

    let studyRecordsData = {};
    const recordsRes = await Promise.resolve(fetch(`/data/challenge_${challengePrefix}_records.json` + cb));
    const recordsResp = await recordsRes;
    if (recordsResp.ok) {
        studyRecordsData = await recordsResp.json();
    }

    // Update state
    setUsersData(usersData);
    setStudyRecordsData(studyRecordsData);
    setChallengeDateRanges(challengeDateRanges);
    
    console.log('🎯 [DEBUG] Challenge ID selected:', activeChallengeId);
    
    console.log('✅ Data loaded successfully');
  } catch (error) {
    console.error('❌ Error loading data:', error);
    // showToast sẽ được gọi từ module khác
    throw error;
  }
}

// Save to server
// ⚠️ Hàm này chứa nhiều debug log - KHÔNG XÓA mà không hỏi người dùng
export async function saveToServer(date: string, userId: number, isChecked: boolean): Promise<boolean> {
  if (getIsSaving()) return false;
  setIsSaving(true);

  const challengeId = getCurrentChallengeId();
  // Log giá trị trước khi gửi
  const payload = { date, userId, challengeId, isChecked };
  console.log('📤 [DEBUG] Gửi request với payload:', payload);
  console.log('📤 [DEBUG] Kiểm tra types:', {
    date: typeof date,
    dateValue: date,
    userId: typeof userId,
    userIdValue: userId,
    isChecked: typeof isChecked,
    isCheckedValue: isChecked
  });

  try {
    const response = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Đọc response body ngay cả khi lỗi để xem thông báo
    const responseData = await response.json();
    console.log('📥 [DEBUG] Response từ server:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData
    });

    if (!response.ok) {
      console.error('❌ [DEBUG] Server trả về lỗi:', responseData);
      throw new Error(responseData.error || 'Failed to save');
    }

    setIsSaving(false);
    return responseData.success;
  } catch (error) {
    console.error('❌ [DEBUG] Error saving:', error);
    setIsSaving(false);
    return false;
  }
}
