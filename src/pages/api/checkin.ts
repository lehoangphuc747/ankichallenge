// API endpoint to update check-in data
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Cloudflare Workers/Pages không có filesystem (fs/path). Endpoint này chỉ hợp lệ khi chạy Node server.
    // Vì dự án đang dùng adapter Cloudflare, mình trả về thông báo rõ ràng để tránh lỗi `require is not defined`.
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Endpoint này không hỗ trợ trên Cloudflare (không thể ghi file). Hãy cập nhật dữ liệu bằng pipeline build hoặc lưu vào KV/D1.'
      }),
      { status: 501, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating check-in:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
