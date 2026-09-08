import type { Metadata } from 'next';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import FloatingContact from '@/components/FloatingContact';
import { fontLink } from '@/lib/theme';

export const metadata: Metadata = {
  title: '노르웨이수피아 · 하다건설',
  description:
    '설계·시공부터 인테리어까지, 하나의 팀이 완성합니다. 주거·상업 공간 시공 및 인테리어 전문.',
  openGraph: {
    title: '노르웨이수피아 · 하다건설',
    description: '설계·시공부터 인테리어까지, 하나의 팀이 완성합니다.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontLink} rel="stylesheet" />
      </head>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <FloatingContact />
      </body>
    </html>
  );
}
