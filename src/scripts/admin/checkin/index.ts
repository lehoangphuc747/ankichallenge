// Main initialization file cho checkin admin module
// Export initCheckin() để import trong Astro component

import { setCurrentDate } from './state';
import { loadData } from './api';
import { renderCheckinList, updateChallengeSelector } from './ui';
import { formatDate } from './utils';
import { setupEventListeners } from './events';
import { setupKeyboardNavigation } from './keyboard';
import { showToast } from './ui';

// Initialize checkin admin
// ⚠️ Hàm này chứa debug logs - KHÔNG XÓA mà không hỏi người dùng
export async function initCheckin(): Promise<void> {
  console.log('🚀 [DEBUG] init() được gọi!');
  
  // Set today's date
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  setCurrentDate(todayStr);
  
  const selectedDateEl = document.getElementById('selectedDate') as HTMLInputElement;
  if (selectedDateEl) {
    selectedDateEl.value = formatDate(todayStr);
  }

  try {
    // Load data
    await loadData();

    // Update challenge selector với data đã load
    updateChallengeSelector();

    // Show content
    const loadingEl = document.getElementById('loading');
    const contentEl = document.getElementById('content');
    if (loadingEl) loadingEl.classList.add('hidden');
    if (contentEl) contentEl.classList.remove('hidden');

    // Render
    renderCheckinList();

    // Setup event listeners
    setupEventListeners();

    // Setup keyboard navigation
    setupKeyboardNavigation();
  } catch (error) {
    console.error('❌ Error initializing checkin:', error);
    showToast('Lỗi!', 'Không thể tải dữ liệu', 'error');
  }
}
