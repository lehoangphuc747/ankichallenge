import type { APIRoute } from 'astro';
import { verifyKey, InteractionType, InteractionResponseType, InteractionResponseFlags } from 'discord-interactions';
import { getFromKV, putToKV } from '../../../utils/kv';

export const prerender = false;

const KV_RECORDS: Record<number, string> = {
  1: 'records_08',
  2: 'records_09',
  3: 'records_10',
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env ?? {};

    const discordPublicKey =
      env.DISCORD_PUBLIC_KEY ||
      import.meta.env.DISCORD_PUBLIC_KEY ||
      '';

    const signature = request.headers.get('X-Signature-Ed25519') || '';
    const timestamp = request.headers.get('X-Signature-Timestamp') || '';

    const rawBody = await request.clone().text();

    const isValid = await verifyKey(rawBody, signature, timestamp, discordPublicKey);
    if (!isValid) {
      return new Response('Invalid signature', { status: 401 });
    }

    const interaction = JSON.parse(rawBody);

    // Ping-Pong
    if (interaction.type === InteractionType.PING) {
      return new Response(JSON.stringify({ type: InteractionResponseType.PONG }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Slash command
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      const commandName = interaction.data?.name;

      if (commandName === 'checkin') {
        const dateOption = interaction.data?.options?.find((o: any) => o.name === 'date');
        const date = dateOption?.value as string;

        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return new Response(
            JSON.stringify({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: 'Ngày không hợp lệ. Định dạng: YYYY-MM-DD (VD: 2026-07-29)',
                flags: InteractionResponseFlags.EPHEMERAL,
              },
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }

        const discordId = interaction.member?.user?.id || interaction.user?.id;
        if (!discordId) {
          return new Response(
            JSON.stringify({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: 'Không thể xác định Discord ID của bạn.',
                flags: InteractionResponseFlags.EPHEMERAL,
              },
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Tra cứu user trong KV
        const usersData = await getFromKV<any>(env, 'users', request.url);
        const userList = Array.isArray(usersData?.data) ? usersData.data : [];
        const member = userList.find((u: any) => String(u.discordId) === String(discordId));

        if (!member) {
          return new Response(
            JSON.stringify({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: 'Tài khoản Discord của bạn chưa được ghép nối với hệ thống Anki Challenge. Vui lòng đăng nhập tại https://ankichallenge.pages.dev bằng Discord để liên kết.',
                flags: InteractionResponseFlags.EPHEMERAL,
              },
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }

        const memberId = member.id;
        const challengeIds: number[] = member.challengeIds || [];
        const memberName = member.name || member.discordNickname || `#${memberId}`;

        if (challengeIds.length === 0) {
          return new Response(
            JSON.stringify({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `Bạn (${memberName}) chưa tham gia challenge nào.`,
                flags: InteractionResponseFlags.EPHEMERAL,
              },
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Chỉ check-in cho challenge mới nhất (challengeId lớn nhất)
        const latestCid = Math.max(...challengeIds);
        const kvKey = KV_RECORDS[latestCid];
        if (!kvKey) {
          return new Response(
            JSON.stringify({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `Không tìm thấy KV key cho challenge #${latestCid}.`,
                flags: InteractionResponseFlags.EPHEMERAL,
              },
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }

        const records = await getFromKV<Record<string, Record<string, boolean>>>(env, kvKey, request.url) || {};
        if (!records[date]) records[date] = {};
        records[date][String(memberId)] = true;
        await putToKV(env, kvKey, records);

        return new Response(
          JSON.stringify({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `✅ **${memberName}** đã check-in **${date}** thành công!`,
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response('Unknown interaction', { status: 400 });
  } catch (error: any) {
    console.error('[discord/interact] Error:', error);
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Đã xảy ra lỗi khi xử lý lệnh. Vui lòng thử lại sau.',
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
};
