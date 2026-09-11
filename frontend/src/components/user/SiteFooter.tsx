'use client';

import { usePathname } from 'next/navigation';
import { theme } from '@/lib/theme';

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer
      className="site-footer"
      style={{
        background: theme.color.surfaceAlt,
        borderTop: `1px solid ${theme.color.line}`,
      }}
    >
      <div
        className="site-footer-inner"
        style={{ maxWidth: theme.maxWidth, margin: '0 auto', display: 'flex', alignItems: 'center' }}
      >
        <div className="site-footer-logos" style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/hada2.png"
            alt="하다건설"
            className="site-footer-logo-hada"
            style={{ width: 'auto', objectFit: 'contain', opacity: 0.9 }}
          />
          <div className="site-footer-divider" style={{ width: 1, background: '#d5d0c7' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/supia2.png"
            alt="노르웨이수피아"
            className="site-footer-logo-supia"
            style={{ width: 'auto', objectFit: 'contain', opacity: 0.9 }}
          />
        </div>

        <div
          className="site-footer-text"
          style={{ fontFamily: theme.font.sansKr, fontWeight: 300, lineHeight: 1.8, color: '#8f8a80' }}
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
