import type { APIRoute } from 'astro';
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  const token = env.DISCORD_TOKEN || import.meta.env.DISCORD_TOKEN;
  if (!token) return new Response(JSON.stringify({ error: 'Missing DISCORD_TOKEN' }), { status: 500 });
  let body: any = {};
  try { body = await request.json(); } catch { body = {}; }
  const action = String(body.action || 'delete').trim();
  const channelId = String(body.channelId || body.threadId || '').trim();
  const messageId = String(body.messageId || '').trim();
  const content = body.content ? String(body.content) : null;
  if (!channelId || !messageId) return new Response(JSON.stringify({ error: 'Missing channelId/threadId or messageId' }), { status: 400 });

  const headers: Record<string, string> = {
    'Authorization': `Bot ${token}`,
    'User-Agent': 'DiscordBot (https://ankichallenge.pages.dev, 1.0)',
  };
  if (action === 'delete') {
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, { method: 'DELETE', headers });
    if (!res.ok && res.status !== 204) {
      const j = await res.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: 'Discord delete failed', details: j, status: res.status }), { status: 502 });
    }
    return new Response(JSON.stringify({ success: true, deleted: messageId }), { headers: { 'Content-Type': 'application/json' } });
  }
  if (action === 'edit' && content) {
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const j: any = await res.json().catch(() => ({}));
    if (!res.ok) return new Response(JSON.stringify({ error: 'Discord edit failed', details: j }), { status: 502 });
    return new Response(JSON.stringify({ success: true, edited: j.id }), { headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
};
