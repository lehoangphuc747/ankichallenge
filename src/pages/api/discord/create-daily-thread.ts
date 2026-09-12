import type { APIRoute } from 'astro';
import quotes from '../../../utils/daily-quotes.json';
export const prerender = false;

const CHANNEL_ID = "1541493820242264256";
const START_ISO = "2026-09-01T00:00:00+07:00";

function getHoChiMinhDate(d = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(d).reduce((a, p) => (a[p.type] = p.value, a), {} as any);
  return new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00+07:00`);
}

function getDayNumber(now = new Date()): number {
  const today = getHoChiMinhDate(now);
  const start = new Date(START_ISO);
  const diffMs = today.getTime() - start.getTime();
  return Math.floor(diffMs / 86400000) + 1;
}

function formatVN(d: Date): string {
  const v = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(d);
  return v;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env ?? {};

  // Guard by CRON_SECRET if set
  const cronSecret = env.CRON_SECRET || import.meta.env.CRON_SECRET;
  if (cronSecret) {
    const got = request.headers.get('x-cron-secret');
    if (got !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
  }

  const token = env.DISCORD_TOKEN || import.meta.env.DISCORD_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: 'Missing DISCORD_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const url = new URL(request.url);
  const dayParam = url.searchParams.get('day');
  const dayOverride = dayParam ? parseInt(dayParam, 10) : null;

  const now = new Date();
  const day = dayOverride ?? getDayNumber(now);

  let targetDate = now;
  if (dayOverride) {
    const start = new Date(START_ISO);
    targetDate = new Date(start.getTime() + (dayOverride - 1) * 86400000);
  }

  const vnDate = formatVN(targetDate); // DD/MM/YYYY
  const ddmm = vnDate.slice(0, 5); // DD/MM

  // If before challenge start (day < 1), still allow but mark as Test
  const dayLabel = day < 1 ? `Test-${ddmm}` : `D${day}-${ddmm}`;
  const quote = (quotes as Record<string, { text: string; author: string }>)[String(day)];
  const quoteBlock = quote ? `\n\n> ${quote.text}\n> — *${quote.author}*` : '';

  let bodyBlock = '';
  if (day === 12) {
    bodyBlock =
      `\n\n🏆 **VINH DANH TOP 3 XUẤT SẮC (CHẶNG ĐẦU DAY 1 – DAY 11)** 🌟\n` +
      `Chúc mừng 3 chiến thần đã bứt phá ngoạn mục:\n` +
      `🥇 **Top 1: Ethan NP** (<@1340307678215405710>) — **19.402 thẻ** (kỷ lục 4.374 thẻ/ngày)\n` +
      `🥈 **Top 2: Nguyen** (<@871321277858725958>) — **13.657 thẻ** (kỷ lục 2.976 thẻ/ngày)\n` +
      `🥉 **Top 3: .diffusion.** (<@1375756159834783755>) — **4.091 thẻ** (kỷ luật tuyệt đối 11/11 ngày)\n\n` +
      `Toàn đội AC11 đã cùng nhau chinh phục hơn **81.300 thẻ**! Mọi người tiếp tục giữ vững ngọn lửa kỷ luật trong Ngày 12 nhé! 🔥💪\n\n` +
      `Chúc mọi người ngày ${day} kỷ luật! 🔥`;
  } else if (day === 13) {
    bodyBlock =
      `\n\n🏆 **TRAO TẶNG DANH HIỆU: "CHIẾN THẦN BÌNH MINH" (EARLY BIRD AC11)** 🌅🐦\n` +
      `Trang trọng vinh danh thành viên **Tram** (<@1446504123657748651>) với kỷ lục vô tiền khoáng hậu:\n` +
      `✨ **Chuỗi 12/12 ngày check-in sớm nhất server!** ✨\n\n` +
      `⏰ **Kỷ luật thép:** Luôn thức dậy và hoàn thành bài học trong khung giờ vàng **04:50 – 05:25 sáng** mỗi ngày.\n` +
      `*(Chính chủ mở bát Day 1 xin tự nguyện nhường ngôi để trao tặng trọn vẹn danh hiệu chuỗi bất bại 12/12 ngày cho bạn Tram! 👏🎩)*\n\n` +
      `Chúc toàn thể anh em AC11 lấy nguồn năng lượng rạng sáng này làm động lực bứt phá trong Ngày ${day} nhé! 🔥💪\n\n` +
      `Chúc mọi người ngày ${day} kỷ luật! 🔥`;
  } else {
    bodyBlock = `\n\nChúc mọi người ngày ${day} kỷ luật! 🔥`;
  }

  const messageContent = day < 1
    ? `## [TEST] Ngày ${day} - ${vnDate} (trước ngày bắt đầu 01/09/2026)`
    : `## Ngày ${day} - ${vnDate}${quoteBlock}${bodyBlock}`;

  const headers: Record<string, string> = {
    'Authorization': `Bot ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'DiscordBot (https://ankichallenge.pages.dev, 1.0)',
  };

  try {
    // 1. Send message to channel
    const msgRes = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: messageContent,
        allowed_mentions: { parse: ['users'] }
      }),
    });
    const msgJson: any = await msgRes.json();
    if (!msgRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to send message', details: msgJson }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }
    const messageId = msgJson.id;

    // 2. Create thread from that message
    const threadRes = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages/${messageId}/threads`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: dayLabel,
        auto_archive_duration: 1440,
      }),
    });
    const threadJson: any = await threadRes.json();
    if (!threadRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to create thread', details: threadJson, messageId }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }

    const threadId = threadJson.id;

    return new Response(JSON.stringify({
      success: true,
      day,
      vnDate,
      messageId,
      threadId,
      threadName: threadJson.name,
      messageContent,
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

// Allow GET for manual browser testing (same as POST)
export const GET: APIRoute = async (ctx) => {
  // convert GET to POST logic without secret check if accessed via browser locally
  return POST(ctx as any);
};
