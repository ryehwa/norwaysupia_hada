'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { theme } from '@/lib/theme';

const NAV = [
  { href: '/', label: 'HOME', mono: true },
  { href: '/works', label: '시공사례', mono: false },
  { href: '/location', label: '오시는 길', mono: false },
  { href: '/contact', label: '문의', mono: false },
];

export default function SiteHeader() {
  const pathname = usePathname();

  // 관리자 콘솔은 자체 레이아웃을 쓴다
  if (pathname.startsWith('/admin')) return null;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,.94)',
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${theme.color.line}`,
      }}
    >
      <div
        className="site-header-bar"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px 28px',
          padding: 'clamp(12px,2.6vw,20px) clamp(16px,4vw,44px)',
        }}
      >
        <Link href="/" className="site-header-logo" style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/combined_trim.png"
            alt="노르웨이수피아 · 하다건설"
            style={{ height: 'clamp(46px,7vw,62px)', width: 'auto', objectFit: 'contain' }}
          />
        </Link>

        <nav
          className="site-header-nav"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            letterSpacing: '.02em',
          }}
        >
          {NAV.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  position: 'relative',
                  paddingBottom: 6,
                  lineHeight: 1,
                  color: theme.color.inkSoft,
                  fontFamily: item.mono ? theme.font.mono : theme.font.sansKr,
                  letterSpacing: item.mono ? '.12em' : undefined,
                }}
              >
                {item.label}
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 1,
                      background: theme.color.ink,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
