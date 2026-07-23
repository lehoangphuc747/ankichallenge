import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ redirect, cookies, url }) => {
  const clientId = import.meta.env.DISCORD_CLIENT_ID || (typeof process !== 'undefined' ? process.env.DISCORD_CLIENT_ID : undefined) || '1396026461118267443';
  
  // Tự động xác định redirect_uri dựa trên origin hiện tại (localhost hoặc production)
  const envRedirectUri = import.meta.env.DISCORD_REDIRECT_URI || (typeof process !== 'undefined' ? process.env.DISCORD_REDIRECT_URI : undefined);
  const redirectUri = envRedirectUri || `${url.origin}/api/auth/callback`;

  // Tạo chuỗi state ngẫu nhiên phòng chống CSRF
  const state = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  
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
