-- Migration: 0004_ac11_challenge.sql
-- Thêm Anki Challenge 11 (challengeId = 4) vào bảng challenges
-- Bắt đầu: 2026-09-01, 100 ngày (giống AC9/AC10)

INSERT OR REPLACE INTO challenges (id, name, start_date, end_date, total_days, description, is_active)
VALUES (4, 'Anki Challenge 11', '2026-09-01', '2026-12-09', 100, '100 ngày thử thách', 1);
