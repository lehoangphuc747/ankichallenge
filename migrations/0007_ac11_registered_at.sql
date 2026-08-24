-- Migration: 0007_ac11_registered_at.sql
-- Ghi lại thời điểm đăng ký AC11 cụ thể
ALTER TABLE users ADD COLUMN ac11_registered_at DATETIME;
