import type { APIRoute } from 'astro';
import { getUserById, approveAc11InDB } from '../../../utils/db';
import { grantAc11Role } from '../../../utils/discord';
import { postAC11MembersToThread } from '../../../utils/threads';

export const prerender = false;

const ANKI_GUILD_ID = '867268399687663616';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  // Kiểm tra quyền admin (cookie admin_session === ADMIN_PASSWORD)
  const env = (locals as any).runtime?.env ?? {};
  const adminPassword =
    env.ADMIN_PASSWORD ||
    import.meta.env.ADMIN_PASSWORD ||
    (typeof process !== 'undefined' ? process.env.ADMIN_PASSWORD : undefined) ||
    'admin123';
  const sessionCookie = cookies.get('admin_session')?.value;
  if (!sessionCookie || sessionCookie !== adminPassword) {
    return new Response(
      JSON.stringify({ success: false, error: 'Không có quyền quản trị.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Đọc body { userId }
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const userId = Number(body.userId);
  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Thiếu userId.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    if (!env.DB) {
      return new Response(
        JSON.stringify({ success: false, error: 'Chỉ hoạt động khi có D1.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await getUserById(env.DB, userId);
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Không tìm thấy thành viên.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!user.discordId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Thành viên này chưa liên kết Discord.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Đánh dấu đã duyệt trong DB
    await approveAc11InDB(env.DB, userId);

    // Gán role Discord (không block nếu lỗi)
    const granted = await grantAc11Role(env, user.discordId);

    // Đẩy thông tin (giới thiệu + mục tiêu) lên thread AC11 — không block kết quả.
    try {
      await postAC11MembersToThread(env, String(request.url || ''), [user]);
    } catch (e) {
      console.warn('[AC11 Thread Hook] Lỗi đẩy thông tin lên thread:', e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        approved: true,
        granted,
        message: granted
          ? 'Đã duyệt + gán role Discord.'
          : 'Đã duyệt nhưng gán role Discord thất bại (kiểm tra role ID / quyền bot).',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[Admin Approve AC11 Error]', err);
    return new Response(
      JSON.stringify({ success: false, error: `Lỗi hệ thống: ${err?.message || err}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};