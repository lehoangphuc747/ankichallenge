// Script to process backup.json and create properly formatted data files
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📦 Đang xử lý file backup...\n');

try {
  // Read backup file
  const backupPath = join(__dirname, '..', 'backup.json');
  const backupData = JSON.parse(readFileSync(backupPath, 'utf8'));
  
  console.log('✅ Đã đọc backup.json');
  console.log(`   - Số lượng users: ${backupData.users?.length || 0}`);
  console.log(`   - Số lượng ngày có records: ${Object.keys(backupData.records || {}).length}`);
  console.log(`   - Ngày export: ${backupData.exportedAt}\n`);

  // Create data directory
  const dataDir = join(__dirname, '..', 'public', 'data');
  mkdirSync(dataDir, { recursive: true });

  // Process users data
  console.log('📝 Đang xử lý dữ liệu users...');
  
  // Add challengeIds array to each user (convert challengeId to challengeIds array)
  const processedUsers = backupData.users.map(user => {
    const challengeIds = user.challengeId ? [user.challengeId] : [1];
    return {
      ...user,
      challengeIds: challengeIds,
      // Keep the old challengeId for compatibility
      challengeId: user.challengeId || 1
    };
  });

  // Sort users by id
  processedUsers.sort((a, b) => a.id - b.id);

  const usersData = {
    data: processedUsers
  };

  const usersFilePath = join(dataDir, 'users.json');
  writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
  console.log(`✅ Đã tạo users.json - ${processedUsers.length} users\n`);

  // Process studyRecords data
  console.log('📝 Đang xử lý dữ liệu studyRecords...');
  
  // Sort dates chronologically
  const sortedDates = Object.keys(backupData.records).sort();
  const studyRecordsData = {};
  
  sortedDates.forEach(date => {
    studyRecordsData[date] = backupData.records[date];
  });

  const studyRecordsFilePath = join(dataDir, 'studyRecords.json');
  writeFileSync(studyRecordsFilePath, JSON.stringify(studyRecordsData, null, 2));
  console.log(`✅ Đã tạo studyRecords.json - ${sortedDates.length} ngày`);
  console.log(`   - Ngày đầu tiên: ${sortedDates[0]}`);
  console.log(`   - Ngày cuối cùng: ${sortedDates[sortedDates.length - 1]}\n`);

  // Create metadata
  const metadata = {
    lastUpdated: new Date().toISOString(),
    description: 'Data processed from backup.json',
    sourceBackupDate: backupData.exportedAt,
    totalUsers: processedUsers.length,
    totalRecordDays: sortedDates.length,
    dateRange: {
      start: sortedDates[0],
      end: sortedDates[sortedDates.length - 1]
    }
  };

  const metadataFilePath = join(dataDir, 'metadata.json');
  writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2));
  console.log('✅ Đã tạo metadata.json\n');

  // Summary
  console.log('🎉 Hoàn thành!\n');
  console.log('📊 Thống kê:');
  console.log(`   - Tổng số users: ${processedUsers.length}`);
  console.log(`   - Users hiển thị: ${processedUsers.filter(u => !u.hidden).length}`);
  console.log(`   - Users ẩn: ${processedUsers.filter(u => u.hidden).length}`);
  console.log(`   - Tổng số ngày có records: ${sortedDates.length}`);
  console.log(`   - Khoảng thời gian: ${sortedDates[0]} → ${sortedDates[sortedDates.length - 1]}`);
  console.log('\n📁 Files đã tạo:');
  console.log('   - public/data/users.json');
  console.log('   - public/data/studyRecords.json');
  console.log('   - public/data/metadata.json');
  console.log('\n💡 Bây giờ bạn có thể:');
  console.log('   1. Kiểm tra các file trong public/data/');
  console.log('   2. Chạy: npm run dev');
  console.log('   3. Xem website chạy với dữ liệu tĩnh!');

} catch (error) {
  console.error('❌ Lỗi khi xử lý backup:', error);
  process.exit(1);
}
