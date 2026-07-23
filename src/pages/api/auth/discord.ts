import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ redirect, cookies, url }) => {
  const clientId = import.meta.env.DISCORD_CLIENT_ID || '1396026461118267443';
  
  // Tự động xác định redirect_uri dựa trên origin hiện tại (localhost hoặc production)
  const redirectUri = `${url.origin}/api/auth/callback`;

  // Tạo chuỗi state ngẫu nhiên bằng crypto API an toàn
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const state = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');

  cookies.set('oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 10, // Cookie state sống 10 phút
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify email',
    state: state,
  });

  return redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
};
