import type { APIRoute } from 'astro';

export const prerender = false;

const GUILD_ID = '867268399687663616';

export const GET: APIRoute = async () => {
  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/widget.json`, {
      headers: {
        'User-Agent': 'AnkiVnLeaderboardAddon/1.0',
      },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ success: false, error: 'Không thể tải widget Discord.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data: any = await res.json();
    const channels = data.channels || [];
    const members = data.members || [];

    // Đếm số người đang ở trong từng kênh voice
    const memberCounts: Record<string, number> = {};
    for (const m of members) {
      if (m.channel_id) {
        memberCounts[m.channel_id] = (memberCounts[m.channel_id] || 0) + 1;
      }
    }

    // Sắp xếp các kênh theo position
    channels.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));

    const voiceChannels = channels.map((ch: any) => ({
      id: ch.id,
      name: ch.name,
      userCount: memberCounts[ch.id] || 0,
      url: `https://discord.com/channels/${GUILD_ID}/${ch.id}`,
      deepLink: `discord://discord.com/channels/${GUILD_ID}/${ch.id}`,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        guildName: data.name || 'Anki Việt Nam',
        instantInvite: data.instant_invite || 'https://discord.com/invite/867268399687663616',
        presenceCount: data.presence_count || 0,
        voiceChannels,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30, s-maxage=60',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
