// API endpoint để cập nhật dữ liệu check-in.
// CHỈ hoạt động khi chạy dev local (npm run dev).
// Khi build static, endpoint này sẽ KHÔNG tồn tại trên production.

import type { APIRoute } from 'astro';

// Không pre-render endpoint này - chỉ chạy server-side khi dev
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Kiểm tra xem có đang chạy trong môi trường có fs không (Node.js)
  // Nếu không có (ví dụ: edge runtime), trả về lỗi
  let fs: typeof import('node:fs/promises') | null = null;
  let path: typeof import('node:path') | null = null;
  
  try {
    // Dynamic import để tránh lỗi khi build
    fs = await import('node:fs/promises');
    path = await import('node:path');
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'API này chỉ hoạt động trên Node.js (dev local)'
      }),
      { status: 501, headers: { 'Content-Type': 'application/json' } }
    );
  }

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

    // Đường dẫn tới file lưu lịch sử check-in
    const DATA_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'studyRecords.json');

    type StudyRecords = Record<string, Record<string, boolean>>;

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
