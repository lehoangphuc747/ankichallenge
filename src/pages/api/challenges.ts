import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const GET: APIRoute = async () => {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'challenges.json');
    
    // Try to read existing file
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return new Response(content, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch {
      // If file doesn't exist, return default challenges
      const defaultChallenges = {
        "1": { "name": "Anki Challenge 8", "start": "2025-09-03", "end": "2025-12-21", "certEnd": "2025-12-11", "description": "100 ngày thử thách + 10 ngày gia hạn" },
        "2": { "name": "Anki Challenge 9", "start": "2025-12-22", "end": "2026-03-31", "description": "100 ngày thử thách" },
        "3": { "name": "Anki Challenge 10", "start": "2026-05-01", "end": "2026-08-09", "description": "100 ngày thử thách" }
      };
      return new Response(JSON.stringify(defaultChallenges, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
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
    const data = await request.json();
    
    if (!data || typeof data !== 'object') {
      return new Response(JSON.stringify({ success: false, error: 'Invalid data format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const filePath = path.join(process.cwd(), 'public', 'data', 'challenges.json');
    const content = JSON.stringify(data, null, 2);
    
    await fs.writeFile(filePath, content, 'utf-8');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating challenges:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
