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

  if (uncheckedList) {
    uncheckedList.innerHTML = unchecked.length === 0
      ? '<div class="p-12 text-center text-gray-500 italic">🎉 Tất cả đã check-in!</div>'
      : unchecked.map(user => `
          <div class="checkin-item group p-4 sm:p-5 hover:bg-orange-50 cursor-pointer transition-all duration-200 flex items-center justify-between border-b border-gray-100 last:border-0 relative overflow-hidden"
               data-user-id="${user.id}" data-user-name="${user.name.replace(/"/g, '&quot;')}">
            
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="flex items-center gap-5">
              <div class="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xl shadow-sm border border-orange-200">
                ${user.name.charAt(0)}
              </div>
              <div>
                <p class="font-bold text-gray-900 text-lg leading-tight group-hover:text-orange-700 transition-colors">${user.name}</p>
                <p class="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1">
                  <span class="opacity-75">💬</span> ${user.discordNickname || 'N/A'}
                </p>
              </div>
            </div>
            
            <div class="w-10 h-10 rounded-full border-2 border-gray-300 group-hover:border-orange-400 flex items-center justify-center text-transparent group-hover:text-orange-400 transition-all">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transform scale-75 group-hover:scale-100 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
               </svg>
            </div>
          </div>
        `).join('');
  }

  // Render checked
  const checkedList = document.getElementById('checkedList');
  if (checkedList) {
    checkedList.innerHTML = checked.length === 0
      ? '<div class="p-12 text-center text-gray-500 italic">Chưa có ai check-in ngày này.</div>'
      : checked.map(user => `
          <div class="checkin-item group p-4 sm:p-5 hover:bg-green-50 cursor-pointer transition-all duration-200 flex items-center justify-between border-b border-gray-100 last:border-0 relative overflow-hidden"
               data-user-id="${user.id}" data-user-name="${user.name.replace(/"/g, '&quot;')}">
            
             <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div class="flex items-center gap-5">
              <div class="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xl shadow-sm border border-green-200">
                ${user.name.charAt(0)}
              </div>
              <div>
                <p class="font-bold text-gray-900 text-lg leading-tight group-hover:text-green-700 transition-colors">${user.name}</p>
                <p class="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1">
                  <span class="opacity-75">💬</span> ${user.discordNickname || 'N/A'}
                </p>
              </div>
            </div>
            
            <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm transform group-hover:scale-110 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
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
