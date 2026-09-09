'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/admin';
import { theme } from '@/lib/theme';
import { admin } from './adminTheme';

const NAV = [
  { href: '/admin', label: '대시보드' },
  { href: '/admin/works', label: '시공 사례' },
  { href: '/admin/inquiries', label: '문의 관리' },
  { href: '/admin/slots', label: '시간대 관리' },
  { href: '/admin/site-info', label: '사이트 정보' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const itemStyle = (active: boolean): React.CSSProperties => ({
    display: 'block',
    padding: '13px 28px',
    cursor: 'pointer',
    fontFamily: theme.font.sansKr,
    fontSize: 14,
    textDecoration: 'none',
    color: active ? '#fff' : admin.sidebarFg,
    background: active ? admin.sidebarActiveBg : 'transparent',
    borderLeft: `2px solid ${active ? '#fff' : 'transparent'}`,
  });

  const footLink: React.CSSProperties = {
    fontFamily: theme.font.sansKr,
    fontSize: 13,
    color: admin.sidebarFg,
    textDecoration: 'none',
    cursor: 'pointer',
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      router.replace('/admin/login');
    }
  };

  return (
    <aside
      style={{
        background: admin.sidebarBg,
        color: '#cfcabf',
        padding: '30px 0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '0 28px 28px', borderBottom: `1px solid ${admin.sidebarLine}` }}>
        <div
          style={{
            fontFamily: theme.font.display,
            fontWeight: 600,
            fontSize: 22,
            color: '#fff',
            letterSpacing: '.03em',
          }}
        >
          HADA × SUPIA
        </div>
        <div
          style={{
            fontFamily: theme.font.mono,
            fontSize: 10,
            letterSpacing: '.28em',
            textTransform: 'uppercase',
            color: admin.sidebarMuted,
            marginTop: 4,
          }}
        >
          Admin Console
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', padding: '18px 0', flex: 1 }}>
        {NAV.map((n) => (
          // 대시보드(/admin)만 정확히 일치할 때 활성 — 하위 경로에 물리지 않게
          <Link
            key={n.href}
            href={n.href}
            style={itemStyle(n.href === '/admin' ? pathname === n.href : pathname.startsWith(n.href))}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <div
        style={{
          padding: '18px 28px 0',
          borderTop: `1px solid ${admin.sidebarLine}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <Link href="/" style={footLink}>
          ← 사이트 보기
        </Link>
        <span onClick={logout} style={footLink}>
          로그아웃
        </span>
      </div>
    </aside>
  );
}
