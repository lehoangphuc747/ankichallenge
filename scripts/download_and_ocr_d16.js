import fs from 'node:fs';
import path from 'node:path';
import { get } from 'node:https';

const images = [
  { user: 'Tram', id: '1446504123657748651', url: 'https://cdn.discordapp.com/ephemeral-attachments/1536356983656030320/1549541905078030486/8D549229-8DBE-45CE-B21E-BE616A1B94AD_4_5005_c.jpeg?ex=6aabbb9b&is=6aaa6a1b&hm=24ad78587be6e3f257fc5045c98dbca4dc88dc729c06211c450bf714af4bf9a4&', name: 'tram_d16.jpeg' },
  { user: 'Linh', id: '883936057878536222', url: 'https://cdn.discordapp.com/ephemeral-attachments/1536356983656030320/1549737939938836520/image.png?ex=6aabc96d&is=6aaa77ed&hm=112019a7604af947c81798154910f0be5f1655ccc2367139d67f6903e21a3859&', name: 'linh_d16.png' },
  { user: 'Minh may mắn', id: '705779271603322911', url: 'https://cdn.discordapp.com/ephemeral-attachments/1536356983656030320/1549741871373221958/image.png?ex=6aabcd16&is=6aaa7b96&hm=b251ef77d4b7d1cd3a34e7e03b0208ce97e2c981ccd53d5256005ded3542d33c&', name: 'minh_d16.png' },
  { user: 'Aleye', id: '616159212980011018', url: 'https://cdn.discordapp.com/ephemeral-attachments/1536356983656030320/1549763282259411084/Screenshot_2026-09-16-19-45-27-092_com.ichi2.anki-edit.jpg?ex=6aabe107&is=6aaa8f87&hm=037c42301f9b35b4a71bb4f312cd8578f141429e736925fc285bd47f3add8e40&', name: 'aleye_d16.jpg' },
  { user: 'PhươngPhương', id: '813419447150444554', url: 'https://cdn.discordapp.com/ephemeral-attachments/1536356983656030320/1549771323260272742/Screenshot_20260916_201710_AnkiDroid.jpg?ex=6aabe884&is=6aaa9704&hm=3843b81a60d03030a50f2a6ddf0cee27f4a7f2222b7adba1e036ce24f0813d16&', name: 'phuong_d16.jpg' },
  { user: 'Anh 3 Khía', id: '1353193643866984490', url: 'https://cdn.discordapp.com/ephemeral-attachments/1536356983656030320/1549783043756138567/IMG_4353.jpg?ex=6aabf36f&is=6aaaa1ef&hm=dba14674fb16cc21766f48897fcb6362069ad52467fbab41f3d40e9b521b8d6f&', name: 'anh3khia_d16.jpg' },
  { user: 'Alan Le', id: '711153532392308767', url: 'https://cdn.discordapp.com/ephemeral-attachments/1536356983656030320/1549789871256637550/Screenshot_20260916_213022_AnkiDroid.jpg?ex=6aabf9cb&is=6aaaa84b&hm=bbdc31082e982bc8b146d6a5b37f35c5cc67900c19d2dd247e4efda0bb346348&', name: 'alan_d16.jpg' },
  { user: 'Danneee05', id: '1503052423390957772', url: 'https://cdn.discordapp.com/ephemeral-attachments/1536356983656030320/1549793448654151871/IMG_1801.jpg?ex=6aabfd1f&is=6aaaab9f&hm=c4d83effe3a08fcad39c661e98ca52693eddbcaf31fd02051689093d84539525&', name: 'danneee_d16.jpg' },
  { user: 'Gai Hàn TOPIK 6', id: '438960335983083530', url: 'https://cdn.discordapp.com/ephemeral-attachments/1536356983656030320/1549799404779872397/Anki_Q5B4Yc02rx.png?ex=6aac02ab&is=6aaab12b&hm=4299f80c27ce9df336f093ae6f2a71af317d70c1b2f1d0a0ef162f82b44baf20&', name: 'gaihan_d16.png' }
];

const outDir = 'discord-export/day16/images';
fs.mkdirSync(outDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve, reject);
      }
      const ws = fs.createWriteStream(dest);
      res.pipe(ws);
      ws.on('finish', () => ws.close(resolve));
      ws.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  for (const img of images) {
    const dest = path.join(outDir, img.name);
    try {
      await download(img.url, dest);
      console.log(`Downloaded ${img.user} -> ${dest}`);
    } catch (e) {
      console.error(`Error downloading ${img.user}:`, e.message);
    }
  }
}

main().catch(console.error);
