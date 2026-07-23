import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = process.env.SITE_URL || 'https://ankichallenge.pages.dev';

const KEYS = [
  'users',
  'challenges',
  'records_08',
  'records_09',
  'records_10',
  'metadata',
];

async function backupKVData() {
  console.log(`🚀 Bắt đầu tải và sao lưu dữ liệu từ Cloudflare KV (${BASE_URL})...\n`);

  const backupData = {
    exportedAt: new Date().toISOString(),
    keys: {},
  };

  const dataDir = join(__dirname, '..', 'public', 'data');
  mkdirSync(dataDir, { recursive: true });

  for (const key of KEYS) {
    const url = `${BASE_URL}/api/data/${key}?v=${Date.now()}`;
    console.log(`📥 Đang tải "${key}" từ ${url}...`);

    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        backupData.keys[key] = data;

        // Lưu bản sao riêng rẽ vào public/data/
        let targetFileName = `${key}.json`;
        if (key === 'records_08') targetFileName = 'challenge_08_records.json';
        if (key === 'records_09') targetFileName = 'challenge_09_records.json';
        if (key === 'records_10') targetFileName = 'challenge_10_records.json';

        const savePath = join(dataDir, targetFileName);
        writeFileSync(savePath, JSON.stringify(data, null, 2));
        console.log(`   ✅ Đã sao lưu thành công -> public/data/${targetFileName}`);
      } else {
        console.warn(`   ⚠️ Không thể tải key "${key}": Status ${res.status}`);
      }
    } catch (err) {
      console.error(`   ❌ Lỗi khi tải key "${key}":`, err.message);
    }
  }

  // Lưu file backup gộp chính: backup_kv.json ở thư mục gốc của project
  const mainBackupPath = join(__dirname, '..', 'backup_kv.json');
  writeFileSync(mainBackupPath, JSON.stringify(backupData, null, 2));

  console.log(`\n🎉 HOÀN THÀNH SAO LƯU DỮ LIỆU!`);
  console.log(`📄 File backup tổng hợp: ${mainBackupPath}`);
  console.log(`📁 Thư mục data tĩnh: ${dataDir}`);
}

backupKVData();
