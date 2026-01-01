// Business logic actions cho checkin admin module
// Xử lý toggle check-in, copy Discord names, bulk actions, navigation

import {
  getUsersData,
  getStudyRecordsData,
  getCurrentDate,
  getCurrentChallengeId,
  getSearchTerm,
  setCurrentDate,
  updateStudyRecordForDate,
  deleteStudyRecordForDate,
  setStudyRecordsData
} from './state';
import { saveToServer } from './api';
import { showToast, renderCheckinList, getAllCheckinItems, updateFocusedItem } from './ui';
import { formatDate, updateDayCounter } from './utils';
import { setAllCheckinItems, setFocusedItemIndex, getFocusedItemIndex } from './state';
import { getChallengeDateRanges } from './state';
import type { User } from './types';

// Toggle check-in
// ⚠️ Hàm này chứa nhiều debug log - KHÔNG XÓA mà không hỏi người dùng
import { getIsSaving, setIsSaving } from './state';

export async function toggleCheckin(userId: number, userName: string): Promise<void> {
  console.log('🎯 [DEBUG] toggleCheckin() được gọi cho:', userName, 'userId:', userId);
  
  // Prevent double-clicking
  if (getIsSaving()) {
    console.log('⏳ Đang xử lý request trước...');
    return;
  }

  const studyRecordsData = getStudyRecordsData();
  const currentDate = getCurrentDate();
  
  if (!studyRecordsData) return;
  
  const isCurrentlyChecked = studyRecordsData[currentDate]?.[userId.toString()] === true;
  const newState = !isCurrentlyChecked;

  // Optimistic update
  if (!studyRecordsData[currentDate]) {
    studyRecordsData[currentDate] = {};
  }
  
  if (newState) {
    updateStudyRecordForDate(currentDate, userId, true);
  } else {
    deleteStudyRecordForDate(currentDate, userId);
  }

  // Update UI immediately (no reload, just re-render)
  console.log('🎨 [DEBUG] Cập nhật UI optimistically...');
  renderCheckinList();

  // Save to server in background
  console.log('💾 [DEBUG] Gọi saveToServer...');
  console.log('💾 [DEBUG] Giá trị trước khi gửi:', {
    currentDate,
    currentDateType: typeof currentDate,
    userId,
    userIdType: typeof userId,
    newState,
    newStateType: typeof newState
  });
  const success = await saveToServer(currentDate, userId, newState);
  console.log('💾 [DEBUG] saveToServer result:', success);

  if (success) {
    const action = newState ? 'Check-in' : 'Xóa check-in';
    showToast('Đã lưu!', `${action} cho ${userName}`, 'success');
  } else {
    // Revert if failed
    const studyRecordsDataAfter = getStudyRecordsData();
    if (studyRecordsDataAfter && studyRecordsDataAfter[currentDate]) {
      if (newState) {
        delete studyRecordsDataAfter[currentDate][userId.toString()];
      } else {
        studyRecordsDataAfter[currentDate][userId.toString()] = true;
      }
      setStudyRecordsData(studyRecordsDataAfter);
    }
    renderCheckinList();
    showToast('Lỗi!', 'Không thể lưu. Vui lòng thử lại', 'error');
  }
}

// Copy tất cả Discord names của người chưa check-in
export async function copyDiscordNames(): Promise<void> {
  const usersData = getUsersData();
  const studyRecordsData = getStudyRecordsData();
  if (!usersData || !studyRecordsData) return;

  const currentChallengeId = getCurrentChallengeId();
  const searchTerm = getSearchTerm();
  const currentDate = getCurrentDate();

  // Lấy danh sách users chưa check-in
  const users = usersData.data.filter((u: User) => {
    if (u.hidden) return false;
    if (!u.challengeIds || !u.challengeIds.includes(currentChallengeId)) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const nameMatch = u.name.toLowerCase().includes(search);
      const discordMatch = (u.discordNickname || '').toLowerCase().includes(search);
      if (!nameMatch && !discordMatch) return false;
    }
    return true;
  });

  const dateRecords = studyRecordsData[currentDate] || {};
  
  // Lọc ra những người chưa check-in
  const uncheckedUsers = users.filter((user: User) => {
    return dateRecords[user.id.toString()] !== true;
  });

  if (uncheckedUsers.length === 0) {
    showToast('Thông báo', 'Không có ai chưa check-in để copy', 'success');
    return;
  }

  // Lấy Discord names (bỏ qua những người không có Discord name)
  const discordNames = uncheckedUsers
    .map((user: User) => user.discordNickname)
    .filter((name: string | undefined) => name && name.trim() !== '')
    .map((name: string) => name.trim());

  if (discordNames.length === 0) {
    showToast('Thông báo', 'Không có Discord name nào để copy', 'success');
    return;
  }

  // Format: Discord mention format (@username1 @username2 @username3)
  const textToCopy = discordNames.map((name: string) => `@${name}`).join(' ');

  // Copy vào clipboard
  try {
    await navigator.clipboard.writeText(textToCopy);
    showToast(
      'Đã copy!', 
      `Đã copy ${discordNames.length} Discord name${discordNames.length > 1 ? 's' : ''} vào clipboard`,
      'success'
    );
    console.log('📋 [DEBUG] Đã copy Discord names:', textToCopy);
  } catch (error) {
    console.error('❌ [DEBUG] Lỗi khi copy:', error);
    // Fallback: Dùng cách copy cũ (nếu browser không support clipboard API)
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Đã copy!', `Đã copy ${discordNames.length} Discord name(s)`, 'success');
    } catch (err) {
      showToast('Lỗi!', 'Không thể copy. Vui lòng thử lại', 'error');
    }
    document.body.removeChild(textArea);
  }
}

// Check-in tất cả unchecked
export async function checkinAllUnchecked(): Promise<void> {
  if (!confirm('Bạn có chắc muốn check-in TẤT CẢ thành viên chưa check-in?')) {
    return;
  }

  const uncheckedItems = Array.from(document.querySelectorAll('#uncheckedList .checkin-item')) as HTMLElement[];
  const userIds: Array<{ id: number; name: string }> = [];

  uncheckedItems.forEach(item => {
    const userId = parseInt(item.dataset.userId || '0');
    const userName = item.dataset.userName || '';
    if (userId) {
      userIds.push({ id: userId, name: userName });
    }
  });

  if (userIds.length === 0) {
    showToast('Thông báo', 'Không có ai cần check-in', 'success');
    return;
  }

  const currentDate = getCurrentDate();
  const studyRecordsData = getStudyRecordsData();
  
  // Check-in từng người một (để có feedback)
  let successCount = 0;
  for (const { id } of userIds) {
    const success = await saveToServer(currentDate, id, true);
    if (success) {
      successCount++;
      // Update local data
      updateStudyRecordForDate(currentDate, id, true);
    }
  }

  // Re-render sau khi xong
  renderCheckinList();
  const allCheckinItems = getAllCheckinItems();
  setAllCheckinItems(allCheckinItems);
  updateFocusedItem();

  showToast(
    'Hoàn thành!',
    `Đã check-in ${successCount}/${userIds.length} thành viên`,
    successCount === userIds.length ? 'success' : 'error'
  );
}

// Uncheck tất cả checked
export async function uncheckAllChecked(): Promise<void> {
  if (!confirm('Bạn có chắc muốn XÓA check-in của TẤT CẢ thành viên đã check-in?')) {
    return;
  }

  const checkedItems = Array.from(document.querySelectorAll('#checkedList .checkin-item')) as HTMLElement[];
  const userIds: Array<{ id: number; name: string }> = [];

  checkedItems.forEach(item => {
    const userId = parseInt(item.dataset.userId || '0');
    const userName = item.dataset.userName || '';
    if (userId) {
      userIds.push({ id: userId, name: userName });
    }
  });

  if (userIds.length === 0) {
    showToast('Thông báo', 'Không có ai đã check-in để xóa', 'success');
    return;
  }

  const currentDate = getCurrentDate();

  // Uncheck từng người một
  let successCount = 0;
  for (const { id } of userIds) {
    const success = await saveToServer(currentDate, id, false);
    if (success) {
      successCount++;
      // Update local data
      deleteStudyRecordForDate(currentDate, id);
    }
  }

  // Re-render sau khi xong
  renderCheckinList();
  const allCheckinItems = getAllCheckinItems();
  setAllCheckinItems(allCheckinItems);
  updateFocusedItem();

  showToast(
    'Hoàn thành!',
    `Đã xóa check-in của ${successCount}/${userIds.length} thành viên`,
    successCount === userIds.length ? 'success' : 'error'
  );
}

// Về ngày hôm nay
export function goToToday(): void {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  setCurrentDate(todayStr);
  
  const selectedDateEl = document.getElementById('selectedDate') as HTMLInputElement;
  if (selectedDateEl) {
    selectedDateEl.value = formatDate(todayStr);
  }
  
  updateDayCounter();
  renderCheckinList();
  const allCheckinItems = getAllCheckinItems();
  setAllCheckinItems(allCheckinItems);
  setFocusedItemIndex(-1);
  updateFocusedItem();
}

// Về ngày cuối cùng của challenge hiện tại
export function goToChallengeEnd(): void {
  const challengeDateRanges = getChallengeDateRanges();
  const currentChallengeId = getCurrentChallengeId();
  const challengeRange = challengeDateRanges[currentChallengeId];
  
  if (!challengeRange) {
    showToast('Thông báo', 'Không tìm thấy thông tin challenge', 'error');
    return;
  }
  
  setCurrentDate(challengeRange.end);
  
  const selectedDateEl = document.getElementById('selectedDate') as HTMLInputElement;
  if (selectedDateEl) {
    selectedDateEl.value = formatDate(challengeRange.end);
  }
  
  updateDayCounter();
  renderCheckinList();
  const allCheckinItems = getAllCheckinItems();
  setAllCheckinItems(allCheckinItems);
  setFocusedItemIndex(-1);
  updateFocusedItem();
}

// Toggle check-in cho item đang focus
export function toggleFocusedItem(): void {
  const focusedItemIndex = getFocusedItemIndex();
  const allCheckinItems = getAllCheckinItems();
  
  if (focusedItemIndex >= 0 && focusedItemIndex < allCheckinItems.length) {
    const item = allCheckinItems[focusedItemIndex];
    const userId = parseInt(item.dataset.userId || '0');
    const userName = item.dataset.userName || '';
    if (userId) {
      toggleCheckin(userId, userName);
      // Sau khi toggle, item sẽ di chuyển sang cột khác, cần update lại
      setTimeout(() => {
        const newAllCheckinItems = getAllCheckinItems();
        setAllCheckinItems(newAllCheckinItems);
        const newFocusedIndex = Math.min(focusedItemIndex, newAllCheckinItems.length - 1);
        setFocusedItemIndex(newFocusedIndex);
        updateFocusedItem();
      }, 100);
    }
  }
}
