'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, type SlotView } from '@/lib/api/admin';
import { theme } from '@/lib/theme';
import { shortDate, upcomingDates, weekday } from '@/lib/format';
import { card, h1, lead, solidButton } from '@/components/admin/adminTheme';

const DATES = 14;

export default function SlotsPage() {
  const [dates] = useState(() => upcomingDates(DATES));
  const [selected, setSelected] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotView[]>([]);
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async (date: string) => {
    setMessage('');
    const res = await adminApi.slots(date);
    setSlots(res.slots);
    setClosed(new Set(res.slots.filter((s) => s.state === 'closed').map((s) => s.time)));
  }, []);

  useEffect(() => {
    if (selected) load(selected).catch(() => setMessage('불러오지 못했습니다.'));
  }, [selected, load]);

  // 예약된 칸은 문의 상세에서만 풀 수 있으므로 여기서는 잠근다.
  const toggle = (s: SlotView) => {
    if (s.state === 'reserved') return;
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(s.time)) next.delete(s.time);
      else next.add(s.time);
      return next;
    });
    setMessage('');
  };

  const save = async () => {
    if (!selected || saving) return;
    setSaving(true);
    try {
      const res = await adminApi.saveSlots(selected, [...closed]);
      setSlots(res.slots);
      setClosed(new Set(res.slots.filter((s) => s.state === 'closed').map((s) => s.time)));
      setMessage('저장되었습니다.');
    } catch {
      setMessage('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const chipStyle = (active: boolean): React.CSSProperties => ({
    flex: 'none',
    textAlign: 'center',
    padding: '9px 13px',
    cursor: 'pointer',
    border: `1px solid ${active ? theme.color.ink : '#e0dbd2'}`,
    fontFamily: theme.font.sansKr,
    background: active ? theme.color.ink : '#fff',
    color: active ? '#fff' : theme.color.inkSoft,
  });

  const slotStyle = (s: SlotView): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: '11px 4px',
      textAlign: 'center',
      fontFamily: theme.font.mono,
      fontSize: 13,
      border: '1px solid #e0dbd2',
    };
    if (s.state === 'reserved')
      return {
        ...base,
        background: theme.color.reservedBg,
        color: theme.color.reservedFg,
        borderColor: theme.color.reservedLine,
        cursor: 'not-allowed',
      };
    if (closed.has(s.time))
      return { ...base, background: theme.color.canvas, color: '#c2bcb0', cursor: 'pointer' };
    return {
      ...base,
      background: theme.color.ink,
      color: '#fff',
      borderColor: theme.color.ink,
      cursor: 'pointer',
    };
  };

  const openCount = slots.filter((s) => s.state !== 'reserved' && !closed.has(s.time)).length;

  return (
    <div>
      <h1 style={h1}>상담 시간대 관리</h1>
      <p style={lead}>
        날짜를 먼저 선택한 뒤, 그 날짜에 열어둘 상담 시간대를 지정하세요. 시간대는 30분 단위로 열리며,
        예약 1건은 1시간(연속 2칸)을 차지합니다. 회색은 마감, 베이지색은 문의로 예약된 시간(문의 상세에서
        해제 시 다시 열림)입니다.
      </p>

      <div style={{ ...card, padding: 30, maxWidth: 640 }}>
        <div
          style={{
            fontFamily: theme.font.sansKr,
            fontSize: 13,
            color: theme.color.faint,
            marginBottom: 12,
          }}
        >
          날짜 선택
        </div>
        <div
          style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 26 }}
        >
          {dates.map((d) => (
            <div key={d} onClick={() => setSelected(d)} style={chipStyle(selected === d)}>
              <div style={{ fontSize: 13 }}>{shortDate(d)}</div>
              <div style={{ fontSize: 11, opacity: 0.72 }}>{weekday(d)}</div>
            </div>
          ))}
        </div>

        {!selected ? (
          <div
            style={{
              fontFamily: theme.font.sansKr,
              fontSize: 14,
              color: theme.color.label,
              padding: '16px 0',
            }}
          >
            날짜를 선택하면 해당 날짜의 시간대를 관리할 수 있습니다.
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(88px,1fr))',
                gap: 10,
              }}
            >
              {slots.map((s) => (
                <div
                  key={s.time}
                  onClick={() => toggle(s)}
                  style={slotStyle(s)}
                  title={s.reservedBy ? `${s.reservedBy} 님 예약` : undefined}
                >
                  {s.time.slice(0, 5)}
                  {s.state === 'reserved' && (
                    <div style={{ fontSize: 10, marginTop: 2 }}>예약</div>
                  )}
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ fontFamily: theme.font.sansKr, fontSize: 13, color: theme.color.faint }}>
                열린 시간대: <b style={{ color: theme.color.ink }}>{openCount}</b>개
                {message && <span style={{ marginLeft: 12 }}>{message}</span>}
              </div>
              <button onClick={save} disabled={saving} style={solidButton(!saving)}>
                {saving ? '저장 중…' : '저장'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
