/** 백엔드 호출 래퍼. rewrites 프록시를 쓰므로 경로는 상대경로. */

export type Category = '주거' | '상업';
export type InquiryStatusLabel = '대기' | '완료';

export interface PhotoView {
  id: number;
  url: string;
  sortOrder: number;
  thumbnail: boolean;
}

export interface ProjectSummary {
  id: number;
  title: string;
  category: Category;
  thumbnailUrl: string | null;
  photoCount: number;
}

export interface ProjectView extends Omit<ProjectSummary, 'thumbnailUrl'> {
  description: string | null;
  thumbnailUrl: string | null;
  photos: PhotoView[];
  createdAt: string;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface FeaturedSlotView {
  slotIndex: number;
  project: ProjectSummary | null;
}

export interface SiteInfoView {
  address: string;
  phone: string;
  email: string;
  businessHours: string;
}

export interface InquiryRow {
  id: number;
  name: string;
  phone: string;
  address: string;
  spaceType: Category;
  consultDate: string | null;
  consultTime: string | null;
  submittedAt: string;
  status: InquiryStatusLabel;
  reserved: boolean;
  confirmed: boolean;
}

export interface InquiryDetail extends InquiryRow {
  addressDetail: string | null;
  size: string | null;
  sizeUnit: string | null;
  workDate: string | null;
  consultEndTime: string | null;
  note: string | null;
}

export interface SlotView {
  time: string;
  state: 'open' | 'closed' | 'reserved';
  reservedBy: string | null;
}

export interface DashboardView {
  projectCount: number;
  pendingCount: number;
  totalInquiryCount: number;
  recentInquiries: InquiryRow[];
}

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
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

const qs = (params: Record<string, string | number | undefined>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? '?' + s : '';
};

// ---------- 공개 ----------
export const publicApi = {
  projects: (p: { category?: string; q?: string; page?: number; size?: number } = {}) =>
    request<PageResponse<ProjectSummary>>('/api/public/projects' + qs(p)),
  project: (id: number) => request<ProjectView>(`/api/public/projects/${id}`),
  featured: () => request<FeaturedSlotView[]>('/api/public/featured'),
  siteInfo: () => request<SiteInfoView>('/api/public/site-info'),
  slots: (date: string) =>
    request<{ date: string; availableTimes: string[]; bookableDays: number }>(
      '/api/public/slots' + qs({ date })
    ),
  submitInquiry: (body: unknown) =>
    request<{ id: number; message: string }>('/api/public/inquiries', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

// ---------- 인증 ----------
export const authApi = {
  login: (username: string, password: string) =>
    request<{ username: string; displayName: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request<{ message: string }>('/api/auth/logout', { method: 'POST' }),
  me: () => request<{ username: string; displayName: string }>('/api/auth/me'),
};

// ---------- 관리자 ----------
export const adminApi = {
  dashboard: () => request<DashboardView>('/api/admin/dashboard'),

  projects: (p: { category?: string; q?: string; page?: number; size?: number } = {}) =>
    request<PageResponse<ProjectSummary>>('/api/admin/projects' + qs(p)),
  project: (id: number) => request<ProjectView>(`/api/admin/projects/${id}`),
  createProject: (data: { title: string; category: string; description?: string }, photos: File[]) => {
    const fd = new FormData();
    fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    photos.forEach((f) => fd.append('photos', f));
    return request<ProjectView>('/api/admin/projects', { method: 'POST', body: fd });
  },
  deleteProject: (id: number) =>
    request<void>(`/api/admin/projects/${id}`, { method: 'DELETE' }),
  addPhotos: (id: number, photos: File[]) => {
    const fd = new FormData();
    photos.forEach((f) => fd.append('photos', f));
    return request<ProjectView>(`/api/admin/projects/${id}/photos`, { method: 'POST', body: fd });
  },
  deletePhoto: (photoId: number) =>
    request<ProjectView>(`/api/admin/photos/${photoId}`, { method: 'DELETE' }),
  reorderPhotos: (id: number, photoIds: number[]) =>
    request<ProjectView>(`/api/admin/projects/${id}/photos/order`, {
      method: 'PUT',
      body: JSON.stringify({ photoIds }),
    }),
  setThumbnail: (id: number, photoId: number) =>
    request<ProjectView>(`/api/admin/projects/${id}/thumbnail`, {
      method: 'PUT',
      body: JSON.stringify({ photoId }),
    }),
  setCategory: (id: number, category: string) =>
    request<ProjectView>(`/api/admin/projects/${id}/category` + qs({ category }), { method: 'PUT' }),

  featured: () => request<FeaturedSlotView[]>('/api/admin/featured'),
  saveFeatured: (projectIds: (number | null)[]) =>
    request<FeaturedSlotView[]>('/api/admin/featured', {
      method: 'PUT',
      body: JSON.stringify({ projectIds }),
    }),

  inquiries: (p: { status?: string; sort?: string; dir?: string } = {}) =>
    request<InquiryRow[]>('/api/admin/inquiries' + qs(p)),
  inquiry: (id: number) => request<InquiryDetail>(`/api/admin/inquiries/${id}`),
  confirmConsult: (id: number) =>
    request<InquiryDetail>(`/api/admin/inquiries/${id}/confirm`, { method: 'POST' }),
  releaseConsult: (id: number) =>
    request<InquiryDetail>(`/api/admin/inquiries/${id}/release`, { method: 'POST' }),
  rereserveConsult: (id: number) =>
    request<InquiryDetail>(`/api/admin/inquiries/${id}/rereserve`, { method: 'POST' }),

  slots: (date: string) =>
    request<{ date: string; slots: SlotView[]; openCount: number }>('/api/admin/slots' + qs({ date })),
  saveSlots: (date: string, closedTimes: string[]) =>
    request<{ date: string; slots: SlotView[]; openCount: number }>('/api/admin/slots' + qs({ date }), {
      method: 'PUT',
      body: JSON.stringify({ closedTimes }),
    }),

  siteInfo: () => request<SiteInfoView>('/api/admin/site-info'),
  updateSiteInfo: (body: SiteInfoView) =>
    request<SiteInfoView>('/api/admin/site-info', { method: 'PUT', body: JSON.stringify(body) }),
};
