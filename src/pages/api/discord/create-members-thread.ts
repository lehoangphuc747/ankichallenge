import type { APIRoute } from 'astro';
import { getUsersFromDB } from '../../../utils/db';
import { getFromKV } from '../../../utils/kv';
import { postAC11MembersToThread, AC11_THREAD_NAME } from '../../../utils/threads';
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};

  const cronSecret = env.CRON_SECRET || import.meta.env.CRON_SECRET;
  if (cronSecret) {
    const got = request.headers.get('x-cron-secret');
    if (got !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
  }

  const token = env.DISCORD_TOKEN || import.meta.env.DISCORD_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: 'Missing DISCORD_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const url = String(request.url || '');
  const reset = (() => { try { return new URL(url).searchParams.get('reset') === '1'; } catch { return false; } })();

  // 1. Lấy danh sách user đã đăng ký AC11
  let userList: any[] = [];
  if (env.DB) {
    const fromDb = await getUsersFromDB(env.DB);
    userList = fromDb.data;
  } else {
    const usersData = await getFromKV<any>(env, 'users', url);
    userList = (usersData?.data && Array.isArray(usersData.data)) ? usersData.data : [];
  }
  const ac11Users = userList.filter((u: any) => (u.challengeIds || []).includes(4));

  const result = await postAC11MembersToThread(env, url, ac11Users, { reset });

  return new Response(
    JSON.stringify({
      success: result.ok,
      error: result.error || undefined,
      threadName: AC11_THREAD_NAME,
      threadId: result.threadId,
      totalAC11: ac11Users.length,
      posted: result.posted,
      skipped: result.skipped,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};

export const GET: APIRoute = async (ctx) => POST(ctx as any);