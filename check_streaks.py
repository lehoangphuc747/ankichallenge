import json

with open('public/data/studyRecords.json', 'r', encoding='utf-8') as f:
    records = json.load(f)

with open('public/data/users.json', 'r', encoding='utf-8') as f:
    users_data = json.load(f)

users = users_data['data']

# Get users in Challenge 2
challenge_two_ids = {str(u['id']) for u in users if u.get('challengeIds') and 2 in u['challengeIds']}

# Count check-ins
checkins = {}
for date, day_records in records.items():
    for uid, checked in day_records.items():
        if uid in challenge_two_ids and checked:
            checkins[uid] = checkins.get(uid, 0) + 1

# Filter 95-100 days
filtered = [(uid, count) for uid, count in checkins.items() if 95 <= count <= 100]
filtered.sort(key=lambda x: x[1], reverse=True)

if not filtered:
    print('Không có người nào có 95-100 ngày check-in.')
    print()
    print('Top 15 người có số ngày check-in cao nhất:')
    sorted_checkins = sorted(checkins.items(), key=lambda x: x[1], reverse=True)[:15]
    for uid, count in sorted_checkins:
        user = next((u for u in users if u['id'] == int(uid)), None)
        if user:
            print(f"ID {uid}: {user['name']} - {count} ngày")
else:
    print(f'Tìm được {len(filtered)} người có 95-100 ngày check-in:')
    print()
    for uid, count in filtered:
        user = next((u for u in users if u['id'] == int(uid)), None)
        if user:
            print(f"ID {uid}: {user['name']} - {count} ngày")
