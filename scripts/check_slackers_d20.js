import fs from 'node:fs';

const stats = JSON.parse(fs.readFileSync('src/data/ac11_stats.json', 'utf8'));

console.log('=== THÀNH VIÊN CÓ NỢ / NGUY CƠ NỢ / NGHỈ NHIỀU (TỔNG 20 NGÀY) ===');
const users = stats.userRankings;

// Sort by daysCount ascending
const slackers = users.filter(u => u.daysCount < 10);
console.log(`Số thành viên học dưới 10/20 ngày: ${slackers.length}`);
slackers.forEach(u => {
  console.log(`- ${u.user}: ${u.daysCount}/20 ngày (${Math.round(u.daysCount/20*100)}%), Tổng thẻ: ${u.totalCards.toLocaleString()} thẻ, Các ngày tham gia: ${u.daysJoined.map(d=>d.replace('day','D')).join(', ')}`);
});
