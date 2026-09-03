import type { APIRoute } from 'astro';
export const prerender = false;

// Endpoint nạp dữ liệu cards_studied / minutes_studied vào bảng checkins (AC11 = challenge 4).
// POST { secret, rows: [{ discordId, date, cards, minutes }] }
// - Đảm bảo cột tồn tại (ALTER TABLE ... IF NOT EXISTS guard qua pragma).
// - UPDATE checkins WHERE discord_id = ? AND date = ? AND challenge_id = ?
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!env.DB) return new Response(JSON.stringify({ error: 'No DB' }), { status: 500 });
  const adminPassword = env.ADMIN_PASSWORD || import.meta.env.ADMIN_PASSWORD || 'admin123';
  const body:any = await request.json().catch(()=>({}));
  if (String(body.secret||'') !== adminPassword) return new Response(JSON.stringify({ error:'Unauthorized' }),{ status:403 });
  const rows:any[] = Array.isArray(body.rows) ? body.rows : [];
  const challengeId = Number(body.challengeId)||4;

  // Đảm bảo cột tồn tại
  try {
    await env.DB.prepare('ALTER TABLE checkins ADD COLUMN cards_studied INTEGER').run();
  } catch(e:any){ const m=String(e?.message||''); /* duplicate column -> ok */ }
  try {
    await env.DB.prepare('ALTER TABLE checkins ADD COLUMN minutes_studied REAL').run();
  } catch(e:any){ /* duplicate column -> ok */ }

  let updated=0, missing=0;
  for (const r of rows){
    const discordId = String(r.discordId||'');
    const date = String(r.date||'');
    const cards = Number(r.cards);
    const minutes = (r.minutes===null||r.minutes===undefined) ? null : Number(r.minutes);
    if(!discordId||!date){ missing++; continue; }
    const res = await env.DB.prepare(`UPDATE checkins SET cards_studied = ?, minutes_studied = ? WHERE discord_id = ? AND date = ? AND challenge_id = ?`)
      .bind(Number.isFinite(cards)?cards:null, minutes, discordId, date, challengeId).run();
    const ch = (res?.meta?.changes ?? 0);
    if(ch>0) updated++; else missing++;
  }
  return new Response(JSON.stringify({ ok:true, challengeId, updated, missing }), { headers:{'Content-Type':'application/json; charset=utf-8'} });
};
export const GET: APIRoute = async (ctx) => POST(ctx as any);