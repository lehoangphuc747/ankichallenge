import fs from 'fs';

const filePath = 'd:/A Web/anki-challenge/public/data/challenge_09_records.json';
const records = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const userId = "52";
const missingDays = [
    '2026-01-22',
    '2026-02-10',
    '2026-02-12',
    '2026-02-24',
    '2026-03-06',
    '2026-03-15'
];

missingDays.forEach(day => {
    if (records[day]) {
        records[day][userId] = true;
    } else {
        console.warn(`Day ${day} not found in records.`);
    }
});

fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf8');
console.log(`Successfully added user ${userId} to missing days in ${filePath}`);
