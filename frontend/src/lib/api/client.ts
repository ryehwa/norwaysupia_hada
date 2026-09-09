/** 공통 호출 래퍼. rewrites 프록시를 쓰므로 경로는 상대경로. */

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

/**
 * 브라우저에서는 상대경로 그대로 두어 next.config.mjs 의 rewrites 프록시를 태운다.
 * 서버 컴포넌트에는 프록시가 없고 상대경로 fetch 도 불가능하므로 백엔드를 직접 부른다.
 */
function resolve(path: string): string {
  if (typeof window !== 'undefined') return path;
  const origin = process.env.BACKEND_ORIGIN ?? 'http://localhost:8080';
  return origin.replace(/\/$/, '') + path;
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(resolve(path), {
    credentials: 'include',
    cache: 'no-store',
    ...init,
    headers:
      init?.body instanceof FormData
        ? init?.headers
        : { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? '요청을 처리할 수 없습니다.', data?.fields);
  }
  return data as T;
}

export const qs = (params: Record<string, string | number | undefined>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? '?' + s : '';
};
