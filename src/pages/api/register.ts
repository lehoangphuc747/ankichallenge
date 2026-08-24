import type { APIRoute } from 'astro';
import { verifySession } from '../../utils/session';
import { registerUserInDB, getUserByDiscordId, approveAc11InDB } from '../../utils/db';
import { grantAc11Role } from '../../utils/discord';
import { getFromKV, putToKV } from '../../utils/kv';

export const prerender = false;

const ANKI_GUILD_ID = '867268399687663616';
const REGISTRATION_OPEN_TIMESTAMP = new Date('2026-08-22T00:00:00+07:00').getTime();

export const POST: APIRoute = async ({ request, cookies, locals, url }) => {
  // Kiểm tra thời gian mở đăng ký (22/08/2026)
  if (Date.now() < REGISTRATION_OPEN_TIMESTAMP) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Cổng đăng ký chưa mở. Thời gian mở chính thức vào ngày 22/08/2026 lúc 00:00:00 (GMT+7).',
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 1. Xác thực session đăng nhập
  const session = cookies.get('user_session')?.value;
  if (!session) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Vui lòng đăng nhập Discord trước khi gửi đăng ký.',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const env = (locals as any).runtime?.env ?? {};
  const sessionSecret =
    env.SESSION_SECRET ||
    import.meta.env.SESSION_SECRET ||
    'anki_challenge_secret_key_2026_super_secure';

  const userSession = await verifySession<any>(session, sessionSecret);
  if (!userSession || !userSession.id) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Kiểm tra tư cách thành viên Discord Anki Việt Nam
  let isMemberOfGuild = Boolean(userSession.inGuild);

  // Nếu trong session chưa ghi nhận, thử kiểm tra trực tiếp qua Bot Token (nếu có cấu hình)
  const botToken = env.DISCORD_TOKEN || import.meta.env.DISCORD_TOKEN;
  if (!isMemberOfGuild && botToken && userSession.id) {
    try {
      const guildRes = await fetch(
        `https://discord.com/api/v10/guilds/${ANKI_GUILD_ID}/members/${userSession.id}`,
        {
          headers: {
            Authorization: `Bot ${botToken}`,
          },
        }
      );
      if (guildRes.ok) {
        isMemberOfGuild = true;
      }
    } catch (e) {
      console.warn('[Register Guild Check Warning]', e);
    }
  }

  if (!isMemberOfGuild) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Bạn chưa tham gia máy chủ Discord Anki Việt Nam. Vui lòng tham gia máy chủ trước khi đăng ký!',
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 3. Đọc dữ liệu gửi lên từ Form (hỗ trợ cả JSON lẫn FormData)
  let bodyData: any = {};
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      bodyData = await request.json();
    } catch {
      bodyData = {};
    }
  } else {
    try {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        bodyData[key] = value;
      });
    } catch {
      bodyData = {};
    }
  }

  const name = String(bodyData.name || userSession.displayName || userSession.username || '').trim();
  if (!name) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Họ và tên không được để trống.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const challengeId = Number(bodyData.challengeId) || 3; // Mặc định Challenge 10 (id = 3)
  const birthYear = bodyData.birthYear ? parseInt(String(bodyData.birthYear), 10) : undefined;
  const attendanceGoalNum = bodyData.attendanceGoal ? parseInt(String(bodyData.attendanceGoal), 10) : undefined;

  const registrationData = {
    name,
    realName: bodyData.realName ? String(bodyData.realName).trim() : undefined,
    email: userSession.email || bodyData.email || undefined,
    discordId: String(userSession.id),
    discordNickname: userSession.username,
    avatar: userSession.avatar,
    birthYear: isNaN(birthYear as number) ? undefined : birthYear,
    place: bodyData.place ? String(bodyData.place).trim() : undefined,
    major: bodyData.major ? String(bodyData.major).trim() : undefined,
    learning: bodyData.learning ? String(bodyData.learning).trim() : undefined,
    bio: bodyData.bio ? String(bodyData.bio).trim() : undefined,
    goals: bodyData.goals ? String(bodyData.goals).trim() : undefined,
    attendanceGoal: isNaN(attendanceGoalNum as number) ? undefined : attendanceGoalNum,
    quotes: bodyData.quotes ? String(bodyData.quotes).trim() : undefined,
    facebookUrl: bodyData.facebookUrl ? String(bodyData.facebookUrl).trim() : undefined,
    zaloUrl: bodyData.zaloUrl ? String(bodyData.zaloUrl).trim() : undefined,
  };

  // Bắt buộc điền đầy đủ cho AC11 (challengeId = 4) — trừ quotes (tùy chọn)
  if (challengeId === 4) {
    const requiredFields: Record<string, any> = {
      realName: registrationData.realName,
      birthYear: registrationData.birthYear,
      place: registrationData.place,
      major: registrationData.major,
      learning: registrationData.learning,
      bio: registrationData.bio,
      facebookUrl: registrationData.facebookUrl,
      zaloUrl: registrationData.zaloUrl,
      attendanceGoal: registrationData.attendanceGoal,
      goals: registrationData.goals,
    };
    const missing = Object.keys(requiredFields).filter(
      (k) => requiredFields[k] === undefined || requiredFields[k] === null || requiredFields[k] === ''
    );
    if (missing.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Vui lòng điền đầy đủ các trường bắt buộc: ${missing.join(', ')}.`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  try {
    let savedUser: any = null;

    // 4. Lưu vào Cloudflare D1
    if (env.DB) {
      savedUser = await registerUserInDB(env.DB, registrationData, challengeId);
    } else {
      // Fallback KV khi chạy môi trường không có D1
      const usersRes = await getFromKV<any>(env, 'users', url.origin);
      const userList = Array.isArray(usersRes?.data) ? usersRes.data : (Array.isArray(usersRes) ? usersRes : []);
      
      let existing = userList.find((u: any) => String(u.discordId) === String(userSession.id));
      if (existing) {
        const ids = new Set(existing.challengeIds || []);
        ids.add(challengeId);
        Object.assign(existing, registrationData, { challengeIds: Array.from(ids) });
        savedUser = existing;
      } else {
        const maxId = userList.reduce((max: number, u: any) => Math.max(max, Number(u.id) || 0), 0);
        savedUser = {
          id: maxId + 1,
          ...registrationData,
          role: 'member',
          challengeIds: [challengeId],
          hidden: false,
          streak: 0,
        };
        userList.push(savedUser);
      }

      if (env.DATA) {
        await putToKV(env, 'users', { data: userList });
      }
    }

    // AC11: đã từng tham gia AC10 (challengeIds có 3) → TỰ ĐỘNG duyệt + gán role.
    // Người mới (chưa từng AC10) → chờ admin duyệt ở /admin/registrations.
    if (challengeId === 4 && savedUser?.discordId) {
      const isAc10Veteran = Array.isArray(savedUser.challengeIds) && savedUser.challengeIds.includes(3);
      if (isAc10Veteran) {
        try {
          if (env.DB) await approveAc11InDB(env.DB, Number(savedUser.id));
          await grantAc11Role(env, String(savedUser.discordId));
        } catch (e) {
          console.warn('[AC11 Auto-approve] Lỗi:', e);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Đăng ký tham gia Anki Challenge thành công!',
        user: savedUser,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[Registration Error]', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Lỗi khi lưu dữ liệu đăng ký: ${err.message || err}`,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
