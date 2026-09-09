/** 유저 사이트가 쓰는 API — 공개 조회와 로그인. */

import { request, qs } from './client';
import type {
  FeaturedSlotView, PageResponse, ProjectSummary, ProjectView, SiteInfoView,
} from './types';

export { ApiError } from './client';
export type * from './types';

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
