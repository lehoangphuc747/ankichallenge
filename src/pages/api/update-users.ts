import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { data } = await request.json();
    
    if (!data || !Array.isArray(data)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid data format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const filePath = path.join(process.cwd(), 'public', 'data', 'users.json');
    const content = JSON.stringify({ data }, null, 2);
    
    await fs.writeFile(filePath, content, 'utf-8');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating users:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
