// API endpoint để cập nhật dữ liệu users.
// Lưu vào Cloudflare KV (hoặc fallback file local khi dev).

import type { APIRoute } from 'astro';
import { getFromKV, putToKV } from '../../utils/kv';
import { verifySession } from '../../utils/session';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    // 1. Verify user session
    const sessionCookie = cookies.get('user_session')?.value;
    const env = (locals as any).runtime?.env ?? {};
    const sessionSecret = env.SESSION_SECRET || import.meta.env.SESSION_SECRET;

    if (!sessionCookie || !sessionSecret) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bạn cần đăng nhập để thực hiện thao tác này' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const loggedUser = await verifySession<{ id: string; username: string; memberId?: number | null; role?: string }>(
      sessionCookie,
      sessionSecret
    );

    if (!loggedUser || !loggedUser.memberId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phiên đăng nhập không hợp lệ hoặc chưa liên kết thành viên' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Request body không hợp lệ (không phải JSON)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hỗ trợ format 1: { data: [...] } (chỉ admin mới có quyền ghi đè toàn bộ)
    if (body.data && Array.isArray(body.data)) {
      if (loggedUser.role !== 'admin') {
        return new Response(
          JSON.stringify({ success: false, error: 'Chỉ Admin mới có quyền cập nhật toàn bộ dữ liệu' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (env.DATA) {
        await putToKV(env, 'users', { data: body.data });
      }
      console.log(`[update-users API] Admin ${loggedUser.username} saved entire users list`);
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
        JSON.stringify({ success: false, error: 'Thiếu tham số. Gửi { userId, updates }' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Authorization Check: User can only edit their own profile unless admin
    const targetIdNum = Number(userId);
    const isOwner = Number(loggedUser.memberId) === targetIdNum;
    const isAdmin = loggedUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bạn không có quyền chỉnh sửa trang cá nhân này' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Prevent modifying critical protected fields
    const safeUpdates = { ...updates };
    delete safeUpdates.id;
    delete safeUpdates.role;
    delete safeUpdates.discordId;
    delete safeUpdates.email;

    // Đọc users hiện tại từ KV
    let usersData: { data: any[] } = await getFromKV(env, 'users', request.url) || { data: [] };

    // Tìm user theo ID
    const userIndex = usersData.data.findIndex((u: any) => u.id === targetIdNum);

    if (userIndex === -1) {
      return new Response(
        JSON.stringify({ success: false, error: `Không tìm thấy thành viên với ID ${userId}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cập nhật user
    usersData.data[userIndex] = {
      ...usersData.data[userIndex],
      ...safeUpdates,
    };

    // Ghi lại vào KV
    if (env.DATA) {
      await putToKV(env, 'users', usersData);
    }

    console.log(`[update-users API] Updated user ${userId} by ${loggedUser.username}:`, safeUpdates);

    return new Response(
      JSON.stringify({ success: true, user: usersData.data[userIndex] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[update-users API] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Lỗi hệ thống' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
