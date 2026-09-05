# Plan: OCR Check-in Images bằng Antigravity (Gemini)

## Mục tiêu
OCR toàn bộ ảnh check-in từ các daily thread D1-D5 để thu thập dữ liệu: số thẻ đã học, thời gian học, streak, tên deck.

## Trạng thái hiện tại

| Ngày | Ảnh | OCR status | File kết quả |
|------|------|-----------|--------------|
| D1-01/09 | 22 ảnh | ✅ Xong (28 users) | `discord-export/ocr-results.json` |
| D2-02/09 | 0 ảnh | ✅ Xong (16 users, ảnh từ thread khác) | `discord-export/ocr-results.json` |
| D3-03/09 | 33 ảnh | ✅ Xong (Antigravity Gemini) | `discord-export/ocr-results.json` |
| D4-04/09 | 15 ảnh | ✅ Xong (Antigravity Gemini) | `discord-export/ocr-results.json` |
| D5-05/09 | 0 ảnh | — | Chưa có check-in |

## Task cần làm

### 1. Setup Antigravity
- [x] Antigravity IDE & Subagents
- [x] Dùng Gemini Vision qua `view_file`
- [x] Test OCR ảnh mẫu thành công

### 2. OCR Day3 (33 ảnh)
- [x] Batch OCR tất cả ảnh trong `discord-export/D3-03/09/` qua các subagent
- [x] Trích xuất: `cards`, `minutes`, `streak`, `deck name`
- [x] Append kết quả vào `ocr-results.json` → key `day3`

### 3. OCR Day4 (15 ảnh)
- [x] Batch OCR tất cả ảnh trong `discord-export/D4-04/09/` qua subagent
- [x] Trích xuất: `cards`, `minutes`, `streak`, `deck name`
- [x] Append kết quả vào `ocr-results.json` → key `day4`

### 4. Tổng hợp & Validate
- [x] Cross-check OCR results và loại bỏ placeholder cũ
- [x] Verify số liệu hợp lý (cards, minutes, streak)
- [ ] Xuất summary: top learners, avg cards/day, most studied decks

## Prompt mẫu cho Antigravity

```
Đây là screenshot từ AnkiDroid / app học tập (Anki flashcard).
Hãy OCR và trả về JSON:
{
  "cards": <số thẻ học/hôm nay>,
  "minutes": <thời gian học, phút>,
  "streak": <chuỗi ngày học liên tiếp>,
  "deck": "<tên deck chính>",
  "detail": "<mô tả ngắn gọn các stats visible>"
}
Nếu không thấy field nào, để null.
```

## Cấu trúc output (`ocr-results.json`)

```json
{
  "day1": { "discordId": { "user": "name", "cards": 100, "minutes": 30, "detail": "..." } },
  "day2": { ... },
  "day3": { ... },
  "day4": { ... }
}
```

## Files liên quan
- `discord-export/D1-01/09/` — 22 ảnh Day1
- `discord-export/D3-03/09/` — 33 ảnh Day3
- `discord-export/D4-04/09/` — 15 ảnh Day4
- `discord-export/ocr-results.json` — kết quả OCR (hiện có Day1 + Day2)
- `src/utils/daily-quotes.json` — quotes cho daily threads
