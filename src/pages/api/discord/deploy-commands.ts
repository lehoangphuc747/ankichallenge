import type { APIRoute } from 'astro';
export const prerender = false;

const COMMANDS = [
  {
    name: 'checkin',
    description: 'Check-in ngày học của bạn',
    options: [
      { type: 3, name: 'date', description: 'Ngày check-in: bỏ trống = hôm nay, hoặc hq, hn, 15/8, YYYY-MM-DD', required: false },
      { type: 11, name: 'image', description: 'Ảnh / screenshot chứng thực (bắt buộc - PNG, JPG...)', required: true },
    ],
  },
  { name: 'trangthai', description: 'Xem trạng thái, thứ hạng, chuỗi streak và tiến độ thử thách của bạn' },
  { name: 'ping', description: 'Tag những ai chưa check-in hôm nay để nhắc nhở (AC11)', options: [{ type: 3, name: 'date', description: 'Ngày cần kiểm tra: bỏ trống = hôm nay, hoặc 02/09, hq...', required: false }] },
];

export const POST: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  const token = env.DISCORD_TOKEN || import.meta.env.DISCORD_TOKEN;
  if (!token) return new Response(JSON.stringify({ error: 'Missing DISCORD_TOKEN' }), { status: 500 });
  const appId = Buffer.from(token.split('.')[0], 'base64').toString('utf-8');
  const guildId = '867268399687663616';
  const url = `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'DiscordBot (https://ankichallenge.pages.dev, 1.0)' },
    body: JSON.stringify(COMMANDS),
  });
  const data = await res.text();
  if (!res.ok) return new Response(JSON.stringify({ error: `Failed ${res.status}`, details: data }), { status: 502 });
  return new Response(data, { headers: { 'Content-Type': 'application/json' } });
};
export const GET: APIRoute = async (ctx) => POST(ctx as any);
