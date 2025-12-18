// API endpoint để cập nhật dữ liệu users.
// CHỈ hoạt động khi chạy dev local (npm run dev).
// Khi build static, endpoint này sẽ KHÔNG tồn tại trên production.

import type { APIRoute } from 'astro';

// Không pre-render API này - chỉ chạy server-side khi dev
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
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
    // Parse body từ request
    const body = await request.json();
    
    // Đường dẫn tới file users.json
    const DATA_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'users.json');

    // Hỗ trợ 2 format:
    // 1. { data: [...] } - ghi đè toàn bộ file
    // 2. { userId, updates } - cập nhật 1 user cụ thể
    
    if (body.data && Array.isArray(body.data)) {
      // Format 1: Ghi đè toàn bộ file users.json
      const usersData = { data: body.data };
      
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(usersData, null, 2), 'utf-8');
      
      console.log(`[update-users API] ✅ Saved entire users.json (${body.data.length} users)`);
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Format 2: Cập nhật 1 user cụ thể
    const { userId, updates } = body as {
      userId?: number | string;
      updates?: Record<string, any>;
    };

    if (!userId || !updates) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Thiếu tham số. Gửi { data: [...] } hoặc { userId, updates }'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Đọc file hiện tại
    let usersData: { data: any[] } = { data: [] };
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      usersData = JSON.parse(fileContent);
    } catch (err) {
      console.error('[update-users API] Lỗi đọc file:', err);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Không thể đọc file users.json'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Tìm user theo ID
    const userIndex = usersData.data.findIndex((u: any) => u.id === Number(userId));
    
    if (userIndex === -1) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Không tìm thấy user với ID ${userId}`
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cập nhật user
    usersData.data[userIndex] = {
      ...usersData.data[userIndex],
      ...updates
    };

    // Ghi lại file với format đẹp (2 spaces)
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(usersData, null, 2), 'utf-8');

    console.log(`[update-users API] ✅ Updated user ${userId}:`, updates);

    return new Response(
      JSON.stringify({ success: true, user: usersData.data[userIndex] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[update-users API] ❌ Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
