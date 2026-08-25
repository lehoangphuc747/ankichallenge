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
        description: 'Ngày check-in: bỏ trống = hôm nay, hoặc hq, hn, 15/8, YYYY-MM-DD',
        required: false,
      },
      {
        type: 11, // ATTACHMENT
        name: 'image',
        description: 'Ảnh / screenshot chứng thực (PNG, JPG...) - tùy chọn',
        required: false,
      },
    ],
  },
  {
    name: 'trangthai',
    description: 'Xem trạng thái, thứ hạng, chuỗi streak và tiến độ thử thách của bạn',
  },
];

// Guild ID để đăng ký lệnh ở cấp guild (hiện ngay cho mọi member, không bị cache delay như global)
const GUILD_ID = process.env.DISCORD_GUILD_ID;

async function deployCommands() {
  const headers = {
    'Authorization': `Bot ${DISCORD_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'DiscordBot (https://ankichallenge.pages.dev, 1.0)',
  };

  // Chỉ đăng ký guild commands (hiện ngay, không bị cache delay như global)
  if (!GUILD_ID) {
    console.error('❌ Thiếu DISCORD_GUILD_ID. Guild commands cần guild đích.');
    process.exit(1);
  }

  const guildUrl = `https://discord.com/api/v10/applications/${appId}/guilds/${GUILD_ID}/commands`;
  console.log(`Đang đăng ký GUILD slash commands cho guild: ${GUILD_ID}...`);

  const guildRes = await fetch(guildUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify(COMMANDS),
  });

  if (guildRes.ok) {
    const data = await guildRes.json();
    console.log(`✅ Đã đăng ký ${data.length} guild command(s) cho guild ${GUILD_ID}:`);
    for (const cmd of data) {
      console.log(`   /${cmd.name} - ${cmd.description}`);
    }
  } else {
    const err = await guildRes.text();
    console.error(`❌ Lỗi đăng ký guild commands (${guildRes.status}):`, err);
    process.exit(1);
  }
}

deployCommands();
