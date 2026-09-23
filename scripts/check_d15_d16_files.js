import fs from 'node:fs';
import path from 'node:path';

for (const d of ['day14', 'day15', 'day16']) {
  const p = path.join('discord-export', d);
  if (fs.existsSync(p)) {
    console.log(`=== ${d} ===`);
    const files = fs.readdirSync(p);
    console.log('Files:', files);
    if (files.includes('chat.json')) {
      const chat = JSON.parse(fs.readFileSync(path.join(p, 'chat.json'), 'utf8'));
      console.log(`chat.json messages: ${chat.length}`);
    }
  } else {
    console.log(`=== ${d} does not exist ===`);
  }
}
