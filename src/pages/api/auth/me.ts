import type { APIRoute } from 'astro';
import { verifySession } from '../../../utils/session';

export const GET: APIRoute = async ({ cookies, locals }) => {
  const session = cookies.get('user_session')?.value;
  if (!session) {
    return new Response(JSON.stringify({ authenticated: false, user: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const env = (locals as any).runtime?.env ?? {};
  const sessionSecret = env.SESSION_SECRET || import.meta.env.SESSION_SECRET || 'anki_challenge_secret_key_2026_super_secure';

  const user = await verifySession(session, sessionSecret);
  if (!user) {
    return new Response(JSON.stringify({ authenticated: false, user: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ authenticated: true, user }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
