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

async function handleCheckin(interaction: any, env: any, requestUrl: string): Promise<Response> {
  const parentId = interaction.channel?.parent_id;
  if (!parentId) {
    return jsonResponse({
      content: 'Lệnh này chỉ dùng được trong **thread** của channel check-in.',
      flags: InteractionResponseFlags.EPHEMERAL,
    });
  }

  const config = await getFromKV<any>(env, 'config');
  if (!config?.checkinChannelId) {
    return jsonResponse({
      content: 'Chưa có channel check-in nào được cấu hình. Hãy nhờ Admin dùng `/setchannel` trước.',
      flags: InteractionResponseFlags.EPHEMERAL,
    });
  }

  if (parentId !== config.checkinChannelId) {
    return jsonResponse({
      content: `Thread này không thuộc channel check-in. Vui lòng dùng \`/checkin\` trong thread của <#${config.checkinChannelId}>.`,
      flags: InteractionResponseFlags.EPHEMERAL,
    });
  }

  if (config.allowedRoleId) {
    const memberRoles: string[] = interaction.member?.roles || [];
    if (!memberRoles.includes(config.allowedRoleId)) {
      return jsonResponse({
        content: 'Bạn không có quyền sử dụng lệnh này vì bạn đang không tham gia challenge.',
        flags: InteractionResponseFlags.EPHEMERAL,
      });
    }
  }

  const dateOption = interaction.data?.options?.find((o: any) => o.name === 'date');
  const date = dateOption?.value as string;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return jsonResponse({
      content: 'Ngày không hợp lệ. Định dạng: YYYY-MM-DD (VD: 2026-07-29)',
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

  const challengesData = await getFromKV<any>(env, 'challenges', requestUrl);
  const challenge = challengesData?.data?.[String(latestCid)];
  if (challenge?.start && challenge?.end) {
    if (date < challenge.start || date > challenge.end) {
      return jsonResponse({
        content: `Ngày **${date}** không nằm trong thời gian của challenge **${challenge.name}** (${challenge.start} → ${challenge.end}).`,
        flags: InteractionResponseFlags.EPHEMERAL,
      });
    }
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
      threadId: interaction.channel_id,
      channelId: parentId,
    });
    await putToKV(env, 'checkin_audit', auditLog);
  } catch (e) {
    console.warn('[discord/interact] Audit log write failed:', e);
  }

  return jsonResponse({
    content: `✅ <@${discordId}> check-in **${date}** thành công!`,
  });
}
