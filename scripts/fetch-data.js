// Script to fetch data from Firebase and save to static JSON files
// Run this on your dev machine: node scripts/fetch-data.js

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase config (same as in your firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyDSj0TWbc4nXY1OfZ0a5RLgTRtUr7d2Ddk",
  authDomain: "anki-challenge.firebaseapp.com",
  projectId: "anki-challenge",
  storageBucket: "anki-challenge.firebasestorage.app",
  messagingSenderId: "7215339989",
  appId: "1:7215339989:web:52605c46a1e2dca09dc55c",
  measurementId: "G-C9LJ0YTHYL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchAndSaveData() {
  console.log('🚀 Bắt đầu fetch dữ liệu từ Firebase...\n');

  try {
    // Create data directory if it doesn't exist
    const dataDir = join(__dirname, '..', 'public', 'data');
    mkdirSync(dataDir, { recursive: true });

    // Fetch users data
    console.log('📥 Đang fetch dữ liệu users...');
    const usersDocRef = doc(db, 'appData', 'users');
    const usersSnapshot = await getDoc(usersDocRef);
    
    if (usersSnapshot.exists()) {
      const usersData = usersSnapshot.data();
      const usersFilePath = join(dataDir, 'users.json');
      writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
      console.log('✅ Đã lưu users.json - Số lượng:', usersData.data?.length || 0, 'users');
    } else {
      console.log('⚠️ Không tìm thấy dữ liệu users');
    }

    // Fetch studyRecords data
    console.log('\n📥 Đang fetch dữ liệu studyRecords...');
    const studyRecordsDocRef = doc(db, 'appData', 'studyRecords');
    const studyRecordsSnapshot = await getDoc(studyRecordsDocRef);
    
    if (studyRecordsSnapshot.exists()) {
      const studyRecordsData = studyRecordsSnapshot.data();
      const studyRecordsFilePath = join(dataDir, 'studyRecords.json');
      writeFileSync(studyRecordsFilePath, JSON.stringify(studyRecordsData, null, 2));
      const recordCount = Object.keys(studyRecordsData).length;
      console.log('✅ Đã lưu studyRecords.json - Số lượng:', recordCount, 'ngày có dữ liệu');
    } else {
      console.log('⚠️ Không tìm thấy dữ liệu studyRecords');
    }

    // Fetch challenges data (if exists)
    console.log('\n📥 Đang fetch dữ liệu challenges...');
    const challengesDocRef = doc(db, 'appData', 'challenges');
    const challengesSnapshot = await getDoc(challengesDocRef);
    
    if (challengesSnapshot.exists()) {
      const challengesData = challengesSnapshot.data();
      const challengesFilePath = join(dataDir, 'challenges.json');
      writeFileSync(challengesFilePath, JSON.stringify(challengesData, null, 2));
      console.log('✅ Đã lưu challenges.json');
    } else {
      console.log('⚠️ Không tìm thấy dữ liệu challenges (có thể không có collection này)');
    }

    // Save metadata
    const metadata = {
      lastUpdated: new Date().toISOString(),
      description: 'Data fetched from Firebase Firestore'
    };
    const metadataFilePath = join(dataDir, 'metadata.json');
    writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2));
    console.log('✅ Đã lưu metadata.json');

    console.log('\n✨ Hoàn thành! Tất cả dữ liệu đã được lưu vào public/data/');
    console.log('📁 Vị trí:', dataDir);
    console.log('\n💡 Bây giờ bạn có thể:');
    console.log('   1. Commit các file JSON này vào git');
    console.log('   2. Deploy code lên server');
    console.log('   3. Website sẽ đọc dữ liệu từ các file này, không cần kết nối Firebase nữa!');
    console.log('\n⚠️ Lưu ý: Khi cần cập nhật dữ liệu, chạy lại: npm run fetch-data');

  } catch (error) {
    console.error('❌ Lỗi khi fetch dữ liệu:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the script
fetchAndSaveData();
