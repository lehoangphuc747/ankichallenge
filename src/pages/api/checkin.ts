// API endpoint để cập nhật dữ liệu check-in.
// Chỉ hoạt động khi chạy với Node adapter (npm run dev hoặc Node server).
// Dùng làm tool admin local để sửa file JSON, sau đó commit và deploy static.

import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

// Không pre-render endpoint này, để nó chạy server-side
export const prerender = false;

// Đường dẫn tới file lưu lịch sử check-in
const DATA_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'studyRecords.json');

type StudyRecords = Record<string, Record<string, boolean>>;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse body từ request
    const body = await request.json();
    const { date, userId, isChecked } = body as {
      date?: string;
      userId?: number | string;
      isChecked?: boolean;
    };

    // Validate input
    if (!date || userId === undefined || typeof isChecked !== 'boolean') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Thiếu tham số date / userId / isChecked'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Đọc file hiện tại
    let records: StudyRecords = {};
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      records = JSON.parse(fileContent) as StudyRecords;
    } catch (err) {
      // Nếu file chưa tồn tại hoặc lỗi parse thì dùng object rỗng
      console.error('[checkin API] Lỗi đọc file, dùng object rỗng:', err);
      records = {};
    }

    const userKey = String(userId);

    // Tạo key ngày nếu chưa có
    if (!records[date]) {
      records[date] = {};
    }

    if (isChecked) {
      // Đánh dấu đã check-in
      records[date][userKey] = true;
    } else {
      // Bỏ check-in
      delete records[date][userKey];

      // Nếu ngày đó không còn ai check-in thì xoá luôn key ngày
      if (Object.keys(records[date]).length === 0) {
        delete records[date];
      }
    }

    // Ghi lại file với format đẹp (2 spaces)
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(records, null, 2), 'utf-8');

    console.log(`[checkin API] ✅ Saved: date=${date}, userId=${userId}, isChecked=${isChecked}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[checkin API] ❌ Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
