import type { APIRoute } from 'astro';
import { getFromKV } from '../../../utils/kv';

/**
 * Thuật toán đối chiếu tài khoản Discord với danh sách thành viên Anki Challenge.
 * Xử lý các edge cases thực tế trong users.json:
 * - Format "username (Display Name)" (ví dụ: endorphin_111 (Medstu QuangXo))
 * - Format Discriminator cũ "username#1234" (ví dụ: hieu7511#3823)
 * - Format Dấu xuyệt "Display Name / username" (ví dụ: Minh Minh / minhminer1412)
 */
function matchMemberByDiscord(u: any, discordUser: any): boolean {
  // 1. Đối chiếu theo Discord ID (Ưu tiên cao nhất)
  if (u.discordId && String(u.discordId) === String(discordUser.id)) {
    return true;
  }

  // 2. Đối chiếu theo Email (nếu cả 2 cùng có email hợp lệ và không rỗng)
  const discordEmailLower = (discordUser.email || '').toLowerCase().trim();
  const userEmailLower = (u.email || '').toLowerCase().trim();
  if (discordEmailLower && userEmailLower && discordEmailLower === userEmailLower) {
    return true;
  }

  // 3. Đối chiếu theo Discord Nickname (xử lý đa dạng định dạng)
  if (u.discordNickname) {
    const rawNick = String(u.discordNickname).toLowerCase().trim();
    const discordUsername = (discordUser.username || '').toLowerCase().trim();
    const discordGlobalName = (discordUser.global_name || '').toLowerCase().trim();

    if (!rawNick) return false;

    // So sánh trực tiếp
    if (rawNick === discordUsername || (discordGlobalName && rawNick === discordGlobalName)) {
      return true;
    }

    // Tách tên trước ngoặc đơn `(`, dấu `#`, hoặc dấu `/`
    const baseNick = rawNick.split(/[\(#\/]/)[0].trim();
    if (baseNick && (baseNick === discordUsername || (discordGlobalName && baseNick === discordGlobalName))) {
      return true;
    }

    // Lấy phần nội dung bên trong ngoặc đơn: "username (Display Name)"
    const insideParenMatch = rawNick.match(/\(([^)]+)\)/);
    if (insideParenMatch) {
      const insideParen = insideParenMatch[1].trim();
      if (insideParen && (insideParen === discordUsername || (discordGlobalName && insideParen === discordGlobalName))) {
        return true;
      }
    }

    // Tách các phần phân cách bằng dấu `/`
    const parts = rawNick.split('/').map((p) => p.trim());
    for (const part of parts) {
      if (part && (part === discordUsername || (discordGlobalName && part === discordGlobalName))) {
        return true;
      }
    }
  }

  return false;
}

export const GET: APIRoute = async ({ url, cookies, redirect, locals }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const savedState = cookies.get('oauth_state')?.value;

  // 1. Kiểm tra phòng chống CSRF
  if (!code || !state || state !== savedState) {
    return new Response(
      JSON.stringify({ error: 'Yêu cầu không hợp lệ hoặc đã hết hạn (CSRF mismatched)' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Xóa cookie state sau khi kiểm tra xong
  cookies.delete('oauth_state', { path: '/' });

  const clientId = import.meta.env.DISCORD_CLIENT_ID || (typeof process !== 'undefined' ? process.env.DISCORD_CLIENT_ID : undefined) || '1396026461118267443';
  const clientSecret = import.meta.env.DISCORD_CLIENT_SECRET || (typeof process !== 'undefined' ? process.env.DISCORD_CLIENT_SECRET : undefined) || 'wR5dYpTlMN8-4qwi8R-7s6TpRGV8Fkqf';
  
  const envRedirectUri = import.meta.env.DISCORD_REDIRECT_URI || (typeof process !== 'undefined' ? process.env.DISCORD_REDIRECT_URI : undefined);
  const redirectUri = envRedirectUri || `${url.origin}/api/auth/callback`;

  try {
    // 2. Đổi OAuth Code lấy Access Token từ Discord
    const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error('[Discord OAuth Error]', tokens);
      return new Response(
        JSON.stringify({ error: `Lỗi lấy token từ Discord: ${tokens.error_description || tokens.error}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Lấy thông tin tài khoản người dùng từ Discord
    const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const discordUser = await userResponse.json();

    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Không thể lấy thông tin người dùng từ Discord' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Đối chiếu (Account Mapping) với danh sách thành viên Anki Challenge
    let memberId: number | null = null;
    let memberName: string | null = null;

    try {
      const usersData = await getFromKV((locals as any).runtime?.env ?? {}, 'users', url.origin);
      const userList = Array.isArray(usersData?.data) ? usersData.data : (Array.isArray(usersData) ? usersData : []);

      const matchedMember = userList.find((u: any) => matchMemberByDiscord(u, discordUser));

      if (matchedMember) {
        memberId = matchedMember.id;
        memberName = matchedMember.name;
      }
    } catch (e) {
      console.warn('[Account Mapping Warning]', e);
    }

    // 5. Tạo session object cho người dùng
    const userData = {
      id: discordUser.id,
      username: discordUser.username,
      displayName: discordUser.global_name || discordUser.username,
      avatar: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/0.png`,
      email: discordUser.email || null,
      memberId: memberId,
      memberName: memberName,
      loggedAt: new Date().toISOString(),
    };

    // 6. Lưu session vào HTTP-only Cookie
    cookies.set('user_session', JSON.stringify(userData), {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
    });

    // 7. Đăng nhập thành công -> Chuyển hướng về trang chủ
    return redirect('/');
  } catch (error) {
    console.error('[Discord Auth Error]', error);
    return new Response('Đã xảy ra lỗi hệ thống khi xác thực với Discord', { status: 500 });
  }
};
