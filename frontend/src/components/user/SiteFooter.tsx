'use client';

import { usePathname } from 'next/navigation';
import { theme } from '@/lib/theme';

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer
      style={{
        background: theme.color.surfaceAlt,
        borderTop: `1px solid ${theme.color.line}`,
        padding: '56px 40px',
      }}
    >
      <div
        style={{
          maxWidth: theme.maxWidth,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/hada2.png"
            alt="하다건설"
            style={{ height: 38, width: 'auto', objectFit: 'contain', opacity: 0.9 }}
          />
          <div style={{ width: 1, height: 24, background: '#d5d0c7', margin: '0 20px' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/supia2.png"
            alt="노르웨이수피아"
            style={{ height: 22, width: 'auto', objectFit: 'contain', opacity: 0.9 }}
          />
        </div>

        <div
          style={{
            textAlign: 'right',
            fontFamily: theme.font.sansKr,
            fontWeight: 300,
            fontSize: 12,
            lineHeight: 1.8,
            color: '#8f8a80',
          }}
        >
          하다건설 · 노르웨이수피아 인테리어
          <br />
          서울시 동작구 사당로 16가길 106, 1층 &nbsp;|&nbsp; 02-6052-0479
          <br />© 2026 HADA × NORWEGIAN SUPIA. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
