'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/admin';
import { theme } from '@/lib/theme';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { admin } from '@/components/admin/adminTheme';

/** 세션을 먼저 확인하고, 없으면 로그인 화면으로 보낸다. */
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    authApi
      .me()
      .then(() => setChecked(true))
      .catch(() => router.replace('/admin/login'));
  }, [router]);

  if (!checked) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: theme.color.canvas,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: theme.font.sansKr,
          fontSize: 14,
          color: theme.color.label,
        }}
      >
        불러오는 중…
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `${admin.sidebarWidth}px 1fr`,
        minHeight: '100vh',
        background: theme.color.canvas,
        color: theme.color.ink,
      }}
    >
      <AdminSidebar />
      <main
        style={{
          padding: '44px clamp(24px,4vw,56px)',
          maxWidth: admin.contentMaxWidth,
          width: '100%',
        }}
      >
        {children}
      </main>
    </div>
  );
}
