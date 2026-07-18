// API endpoint cho challenges.
// GET: Đọc từ KV (fallback fetch tĩnh)
// POST: Ghi vào KV

import type { APIRoute } from 'astro';
import { getFromKV, putToKV } from '../../utils/kv';

export const prerender = false;

const defaultChallenges = {
  "1": { "name": "Anki Challenge 8", "start": "2025-09-03", "end": "2025-12-21", "certEnd": "2025-12-11", "totalDays": 110, "description": "100 ngày + 10 ngày gia hạn" },
  "2": { "name": "Anki Challenge 9", "start": "2025-12-22", "end": "2026-03-31", "totalDays": 100, "description": "100 ngày thử thách" },
  "3": { "name": "Anki Challenge 10", "start": "2026-04-10", "end": "2026-07-18", "totalDays": 100, "description": "100 ngày thử thách" }
};

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env ?? {};
    const data = await getFromKV(env, 'challenges', request.url);

    if (data) {
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fallback về default
    return new Response(JSON.stringify(defaultChallenges, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error reading challenges:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const env = (locals as any).runtime?.env ?? {};

    await putToKV(env, 'challenges', body);

    console.log('[challenges API] Saved challenges to KV');
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating challenges:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
