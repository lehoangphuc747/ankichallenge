# TODOS — Anki Challenge

Danh sách công việc đang dở / dự kiến. Cập nhật khi hoàn thành.

## 🔄 ĐANG LÀM DỞ (chưa commit/deploy)

- [x] Không còn mục nào đang dở ở đây. (Đã xử lý xong checkin + approve AC11.)

## 📌 VIỆC DỰ KIẾN / NICE-TO-HAVE

- [ ] **Set env trên Cloudflare Pages**: `DISCORD_AC11_ROLE_ID` (Role ID role AC11) để nút "Duyệt" ở `/admin/registrations` gán role Discord được. Cũng cần `DISCORD_TOKEN` đã có.
- [ ] Kiểm tra bot có quyền **Manage Roles** và role AC11 nằm dưới role cao nhất của bot.
- [ ] Xác nhận luồng **auto-approve cho veteran AC10**: người từng AC10 (`challengeIds` có 3) được tự động duyệt + gán role khi đăng ký AC11; người mới chờ duyệt thủ công.
- [ ] **KV `challenges` fallback**: sync lại key `challenges` trong KV namespace `DATA` cho khớp AC11 (chạy `npm run backup-kv`).
- [ ] **Auth riêng cho trang admin con** (`/admin/members`, `/admin/challenges`): hiện chỉ `/admin` và endpoint approve yêu cầu login.
- [ ] Cân nhắc: hiển thị `realName`/`attendanceGoal`/trạng thái duyệt trên profile/certificate nếu cần.

## ✅ ĐÃ HOÀN THÀNH (đã deploy)
- AC11 (challenge 4): add vào `challenges.json` + D1 `challenges` table, start `2026-09-01`, 100 ngày.
- Form AC11: tách tên thật/display (display tự lấy Discord), thêm bio/FB/Zalo/mục tiêu chuyên cần; migration `0005` (`real_name`, `attendance_goal`); bắt buộc điền (client + server challenge 4).
- Navbar leaderboard: dropdown thêm AC11 + **mặc định chọn AC11**; banner AC11; gỡ nút AC10.
- Admin: `/admin` (dashboard) + `/admin/registrations` restyle Claude + Lucide.