-- 1. Bảng Users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    discord_id TEXT UNIQUE,
    discord_nickname TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'member',
    challenge_ids TEXT DEFAULT '[]',
    bio TEXT,
    learning TEXT,
    major TEXT,
    facebook_url TEXT,
    zalo_url TEXT,
    birth_year INTEGER,
    place TEXT,
    goals TEXT,
    quotes TEXT,
    hidden INTEGER DEFAULT 0,
    previous_rank INTEGER,
    streak INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);

-- 2. Bảng Challenges
CREATE TABLE IF NOT EXISTS challenges (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    cert_end TEXT,
    total_days INTEGER NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1
);

-- 3. Bảng Checkins (Điểm danh)
CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    discord_id TEXT,
    channel_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(challenge_id) REFERENCES challenges(id),
    UNIQUE(challenge_id, user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_checkins_lookup ON checkins(challenge_id, date, user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user ON checkins(user_id, challenge_id);

-- 4. Bảng Login History
CREATE TABLE IF NOT EXISTS login_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    discord_id TEXT,
    email TEXT,
    logged_in_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip TEXT
);
