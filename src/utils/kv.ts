// KV helper cho Cloudflare Pages
// Đọc/ghi data thông qua KV namespace, fallback về fetch tĩnh khi dev local

const KV_KEYS = {
  users: 'users',
  challenges: 'challenges',
  records_08: 'records_08',
  records_09: 'records_09',
  records_10: 'records_10',
  metadata: 'metadata',
} as const;

export type KVKey = keyof typeof KV_KEYS;

// Mapping từ KV key sang file path tĩnh (fallback)
const KEY_TO_FILE: Record<string, string> = {
  users: '/data/users.json',
  challenges: '/data/challenges.json',
  records_08: '/data/challenge_08_records.json',
  records_09: '/data/challenge_09_records.json',
  records_10: '/data/challenge_10_records.json',
  metadata: '/data/metadata.json',
};

/**
 * Đọc JSON từ KV namespace.
 * Nếu KV binding không có (local dev không dùng wrangler), fallback về fetch tĩnh.
 */
export async function getFromKV<T = any>(
  env: { DATA?: KVNamespace },
  key: string,
  requestUrl?: string
): Promise<T | null> {
  // Có KV binding → đọc từ KV
  if (env.DATA) {
    try {
      const value = await env.DATA.get(key, 'json');
      if (value !== null) {
        return value as T | null;
      }
    } catch (e) {
      console.warn(`[KV] Error getting key "${key}" from KV, falling back to static file:`, e);
    }
  }

  // Fallback: fetch file tĩnh (local dev với npm run dev)
  const filePath = KEY_TO_FILE[key];
  if (filePath && requestUrl) {
    try {
      const res = await fetch(new URL(filePath + '?v=' + Date.now(), requestUrl));
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Ghi JSON vào KV namespace.
 */
export async function putToKV(
  env: { DATA?: KVNamespace },
  key: string,
  data: any
): Promise<void> {
  if (!env.DATA) {
    throw new Error('KV binding "DATA" không khả dụng. Không thể ghi data.');
  }
  await env.DATA.put(key, JSON.stringify(data));
}
