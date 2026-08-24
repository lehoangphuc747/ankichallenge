# TODOS — Anki Challenge

Danh sách công việc đang dở / dự kiến. Cập nhật khi hoàn thành.

## 🔄 ĐANG LÀM DỞ (chưa commit/deploy)

- [ ] **`/admin/checkin` restyle Claude (UI JS)**: Template `.astro` đã restyle Claude + Lucide, NHƯNG các hàng danh sách được inject bằng JS trong `src/scripts/admin/checkin/ui.ts` vẫn dùng màu cũ (orange/green) → cần đổi sang tông Claude (terracotta `#CC785C` cho `chưa check`, Claude-green cho `đã check`) + cập nhật class focus ring trong `updateFocusedItem()`.
- [ ] **Build + commit + push + deploy** toàn bộ thay đổi `/admin/checkin` (template + UI JS).
- [ ] **Verify live** `/admin/checkin` sau khi deploy.

## 📌 VIỆC DỰ KIẾN / NICE-TO-HAVE

- [ ] **KV `challenges` fallback**: KV namespace `DATA` chứa key `challenges` cũ (1–3, chưa có AC11). Sync lại (chạy `npm run backup-kv` hoặc ghi KV) cho khớp D1.
- [ ] **Auth riêng cho trang admin con** (`/admin/members`, `/admin/challenges`, `/admin/checkin`, `/admin/registrations`): hiện các trang con chưa tự kiểm tra `admin_session` (chỉ `/admin` yêu cầu login).
- [ ] **`/api/data` thêm nhánh D1 cho records_11**: đã thêm key `records_11` (D1 challenge 4); xác nhận `/checkin` fallback KV dùng `KV_RECORDS[4]='records_11'` đã hoạt động.
- [ ] Cân nhắc: hiển thị `realName`/`attendanceGoal` trên profile/certificate nếu cần (hiện chỉ lưu + hiển thị ở admin registrations).

## ✅ ĐÃ HOÀN THÀNH (đã deploy)
- AC11 (challenge 4): add vào `challenges.json` + D1 `challenges` table, start `2026-09-01`, 100 ngày.
- Form AC11: tách tên thật/display (display tự lấy Discord), thêm bio/FB/Zalo/mục tiêu chuyên cần; migration `0005` (`real_name`, `attendance_goal`); bắt buộc điền (client + server challenge 4).
- Navbar leaderboard: dropdown thêm AC11 + **mặc định chọn AC11**; banner AC11; gỡ nút AC10.
- Admin: `/admin` (dashboard) + `/admin/registrations` restyle Claude + Lucide.