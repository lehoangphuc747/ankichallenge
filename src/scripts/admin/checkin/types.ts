// Type definitions cho checkin admin module

// User data structure từ users.json
export interface User {
  id: number;
  name: string;
  discordNickname?: string;
  hidden?: boolean;
  challengeIds?: number[];
  challengeId?: number; // Legacy field, giữ lại để compatibility
}

// Users data structure từ API/JSON
export interface UsersData {
  data: User[];
}

// Challenge date range structure
export interface ChallengeDateRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  name: string;
}

// Challenge date ranges map: challengeId -> ChallengeDateRange
export interface ChallengeDateRanges {
  [challengeId: number]: ChallengeDateRange;
}

// Study records structure: date -> userId -> checked (true/false)
export interface StudyRecords {
  [date: string]: {
    [userId: string]: boolean;
  };
}

// Main state object
export interface CheckinState {
  usersData: UsersData | null;
  studyRecordsData: StudyRecords | null;
  currentDate: string; // YYYY-MM-DD format
  currentChallengeId: number;
  challengeDateRanges: ChallengeDateRanges;
  searchTerm: string;
  focusedItemIndex: number;
  allCheckinItems: HTMLElement[];
  isSaving: boolean;
}

// Toast notification type
export type ToastType = 'success' | 'error';
