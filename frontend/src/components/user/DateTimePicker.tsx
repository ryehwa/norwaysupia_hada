'use client';

import { useEffect, useMemo, useState } from 'react';
import { publicApi } from '@/lib/api/public';
import { theme } from '@/lib/theme';
import { ampm } from '@/lib/format';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const iso = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/**
 * 날짜 + (선택) 시간 선택 팝업.
 * withTime=true 이면 상담 예약용으로, 관리자가 열어둔 시간만 서버에서 받아 표시한다.
 */
export default function DateTimePicker({
  title,
  withTime,
  onSelect,
  onClose,
}: {
  title: string;
  withTime: boolean;
  onSelect: (date: string, time?: string) => void;
  onClose: () => void;
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [times, setTimes] = useState<string[] | null>(null);
  const [loadingTimes, setLoadingTimes] = useState(false);

  useEffect(() => {
    if (!withTime || !selectedDate) return;
    setLoadingTimes(true);
    publicApi
      .slots(selectedDate)
      .then((res) => setTimes(res.availableTimes))
      .catch(() => setTimes([]))
      .finally(() => setLoadingTimes(false));
  }, [withTime, selectedDate]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const dayStyle = (day: number | null): React.CSSProperties => {
    if (day === null) return { visibility: 'hidden' };
    const date = new Date(year, month, day);
    const key = iso(date);
    const past = date < today;
    const active = selectedDate === key;
    return {
      height: 38,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: theme.font.mono,
      fontSize: 13,
      cursor: past ? 'default' : 'pointer',
      background: active ? theme.color.ink : 'transparent',
      color: active ? '#fff' : past ? '#cbc5b9' : theme.color.inkSoft,
    };
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,18,14,.5)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          width: '100%',
          maxWidth: 430,
          maxHeight: '88vh',
          overflow: 'auto',
          padding: '30px 28px',
        }}
      >
        <div
          style={{
            fontFamily: theme.font.sansKr,
            fontWeight: 500,
            fontSize: 18,
            color: theme.color.ink,
            marginBottom: 24,
          }}
        >
          {title}
        </div>

        {/* 월 이동 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 34,
            marginBottom: 16,
          }}
        >
          <span
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            style={{ cursor: 'pointer', fontSize: 20, color: theme.color.faint }}
          >
            ‹
          </span>
          <span
            style={{
              fontFamily: theme.font.mono,
              fontSize: 17,
              fontWeight: 600,
              color: theme.color.ink,
            }}
          >
            {year}. {String(month + 1).padStart(2, '0')}
          </span>
          <span
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            style={{ cursor: 'pointer', fontSize: 20, color: theme.color.faint }}
          >
            ›
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7,1fr)',
            gap: 2,
            marginBottom: 6,
          }}
        >
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              style={{
                textAlign: 'center',
                fontFamily: theme.font.sansKr,
                fontSize: 11,
                color: theme.color.label,
                padding: '4px 0',
              }}
            >
              {w}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
          {cells.map((day, i) => (
            <div
              key={i}
              style={dayStyle(day)}
              onClick={() => {
                if (day === null) return;
                const date = new Date(year, month, day);
                if (date < today) return;
                const key = iso(date);
                setSelectedDate(key);
                setTimes(null);
                if (!withTime) {
                  onSelect(key);
                  onClose();
                }
              }}
            >
              {day ?? ''}
            </div>
          ))}
        </div>

        {/* 시간 선택 — 관리자가 열어둔 시간만 */}
        {withTime && selectedDate && (
          <div style={{ marginTop: 26 }}>
            <div
              style={{
                fontFamily: theme.font.sansKr,
                fontSize: 13,
                color: theme.color.faint,
                marginBottom: 12,
              }}
            >
              상담 시간 (1회 상담은 1시간 진행됩니다)
            </div>

            {loadingTimes ? (
              <div style={{ fontFamily: theme.font.sansKr, fontSize: 13, color: theme.color.label }}>
                예약 가능한 시간을 확인하고 있습니다…
              </div>
            ) : times && times.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(84px,1fr))',
                  gap: 8,
                }}
              >
                {times.map((t) => (
                  <div
                    key={t}
                    onClick={() => {
                      onSelect(selectedDate, t);
                      onClose();
                    }}
                    style={{
                      padding: '10px 0',
                      textAlign: 'center',
                      fontFamily: theme.font.mono,
                      fontSize: 12,
                      cursor: 'pointer',
                      border: `1px solid ${theme.color.lineStrong}`,
                      background: '#fff',
                      color: theme.color.inkSoft,
                    }}
                  >
                    {ampm(t)}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontFamily: theme.font.sansKr, fontSize: 13, color: theme.color.label }}>
                이 날짜에는 예약 가능한 시간이 없습니다. 다른 날짜를 선택해 주세요.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
