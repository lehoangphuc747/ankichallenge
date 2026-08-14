// API endpoint đọc data từ Cloudflare KV
// GET /api/data/users, /api/data/challenges, /api/data/records_08, etc.

import type { APIRoute } from 'astro';
import { getFromKV } from '../../../utils/kv';
import { getUsersFromDB, getChallengesFromDB, getRecordsFromDB } from '../../../utils/db';

export const prerender = false;

// Các key được phép truy cập (whitelist)
const ALLOWED_KEYS = new Set([
  'users',
  'challenges',
  'records_08',
  'records_09',
  'records_10',
  'metadata',
  'login_history',
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
    let data: any = null;

    // Ưu tiên đọc từ Cloudflare D1 Database nếu có binding DB
    if (env.DB) {
      if (key === 'users') {
        data = await getUsersFromDB(env.DB);
      } else if (key === 'challenges') {
        data = await getChallengesFromDB(env.DB);
      } else if (key === 'records_08') {
        data = await getRecordsFromDB(env.DB, 1);
      } else if (key === 'records_09') {
        data = await getRecordsFromDB(env.DB, 2);
      } else if (key === 'records_10') {
        data = await getRecordsFromDB(env.DB, 3);
      }
    }

    // Fallback sang KV hoặc file tĩnh
    if (data === null) {
      data = await getFromKV(env, key, request.url);
    }

    if (data === null) {
      return new Response(
        JSON.stringify({ error: `Không tìm thấy dữ liệu cho key "${key}"` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=60'
      },
    });
  } catch (error: any) {
    console.error(`[api/data/${key}] Error:`, error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
