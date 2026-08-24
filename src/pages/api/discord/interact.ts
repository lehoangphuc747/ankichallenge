import type { APIRoute } from 'astro';
import nacl from 'tweetnacl';
import { InteractionType, InteractionResponseType, InteractionResponseFlags } from 'discord-interactions';
import { getFromKV, putToKV } from '../../../utils/kv';
import { getUserByDiscordId, recordCheckinInDB, getUsersFromDB, getChallengesFromDB, getRecordsFromDB } from '../../../utils/db';
import { calculateUserStats } from '../../../utils/calculateStats.js';

function hexToUint8Array(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g);
  if (!matches) throw new Error('Invalid hex string');
  return new Uint8Array(matches.map((b) => Number.parseInt(b, 16)));
}

function verifyDiscordKey(rawBody: string, signature: string, timestamp: string, publicKey: string): boolean {
  try {
    const message = new TextEncoder().encode(timestamp + rawBody);
    return nacl.sign.detached.verify(
      message,
      hexToUint8Array(signature),
      hexToUint8Array(publicKey)
    );
  } catch (e) {
    console.error('[discord/interact] verifyKey error:', e);
    return false;
  }
}

export const prerender = false;

const KV_RECORDS: Record<number, string> = {
  1: 'records_08',
  2: 'records_09',
  3: 'records_10',
  4: 'records_11',
};

function jsonResponse(type: number, data: any): Response {
  return new Response(JSON.stringify({
    type,
    data,
  }), { headers: { 'Content-Type': 'application/json' } });
}

const WEBHOOK_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'DiscordBot (https://ankichallenge.pages.dev, 1.0)',
};

async function patchOriginalMessage(interaction: any, content: string, ephemeral = false): Promise<void> {
  const url = `https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`;
  const body: any = { content };
  if (ephemeral) body.flags = InteractionResponseFlags.EPHEMERAL;
  await fetch(url, {
    method: 'PATCH',
    headers: WEBHOOK_HEADERS,
    body: JSON.stringify(body),
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env ?? {};
    const discordPublicKey =
      env.DISCORD_PUBLIC_KEY ||
      import.meta.env.DISCORD_PUBLIC_KEY ||
      '1338d998546db898e644782be4c1d80b4bfa057553efc7aafe92a9c444857d32';
    const signature = request.headers.get('X-Signature-Ed25519') || '';
    const timestamp = request.headers.get('X-Signature-Timestamp') || '';
    const rawBody = await request.clone().text();

    const isValid = await verifyDiscordKey(rawBody, signature, timestamp, discordPublicKey);
    if (!isValid) {
      return new Response('Invalid signature', { status: 401 });
    }

    const interaction = JSON.parse(rawBody);
    const requestUrl = request.url;

    if (interaction.type === InteractionType.PING) {
      return new Response(JSON.stringify({ type: InteractionResponseType.PONG }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      const commandName = interaction.data?.name;
      if (commandName === 'checkin' || commandName === 'rank' || commandName === 'streak' || commandName === 'trangthai') {
        const ctx = (locals as any).runtime?.ctx;
        const run = async () => {
          try {
            if (commandName === 'checkin') {
              await handleCheckin(interaction, env, requestUrl);
            } else {
              await handleRank(interaction, env, requestUrl);
            }
          } catch (error: any) {
            console.error(`[discord/interact] Background ${commandName} error:`, error);
            await patchOriginalMessage(
              interaction,
              'Đã xảy ra lỗi khi xử lý lệnh. Vui lòng thử lại sau.',
              true
            );
          }
        };
        if (ctx?.waitUntil) {
          ctx.waitUntil(run());
        } else {
          run();
        }
        return jsonResponse(InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE, {});
      }
    }

    return new Response('Unknown interaction', { status: 400 });
  } catch (error: any) {
    console.error('[discord/interact] Error:', error);
    return jsonResponse(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, {
      content: 'Đã xảy ra lỗi khi xử lý lệnh. Vui lòng thử lại sau.',
      flags: InteractionResponseFlags.EPHEMERAL,
    });
  }
};

function parseCheckinDate(input?: string): string | null {
  const now = new Date();
  const nowVN = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const nowVNStr = nowVN.toISOString().slice(0, 10);
  const today = new Date(nowVNStr + 'T00:00:00.000Z');

  if (!input || !input.trim()) return nowVNStr;

  let s = input.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Bỏ chữ 'ngay' ở đầu nếu có
  s = s.replace(/^ngay\s+/, '').trim();

  if (s === 'hn' || s === 'hom_nay' || s === 'hom nay' || s === 'today') return nowVNStr;
  if (s === 'hq' || s === 'hom_qua' || s === 'hom qua' || s === 'yesterday') {
    const y = new Date(today.getTime() - 86400000);
    return y.toISOString().slice(0, 10);
  }
  if (s === 'hk' || s === 'ht' || s === 'hom_kia' || s === 'hom kia') {
    const y = new Date(today.getTime() - 2 * 86400000);
    return y.toISOString().slice(0, 10);
  }
  if (s === 'nm' || s === 'ngay_mai' || s === 'ngay mai' || s === 'tomorrow') {
    const y = new Date(today.getTime() + 86400000);
    return y.toISOString().slice(0, 10);
  }

  // 1. Dạng YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
  const ymd = s.match(/^(\d{4})\s*[\/\.\-]\s*(\d{1,2})\s*[\/\.\-]\s*(\d{1,2})$/);
  if (ymd) {
    const year = Number(ymd[1]);
    const month = Number(ymd[2]);
    const day = Number(ymd[3]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // 2. Dạng DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  const dmy = s.match(/^(\d{1,2})\s*[\/\.\-]\s*(\d{1,2})\s*[\/\.\-]\s*(\d{4})$/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = Number(dmy[3]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // 3. Dạng DD/MM, DD-MM, DD.MM (có thể có khoảng trắng ví dụ 14 / 08)
  const dm = s.match(/^(\d{1,2})\s*[\/\.\-]\s*(\d{1,2})$/);
  if (dm) {
    const day = Number(dm[1]);
    const month = Number(dm[2]);
    const year = nowVN.getUTCFullYear();
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      const candidate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (candidate > nowVNStr) {
        const currMonth = nowVN.getUTCMonth() + 1;
        if (month > currMonth) {
          return `${year - 1}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
      return candidate;
    }
  }

  // 4. Dạng chỉ nhập ngày trong tháng hiện tại: VD '14', '5'
  const justDay = s.match(/^(\d{1,2})$/);
  if (justDay) {
    const day = Number(justDay[1]);
    const month = nowVN.getUTCMonth() + 1;
    const year = nowVN.getUTCFullYear();
    if (day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  return null;
}

function formatDateDisplay(ymd: string): string {
  const parts = ymd.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return ymd;
}

async function handleCheckin(interaction: any, env: any, requestUrl: string): Promise<void> {
  const dateOption = interaction.data?.options?.find((o: any) => o.name === 'date');
  const rawInput = dateOption?.value;
  const date = parseCheckinDate(rawInput);

  if (!date) {
    return patchOriginalMessage(
      interaction,
      `Ngày "${rawInput || ''}" không hợp lệ. Bạn có thể gõ:\n` +
      `• \`/checkin\` (hôm nay)\n` +
      `• \`/checkin date: hq\` (hôm qua) hoặc \`hk\` (hôm kia)\n` +
      `• \`/checkin date: 14/8\` hoặc \`14/08\` hoặc \`14-08\``,
      true
    );
  }

  const now = new Date();
  const todayVN = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const todayStr = todayVN.toISOString().slice(0, 10);
  const displayDate = formatDateDisplay(date);

  if (date > todayStr) {
    return patchOriginalMessage(
      interaction,
      `Ngày **${displayDate}** là trong tương lai. Chỉ check-in được cho ngày hôm nay hoặc các ngày trước.`,
      true
    );
  }

  const discordId = interaction.member?.user?.id || interaction.user?.id;
  if (!discordId) {
    return patchOriginalMessage(interaction, 'Không thể xác định Discord ID.', true);
  }

  let member: any = null;

  if (env.DB) {
    member = await getUserByDiscordId(env.DB, discordId);
  } else {
    const usersData = await getFromKV<any>(env, 'users', requestUrl);
    const userList = Array.isArray(usersData?.data) ? usersData.data : [];
    member = userList.find((u: any) => String(u.discordId) === String(discordId));
  }

  if (!member) {
    return patchOriginalMessage(
      interaction,
      '⚠️ **Tài khoản Discord của bạn chưa được liên kết với hệ thống Anki Challenge!**\n\n' +
      '👉 **Hướng dẫn:**\n' +
      '1. Bấm vào link đăng nhập trực tiếp: https://ankichallenge.pages.dev/api/auth/discord (hoặc truy cập https://ankichallenge.pages.dev và chọn **Đăng nhập Discord**).\n' +
      '2. Xác nhận uỷ quyền tài khoản Discord của bạn.\n' +
      '3. Sau khi đăng nhập thành công, quay lại đây và gõ `/checkin` nhé!',
      true
    );
  }

  const memberId = member.id;
  const challengeIds: number[] = member.challengeIds || [];
  const memberName = member.name || member.discordNickname || `#${memberId}`;

  if (challengeIds.length === 0) {
    return patchOriginalMessage(
      interaction,
      `⚠️ **Bạn (${memberName}) chưa tham gia thử thách nào!**\n\nVui lòng truy cập https://ankichallenge.pages.dev để đăng ký tham gia thử thách trước khi check-in.`,
      true
    );
  }

  const latestCid = Math.max(...challengeIds);

  if (env.DB) {
    const isNew = await recordCheckinInDB(env.DB, {
      challengeId: latestCid,
      userId: memberId,
      date,
      discordId: String(discordId),
      channelId: interaction.channel_id,
    });

    if (!isNew) {
      return patchOriginalMessage(interaction, `Bạn đã check-in ngày **${displayDate}** rồi.`, true);
    }
  } else {
    // Fallback KV
    const kvKey = KV_RECORDS[latestCid];
    if (!kvKey) {
      return patchOriginalMessage(interaction, `Không tìm thấy KV key cho challenge #${latestCid}.`, true);
    }

    const records = await getFromKV<Record<string, Record<string, boolean>>>(env, kvKey, requestUrl) || {};
    if (!records[date]) records[date] = {};

    if (records[date][String(memberId)]) {
      return patchOriginalMessage(interaction, `Bạn đã check-in ngày **${displayDate}** rồi.`, true);
    }

    records[date][String(memberId)] = true;
    await putToKV(env, kvKey, records);
  }

  return patchOriginalMessage(interaction, `✅ <@${discordId}> check-in ngày **${displayDate}** thành công!`);
}

async function handleRank(interaction: any, env: any, requestUrl: string): Promise<void> {
  const discordId = interaction.member?.user?.id || interaction.user?.id;
  if (!discordId) {
    return patchOriginalMessage(interaction, 'Không thể xác định Discord ID.', true);
  }

  let userList: any[] = [];
  if (env.DB) {
    const dbUsers = await getUsersFromDB(env.DB);
    userList = dbUsers.data;
  } else {
    const usersData = await getFromKV<any>(env, 'users', requestUrl);
    userList = Array.isArray(usersData?.data) ? usersData.data : [];
  }

  const member = userList.find((u: any) => String(u.discordId) === String(discordId));
  if (!member) {
    return patchOriginalMessage(
      interaction,
      '⚠️ **Tài khoản Discord của bạn chưa được liên kết với hệ thống Anki Challenge!**\n\n' +
      '👉 **Hướng dẫn:**\n' +
      '1. Bấm vào link đăng nhập trực tiếp: https://ankichallenge.pages.dev/api/auth/discord (hoặc truy cập https://ankichallenge.pages.dev và chọn **Đăng nhập Discord**).\n' +
      '2. Xác nhận uỷ quyền tài khoản Discord của bạn.\n' +
      '3. Sau khi đăng nhập thành công, quay lại đây và gõ `/trangthai` nhé!',
      true
    );
  }

  const challengeIds: number[] = member.challengeIds || [];
  if (challengeIds.length === 0) {
    return patchOriginalMessage(interaction, `⚠️ Bạn (${member.name}) chưa đăng ký tham gia thử thách nào!`, true);
  }

  const latestCid = Math.max(...challengeIds);

  let challenges: Record<string, any> = {};
  if (env.DB) {
    challenges = await getChallengesFromDB(env.DB);
  } else {
    challenges = await getFromKV<any>(env, 'challenges', requestUrl) || {};
  }

  const challenge = challenges[String(latestCid)] || {
    name: `Anki Challenge #${latestCid}`,
    start: '2026-01-01',
    end: '2026-12-31',
    totalDays: 100,
  };

  let records: Record<string, Record<string, boolean>> = {};
  if (env.DB) {
    records = await getRecordsFromDB(env.DB, latestCid);
  } else {
    const kvKey = KV_RECORDS[latestCid] || 'records_10';
    records = await getFromKV<any>(env, kvKey, requestUrl) || {};
  }

  const enrolledUsers = userList.filter((u: any) => (u.challengeIds || []).includes(latestCid));
  const dateRanges = { [latestCid]: { start: challenge.start, end: challenge.end } };
  const allStats = calculateUserStats(enrolledUsers, records, latestCid, dateRanges);

  allStats.sort((a: any, b: any) => {
    const pA = a.currentStat?.disciplinePercentage ?? 0;
    const pB = b.currentStat?.disciplinePercentage ?? 0;
    if (pB !== pA) return pB - pA;
    return (b.currentStat?.streak ?? 0) - (a.currentStat?.streak ?? 0);
  });

  let currentRank = 1;
  let prevPercent: number | null = null;
  let userRank = 1;
  let targetStat: any = null;

  for (let i = 0; i < allStats.length; i++) {
    const item = allStats[i];
    const pct = item.currentStat?.disciplinePercentage ?? 0;
    if (prevPercent !== null && pct < prevPercent) {
      currentRank = i + 1;
    }
    prevPercent = pct;

    if (item.id === member.id) {
      userRank = currentRank;
      targetStat = item.currentStat;
    }
  }

  const now = new Date();
  const todayVN = new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const isCheckedToday = Boolean(records[todayVN]?.[String(member.id)]);

  const streak = targetStat?.streak ?? 0;
  const longestStreak = targetStat?.longestStreak ?? 0;
  const totalDays = targetStat?.totalDays ?? 0;
  const disciplinePercentage = targetStat?.disciplinePercentage ?? 0;

  const msg = 
    `📊 **Thống kê thử thách của <@${discordId}>** — **${challenge.name}**\n\n` +
    `🏆 **Thứ hạng**: **#${userRank}** / ${enrolledUsers.length} thành viên\n` +
    `🔥 **Chuỗi liên tục (Streak)**: **${streak} ngày** (Kỷ lục: ${longestStreak} ngày)\n` +
    `📈 **Tỉ lệ chuyên cần**: **${disciplinePercentage}%** (${totalDays} ngày đã học)\n` +
    `📅 **Hôm nay (${todayVN.slice(8, 10)}/${todayVN.slice(5, 7)})**: ${isCheckedToday ? '✅ Đã check-in' : '⏳ Chưa check-in (gõ `/checkin` ngay)'}\n\n` +
    `🔗 Xem bảng xếp hạng: https://ankichallenge.pages.dev`;

  return patchOriginalMessage(interaction, msg);
}

