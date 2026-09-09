'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  adminApi,
  type InquiryDetail,
  type InquiryRow,
  type InquiryStatusLabel,
} from '@/lib/api/admin';
import { theme } from '@/lib/theme';
import { consultLabel, phoneLabel, stamp } from '@/lib/format';
import { admin, card, emptyBox, h1, lead, statusBadge } from '@/components/admin/adminTheme';

type SortKey = 'consult' | 'submittedAt';
type SortDir = 'asc' | 'desc';

const COLUMNS = '1fr 1fr 2fr 0.8fr 1.2fr 1.4fr 0.9fr';
const MIN_WIDTH = 1040;

/** 대기/완료 두 섹션은 정렬 상태를 각각 따로 가진다. */
function useSection(status: InquiryStatusLabel) {
  const [rows, setRows] = useState<InquiryRow[]>([]);
  const [sort, setSort] = useState<SortKey>('submittedAt');
  const [dir, setDir] = useState<SortDir>('desc');

  const load = useCallback(async () => {
    const res = await adminApi.inquiries({ status, sort, dir });
    setRows(res);
  }, [status, sort, dir]);

  useEffect(() => {
    load().catch(() => setRows([]));
  }, [load]);

  const toggleSort = (key: SortKey) => {
    if (sort === key) setDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else {
      setSort(key);
      setDir('desc');
    }
  };

  const arrow = (key: SortKey) => (sort === key ? (dir === 'desc' ? ' ▼' : ' ▲') : '');

  return { rows, toggleSort, arrow, reload: load };
}

function InquiryTable({
  title,
  rows,
  toggleSort,
  arrow,
  emptyText,
  onOpen,
  dimmed,
}: {
  title: React.ReactNode;
  rows: InquiryRow[];
  toggleSort: (key: SortKey) => void;
  arrow: (key: SortKey) => string;
  emptyText: string;
  onOpen: (id: number) => void;
  dimmed?: boolean;
}) {
  const head: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: COLUMNS,
    gap: 12,
    padding: '14px 22px',
    borderBottom: `1px solid ${admin.cardLine}`,
    fontFamily: theme.font.mono,
    fontSize: 11,
    letterSpacing: '.12em',
    textTransform: 'uppercase',
    color: theme.color.label,
    minWidth: MIN_WIDTH,
  };

  const row: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: COLUMNS,
    gap: 12,
    padding: '16px 22px',
    borderBottom: `1px solid ${admin.rowLine}`,
    fontFamily: theme.font.sansKr,
    fontSize: 13,
    color: theme.color.inkSoft,
    alignItems: 'center',
    minWidth: MIN_WIDTH,
    cursor: 'pointer',
    opacity: dimmed ? 0.72 : 1,
  };

  const sortable: React.CSSProperties = { cursor: 'pointer', color: theme.color.ink };

  return (
    <>
      <div
        style={{
          marginBottom: 16,
          fontFamily: theme.font.sansKr,
          fontWeight: 500,
          fontSize: 15,
          color: theme.color.ink,
        }}
      >
        {title}
      </div>
      {rows.length === 0 ? (
        <div style={emptyBox}>{emptyText}</div>
      ) : (
        <div style={{ ...card, overflowX: 'auto' }}>
          <div style={head}>
            <span>이름</span>
            <span>연락처</span>
            <span>주소</span>
            <span>유형</span>
            <span onClick={() => toggleSort('consult')} style={sortable}>
              상담 희망{arrow('consult')}
            </span>
            <span onClick={() => toggleSort('submittedAt')} style={sortable}>
              문의일시{arrow('submittedAt')}
            </span>
            <span>상태</span>
          </div>
          {rows.map((q) => (
            <div key={q.id} onClick={() => onOpen(q.id)} style={row}>
              <span>
                {q.name}
                {!q.notified && (
                  <span
                    title={q.notifyError ?? '알림이 아직 발송되지 않았습니다'}
                    style={{
                      marginLeft: 6,
                      fontFamily: theme.font.sansKr,
                      fontSize: 11,
                      color: theme.color.danger,
                      border: `1px solid #e8d3cd`,
                      background: '#f7ece9',
                      padding: '1px 6px',
                    }}
                  >
                    알림 실패
                  </span>
                )}
              </span>
              <span>{phoneLabel(q.phone)}</span>
              <span style={{ color: theme.color.muted }}>{q.address}</span>
              <span>{q.spaceType}</span>
              <span style={{ color: theme.color.muted }}>
                {consultLabel(q.consultDate, q.consultTime, null)}
              </span>
              <span style={{ color: theme.color.muted }}>{stamp(q.submittedAt)}</span>
              <span style={statusBadge(q.status)}>{q.status}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Detail({
  detail,
  onBack,
  onChange,
}: {
  detail: InquiryDetail;
  onBack: () => void;
  onChange: (d: InquiryDetail) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async (fn: () => Promise<InquiryDetail>) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      onChange(await fn());
    } catch (e) {
      setError(e instanceof Error ? e.message : '처리하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const badge = (bg: string, fg: string, line: string): React.CSSProperties => ({
    fontFamily: theme.font.sansKr,
    fontSize: 12,
    background: bg,
    color: fg,
    border: `1px solid ${line}`,
    padding: '3px 11px',
  });

  const action = (primary: boolean): React.CSSProperties => ({
    cursor: busy ? 'default' : 'pointer',
    fontFamily: theme.font.sansKr,
    fontSize: 13,
    color: primary ? '#fff' : theme.color.danger,
    background: primary ? theme.color.ink : '#fff',
    border: primary ? 'none' : '1px solid #e0cfc9',
    padding: '8px 20px',
  });

  const key: React.CSSProperties = { color: theme.color.label };
  const released = !detail.reserved;

  return (
    <>
      <span
        onClick={onBack}
        style={{
          display: 'inline-block',
          cursor: 'pointer',
          fontFamily: theme.font.sansKr,
          fontSize: 13,
          color: theme.color.muted,
          marginBottom: 20,
        }}
      >
        ← 목록으로
      </span>

      <div style={{ ...card, padding: 34, maxWidth: 640 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 26,
          }}
        >
          <div style={{ fontFamily: theme.font.display, fontWeight: 600, fontSize: 26 }}>
            {detail.name}
          </div>
          <span
            onClick={() =>
              run(() =>
                adminApi.setInquiryStatus(detail.id, detail.status === '완료' ? '대기' : '완료')
              )
            }
            style={statusBadge(detail.status, true)}
            title="클릭하면 대기 · 완료를 전환합니다"
          >
            {detail.status}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '130px 1fr',
            gap: '14px 20px',
            fontFamily: theme.font.sansKr,
            fontSize: 14,
            color: theme.color.inkSoft,
          }}
        >
          <div style={key}>문의 일시</div>
          <div>{stamp(detail.submittedAt)}</div>

          <div style={key}>연락처</div>
          <div>{phoneLabel(detail.phone)}</div>

          <div style={key}>시공 장소</div>
          <div>{[detail.address, detail.addressDetail].filter(Boolean).join(' ')}</div>

          <div style={key}>공간 유형</div>
          <div>{detail.spaceType}</div>

          <div style={key}>공간 크기</div>
          <div>{detail.size ? `${detail.size}${detail.sizeUnit ?? ''}` : '-'}</div>

          <div style={key}>공사 희망일자</div>
          <div>{detail.workDate ?? '-'}</div>

          <div style={key}>상담 희망일시</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span>
                {consultLabel(detail.consultDate, detail.consultTime, detail.consultEndTime)}
              </span>
              {detail.reserved && !detail.confirmed && (
                <span
                  style={badge(
                    theme.color.reservedBg,
                    theme.color.reservedFg,
                    theme.color.reservedLine
                  )}
                >
                  예약됨 · 슬롯 마감
                </span>
              )}
              {detail.reserved && detail.confirmed && (
                <span style={badge(theme.color.doneBg, theme.color.doneFg, theme.color.doneLine)}>
                  확정됨
                </span>
              )}
              {released && (
                <span
                  onClick={() => run(() => adminApi.rereserveConsult(detail.id))}
                  style={{
                    ...badge('#f7ece9', theme.color.danger, '#e8d3cd'),
                    cursor: busy ? 'default' : 'pointer',
                  }}
                  title="클릭하면 다시 예약 확정합니다"
                >
                  예약 해제됨
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              {detail.reserved && !detail.confirmed && (
                <span onClick={() => run(() => adminApi.confirmConsult(detail.id))} style={action(true)}>
                  상담일자 확정
                </span>
              )}
              {detail.reserved && (
                <span onClick={() => run(() => adminApi.releaseConsult(detail.id))} style={action(false)}>
                  상담예약 해제
                </span>
              )}
              {released && (
                <span style={{ fontFamily: theme.font.sansKr, fontSize: 12, color: theme.color.label }}>
                  ‘예약 해제됨’을 다시 클릭하면 예약이 확정됩니다.
                </span>
              )}
            </div>
            {error && (
              <div
                style={{
                  marginTop: 10,
                  fontFamily: theme.font.sansKr,
                  fontSize: 13,
                  color: theme.color.danger,
                }}
              >
                {error}
              </div>
            )}
          </div>

          <div style={key}>비고</div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{detail.note || '-'}</div>

          <div style={key}>알림 메일</div>
          <div>
            {detail.notified ? (
              <span style={{ color: theme.color.doneFg }}>
                발송 완료 · {detail.notifiedAt ? stamp(detail.notifiedAt) : ''}
              </span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ color: theme.color.danger }}>
                  미발송 {detail.notifyTries > 0 && `(${detail.notifyTries}회 시도)`}
                </span>
                {detail.notifyError && (
                  <span
                    style={{ fontSize: 12, color: theme.color.muted, wordBreak: 'break-all' }}
                  >
                    {detail.notifyError}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function InquiriesInner() {
  const router = useRouter();
  const params = useSearchParams();
  const selectedId = params.get('id');

  const pending = useSection('대기');
  const done = useSection('완료');
  const [detail, setDetail] = useState<InquiryDetail | null>(null);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    adminApi
      .inquiry(Number(selectedId))
      .then(setDetail)
      .catch(() => setDetail(null));
  }, [selectedId]);

  const open = (id: number) => router.push(`/admin/inquiries?id=${id}`);

  const back = () => {
    router.push('/admin/inquiries');
    pending.reload();
    done.reload();
  };

  return (
    <div>
      <h1 style={h1}>문의 관리</h1>
      <p style={lead}>접수된 견적/상담 문의 목록입니다.</p>

      {detail ? (
        <Detail detail={detail} onBack={back} onChange={setDetail} />
      ) : (
        <>
          <div style={{ marginBottom: 44 }}>
            <InquiryTable
              title={
                <>
                  처리 전 · 대기 <span style={{ color: theme.color.label }}>({pending.rows.length})</span>
                </>
              }
              rows={pending.rows}
              toggleSort={pending.toggleSort}
              arrow={pending.arrow}
              emptyText="대기 중인 문의가 없습니다."
              onOpen={open}
            />
          </div>
          <InquiryTable
            title={
              <>
                완료 처리 <span style={{ color: theme.color.label }}>({done.rows.length})</span>
              </>
            }
            rows={done.rows}
            toggleSort={done.toggleSort}
            arrow={done.arrow}
            emptyText="완료 처리된 문의가 없습니다."
            onOpen={open}
            dimmed
          />
        </>
      )}
    </div>
  );
}

export default function InquiriesPage() {
  return (
    <Suspense fallback={null}>
      <InquiriesInner />
    </Suspense>
  );
}
