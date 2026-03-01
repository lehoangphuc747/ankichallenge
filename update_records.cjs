const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'data', 'studyRecords.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const dates = [
  "2026-01-29",
  "2026-01-30",
  "2026-01-31",
  "2026-02-01",
  "2026-02-02",
  "2026-02-03",
  "2026-02-04",
  "2026-02-05",
  "2026-02-06",
  "2026-02-07",
  "2026-02-08",
  "2026-02-09",
  "2026-02-10",
  "2026-02-11",
  "2026-02-12",
  "2026-02-13",
  "2026-02-14",
  "2026-02-15",
  "2026-02-16",
  "2026-02-17",
  "2026-02-18",
  "2026-02-19",
  "2026-02-20",
  "2026-02-21",
  "2026-02-22",
  "2026-02-23",
  "2026-02-24"
];

const userId = "53";

dates.forEach(date => {
  if (data[date]) {
    data[date][userId] = true;
  } else {
    data[date] = { [userId]: true };
  }
});

// Write back with 2 spaces formatting to match original JSON
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
console.log('Update successful!');
