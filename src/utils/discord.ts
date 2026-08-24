// Discord bot helpers (dùng chung giữa register/approve)
const ANKI_GUILD_ID = '867268399687663616';
const UA = 'DiscordBot (https://ankichallenge.pages.dev, 1.0)';

/**
 * Gán role Discord cho thành viên.
 * Role ID lấy từ env `DISCORD_AC11_ROLE_ID`.
 * Nếu thiếu token/role hoặc thất bại → log warning và trả false (không throw).
 */
export async function grantAc11Role(env: any, discordId: string): Promise<boolean> {
  const token = env.DISCORD_TOKEN || import.meta.env.DISCORD_TOKEN;
  const roleId = env.DISCORD_AC11_ROLE_ID || import.meta.env.DISCORD_AC11_ROLE_ID;

  if (!token || !roleId) {
    console.warn('[AC11 Role] Thiếu DISCORD_TOKEN hoặc DISCORD_AC11_ROLE_ID - bỏ qua gán role.');
    return false;
  }

  const url = `https://discord.com/api/v10/guilds/${ANKI_GUILD_ID}/members/${discordId}/roles/${roleId}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': UA,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.warn(`[AC11 Role] Gán role thất bại (${res.status}):`, text);
    return false;
  }
  return true;
}