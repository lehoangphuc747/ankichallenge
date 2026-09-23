import fs from 'node:fs';

const chat = JSON.parse(fs.readFileSync('discord-export/day20/chat.json', 'utf8'));

for (const m of chat) {
  if (m.content.includes('895672321916960838') || m.authorId === '895672321916960838') {
    console.log(`Msg ID: ${m.id} | Author: ${m.author} | Content: ${m.content} | Images:`, m.images);
  }
}
