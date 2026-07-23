import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies }) => {
  const session = cookies.get('user_session')?.value;
  if (!session) {
    return new Response(JSON.stringify({ authenticated: false, user: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const user = JSON.parse(session);
    return new Response(JSON.stringify({ authenticated: true, user }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ authenticated: false, user: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
