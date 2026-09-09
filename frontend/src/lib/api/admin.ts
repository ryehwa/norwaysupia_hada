/** 관리자 콘솔 전용 API. 모두 세션 인증이 필요하다. */

import { request, qs } from './client';
import type {
  DashboardView, FeaturedSlotView, InquiryDetail, InquiryRow, InquiryStatusLabel,
  PageResponse, ProjectSummary, ProjectView, SiteInfoView, SlotView,
} from './types';

export { ApiError } from './client';
export type * from './types';

/** 로그인 · 로그아웃 · 세션 확인 — 콘솔 진입에만 쓰인다. */
export const authApi = {
  login: (username: string, password: string) =>
    request<{ username: string; displayName: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request<{ message: string }>('/api/auth/logout', { method: 'POST' }),
  me: () => request<{ username: string; displayName: string }>('/api/auth/me'),
};

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
  setInquiryStatus: (id: number, status: InquiryStatusLabel) =>
    request<InquiryDetail>(`/api/admin/inquiries/${id}/status` + qs({ status }), {
      method: 'PATCH',
    }),

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
