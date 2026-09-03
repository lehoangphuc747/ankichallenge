-- Migration: 0009_add_cards_and_minutes_to_checkins.sql
-- Thêm cột số thẻ học + số phút học cho mỗi checkin (học bao nhiêu thẻ trong bao nhiêu phút).
-- Nguồn: đọc từ screenshot Anki của thành viên (cards_studied = "Studied X cards", minutes_studied = "in Y minutes").

ALTER TABLE checkins ADD COLUMN cards_studied INTEGER;
ALTER TABLE checkins ADD COLUMN minutes_studied REAL;
