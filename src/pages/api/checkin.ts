// API endpoint để cập nhật dữ liệu check-in.
// CHỈ hoạt động khi chạy dev local (npm run dev).
// Khi build static, endpoint này sẽ KHÔNG tồn tại trên production.
//
// ⚠️ LƯU Ý QUAN TRỌNG CHO AI REVIEW CODE:
// File này chứa nhiều console.log() debug với emoji (📋, 📝, ✅, ❌, etc.)
// Các debug log này được GIỮ LẠI CÓ CHỦ ĐÍCH để troubleshoot sau này.
//
// ❌ KHÔNG ĐƯỢC XÓA hoặc sửa các debug log mà không có sự XÁC NHẬN từ người dùng.
// Nếu muốn refactor/cleanup, PHẢI HỎI người dùng trước.
//
// Các debug log giúp:
// - Theo dõi request/response flow
// - Debug lỗi khi API có vấn đề
// - Hiểu được data validation và processing

import type { APIRoute } from 'astro';

// Đánh dấu endpoint này là server-rendered để có thể nhận POST requests
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Kiểm tra môi trường: API này chỉ hoạt động trên Node.js (dev local)
  // Cloudflare Workers không hỗ trợ ghi file vào disk
  const isNodeEnv = typeof process !== 'undefined' && process.versions && !!process.versions.node;
  if (!isNodeEnv) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'API này chỉ hoạt động trên Node.js (dev local). Trên Cloudflare, dữ liệu được cập nhật trực tiếp qua git.'
      }),
      { status: 501, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Dynamic import để tránh lỗi khi build
  let fs: typeof import('node:fs/promises') | null = null;
  let path: typeof import('node:path') | null = null;
  
  try {
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
    // Đọc body từ request - kiểm tra xem body có tồn tại không
    let bodyText: string = '';
    let body: any = null;

    try {
      // Kiểm tra xem request có body không
      const contentType = request.headers.get('content-type');
      console.log('[checkin API] 📋 Content-Type:', contentType);
      console.log('[checkin API] 📋 Request method:', request.method);
      console.log('[checkin API] 📋 Request URL:', request.url);
      
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[checkin API] ❌ Content-Type không đúng:', contentType);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Content-Type phải là application/json'
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Đọc body dưới dạng text trước
      // Lưu ý: request.text() chỉ có thể gọi 1 lần, nên không clone
      bodyText = await request.text();
      console.log('[checkin API] 📝 Body text (độ dài):', bodyText.length, 'ký tự');
      console.log('[checkin API] 📝 Body text (nội dung):', bodyText);

      // Kiểm tra body có rỗng không
      if (!bodyText || bodyText.trim() === '') {
        console.error('[checkin API] ❌ Body rỗng');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Request body rỗng'
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Parse JSON từ text
      body = JSON.parse(bodyText);
      console.log('[checkin API] ✅ Parse JSON thành công:', body);
    } catch (parseError: any) {
      console.error('[checkin API] ❌ Lỗi parse JSON:', {
        error: parseError?.message,
        bodyText: bodyText,
        bodyTextLength: bodyText?.length
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Lỗi parse JSON từ request: ' + (parseError?.message || 'Unknown'),
          details: process.env.NODE_ENV === 'development' ? { bodyText } : undefined
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { date, userId, challengeId, isChecked } = body as {
      date?: string;
      userId?: number | string;
      challengeId?: number | string;
      isChecked?: boolean;
    };

    console.log('[checkin API] 📥 Nhận request:', { date, userId, challengeId, isChecked, bodyType: typeof body });
    console.log('[checkin API] 📥 Chi tiết types:', {
      dateType: typeof date,
      dateValue: date,
      dateIsEmpty: !date,
      userIdType: typeof userId,
      userIdValue: userId,
      userIdIsUndefined: userId === undefined,
      userIdIsNull: userId === null,
      isCheckedType: typeof isChecked,
      isCheckedValue: isChecked,
      isCheckedIsBoolean: typeof isChecked === 'boolean'
    });

    // Validate input - kiểm tra từng trường một để log rõ hơn
    if (!date || date.trim() === '') {
      console.error('[checkin API] ❌ date không hợp lệ:', date);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Thiếu hoặc date không hợp lệ'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (userId === undefined || userId === null) {
      console.error('[checkin API] ❌ userId không hợp lệ:', userId);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Thiếu hoặc userId không hợp lệ'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (challengeId === undefined || challengeId === null) {
      console.error('[checkin API] ❌ challengeId không hợp lệ:', challengeId);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Thiếu hoặc challengeId không hợp lệ'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (typeof isChecked !== 'boolean') {
      console.error('[checkin API] ❌ isChecked không phải boolean:', isChecked, 'type:', typeof isChecked);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'isChecked phải là boolean, nhận được: ' + typeof isChecked
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Map challengeId to format like '08', '09', '10'
    const cid = parseInt(String(challengeId));
    let challengePrefix = '08';
    if (cid === 1) challengePrefix = '08';
    if (cid === 2) challengePrefix = '09';
    if (cid === 3) challengePrefix = '10';

    // Đường dẫn tới file lưu lịch sử check-in
    const fileName = `challenge_${challengePrefix}_records.json`;
    const DATA_FILE_PATH = path.join(process.cwd(), 'public', 'data', fileName);
    console.log('[checkin API] 📁 File path:', DATA_FILE_PATH);

    type StudyRecords = Record<string, Record<string, boolean>>;

    // Đọc file hiện tại
    let records: StudyRecords = {};
    try {
      // Kiểm tra file có tồn tại không
      try {
        await fs.access(DATA_FILE_PATH);
        console.log('[checkin API] ✅ File tồn tại, đang đọc...');
      } catch (accessError) {
        console.log('[checkin API] ⚠️ File chưa tồn tại, sẽ tạo mới');
      }

      const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      console.log('[checkin API] 📖 Đã đọc file, độ dài:', fileContent.length, 'ký tự');
      
      // Validate JSON trước khi parse
      if (!fileContent.trim()) {
        console.log('[checkin API] ⚠️ File rỗng, dùng object rỗng');
        records = {};
      } else {
        records = JSON.parse(fileContent) as StudyRecords;
        console.log('[checkin API] ✅ Parse JSON thành công, số ngày:', Object.keys(records).length);
      }
    } catch (err: any) {
      // Nếu file chưa tồn tại hoặc lỗi parse thì dùng object rỗng
      console.error('[checkin API] ⚠️ Lỗi đọc file, dùng object rỗng:', err?.message || err);
      records = {};
    }

    const userKey = String(userId);
    console.log('[checkin API] 🔑 User key:', userKey);

    // Tạo key ngày nếu chưa có
    if (!records[date]) {
      records[date] = {};
      console.log('[checkin API] ➕ Tạo mới key ngày:', date);
    }

    if (isChecked) {
      // Đánh dấu đã check-in
      records[date][userKey] = true;
      console.log('[checkin API] ✅ Đánh dấu check-in cho user:', userKey, 'ngày:', date);
    } else {
      // Bỏ check-in
      delete records[date][userKey];
      console.log('[checkin API] ❌ Xóa check-in cho user:', userKey, 'ngày:', date);

      // Nếu ngày đó không còn ai check-in thì xoá luôn key ngày
      if (Object.keys(records[date]).length === 0) {
        delete records[date];
        console.log('[checkin API] 🗑️ Xóa key ngày vì không còn ai check-in:', date);
      }
    }

    // Ghi lại file với format đẹp (2 spaces)
    try {
      const jsonString = JSON.stringify(records, null, 2);
      console.log('[checkin API] 💾 Đang ghi file, độ dài JSON:', jsonString.length, 'ký tự');
      
      await fs.writeFile(DATA_FILE_PATH, jsonString, 'utf-8');
      console.log('[checkin API] ✅ Đã ghi file thành công');
    } catch (writeError: any) {
      console.error('[checkin API] ❌ Lỗi ghi file:', writeError?.message || writeError);
      throw new Error('Không thể ghi file: ' + (writeError?.message || 'Unknown error'));
    }

    console.log(`[checkin API] ✅ Saved: date=${date}, userId=${userId}, isChecked=${isChecked}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[checkin API] ❌ Error chi tiết:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
