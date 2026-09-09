import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '관리자 콘솔 · 노르웨이수피아 · 하다건설',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
