import type { APIRoute } from 'astro';
import { getFromKV, putToKV } from '../../../utils/kv';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    const adminPassword = import.meta.env.ADMIN_PASSWORD || 
                          (typeof process !== 'undefined' ? process.env.ADMIN_PASSWORD : undefined) || 
                          'admin123';
    const adminCookie = cookies.get('admin_session')?.value;
    const isPassAuthed = adminCookie === adminPassword;

    const env = (locals as any).runtime?.env ?? {};

    if (!isPassAuthed) {
      return new Response(
        JSON.stringify({ success: false, error: 'Không có quyền Admin' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { logId, discordId, discordNickname, email, memberId } = await request.json();

    if (!memberId || (!discordId && !logId)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Thiếu thông tin memberId hoặc discordId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Lấy dữ liệu users từ KV
    const usersData = await getFromKV(env, 'users', request.url);
    if (!usersData || !Array.isArray(usersData.data)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Không thể đọc dữ liệu thành viên từ KV' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const targetMember = usersData.data.find((m: any) => m.id === parseInt(memberId));
    if (!targetMember) {
      return new Response(
        JSON.stringify({ success: false, error: `Không tìm thấy thành viên ID #${memberId}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Gán discordId và thông tin liên quan
    targetMember.discordId = String(discordId);
    if (discordNickname) {
      targetMember.discordNickname = discordNickname;
    }
    if (email && (!targetMember.email || targetMember.email === '')) {
      targetMember.email = email;
    }

    // 3. Lưu lại danh sách users vào KV
    if (env.DATA) {
      await putToKV(env, 'users', usersData);
    }

    // 4. Cập nhật nhật ký login_history trong KV nếu có logId
    try {
      const historyList = await getFromKV<any[]>(env, 'login_history', request.url);
      if (Array.isArray(historyList)) {
        let historyUpdated = false;
        for (const log of historyList) {
          if (log.id === logId || String(log.discordId) === String(discordId)) {
            log.memberId = targetMember.id;
            log.memberName = targetMember.name;
            historyUpdated = true;
          }
        }
        if (historyUpdated && env.DATA) {
          await putToKV(env, 'login_history', historyList);
        }
      }
    } catch (err) {
      console.warn('[map-discord] Cannot update login_history in KV:', err);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Đã ghép nối thành công Discord ID ${discordId} với thành viên #${targetMember.id} (${targetMember.name})`,
        member: targetMember
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[map-discord error]', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Lỗi hệ thống' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
