-- Migration: 0003_study_lounge.sql
-- Hỗ trợ Phòng Học Tự Thân (Native Study Lounge): Pomodoro status và Cổ vũ 1-chạm (Cheers)

-- 1. Bổ sung trường pomodoro và trạng thái học vào bảng study_sessions
ALTER TABLE study_sessions ADD COLUMN is_focusing INTEGER DEFAULT 0;
ALTER TABLE study_sessions ADD COLUMN pomodoro_count INTEGER DEFAULT 0;
ALTER TABLE study_sessions ADD COLUMN current_activity TEXT;

-- 2. Bảng cheers: Lưu các tương tác cổ vũ thời gian thực giữa các thành viên
CREATE TABLE IF NOT EXISTS cheers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    sender_name TEXT NOT NULL,
    target_id INTEGER NOT NULL,
    emoji TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    is_read INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_cheers_target ON cheers(target_id, is_read);
CREATE INDEX IF NOT EXISTS idx_cheers_created ON cheers(created_at);
