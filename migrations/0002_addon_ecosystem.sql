-- Migration: 0002_addon_ecosystem.sql
-- Thêm các bảng và trường hỗ trợ hệ sinh thái Anki Desktop Addon (100% D1 SQLite)

-- 1. Bổ sung trường addon_token và addon_verified vào bảng users
ALTER TABLE users ADD COLUMN addon_token TEXT;
ALTER TABLE users ADD COLUMN addon_verified INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_users_addon_token ON users(addon_token);

-- 2. Bảng addon_stats: Lưu lịch sử chi tiết từng ngày học (số thẻ, thời gian, retention)
CREATE TABLE IF NOT EXISTS addon_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    cards_reviewed INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    retention_rate REAL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(user_id, challenge_id, date)
);
CREATE INDEX IF NOT EXISTS idx_addon_stats_lookup ON addon_stats(challenge_id, date);
CREATE INDEX IF NOT EXISTS idx_addon_stats_user ON addon_stats(user_id, challenge_id);

-- 3. Bảng study_sessions: Lưu trạng thái học trực tuyến của thành viên (Study Together Live HUD)
CREATE TABLE IF NOT EXISTS study_sessions (
    user_id INTEGER PRIMARY KEY,
    discord_id TEXT,
    display_name TEXT,
    avatar TEXT,
    cards_today INTEGER DEFAULT 0,
    time_today_seconds INTEGER DEFAULT 0,
    last_ping DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_study_sessions_ping ON study_sessions(last_ping);
