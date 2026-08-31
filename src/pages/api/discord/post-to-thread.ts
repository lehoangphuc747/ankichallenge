import type { APIRoute } from 'astro';
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  const token = env.DISCORD_TOKEN || import.meta.env.DISCORD_TOKEN;
  if (!token) return new Response(JSON.stringify({ error: 'Missing DISCORD_TOKEN' }), { status: 500 });

  let body: any = {};
  try { body = await request.json(); } catch { body = {}; }
  const threadId = String(body.threadId || body.thread_id || '').trim();
  const content = String(body.content || '').trim();
  if (!threadId || !content) return new Response(JSON.stringify({ error: 'Missing threadId or content' }), { status: 400 });

  const headers = {
    'Authorization': `Bot ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'DiscordBot (https://ankichallenge.pages.dev, 1.0)',
  };
  const res = await fetch(`https://discord.com/api/v10/channels/${threadId}/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
  });
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok) return new Response(JSON.stringify({ error: 'Discord API error', details: j }), { status: 502 });
  return new Response(JSON.stringify({ success: true, messageId: j.id, threadId }), { headers: { 'Content-Type': 'application/json' } });
};

export const GET: APIRoute = async (ctx) => POST(ctx as any);
