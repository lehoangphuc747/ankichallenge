import type { APIRoute } from 'astro';

const defaultChallenges = {
  "1": { "name": "Anki Challenge 8", "start": "2025-09-03", "end": "2025-12-21", "certEnd": "2025-12-11", "description": "100 ngày thử thách + 10 ngày gia hạn" },
  "2": { "name": "Anki Challenge 9", "start": "2025-12-22", "end": "2026-03-31", "description": "100 ngày thử thách" },
  "3": { "name": "Anki Challenge 10", "start": "2026-05-01", "end": "2026-08-09", "description": "100 ngày thử thách" }
};

export const GET: APIRoute = async ({ request }) => {
  try {
    try {
      // Cloudflare Workers không có filesystem; đọc file tĩnh qua fetch.
      // Lưu ý: cần base URL thật để fetch tới asset cùng origin.
      // Trong Astro APIRoute, hãy dùng request.url làm base.
      const res = await fetch(new URL('/data/challenges.json', request.url), { cache: 'force-cache' });
      if (res.ok) {
        const text = await res.text();
        return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    } catch {
      // ignore
    }

    return new Response(JSON.stringify(defaultChallenges, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error reading challenges:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Cloudflare Workers/Pages không có filesystem (fs/path) nên không thể ghi file JSON lúc runtime.
    // Nếu cần update, hãy commit file `public/data/challenges.json` trong bước build hoặc lưu vào KV/D1.
    void request;
    return new Response(
      JSON.stringify({ success: false, error: 'Endpoint này không hỗ trợ trên Cloudflare (không thể ghi file).' }),
      { status: 501, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating challenges:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
