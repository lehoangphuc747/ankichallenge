-- Lưu link ảnh chứng thực của check-in (Discord CDN URL, chỉ là chuỗi, không phải file)
ALTER TABLE checkins ADD COLUMN image_url TEXT;
CREATE INDEX IF NOT EXISTS idx_checkins_image ON checkins(image_url);
