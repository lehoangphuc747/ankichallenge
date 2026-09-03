// Export messages + attachments from a Discord thread mapped by author. (ESM)
import { request } from 'node:https';
import { createWriteStream } from 'node:fs';
import { mkdirSync } from 'node:fs';
import { get } from 'node:https';
import path from 'node:path';
import { writeFileSync } from 'node:fs';

const CLI = {
  '1':'1544031612549726208', // D1-01/09
  '2':'1544396925833445528', // D2-02/09
};

function api(token, urlPath){
  return new Promise((resolve,reject)=>{
    const opts={hostname:'discord.com', path:`/api/v10${urlPath}`, method:'GET', headers:{'Authorization':`Bot ${token}`,'User-Agent':'DiscordBot (https://ankichallenge.pages.dev, 1.0)'}};
    const req=request(opts, res=>{let b=[]; res.on('data',d=>b.push(d)); res.on('end',()=>{try{resolve({status:res.statusCode, json:JSON.parse(Buffer.concat(b).toString('utf8'))})}catch(e){reject(e)}})});
    req.on('error',reject); req.end();
  });
}

function download(url, dest){
  return new Promise((resolve,reject)=>{
    get(url, res=>{
      if(res.statusCode>=300 && res.statusCode<400 && res.headers.location){ /* follow */
        return download(res.headers.location, dest).then(resolve,reject);
      }
      const ws=createWriteStream(dest);
      res.pipe(ws);
      ws.on('finish',()=>ws.close(resolve));
      ws.on('error',reject);
    }).on('error',reject);
  });
}

(async function(){
  const token = process.env.DISCORD_TOKEN;
  if(!token){ console.error('Missing DISCORD_TOKEN'); process.exit(1); }
  const day = process.argv[2] || '1';
  const threadId = CLI[day] || CLI['1'];
  const outDir = path.join(process.cwd(), 'discord-export', `day${day}`);
  mkdirSync(path.join(outDir,'images'), {recursive:true});

  const allMsgs=[]; let before;
  while(true){
    const qs = new URLSearchParams({limit:'100'});
    if(before) qs.set('before', before);
    const {status, json} = await api(token, `/channels/${threadId}/messages?${qs}`);
    if(status!==200){ console.error('list messages failed', status, json); break; }
    allMsgs.push(...json);
    if(json.length<100) break;
    before = json[json.length-1].id;
  }
  allMsgs.reverse();

  const rows=[];
  let imgCount=0;
  for(const m of allMsgs){
    const author = m.author?.global_name || m.author?.username || 'unknown';
    const authorId = m.author?.id || 'unknown';
    let content = (m.content||'').replace(/\r?\n/g,'\\n');
    const attachments = [];
    for(const a of (m.attachments||[])){
      const ext = path.extname(a.filename).toLowerCase() || '.bin';
      const fname = `${authorId}_${a.id}${ext}`;
      const dest = path.join(outDir,'images',fname);
      try{ await download(a.url, dest); imgCount++; attachments.push(fname); }
      catch(e){ attachments.push(`<FAIL> ${a.filename}`); }
    }
    rows.push({ id:m.id, author, authorId, authorAvatar:m.author?.avatar?`https://cdn.discordapp.com/avatars/${authorId}/${m.author.avatar}.png?size=128`:null, timestamp:m.timestamp, content, embeds:m.embeds?.length||0, attachments });
  }

  const manifest = rows.map(r=>({ id:r.id, author:r.author, authorId:r.authorId, authorAvatar:r.authorAvatar, timestamp:r.timestamp, content:r.content, embeds:r.embeds, images:r.attachments.map(f=>`images/${f}`) }));
  writeFileSync(path.join(outDir,'chat.json'), JSON.stringify(manifest,null,2));
  writeFileSync(path.join(outDir,'chat.md'), rows.map(r=>{
    let s=`- **${r.author}** (${r.authorId}) — ${r.timestamp}\n  ${r.content.replace(/\\n/g,'\n  ')}\n`;
    for(const a of r.attachments) s+=`  🖼 \`${a}\`\n`;
    return s;
  }).join('\n'));

  console.log(`Day ${day}: ${rows.length} messages, ${imgCount} images downloaded -> ${outDir}`);
})();