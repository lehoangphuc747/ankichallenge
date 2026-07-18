// API endpoint để cập nhật dữ liệu check-in.
// Lưu vào Cloudflare KV (hoặc fallback file local khi dev).

import type { APIRoute } from 'astro';
import { getFromKV, putToKV } from '../../utils/kv';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    let bodyText: string = '';
    let body: any = null;

    try {
      const contentType = request.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return new Response(
          JSON.stringify({ success: false, error: 'Content-Type phải là application/json' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      bodyText = await request.text();
      if (!bodyText || bodyText.trim() === '') {
        return new Response(
          JSON.stringify({ success: false, error: 'Request body rỗng' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      body = JSON.parse(bodyText);
    } catch (parseError: any) {
      return new Response(
        JSON.stringify({ success: false, error: 'Lỗi parse JSON: ' + (parseError?.message || 'Unknown') }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { date, userId, challengeId, isChecked } = body as {
      date?: string;
      userId?: number | string;
      challengeId?: number | string;
      isChecked?: boolean;
    };

    // Validate input
    if (!date || date.trim() === '') {
      return new Response(
        JSON.stringify({ success: false, error: 'Thiếu hoặc date không hợp lệ' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (userId === undefined || userId === null) {
      return new Response(
        JSON.stringify({ success: false, error: 'Thiếu hoặc userId không hợp lệ' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (challengeId === undefined || challengeId === null) {
      return new Response(
        JSON.stringify({ success: false, error: 'Thiếu hoặc challengeId không hợp lệ' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (typeof isChecked !== 'boolean') {
      return new Response(
        JSON.stringify({ success: false, error: 'isChecked phải là boolean' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Map challengeId to KV key
    const cid = parseInt(String(challengeId));
    let kvKey = 'records_08';
    if (cid === 1) kvKey = 'records_08';
    if (cid === 2) kvKey = 'records_09';
    if (cid === 3) kvKey = 'records_10';

    const env = (locals as any).runtime?.env ?? {};

    // Đọc records hiện tại từ KV
    type StudyRecords = Record<string, Record<string, boolean>>;
    let records: StudyRecords = await getFromKV(env, kvKey, request.url) || {};

    const userKey = String(userId);

    // Tạo key ngày nếu chưa có
    if (!records[date]) {
      records[date] = {};
    }

    if (isChecked) {
      records[date][userKey] = true;
    } else {
      delete records[date][userKey];
      // Nếu ngày đó không còn ai check-in thì xoá luôn key ngày
      if (Object.keys(records[date]).length === 0) {
        delete records[date];
      }
    }

    // Ghi lại vào KV
    await putToKV(env, kvKey, records);

    console.log(`[checkin API] Saved: date=${date}, userId=${userId}, isChecked=${isChecked}, kvKey=${kvKey}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[checkin API] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
