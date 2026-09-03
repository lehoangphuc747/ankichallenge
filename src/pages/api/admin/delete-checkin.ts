import type { APIRoute } from 'astro';
import { removeCheckinFromDB, getUserByDiscordId } from '../../../utils/db';
export const prerender = false;

// Endpoint tạm: xóa checkin của 1 user trong 1 ngày (AC11 = challenge 4)
// POST { discordId, date }  — optional: userId, challengeId
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return new Response(JSON.stringify({ error: 'No DB' }), { status: 500 });
  const adminPassword = env.ADMIN_PASSWORD || import.meta.env.ADMIN_PASSWORD || 'admin123';
  const body:any = await request.json().catch(()=>({}));
  const secret = String(body.secret||'');
  if (secret !== adminPassword) return new Response(JSON.stringify({ error:'Unauthorized' }),{ status:403 });

  let userId = Number(body.userId);
  const discordId = String(body.discordId||'');
  if (!userId && discordId) { const u = await getUserByDiscordId(env.DB, discordId); userId = u?.id ? Number(u.id) : 0; }
  const challengeId = Number(body.challengeId)||4;
  const date = String(body.date||'');
  if(!userId||!date) return new Response(JSON.stringify({ error:'need userId(hoặc discordId)+date' }),{status:400});

  const ok = await removeCheckinFromDB(env.DB, challengeId, userId, date);
  return new Response(JSON.stringify({ ok, userId, challengeId, date }));
};
export const GET: APIRoute = async (ctx) => POST(ctx as any);