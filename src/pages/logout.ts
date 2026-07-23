import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('user_session', { path: '/' });
  return redirect('/');
};
