import type { APIRoute } from 'astro';
import { verifySession } from '../../../utils/session';

export const GET: APIRoute = async ({ cookies }) => {
  const session = cookies.get('user_session')?.value;
  if (!session) {
    return new Response(JSON.stringify({ authenticated: false, user: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sessionSecret = import.meta.env.SESSION_SECRET;
  if (!sessionSecret) {
    return new Response(JSON.stringify({ authenticated: false, user: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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
