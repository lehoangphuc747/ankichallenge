import type { APIRoute } from 'astro';
export const prerender = false;

// Endpoint tạm: export message+ảnh của 1 daily thread, map theo người gửi.
// POST { day: 1|2 ... } hoặc GET ?day=1
const CLI: Record<number,string> = { 1:'1544031612549726208', 2:'1544396925833445528' };

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  const token = env.DISCORD_TOKEN || import.meta.env.DISCORD_TOKEN;
  if (!token) return new Response(JSON.stringify({ error: 'Missing DISCORD_TOKEN' }), { status: 500 });
  let body:any={}; try{ body = await request.json(); }catch{}
  const day = Number(body.day) || 1;
  const threadId = body.threadId || CLI[day];
  if (!threadId) return new Response(JSON.stringify({ error:'unknown day' }), { status:400 });

  const H={ 'Authorization':`Bot ${token}`, 'User-Agent':'DiscordBot (https://ankichallenge.pages.dev, 1.0)' };
  const allMsgs=[]; let before;
  try{
    while(true){
      const qs=new URLSearchParams({limit:'100'}); if(before) qs.set('before',before);
      const r=await fetch(`https://discord.com/api/v10/channels/${threadId}/messages?${qs}`,{headers:H});
      if(!r.ok) return new Response(JSON.stringify({error:`Discord ${r.status}`}),{status:502});
      const j=await r.json(); allMsgs.push(...j); if(j.length<100) break; before=j[j.length-1].id;
    }
  }catch(e){ return new Response(JSON.stringify({error:String(e)}),{status:500}); }
  allMsgs.reverse();

  const rows=allMsgs.map(m=>({
    id:m.id,
    author:m.author?.global_name||m.author?.username||'unknown',
    authorId:m.author?.id||'unknown',
    authorAvatar:m.author?.avatar?`https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png?size=128`:null,
    timestamp:m.timestamp,
    content:m.content||'',
    images:(m.attachments||[]).map((a:any)=>({ name:a.filename||'file', url:a.url, contentType:a.content_type, size:a.size })),
    embeds:m.embeds?.length||0,
  }));
  return new Response(JSON.stringify({ day, threadId, total:rows.length, messages:rows }), { headers:{'Content-Type':'application/json; charset=utf-8'} });
};
export const GET: APIRoute = async (ctx) => POST(ctx as any);