// API endpoint để cập nhật dữ liệu users.
// Lưu vào Cloudflare KV (hoặc fallback file local khi dev).

import type { APIRoute } from 'astro';
import { getFromKV, putToKV } from '../../utils/kv';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Request body không hợp lệ (không phải JSON)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const env = (locals as any).runtime?.env ?? {};

    // Hỗ trợ 2 format:
    // 1. { data: [...] } - ghi đè toàn bộ users
    // 2. { userId, updates } - cập nhật 1 user cụ thể

    if (body.data && Array.isArray(body.data)) {
      // Format 1: Ghi đè toàn bộ
      await putToKV(env, 'users', { data: body.data });
      console.log(`[update-users API] Saved entire users (${body.data.length} users)`);
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
        JSON.stringify({ success: false, error: 'Thiếu tham số. Gửi { data: [...] } hoặc { userId, updates }' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Đọc users hiện tại từ KV
    let usersData: { data: any[] } = await getFromKV(env, 'users', request.url) || { data: [] };

    // Tìm user theo ID
    const userIndex = usersData.data.findIndex((u: any) => u.id === Number(userId));

    if (userIndex === -1) {
      return new Response(
        JSON.stringify({ success: false, error: `Không tìm thấy user với ID ${userId}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cập nhật user
    usersData.data[userIndex] = {
      ...usersData.data[userIndex],
      ...updates,
    };

    // Ghi lại vào KV
    await putToKV(env, 'users', usersData);

    console.log(`[update-users API] Updated user ${userId}:`, updates);

    return new Response(
      JSON.stringify({ success: true, user: usersData.data[userIndex] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[update-users API] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
