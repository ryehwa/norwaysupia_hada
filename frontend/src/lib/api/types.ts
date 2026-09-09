/** 백엔드 DTO 와 1:1로 맞춘 타입. 유저·관리자 양쪽에서 함께 쓴다. */

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
  notified: boolean;
  notifyError: string | null;
}

export interface InquiryDetail extends InquiryRow {
  addressDetail: string | null;
  size: string | null;
  sizeUnit: string | null;
  workDate: string | null;
  consultEndTime: string | null;
  note: string | null;
  notifiedAt: string | null;
  notifyTries: number;
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
  unnotifiedCount: number;
  recentInquiries: InquiryRow[];
}
