import type { APIRoute } from 'astro';
import { verifySession, signSession } from '../../../utils/session';

export const prerender = false;

const ANKI_GUILD_ID = '867268399687663616';

export const GET: APIRoute = async ({ cookies, locals }) => {
  const session = cookies.get('user_session')?.value;
  if (!session) {
    return new Response(JSON.stringify({ authenticated: false, inGuild: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const env = (locals as any).runtime?.env ?? {};
  const sessionSecret = env.SESSION_SECRET || import.meta.env.SESSION_SECRET || 'anki_challenge_secret_key_2026_super_secure';
  const botToken = env.DISCORD_TOKEN || import.meta.env.DISCORD_TOKEN;

  const user = await verifySession<any>(session, sessionSecret);
  if (!user) {
    return new Response(JSON.stringify({ authenticated: false, inGuild: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let inGuild = Boolean(user.inGuild);

  // Nếu có Bot Token, có thể kiểm tra trực tiếp qua Guild Members API của Discord Bot
  if (botToken && user.id) {
    try {
      const memberRes = await fetch(
        `https://discord.com/api/v10/guilds/${ANKI_GUILD_ID}/members/${user.id}`,
        {
          headers: {
            Authorization: `Bot ${botToken}`,
          },
        }
      );
      if (memberRes.ok) {
        inGuild = true;
        // Cập nhật lại session cookie nếu trạng thái thay đổi
        if (!user.inGuild) {
          user.inGuild = true;
          const signedSession = await signSession(user, sessionSecret);
          cookies.set('user_session', signedSession, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
          });
        }
      } else if (memberRes.status === 404) {
        inGuild = false;
      }
    } catch (e) {
      console.warn('[Check Guild API Warning]', e);
    }
  }

  return new Response(
    JSON.stringify({
      authenticated: true,
      inGuild,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        email: user.email,
        inGuild,
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
