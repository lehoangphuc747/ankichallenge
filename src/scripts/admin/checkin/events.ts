// DOM event handlers cho checkin admin module
// Xử lý click, input, change events

import {
  setCurrentDate,
  setCurrentChallengeId,
  setSearchTerm,
  getCurrentDate
} from './state';
import { toggleCheckin, copyDiscordNames } from './actions';
import { renderCheckinList, updateChallengeSelector } from './ui';
import { formatDate, updateDayCounter } from './utils';

// Setup event listeners
export function setupEventListeners(): void {
  // Event delegation for check-in items (prevent any form of page reload)
  document.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.checkin-item');
    if (item) {
      e.preventDefault(); // Prevent any default behavior
      e.stopPropagation(); // Stop event bubbling
      const userId = parseInt(item.dataset.userId || '0');
      const userName = item.dataset.userName || '';
      
      // Call toggle without waiting (fire and forget for UI responsiveness)
      toggleCheckin(userId, userName);
      return false; // Extra safety to prevent navigation
    }
  });

  // Previous day button
  const prevDayBtn = document.getElementById('prevDay');
  if (prevDayBtn) {
    prevDayBtn.addEventListener('click', () => {
      console.log('⬅️ [DEBUG] Previous day clicked');
      const currentDate = getCurrentDate();
      const date = new Date(currentDate);
      date.setDate(date.getDate() - 1);
      const newDate = date.toISOString().split('T')[0];
      setCurrentDate(newDate);
      
      const selectedDateEl = document.getElementById('selectedDate') as HTMLInputElement;
      if (selectedDateEl) {
        selectedDateEl.value = formatDate(newDate);
      }
      updateDayCounter();
      renderCheckinList();
    });
  }

  // Next day button
  const nextDayBtn = document.getElementById('nextDay');
  if (nextDayBtn) {
    nextDayBtn.addEventListener('click', () => {
      console.log('➡️ [DEBUG] Next day clicked');
      const currentDate = getCurrentDate();
      const date = new Date(currentDate);
      date.setDate(date.getDate() + 1);
      const newDate = date.toISOString().split('T')[0];
      setCurrentDate(newDate);
      
      const selectedDateEl = document.getElementById('selectedDate') as HTMLInputElement;
      if (selectedDateEl) {
        selectedDateEl.value = formatDate(newDate);
      }
      updateDayCounter();
      renderCheckinList();
    });
  }

  // Challenge selector
  const challengeSelect = document.getElementById('challengeSelect') as HTMLSelectElement;
  if (challengeSelect) {
    challengeSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      const newChallengeId = parseInt(target.value);
      setCurrentChallengeId(newChallengeId);
      console.log('🎯 [DEBUG] Challenge changed to:', newChallengeId);
      updateDayCounter();
      renderCheckinList();
    });
  }

  // Search input
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const searchTerm = target.value.trim();
      setSearchTerm(searchTerm);
      console.log('🔍 [DEBUG] Searching for:', searchTerm);
      renderCheckinList();
    });
  }

  // Clear search button
  const clearSearchBtn = document.getElementById('clearSearch');
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      setSearchTerm('');
      const searchInputEl = document.getElementById('searchInput') as HTMLInputElement;
      if (searchInputEl) {
        searchInputEl.value = '';
      }
      renderCheckinList();
    });
  }

  // Copy Discord names button
  const copyDiscordNamesBtn = document.getElementById('copyDiscordNamesBtn');
  if (copyDiscordNamesBtn) {
    copyDiscordNamesBtn.addEventListener('click', () => {
      copyDiscordNames();
    });
  }
}
