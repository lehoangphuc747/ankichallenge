// Script đăng ký slash command /checkin lên Discord
// Chạy: node scripts/deploy-commands.js

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

if (!DISCORD_TOKEN) {
  console.error('Lỗi: Biến môi trường DISCORD_TOKEN chưa được set.');
  console.error('Chạy: $env:DISCORD_TOKEN="your-bot-token"');
  process.exit(1);
}

// Giải mã Application ID từ bot token (phần base64 đầu tiên trước dấu chấm)
const appId = Buffer.from(DISCORD_TOKEN.split('.')[0], 'base64').toString('utf-8');

const COMMANDS = [
  {
    name: 'checkin',
    description: 'Check-in ngày học của bạn',
    options: [
      {
        type: 3, // STRING
        name: 'date',
        description: 'Ngày cần check-in (YYYY-MM-DD)',
        required: true,
      },
    ],
  },
  {
    name: 'setchannel',
    description: '[Admin] Đặt channel hiện tại làm channel check-in. Chỉ thread trong channel này mới được check-in.',
  },
];

async function deployCommands() {
  const url = `https://discord.com/api/v10/applications/${appId}/commands`;

  console.log(`Đang đăng ký slash commands cho Application ID: ${appId}...`);

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bot ${DISCORD_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(COMMANDS),
  });

  if (res.ok) {
    const data = await res.json();
    console.log(`✅ Đã đăng ký thành công ${data.length} slash command(s):`);
    for (const cmd of data) {
      console.log(`   /${cmd.name} - ${cmd.description}`);
    }
  } else {
    const err = await res.text();
    console.error(`❌ Lỗi đăng ký commands (${res.status}):`, err);
    process.exit(1);
  }
}

deployCommands();
