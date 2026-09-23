const avaDaily = [
  { day: 1, date: '01/09', cards: 162 },
  { day: 2, date: '02/09', cards: 1036 },
  { day: 3, date: '03/09', cards: 6 },
  { day: 4, date: '04/09', cards: 159 },
  { day: 5, date: '05/09', cards: 67 },
  { day: 6, date: '06/09', cards: 4 },
  { day: 7, date: '07/09', cards: 131 },
  { day: 8, date: '08/09', cards: 90 },
  { day: 9, date: '09/09', cards: 290 },
  { day: 10, date: '10/09', cards: 1 },
  { day: 11, date: '11/09', cards: 64 },
  { day: 12, date: '12/09', cards: 15 },
  { day: 13, date: '13/09', cards: 515 },
];

const KPI = 500;
let totalCards = 0;
let debt = 0;

console.log('=== CHI TIẾT TÍNH NỢ CỦA AVA TỪ DAY 1 ĐẾN DAY 13 ===');
for (const d of avaDaily) {
  totalCards += d.cards;
  const diff = d.cards - KPI;
  debt -= diff;
  const status = diff >= 0 ? `🟢 VƯỢT +${diff}` : `🔴 Thiếu ${Math.abs(diff)}`;
  console.log(`• Day ${d.day} (${d.date}): Học ${d.cards} thẻ ➔ ${status} (Nợ luỹ kế: ${debt.toLocaleString('vi-VN')} thẻ)`);
}

const totalKPI13 = 13 * KPI;
console.log('\n--- HẾT DAY 13 ---');
console.log(`Tổng thẻ đã học 13 ngày: ${totalCards.toLocaleString('vi-VN')} thẻ`);
console.log(`KPI 13 ngày: ${totalKPI13.toLocaleString('vi-VN')} thẻ`);
console.log(`Tổng nợ hết Day 13: ${(totalKPI13 - totalCards).toLocaleString('vi-VN')} thẻ`);

console.log('\n--- NẾU TÍNH THÊM KPI DAY 14 (500 thẻ) ---');
console.log(`Nếu chưa học Day 14: Nợ tạm tính = ${(totalKPI13 - totalCards + 500).toLocaleString('vi-VN')} thẻ (chạm ngưỡng 4.460 thẻ!)`);
