import type { APIRoute } from 'astro';

// Không pre-render API này - chỉ chạy server-side khi dev
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Cloudflare Workers/Pages không có filesystem (fs/path).
    // Endpoint này từng ghi thẳng vào public/data/users.json (chỉ hợp lệ trên Node).
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Endpoint này không hỗ trợ trên Cloudflare (không thể ghi file). Hãy cập nhật users.json trong bước build hoặc lưu vào KV/D1.'
      }),
      { status: 501, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating users:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
