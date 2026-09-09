'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, type DashboardView } from '@/lib/api/admin';
import { theme } from '@/lib/theme';
import { consultLabel } from '@/lib/format';
import { admin, card, h1, h2, lead } from '@/components/admin/adminTheme';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardView | null>(null);

  useEffect(() => {
    adminApi.dashboard().then(setData).catch(() => setData(null));
  }, []);

  const stat = (title: string, value: number | undefined) => (
    <div key={title} style={{ ...card, padding: 28 }}>
      <div
        style={{
          fontFamily: theme.font.mono,
          fontSize: 11,
          letterSpacing: '.2em',
          textTransform: 'uppercase',
          color: theme.color.label,
        }}
      >
        {title}
      </div>
      <div style={{ fontFamily: theme.font.display, fontWeight: 600, fontSize: 40, marginTop: 8 }}>
        {value ?? '–'}
      </div>
    </div>
  );

  return (
    <div>
      <h1 style={h1}>대시보드</h1>
      <p style={lead}>오늘의 현황을 한눈에 확인하세요.</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
          gap: 18,
          marginBottom: 44,
        }}
      >
        {stat('시공 사례', data?.projectCount)}
        {stat('신규 문의', data?.pendingCount)}
        {stat('전체 문의', data?.totalInquiryCount)}
        {/* 알림이 못 나간 건이 있을 때만 드러낸다 */}
        {!!data?.unnotifiedCount && (
          <div style={{ ...card, padding: 28, borderColor: theme.color.danger }}>
            <div
              style={{
                fontFamily: theme.font.mono,
                fontSize: 11,
                letterSpacing: '.2em',
                textTransform: 'uppercase',
                color: theme.color.danger,
              }}
            >
              알림 미발송
            </div>
            <div
              style={{
                fontFamily: theme.font.display,
                fontWeight: 600,
                fontSize: 40,
                marginTop: 8,
                color: theme.color.danger,
              }}
            >
              {data.unnotifiedCount}
            </div>
          </div>
        )}
      </div>

      <h2 style={{ ...h2, marginBottom: 16 }}>최근 문의</h2>
      <div style={card}>
        {data && data.recentInquiries.length === 0 && (
          <div
            style={{
              fontFamily: theme.font.sansKr,
              fontSize: 14,
              color: theme.color.label,
              textAlign: 'center',
              padding: '36px 0',
            }}
          >
            아직 접수된 문의가 없습니다.
          </div>
        )}
        {data?.recentInquiries.map((q) => (
          <div
            key={q.id}
            onClick={() => router.push(`/admin/inquiries?id=${q.id}`)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 22px',
              borderBottom: `1px solid ${admin.rowLine}`,
              cursor: 'pointer',
            }}
          >
            <div>
              <span style={{ fontFamily: theme.font.sansKr, fontSize: 14, color: theme.color.ink }}>
                {q.name}
              </span>
              <span
                style={{
                  fontFamily: theme.font.sansKr,
                  fontSize: 13,
                  color: theme.color.faint,
                  marginLeft: 12,
                }}
              >
                {q.spaceType}
              </span>
            </div>
            <div style={{ fontFamily: theme.font.mono, fontSize: 12, color: theme.color.label }}>
              {consultLabel(q.consultDate, q.consultTime, null)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
