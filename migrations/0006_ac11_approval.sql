-- Migration: 0006_ac11_approval.sql
-- Đánh dấu thành viên đã được admin duyệt đăng ký AC11 (1 = đã duyệt)
ALTER TABLE users ADD COLUMN ac11_approved INTEGER DEFAULT 0;