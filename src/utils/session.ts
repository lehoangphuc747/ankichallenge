/**
 * Tiện ích ký và xác minh Session Cookie bằng HMAC-SHA256.
 * Ngăn chặn người dùng giả mạo hoặc sửa đổi dữ liệu session cookie.
 *
 * Định dạng Cookie: base64(JSON).base64url(hmac_signature)
 */

const ALGO = { name: 'HMAC', hash: 'SHA-256' } as const;

function toB64Url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    ALGO,
    false,
    ['sign', 'verify'],
  );
}

/**
 * Ký một object thành chuỗi cookie an toàn.
 * Trả về: "base64Payload.hmacSignature"
 */
export async function signSession(data: object, secret: string): Promise<string> {
  const payload = btoa(encodeURIComponent(JSON.stringify(data)));
  const key = await getKey(secret);
  const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return `${payload}.${toB64Url(sigBuffer)}`;
}

/**
 * Xác minh chữ ký cookie và giải mã dữ liệu session.
 * Trả về null nếu cookie bị giả mạo hoặc không hợp lệ.
 */
export async function verifySession<T = Record<string, unknown>>(
  token: string,
  secret: string,
): Promise<T | null> {
  try {
    const dotIdx = token.lastIndexOf('.');
    if (dotIdx === -1) return null;

    const payload = token.slice(0, dotIdx);
    const receivedSig = token.slice(dotIdx + 1);

    const key = await getKey(secret);
    const expectedSigBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(payload),
    );
    const expectedSig = toB64Url(expectedSigBuffer);

    // So sánh Timing-Safe để tránh Timing Attack
    if (receivedSig.length !== expectedSig.length) return null;
    let diff = 0;
    for (let i = 0; i < receivedSig.length; i++) {
      diff |= receivedSig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
    }
    if (diff !== 0) return null;

    return JSON.parse(decodeURIComponent(atob(payload))) as T;
  } catch {
    return null;
  }
}
