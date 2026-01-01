// State management cho checkin admin module
// Quản lý tất cả state variables và cung cấp getters/setters

import type { CheckinState, UsersData, StudyRecords, ChallengeDateRanges } from './types';

// State object chứa tất cả state variables
const state: CheckinState = {
  usersData: null,
  studyRecordsData: null,
  currentDate: '',
  currentChallengeId: 1, // Sẽ được cập nhật tự động sau khi load challenges
  challengeDateRanges: {},
  searchTerm: '',
  focusedItemIndex: -1,
  allCheckinItems: [],
  isSaving: false
};

// Getters
export function getUsersData(): UsersData | null {
  return state.usersData;
}

export function getStudyRecordsData(): StudyRecords | null {
  return state.studyRecordsData;
}

export function getCurrentDate(): string {
  return state.currentDate;
}

export function getCurrentChallengeId(): number {
  return state.currentChallengeId;
}

export function getChallengeDateRanges(): ChallengeDateRanges {
  return state.challengeDateRanges;
}

export function getSearchTerm(): string {
  return state.searchTerm;
}

export function getFocusedItemIndex(): number {
  return state.focusedItemIndex;
}

export function getAllCheckinItems(): HTMLElement[] {
  return state.allCheckinItems;
}

export function getIsSaving(): boolean {
  return state.isSaving;
}

// Setters
export function setUsersData(data: UsersData | null): void {
  state.usersData = data;
}

export function setStudyRecordsData(data: StudyRecords | null): void {
  state.studyRecordsData = data;
}

export function setCurrentDate(date: string): void {
  state.currentDate = date;
}

export function setCurrentChallengeId(id: number): void {
  state.currentChallengeId = id;
}

export function setChallengeDateRanges(ranges: ChallengeDateRanges): void {
  state.challengeDateRanges = ranges;
}

export function setSearchTerm(term: string): void {
  state.searchTerm = term;
}

export function setFocusedItemIndex(index: number): void {
  state.focusedItemIndex = index;
}

export function setAllCheckinItems(items: HTMLElement[]): void {
  state.allCheckinItems = items;
}

export function setIsSaving(saving: boolean): void {
  state.isSaving = saving;
}

// Helper functions để update nested state
export function updateStudyRecordForDate(date: string, userId: number, checked: boolean): void {
  if (!state.studyRecordsData) {
    state.studyRecordsData = {};
  }
  if (!state.studyRecordsData[date]) {
    state.studyRecordsData[date] = {};
  }
  if (checked) {
    state.studyRecordsData[date][userId.toString()] = true;
  } else {
    delete state.studyRecordsData[date][userId.toString()];
  }
}

export function deleteStudyRecordForDate(date: string, userId: number): void {
  if (state.studyRecordsData && state.studyRecordsData[date]) {
    delete state.studyRecordsData[date][userId.toString()];
  }
}

// Export state object để các modules khác có thể truy cập trực tiếp nếu cần
export { state };
