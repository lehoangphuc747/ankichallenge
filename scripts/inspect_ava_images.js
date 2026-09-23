import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP status ${res.statusCode}`));
      const ws = fs.createWriteStream(dest);
      res.pipe(ws);
      ws.on('finish', () => ws.close(resolve));
      ws.on('error', reject);
    }).on('error', reject);
  });
}

const images = [
  {
    name: 'ava_d20_1.jpg',
    url: 'https://cdn.discordapp.com/ephemeral-attachments/1536356983656030320/1552001009524416572/Screenshot_2026-09-22-23-56-09-51_a9eef3a2a561b80d5c76daebd0f9a14c.jpg?ex=6ab40513&is=6ab2b393&hm=85e07936b6aa30776e68edf302282a1d7010928d47163dcc104196388e633066&'
  },
  {
    name: 'ava_d20_2.jpg',
    url: 'https://cdn.discordapp.com/ephemeral-attachments/1536356983656030320/1552001858997063910/Screenshot_2026-09-22-23-58-49-36_a9eef3a2a561b80d5c76daebd0f9a14c.jpg?ex=6ab405dd&is=6ab2b45d&hm=be32f44ae73af0ced95601fef426a54433b2964a7d335e5aebbe9d3aec02a700&'
  },
  {
    name: 'ava_d20_corrected.jpg',
    url: 'https://cdn.discordapp.com/attachments/1550947554156478535/1552122738703867914/image0.jpg?ex=6ab47671&is=6ab324f1&hm=a972166f3021ae7753481c1a35c1276bb2cb906aa15d804771f566c13a322b25&'
  },
  {
    name: 'ava_d21.jpg',
    url: 'https://cdn.discordapp.com/ephemeral-attachments/1536356983656030320/1552001535397863455/Screenshot_2026-09-22-23-56-09-51_a9eef3a2a561b80d5c76daebd0f9a14c.jpg?ex=6ab40590&is=6ab2b410&hm=14ff78369d3454491a76dbd2c45fa747ee020a538d4d2ecbb0cd065f5ccf7bce&'
  },
  {
    name: 'ava_d22.jpg',
    url: 'https://cdn.discordapp.com/ephemeral-attachments/1536356983656030320/1552002582267043940/Screenshot_2026-09-23-00-03-41-35_a9eef3a2a561b80d5c76daebd0f9a14c.jpg?ex=6ab4068a&is=6ab2b50a&hm=8653aec743398d0507495910912150bdd3cfe1ecdfc3b72f56bb434def3cdadd&'
  }
];

const outDir = 'discord-export/ava_test';
fs.mkdirSync(outDir, { recursive: true });

async function main() {
  for (const img of images) {
    const dest = path.join(outDir, img.name);
    try {
      await downloadFile(img.url, dest);
      console.log(`Downloaded ${img.name} (${fs.statSync(dest).size} bytes)`);
    } catch (e) {
      console.error(`Failed ${img.name}:`, e.message);
    }
  }
}

main().catch(console.error);
