// Tiện ích đẩy thông tin thành viên AC11 lên thread "Giới thiệu & Mục tiêu - AC11"
// Dùng chung cho endpoint create-members-thread và hook register/approve-ac11.

import { getFromKV, putToKV } from './kv';

export const AC11_THREAD_CHANNEL_ID = "1541493820242264256";
export const AC11_THREAD_TRACK_KEY = "ac11_members_thread_id";
export const AC11_POSTED_IDS_KEY = "ac11_members_thread_posted";
export const AC11_THREAD_NAME = "👋 Giới thiệu & Mục tiêu - AC11";

function botHeaders(token: string): Record<string, string> {
  return {
    'Authorization': `Bot ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'DiscordBot (https://ankichallenge.pages.dev, 1.0)',
  };
}

export function isAC11User(u: any): boolean {
  return (Array.isArray(u?.challengeIds) && u.challengeIds.includes(4)) || false;
}

export function memberMessage(u: any): string {
  const name = u.realName || u.name || `Thành viên #${u.id}`;
  const discord = u.discordNickname || u.name || '';
  const bio = (u.bio || '').trim();
  const goals = (u.goals || '').trim();
  const place = (u.place || '').trim();
  const attendanceGoal = u.attendanceGoal ? `${u.attendanceGoal} ngày` : '';

  const lines: string[] = [];
  lines.push(`## 👤 **${name}**`);
  if (discord) lines.push(`*(${discord})*`);
  if (place) lines.push(`\n> 📍 **Nơi ở:** ${place}`);
  if (bio) {
    lines.push(`\n**📝 Giới thiệu**`);
    lines.push(bio);
  }
  if (goals) {
    lines.push(`\n**🎯 Mục tiêu**`);
    lines.push(goals);
  }
  if (attendanceGoal) lines.push(`\n**📊 Mục tiêu chuyên cần:** ${attendanceGoal}`);
  return lines.join('\n');
}

/**
 * Lấy or tạo thread AC11 (track theo KV để tránh tạo lặp).
 * Trả về { threadId } hoặc { error }.
 */
async function getOrCreateAC11Thread(
  env: any,
  url: string,
  token: string,
  headers: Record<string, string>
): Promise<{ threadId: string } | { error: string; details?: any }> {
  const trackObj = await getFromKV<any>(env, AC11_THREAD_TRACK_KEY, url).catch(() => null);
  const existing = (trackObj && trackObj.threadId) || null;
  if (existing) return { threadId: existing };

  // Tạo thread mới từ tin nhắn trong kênh daily-thread
  const msgRes = await fetch(`https://discord.com/api/v10/channels/${AC11_THREAD_CHANNEL_ID}/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content: `## 📋 **Danh sách thành viên đã đăng ký Anki Challenge 11**` }),
  });
  const msgJson: any = await msgRes.json();
  if (!msgRes.ok) {
    return { error: 'Failed to send thread seed message', details: msgJson };
  }

  const threadRes = await fetch(
    `https://discord.com/api/v10/channels/${AC11_THREAD_CHANNEL_ID}/messages/${msgJson.id}/threads`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: AC11_THREAD_NAME, auto_archive_duration: 4320 }),
    }
  );
  const threadJson: any = await threadRes.json();
  if (!threadRes.ok) {
    return { error: 'Failed to create thread', details: threadJson };
  }

  await putToKV(env, AC11_THREAD_TRACK_KEY, { threadId: threadJson.id }).catch(() => {});
  return { threadId: threadJson.id };
}

async function getPostedIds(env: any, url: string): Promise<Set<number>> {
  const postedObj = await getFromKV<any>(env, AC11_POSTED_IDS_KEY, url).catch(() => null);
  const ids = (postedObj && Array.isArray(postedObj.ids)) ? postedObj.ids : [];
  return new Set(ids.map((x: any) => Number(x)));
}

/**
 * Đẩy danh sách thành viên AC11 lên thread (bỏ qua những người đã đăng trước đó).
 * Tự tạo thread nếu chưa có. Không throw; trả về kết quả.
 */
export async function postAC11MembersToThread(
  env: any,
  url: string,
  users: any[],
  opts: { reset?: boolean } = {}
): Promise<{ ok: boolean; posted: number; skipped: number; threadId?: string; error?: string }> {
  const token = env.DISCORD_TOKEN || import.meta.env.DISCORD_TOKEN;
  if (!token) return { ok: false, posted: 0, skipped: 0, error: 'Missing DISCORD_TOKEN' };

  const ac11Users = (users || []).filter(isAC11User);
  const headers = botHeaders(token);

  const thread = await getOrCreateAC11Thread(env, url, token, headers);
  if ('error' in thread) return { ok: false, posted: 0, skipped: 0, error: thread.error };

  const postedSet = opts.reset ? new Set<number>() : await getPostedIds(env, url);
  const toPost = ac11Users.filter((u: any) => !postedSet.has(Number(u.id)));

  let postedCount = 0;
  for (const u of toPost) {
    const body = memberMessage(u);
    const res = await fetch(`https://discord.com/api/v10/channels/${thread.threadId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content: body }),
    });
    if (res.ok) {
      postedSet.add(Number(u.id));
      postedCount++;
    } else {
      const j = await res.json().catch(() => null);
      console.warn('[AC11 thread] post failed for user', u.id, j);
    }
  }

  await putToKV(env, AC11_POSTED_IDS_KEY, { ids: Array.from(postedSet) }).catch(() => {});

  return { ok: true, posted: postedCount, skipped: toPost.length - postedCount, threadId: thread.threadId };
}