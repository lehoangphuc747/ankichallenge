-- Migration: 0010_checkin_update_count.sql
-- Cho phép user check-in nhiều lần/ngày để cập nhật số thẻ & phút.
-- update_count: số lần cập nhật (tăng mỗi lần checkin lại).
-- updated_at: thời điểm cập nhật gần nhất.
ALTER TABLE checkins ADD COLUMN update_count INTEGER DEFAULT 1;
ALTER TABLE checkins ADD COLUMN updated_at DATETIME;
