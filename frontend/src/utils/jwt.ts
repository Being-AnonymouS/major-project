export interface JwtPayload {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

const normalizeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  return `${normalized}${'='.repeat(padLength)}`;
};

const decodeBase64Utf8 = (value: string): string => {
  const binary = window.atob(normalizeBase64Url(value));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder().decode(bytes);
  }

  return binary;
};

export const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3 || !tokenParts[1]) {
      return null;
    }

    const payloadJson = decodeBase64Utf8(tokenParts[1]);
    const payload = JSON.parse(payloadJson) as JwtPayload;

    return payload;
  } catch {
    return null;
  }
};

export const isJwtExpired = (token: string, bufferSeconds = 0): boolean => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp || typeof payload.exp !== 'number') {
    return true;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSeconds + bufferSeconds;
};
