// API endpoint đọc data từ Cloudflare KV
// GET /api/data/users, /api/data/challenges, /api/data/records_08, etc.

import type { APIRoute } from 'astro';
import { getFromKV } from '../../../utils/kv';

export const prerender = false;

// Các key được phép truy cập (whitelist)
const ALLOWED_KEYS = new Set([
  'users',
  'challenges',
  'records_08',
  'records_09',
  'records_10',
  'metadata',
]);

export const GET: APIRoute = async ({ params, request, locals }) => {
  const key = params.key;

  if (!key || !ALLOWED_KEYS.has(key)) {
    return new Response(
      JSON.stringify({ error: `Key "${key}" không hợp lệ hoặc không được phép truy cập.` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const env = (locals as any).runtime?.env ?? {};
    const data = await getFromKV(env, key, request.url);

    if (data === null) {
      return new Response(
        JSON.stringify({ error: `Không tìm thấy dữ liệu cho key "${key}"` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error(`[api/data/${key}] Error:`, error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
