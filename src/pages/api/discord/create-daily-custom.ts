import type { APIRoute } from 'astro';
export const prerender = false;
const CHANNEL_ID = "1541493820242264256";
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  const token = env.DISCORD_TOKEN || import.meta.env.DISCORD_TOKEN;
  if (!token) return new Response(JSON.stringify({ error: 'Missing DISCORD_TOKEN' }), { status: 500 });
  let body:any={}; try{ body=await request.json(); }catch{}
  const day = Number(body.day) || 3;
  const vnDate = String(body.vnDate || '03/09/2026');
  const ddmm = vnDate.slice(0,5);
  const dayLabel = `D${day}-${ddmm}`;
  const messageContent = `## Ngày ${day} - ${vnDate}`;
  const headers: Record<string,string> = { 'Authorization': `Bot ${token}`, 'Content-Type':'application/json', 'User-Agent':'DiscordBot (https://ankichallenge.pages.dev, 1.0)' };
  const msgRes = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, { method:'POST', headers, body: JSON.stringify({ content: messageContent }) });
  const msgJson:any = await msgRes.json();
  if(!msgRes.ok) return new Response(JSON.stringify({ error:'Failed to send message', details: msgJson }), { status:502 });
  const messageId = msgJson.id;
  const threadRes = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages/${messageId}/threads`, { method:'POST', headers, body: JSON.stringify({ name: dayLabel, auto_archive_duration:1440 }) });
  const threadJson:any = await threadRes.json();
  if(!threadRes.ok) return new Response(JSON.stringify({ error:'Failed to create thread', details: threadJson, messageId }), { status:502 });
  return new Response(JSON.stringify({ success:true, day, vnDate, messageId, threadId: threadJson.id, threadName: threadJson.name, messageContent }), { headers:{'Content-Type':'application/json'}});
};
export const GET: APIRoute = async (ctx) => POST(ctx as any);
