import type { APIRoute } from 'astro';
import {
  getUserByAddonToken,
  getUserById,
  getUserByDiscordId,
  sendCheerInDB,
  getUnreadCheersFromDB,
  markCheersAsReadInDB,
} from '../../../utils/db';
import { verifySession } from '../../../utils/session';

export const prerender = false;

// 1. POST: Gửi cổ vũ đến bạn học
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  const db = env.DB;
  const sessionSecret = import.meta.env.SESSION_SECRET || env.SESSION_SECRET || 'ankivn-secret-default-key-change-in-prod';

  if (!db) {
    return new Response(JSON.stringify({ error: 'DB D1 chưa sẵn sàng.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return new Response(JSON.stringify({ error: 'Yêu cầu token xác thực.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let senderUser: any = null;
  const tokenPayload = await verifySession<any>(token, sessionSecret);
  if (tokenPayload?.userId) {
    senderUser = await getUserById(db, Number(tokenPayload.userId));
  }
  if (!senderUser && tokenPayload?.discordId) {
    senderUser = await getUserByDiscordId(db, String(tokenPayload.discordId));
  }
  if (!senderUser) {
    senderUser = await getUserByAddonToken(db, token);
  }

  if (!senderUser) {
    return new Response(JSON.stringify({ error: 'Tài khoản không hợp lệ.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const targetId = Number(body.targetId);
  const emoji = String(body.emoji || '🔥').slice(0, 8);

  if (!targetId || targetId === senderUser.id) {
    return new Response(JSON.stringify({ error: 'Mục tiêu cổ vũ không hợp lệ.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await sendCheerInDB(db, {
      senderId: senderUser.id,
      senderName: senderUser.name || 'Một bạn học',
      targetId: targetId,
      emoji: emoji,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Đã gửi cổ vũ ${emoji} thành công!`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// 2. GET: Lấy các cổ vũ chưa đọc gửi đến người dùng
export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  const db = env.DB;
  const sessionSecret = import.meta.env.SESSION_SECRET || env.SESSION_SECRET || 'ankivn-secret-default-key-change-in-prod';

  if (!db) {
    return new Response(JSON.stringify({ error: 'DB D1 chưa sẵn sàng.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return new Response(JSON.stringify({ error: 'Yêu cầu token xác thực.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let user: any = null;
  const tokenPayload = await verifySession<any>(token, sessionSecret);
  if (tokenPayload?.userId) {
    user = await getUserById(db, Number(tokenPayload.userId));
  }
  if (!user && tokenPayload?.discordId) {
    user = await getUserByDiscordId(db, String(tokenPayload.discordId));
  }
  if (!user) {
    user = await getUserByAddonToken(db, token);
  }

  if (!user) {
    return new Response(JSON.stringify({ error: 'Tài khoản không hợp lệ.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const unreadCheers = await getUnreadCheersFromDB(db, user.id);

    // Đánh dấu đã đọc nếu có
    if (unreadCheers.length > 0) {
      const ids = unreadCheers.map((c) => c.id);
      await markCheersAsReadInDB(db, ids);
    }

    return new Response(
      JSON.stringify({
        success: true,
        cheers: unreadCheers,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
