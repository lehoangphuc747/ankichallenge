import type { APIRoute } from 'astro';
import nacl from 'tweetnacl';
import { InteractionType, InteractionResponseType, InteractionResponseFlags } from 'discord-interactions';
import { getFromKV, putToKV } from '../../../utils/kv';

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
};

function jsonResponse(data: any): Response {
  return new Response(JSON.stringify({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data,
  }), { headers: { 'Content-Type': 'application/json' } });
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
      if (commandName === 'setchannel') return handleSetChannel(interaction, env);
      if (commandName === 'setrole') return handleSetRole(interaction, env);
      if (commandName === 'checkin') return handleCheckin(interaction, env, requestUrl);
    }

    return new Response('Unknown interaction', { status: 400 });
  } catch (error: any) {
    console.error('[discord/interact] Error:', error);
    return jsonResponse({
      content: 'Đã xảy ra lỗi khi xử lý lệnh. Vui lòng thử lại sau.',
      flags: InteractionResponseFlags.EPHEMERAL,
    });
  }
};

async function handleSetChannel(interaction: any, env: any): Promise<Response> {
  const permissions = interaction.member?.permissions;
  if (!permissions || (BigInt(permissions) & 8n) !== 8n) {
    return jsonResponse({
      content: 'Bạn cần quyền **Administrator** trên server để dùng lệnh này.',
      flags: InteractionResponseFlags.EPHEMERAL,
    });
  }

  const channelId = interaction.channel_id;
  await putToKV(env, 'config', { checkinChannelId: channelId });

  return jsonResponse({
    content: `✅ Đã đặt <#${channelId}> làm channel check-in. Chỉ các **thread** trong channel này mới được dùng \`/checkin\`.`,
    flags: InteractionResponseFlags.EPHEMERAL,
  });
}

async function handleSetRole(interaction: any, env: any): Promise<Response> {
  const permissions = interaction.member?.permissions;
  if (!permissions || (BigInt(permissions) & 8n) !== 8n) {
    return jsonResponse({
      content: 'Bạn cần quyền **Administrator** trên server để dùng lệnh này.',
      flags: InteractionResponseFlags.EPHEMERAL,
    });
  }

  const roleOption = interaction.data?.options?.find((o: any) => o.name === 'role');
  const roleId = roleOption?.value as string | undefined;

  const config = (await getFromKV<any>(env, 'config')) || {};
  if (roleId) {
    config.allowedRoleId = roleId;
    await putToKV(env, 'config', config);
    return jsonResponse({
      content: `✅ Đã set role <@&${roleId}> được phép check-in.`,
      flags: InteractionResponseFlags.EPHEMERAL,
    });
  } else {
    delete config.allowedRoleId;
    await putToKV(env, 'config', config);
    return jsonResponse({
      content: 'Đã xoá giới hạn role. Ai cũng có thể check-in (nếu đã link Discord).',
      flags: InteractionResponseFlags.EPHEMERAL,
    });
  }
}

function parseCheckinDate(input?: string): string | null {
  const now = new Date();
  const nowVN = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const nowVNStr = nowVN.toISOString().slice(0, 10);
  const today = new Date(nowVNStr + 'T00:00:00.000Z');

  if (!input || !input.trim()) return nowVNStr;

  const s = input.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (s === 'hom_nay' || s === 'hom nay' || s === 'today') return nowVNStr;
  if (s === 'hom_qua' || s === 'hom qua' || s === 'yesterday') {
    const y = new Date(today.getTime() - 86400000);
    return y.toISOString().slice(0, 10);
  }

  // Định dạng đầy đủ YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // dạng dd/mm, dd/m, d/mm, d/m
  const m = s.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = nowVN.getUTCFullYear();
    if (day < 1 || day > 31 || month < 1 || month > 12) return null;
    const candidate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (candidate > nowVNStr) {
      const y = new Date(`${candidate}T00:00:00.000Z`);
      return new Date(y.getTime() - 365 * 86400000).toISOString().slice(0, 10);
    }
    return candidate;
  }

  return null;
}

async function handleCheckin(interaction: any, env: any, requestUrl: string): Promise<Response> {
  const dateOption = interaction.data?.options?.find((o: any) => o.name === 'date');
  const date = parseCheckinDate(dateOption?.value);

  if (!date) {
    return jsonResponse({
      content: 'Ngày không hợp lệ. Gõ `/checkin` để check-in hôm nay, hoặc nhập dạng `dd/mm` (VD: `/checkin 29/07`), `hôm_qua`, hoặc `YYYY-MM-DD`.',
      flags: InteractionResponseFlags.EPHEMERAL,
    });
  }

  const now = new Date();
  const todayVN = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const todayStr = todayVN.toISOString().slice(0, 10);

  if (date > todayStr) {
    return jsonResponse({
      content: 'Ngày **' + date + '** là trong tương lai. Chỉ check-in được cho ngày hôm nay hoặc quá khứ.',
      flags: InteractionResponseFlags.EPHEMERAL,
    });
  }

  const discordId = interaction.member?.user?.id || interaction.user?.id;
  if (!discordId) {
    return jsonResponse({
      content: 'Không thể xác định Discord ID.',
      flags: InteractionResponseFlags.EPHEMERAL,
    });
  }

  const usersData = await getFromKV<any>(env, 'users', requestUrl);
  const userList = Array.isArray(usersData?.data) ? usersData.data : [];
  const member = userList.find((u: any) => String(u.discordId) === String(discordId));

  if (!member) {
    return jsonResponse({
      content: 'Tài khoản Discord của bạn chưa được ghép nối với hệ thống Anki Challenge. Vui lòng đăng nhập tại https://ankichallenge.pages.dev bằng Discord để liên kết.',
      flags: InteractionResponseFlags.EPHEMERAL,
    });
  }

  const memberId = member.id;
  const challengeIds: number[] = member.challengeIds || [];
  const memberName = member.name || member.discordNickname || `#${memberId}`;

  if (challengeIds.length === 0) {
    return jsonResponse({
      content: `Bạn (${memberName}) chưa tham gia challenge nào.`,
      flags: InteractionResponseFlags.EPHEMERAL,
    });
  }

  const latestCid = Math.max(...challengeIds);
  const kvKey = KV_RECORDS[latestCid];
  if (!kvKey) {
    return jsonResponse({
      content: `Không tìm thấy KV key cho challenge #${latestCid}.`,
      flags: InteractionResponseFlags.EPHEMERAL,
    });
  }

  const records = await getFromKV<Record<string, Record<string, boolean>>>(env, kvKey, requestUrl) || {};
  if (!records[date]) records[date] = {};

  if (records[date][String(memberId)]) {
    return jsonResponse({
      content: `Bạn đã check-in ngày **${date}** rồi.`,
      flags: InteractionResponseFlags.EPHEMERAL,
    });
  }

  records[date][String(memberId)] = true;
  await putToKV(env, kvKey, records);

  try {
    const auditLog = await getFromKV<any[]>(env, 'checkin_audit') || [];
    auditLog.push({
      discordId,
      userId: memberId,
      date,
      timestamp: new Date().toISOString(),
      channelId: interaction.channel_id,
    });
    await putToKV(env, 'checkin_audit', auditLog);
  } catch (e) {
    console.warn('[discord/interact] Audit log write failed:', e);
  }

  return jsonResponse({
    content: `✅ <@${discordId}> check-in **${date}** thành công!`,
  });
}
