// Keyboard navigation handlers cho checkin admin module
// Xử lý tất cả keyboard events và shortcuts

import {
  getSearchTerm,
  setSearchTerm,
  getFocusedItemIndex,
  setFocusedItemIndex,
  getAllCheckinItems,
  setAllCheckinItems
} from './state';
import { renderCheckinList, updateFocusedItem, getAllCheckinItems as getAllCheckinItemsFromUI } from './ui';
import { toggleFocusedItem, goToToday, goToChallengeEnd, checkinAllUnchecked, uncheckAllChecked } from './actions';

// Setup keyboard navigation
export function setupKeyboardNavigation(): void {
  // Global keyboard event handler
  document.addEventListener('keydown', (e) => {
    // Không xử lý nếu đang type trong input/textarea/select
    const activeElement = document.activeElement;
    const isInputFocused = activeElement?.tagName === 'INPUT' || 
                           activeElement?.tagName === 'TEXTAREA' || 
                           activeElement?.tagName === 'SELECT';
    const isSearchInput = activeElement?.id === 'searchInput';
    
    // Ctrl+F hoặc / để focus search
    if ((e.ctrlKey && e.key === 'f') || e.key === '/') {
      e.preventDefault();
      const searchInput = document.getElementById('searchInput') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
      return;
    }

    // Escape để clear search và focus về list
    if (e.key === 'Escape') {
      if (isSearchInput) {
        e.preventDefault();
        setSearchTerm('');
        (activeElement as HTMLInputElement).value = '';
        renderCheckinList();
        const allCheckinItems = getAllCheckinItemsFromUI();
        setAllCheckinItems(allCheckinItems);
        setFocusedItemIndex(-1);
        updateFocusedItem();
        (activeElement as HTMLElement).blur(); // Blur search input
      }
      return;
    }

    // Arrow Up/Down khi đang ở search bar: blur input và di chuyển vào list
    if (isSearchInput && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      (activeElement as HTMLElement).blur(); // Blur search input
      const allCheckinItems = getAllCheckinItemsFromUI();
      setAllCheckinItems(allCheckinItems);
      if (allCheckinItems.length > 0) {
        const focusedItemIndex = getFocusedItemIndex();
        if (focusedItemIndex < 0) {
          // Nếu chưa có focus, focus vào item đầu tiên (ArrowDown) hoặc item cuối cùng (ArrowUp)
          setFocusedItemIndex(e.key === 'ArrowDown' ? 0 : allCheckinItems.length - 1);
        } else {
          // Nếu đã có focus, di chuyển theo hướng
          if (e.key === 'ArrowDown') {
            setFocusedItemIndex(focusedItemIndex < allCheckinItems.length - 1 
              ? focusedItemIndex + 1 
              : 0);
          } else {
            setFocusedItemIndex(focusedItemIndex > 0 
              ? focusedItemIndex - 1 
              : allCheckinItems.length - 1);
          }
        }
        updateFocusedItem();
      }
      return;
    }

    // Enter khi đang ở search bar: blur input và focus vào item đầu tiên
    if (isSearchInput && e.key === 'Enter') {
      e.preventDefault();
      (activeElement as HTMLElement).blur(); // Blur search input
      const allCheckinItems = getAllCheckinItemsFromUI();
      setAllCheckinItems(allCheckinItems);
      if (allCheckinItems.length > 0) {
        const focusedItemIndex = getFocusedItemIndex();
        if (focusedItemIndex < 0) {
          setFocusedItemIndex(0); // Focus vào item đầu tiên
        }
        updateFocusedItem();
      }
      return;
    }

    // Nếu đang focus vào input khác (không phải search), chỉ xử lý Escape và Ctrl+F
    if (isInputFocused && !isSearchInput) {
      return;
    }

    // Date navigation (chỉ khi không focus input)
    if (!isInputFocused) {
      if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('prevDay')?.click();
        return;
      }
      if (e.key === 'ArrowRight' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('nextDay')?.click();
        return;
      }
      if (e.key === 'Home' && !e.ctrlKey) {
        e.preventDefault();
        goToToday();
        return;
      }
      if (e.key === 'End' && !e.ctrlKey) {
        e.preventDefault();
        goToChallengeEnd();
        return;
      }
    }

    // List navigation (chỉ khi không focus input)
    if (!isInputFocused) {
      const allCheckinItems = getAllCheckinItemsFromUI();
      setAllCheckinItems(allCheckinItems);
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const focusedItemIndex = getFocusedItemIndex();
        if (focusedItemIndex < allCheckinItems.length - 1) {
          setFocusedItemIndex(focusedItemIndex + 1);
        } else {
          setFocusedItemIndex(0); // Loop back to top
        }
        updateFocusedItem();
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const focusedItemIndex = getFocusedItemIndex();
        if (focusedItemIndex > 0) {
          setFocusedItemIndex(focusedItemIndex - 1);
        } else {
          setFocusedItemIndex(allCheckinItems.length - 1); // Loop to bottom
        }
        updateFocusedItem();
        return;
      }

      // Space hoặc Enter để toggle
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const focusedItemIndex = getFocusedItemIndex();
        if (focusedItemIndex >= 0) {
          toggleFocusedItem();
        } else if (allCheckinItems.length > 0) {
          // Nếu chưa có focus, focus vào item đầu tiên
          setFocusedItemIndex(0);
          updateFocusedItem();
        }
        return;
      }

      // Tab để di chuyển giữa items
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        const focusedItemIndex = getFocusedItemIndex();
        if (focusedItemIndex < allCheckinItems.length - 1) {
          setFocusedItemIndex(focusedItemIndex + 1);
        } else {
          setFocusedItemIndex(0);
        }
        updateFocusedItem();
        return;
      }

      // Shift+Tab để di chuyển ngược lại
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        const focusedItemIndex = getFocusedItemIndex();
        if (focusedItemIndex > 0) {
          setFocusedItemIndex(focusedItemIndex - 1);
        } else {
          setFocusedItemIndex(allCheckinItems.length - 1);
        }
        updateFocusedItem();
        return;
      }

      // Ctrl+A để check-in tất cả unchecked
      if (e.ctrlKey && e.key === 'a' && !e.shiftKey) {
        e.preventDefault();
        checkinAllUnchecked();
        return;
      }

      // Ctrl+Shift+A để uncheck tất cả checked
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        uncheckAllChecked();
        return;
      }
    }
  });
}
