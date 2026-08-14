import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const dateStr = new Date().toISOString().slice(0, 10);
const outputFile = path.join(rootDir, `backup_d1_${dateStr}.sql`);

console.log('🚀 Đang xuất bản sao lưu SQL từ Cloudflare D1 Remote (anki-challenge-db)...');
try {
  execSync(`npx wrangler d1 export anki-challenge-db --remote --output="${outputFile}" -y`, {
    stdio: 'inherit',
    cwd: rootDir,
  });
  console.log(`\n🎉 Xuất file SQL backup D1 thành công: ${outputFile}`);
} catch (error) {
  console.error('❌ Lỗi khi xuất backup D1:', error.message);
}
