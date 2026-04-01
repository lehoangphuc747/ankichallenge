const fs = require('fs');

const records = JSON.parse(fs.readFileSync('public/data/studyRecords.json', 'utf8'));
const usersData = JSON.parse(fs.readFileSync('public/data/users.json', 'utf8'));
const users = usersData.data;

// Get all users in Challenge 2 (Challenge 9)
const challengeTwo = users.filter(u => u.challengeIds && u.challengeIds.includes(2));
const challengeTwoIds = new Set(challengeTwo.map(u => u.id.toString()));

// Count check-ins for each user
const checkins = {};
Object.keys(records).forEach(date => {
  Object.keys(records[date]).forEach(uid => {
    if (challengeTwoIds.has(uid)) {
      checkins[uid] = (checkins[uid] || 0) + 1;
    }
  });
});

// Find users with 95-100 check-ins
const filtered = Object.entries(checkins)
  .filter(([uid, count]) => count >= 95 && count <= 100)
  .sort((a, b) => b[1] - a[1]);

console.log(`Found ${filtered.length} users with 95-100 check-in days:\n`);

if (filtered.length === 0) {
  console.log('No users found with exactly 95-100 check-in days.');
  console.log('\nTop users by check-in count:');
  Object.entries(checkins)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([uid, count]) => {
      const user = users.find(u => u.id === parseInt(uid));
      console.log(`ID ${uid}: ${user.name} - ${count} days`);
    });
} else {
  filtered.forEach(([uid, count]) => {
    const user = users.find(u => u.id === parseInt(uid));
    console.log(`ID ${uid}: ${user.name} - ${count} days`);
  });
}
