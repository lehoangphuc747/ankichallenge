import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, request } = context;

  // Lấy password từ env (hỗ trợ cả Astro env và Node process env)
  const adminPassword = import.meta.env.ADMIN_PASSWORD || 
                        (typeof process !== 'undefined' ? process.env.ADMIN_PASSWORD : undefined) || 
                        'admin123';

  // Chuẩn hóa đường dẫn (bỏ trailing slash)
  const pathname = url.pathname.replace(/\/$/, '');

  // 1. Bảo vệ các trang quản trị /admin/*
  if (pathname.startsWith('/admin')) {
    const sessionCookie = cookies.get('admin_session')?.value;
    const isAuthenticated = sessionCookie === adminPassword;

    // Nếu cố tình truy cập trang con (ví dụ /admin/checkin) mà chưa login -> redirect về /admin
    if (!isAuthenticated && pathname !== '/admin') {
      console.log(`[Middleware] 🔒 Từ chối truy cập ${pathname}, redirect về /admin`);
      return redirect('/admin', 302);
    }
  }

  // 2. Bảo vệ các API thay đổi dữ liệu nhạy cảm
  const isSensitiveApi = 
    pathname === '/api/checkin' || 
    pathname === '/api/update-users' || 
    (pathname === '/api/challenges' && request.method === 'POST');

  if (isSensitiveApi) {
    const sessionCookie = cookies.get('admin_session')?.value;
    const isAuthenticated = sessionCookie === adminPassword;

    if (!isAuthenticated) {
      console.log(`[Middleware] 🔒 Chặn request API không hợp lệ tới ${pathname}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized: Bạn cần đăng nhập để thực hiện thao tác này.'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  return next();
});
