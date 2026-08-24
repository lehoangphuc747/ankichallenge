-- Migration: 0005_ac11_profile_fields.sql
-- Thêm cột cho form đăng ký AC11 (real_name private + attendance_goal)
ALTER TABLE users ADD COLUMN real_name TEXT;
ALTER TABLE users ADD COLUMN attendance_goal INTEGER;
