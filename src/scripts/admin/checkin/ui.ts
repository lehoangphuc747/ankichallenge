// UI rendering functions cho checkin admin module
// Xử lý tất cả việc render UI và update DOM

import {
  getUsersData,
  getStudyRecordsData,
  getCurrentDate,
  getCurrentChallengeId,
  getSearchTerm,
  getChallengeDateRanges,
  getFocusedItemIndex,
  setAllCheckinItems,
  setFocusedItemIndex
} from './state';
import { updateDayCounter } from './utils';
import type { User } from './types';

// Show toast notification
export function showToast(title: string, message: string, type: 'success' | 'error' = 'success'): void {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  const titleEl = document.getElementById('toastTitle');
  const messageEl = document.getElementById('toastMessage');
  
  if (!toast || !icon || !titleEl || !messageEl) return;
  
  const toastContainer = toast.querySelector('div');
  if (!toastContainer) return;

  if (type === 'success') {
    icon.textContent = '✅';
    toastContainer.classList.remove('border-red-500', 'border-yellow-500');
    toastContainer.classList.add('border-green-500');
  } else if (type === 'error') {
    icon.textContent = '❌';
    toastContainer.classList.remove('border-green-500', 'border-yellow-500');
    toastContainer.classList.add('border-red-500');
  }

  titleEl.textContent = title;
  messageEl.textContent = message;
  
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Update challenge selector with loaded challenges
export function updateChallengeSelector(): void {
  const selector = document.getElementById('challengeSelect') as HTMLSelectElement;
  if (!selector) return;

  const challengeDateRanges = getChallengeDateRanges();
  selector.innerHTML = Object.entries(challengeDateRanges)
    .map(([id, data]) => `<option value="${id}">${data.name}</option>`)
    .join('');
  
  // Set giá trị mặc định cho selector sau khi load xong
  // Đảm bảo selector hiển thị đúng challenge đang được chọn
  const currentChallengeId = getCurrentChallengeId();
  if (currentChallengeId && challengeDateRanges[currentChallengeId]) {
    selector.value = currentChallengeId.toString();
    console.log('🎯 [DEBUG] Set challenge mặc định:', currentChallengeId);
  }
}

// Get all checkin items (ưu tiên unchecked trước)
export function getAllCheckinItems(): HTMLElement[] {
  const unchecked = Array.from(document.querySelectorAll('#uncheckedList .checkin-item')) as HTMLElement[];
  const checked = Array.from(document.querySelectorAll('#checkedList .checkin-item')) as HTMLElement[];
  // Ưu tiên unchecked trước (thường cần check-in nhiều hơn)
  return [...unchecked, ...checked];
}

// Update focused item visual
export function updateFocusedItem(): void {
  const allCheckinItems = getAllCheckinItems();
  const focusedItemIndex = getFocusedItemIndex();
  
  allCheckinItems.forEach((item, index) => {
    if (index === focusedItemIndex) {
      // Thêm các class để làm focus rõ ràng hơn
      item.classList.add(
        'ring-4',           // Ring dày hơn (từ ring-2 → ring-4)
        'ring-blue-500',    // Màu xanh dương
        'ring-offset-2',    // Offset để tạo khoảng cách
        'shadow-lg',        // Shadow lớn để nổi bật
        'shadow-blue-200',  // Shadow màu xanh nhạt
        'bg-blue-100',      // Background đậm hơn (từ blue-50 → blue-100)
        'border-2',         // Border dày
        'border-blue-400'   // Border màu xanh
      );
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      // Xóa tất cả các class focus
      item.classList.remove(
        'ring-4',
        'ring-blue-500',
        'ring-offset-2',
        'shadow-lg',
        'shadow-blue-200',
        'bg-blue-100',
        'border-2',
        'border-blue-400'
      );
    }
  });
}

// Render check-in list
// ⚠️ Hàm này chứa debug logs - KHÔNG XÓA mà không hỏi người dùng
export function renderCheckinList(): void {
  const currentDate = getCurrentDate();
  const currentChallengeId = getCurrentChallengeId();
  console.log('🖼️ [DEBUG] renderCheckinList() được gọi cho ngày:', currentDate, 'challenge:', currentChallengeId);
  
  const usersData = getUsersData();
  const studyRecordsData = getStudyRecordsData();
  if (!usersData || !studyRecordsData) return;

  // Update day counter
  updateDayCounter();

  // Filter users by current challenge, not hidden, and search term
  const searchTerm = getSearchTerm();
  const users = usersData.data.filter((u: User) => {
    if (u.hidden) return false;
    if (!u.challengeIds || !u.challengeIds.includes(currentChallengeId)) return false;
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const nameMatch = u.name.toLowerCase().includes(search);
      const discordMatch = (u.discordNickname || '').toLowerCase().includes(search);
      return nameMatch || discordMatch;
    }
    
    return true;
  });
  
  const dateRecords = studyRecordsData[currentDate] || {};

  const checked: User[] = [];
  const unchecked: User[] = [];

  users.forEach((user: User) => {
    const isChecked = dateRecords[user.id.toString()] === true;
    if (isChecked) {
      checked.push(user);
    } else {
      unchecked.push(user);
    }
  });

  // Update stats
  const checkedCountEl = document.getElementById('checkedCount');
  const uncheckedCountEl = document.getElementById('uncheckedCount');
  const checkedHeaderEl = document.getElementById('checkedHeader');
  const uncheckedHeaderEl = document.getElementById('uncheckedHeader');
  const checkinRateEl = document.getElementById('checkinRate');
  
  if (checkedCountEl) checkedCountEl.textContent = checked.length.toString();
  if (uncheckedCountEl) uncheckedCountEl.textContent = unchecked.length.toString();
  if (checkedHeaderEl) checkedHeaderEl.textContent = checked.length.toString();
  if (uncheckedHeaderEl) uncheckedHeaderEl.textContent = unchecked.length.toString();
  
  const rate = users.length > 0 ? Math.round((checked.length / users.length) * 100) : 0;
  if (checkinRateEl) checkinRateEl.textContent = `${rate}%`;

  // Render unchecked
  const uncheckedList = document.getElementById('uncheckedList');
  if (uncheckedList) {
    uncheckedList.innerHTML = unchecked.length === 0 
      ? '<div class="p-8 text-center text-gray-500">🎉 Tất cả đã check-in!</div>'
      : unchecked.map(user => `
          <div class="checkin-item p-4 hover:bg-orange-50 cursor-pointer transition-colors flex items-center justify-between"
               data-user-id="${user.id}" data-user-name="${user.name.replace(/"/g, '&quot;')}">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                ${user.name.charAt(0)}
              </div>
              <div>
                <p class="font-semibold text-gray-900">${user.name}</p>
                <p class="text-sm text-gray-500">${user.discordNickname || 'N/A'}</p>
              </div>
            </div>
            <div class="text-gray-400">
              <span class="text-2xl">○</span>
            </div>
          </div>
        `).join('');
  }

  // Render checked
  const checkedList = document.getElementById('checkedList');
  if (checkedList) {
    checkedList.innerHTML = checked.length === 0
      ? '<div class="p-8 text-center text-gray-500">Chưa có ai check-in</div>'
      : checked.map(user => `
          <div class="checkin-item p-4 hover:bg-green-50 cursor-pointer transition-colors flex items-center justify-between"
               data-user-id="${user.id}" data-user-name="${user.name.replace(/"/g, '&quot;')}">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                ${user.name.charAt(0)}
              </div>
              <div>
                <p class="font-semibold text-gray-900">${user.name}</p>
                <p class="text-sm text-gray-500">${user.discordNickname || 'N/A'}</p>
              </div>
            </div>
            <div class="text-green-600">
              <span class="text-2xl">✓</span>
            </div>
          </div>
        `).join('');
  }
  
  // Update navigation state sau khi render
  const allCheckinItems = getAllCheckinItems();
  setAllCheckinItems(allCheckinItems);
  setFocusedItemIndex(-1);
  updateFocusedItem();
}
