import fs from 'fs';

const records = JSON.parse(fs.readFileSync('d:/A Web/anki-challenge/public/data/challenge_09_records.json', 'utf8'));
const userId = "52";

const startDate = new Date('2025-12-22');
const endDate = new Date('2026-03-31');

const missingDays = [];
let currentDate = new Date(startDate);

while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (!records[dateStr] || !records[dateStr][userId]) {
        missingDays.push(dateStr);
    }
    currentDate.setDate(currentDate.getDate() + 1);
}

console.log(`User ID: ${userId}`);
console.log(`Missing Days (${missingDays.length}):`);
console.log(missingDays.join('\n'));
