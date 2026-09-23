const dailyStats = [
  { day: 1, date: '01/09', cards: 274, note: 'Học 274 thẻ' },
  { day: 2, date: '02/09', cards: 431, note: 'Học 431 thẻ' },
  { day: 3, date: '03/09', cards: 3,   note: 'Học 3 thẻ' },
  { day: 4, date: '04/09', cards: 0,   note: 'Vắng học (0 thẻ, có phép)' },
  { day: 5, date: '05/09', cards: 178, note: 'Học 178 thẻ' },
  { day: 6, date: '06/09', cards: 189, note: 'Học 189 thẻ' },
  { day: 7, date: '07/09', cards: 132, note: 'Học 132 thẻ' },
  { day: 8, date: '08/09', cards: 9,   note: 'Học 9 thẻ' },
  { day: 9, date: '09/09', cards: 442, note: 'Học 442 thẻ' },
  { day: 10, date: '10/09', cards: 65, note: 'Học 65 thẻ' },
  { day: 11, date: '11/09', cards: 812, note: 'Học 812 thẻ (vượt chỉ tiêu)' },
  { day: 12, date: '12/09', cards: 0,   note: 'Quên học (0 thẻ)' },
  { day: 13, date: '13/09', cards: 21,  note: 'Học 21 thẻ' },
  { day: 14, date: '14/09', cards: 2025, note: 'Học 2.025 thẻ (kỷ lục bứt phá)' },
];

const KPI = 500;
let cumulativeDebt = 0;
let totalCardsLearned = 0;
let participatedDays = 0;

console.log('=== CHI TIẾT TÍNH TOÁN SỔ NỢ SUNNY (DAY 1 - DAY 14) ===\n');

for (const d of dailyStats) {
  totalCardsLearned += d.cards;
  if (d.cards > 0) participatedDays++;
  const diff = d.cards - KPI;
  cumulativeDebt -= diff; // if diff > 0 => debt decreases; if diff < 0 => debt increases
  
  const statusStr = diff >= 0 
    ? `🟢 VƯỢT +${diff} thẻ ➔ Nợ luỹ kế: ${cumulativeDebt.toLocaleString('vi-VN')} thẻ`
    : `🔴 Nợ ${Math.abs(diff)} thẻ ➔ Nợ luỹ kế: ${cumulativeDebt.toLocaleString('vi-VN')} thẻ`;

  console.log(`• Day ${d.day} (${d.date}): ${d.note} ➔ ${statusStr}`);
}

const totalKPI = dailyStats.length * KPI; // 14 * 500 = 7000 thẻ

console.log('\n=========================================');
console.log(`Tổng số ngày đã diễn ra: ${dailyStats.length} ngày`);
console.log(`Số ngày thực tế có học: ${participatedDays}/${dailyStats.length} ngày (${Math.round(participatedDays/dailyStats.length*100)}%)`);
console.log(`Hạn mức KPI 14 ngày: ${totalKPI.toLocaleString('vi-VN')} thẻ (14 × 500)`);
console.log(`Tổng số thẻ thực tế đã học: ${totalCardsLearned.toLocaleString('vi-VN')} thẻ`);
console.log(`Tổng nợ theo công thức (Tổng KPI - Tổng thẻ): ${(totalKPI - totalCardsLearned).toLocaleString('vi-VN')} thẻ`);
console.log(`Tổng nợ luỹ kế kiểm tra chéo: ${cumulativeDebt.toLocaleString('vi-VN')} thẻ`);
console.log('Khớp nhau 100%:', (totalKPI - totalCardsLearned) === cumulativeDebt);
