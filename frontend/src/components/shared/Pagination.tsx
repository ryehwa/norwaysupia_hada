'use client';

import { theme } from '@/lib/theme';

/**
 * 페이지가 많아지면 현재 페이지 주변 5개만 보여주고 앞뒤는 … 으로 접는다.
 */
export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number; // 0-based
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const WINDOW = 5;
  let start = Math.max(0, page - Math.floor(WINDOW / 2));
  const end = Math.min(totalPages, start + WINDOW);
  start = Math.max(0, end - WINDOW);

  const numbers: number[] = [];
  for (let i = start; i < end; i++) numbers.push(i);

  const cell = (active: boolean): React.CSSProperties => ({
    minWidth: 36,
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: theme.font.mono,
    fontSize: 13,
    border: `1px solid ${active ? theme.color.ink : '#e0dbd2'}`,
    background: active ? theme.color.ink : 'transparent',
    color: active ? '#fff' : theme.color.inkSoft,
    cursor: 'pointer',
  });

  const arrow = (disabled: boolean): React.CSSProperties => ({
    ...cell(false),
    color: disabled ? '#c2bcb0' : theme.color.inkSoft,
    cursor: disabled ? 'default' : 'pointer',
  });

  const dots = (
    <span
      style={{
        minWidth: 24,
        textAlign: 'center',
        fontFamily: theme.font.mono,
        fontSize: 13,
        color: theme.color.label,
      }}
    >
      …
    </span>
  );

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 60,
        flexWrap: 'wrap',
      }}
    >
      <button style={arrow(page === 0)} onClick={() => page > 0 && onChange(page - 1)} aria-label="이전">
        ‹
      </button>

      {start > 0 && (
        <>
          <button style={cell(false)} onClick={() => onChange(0)}>
            1
          </button>
          {start > 1 && dots}
        </>
      )}

      {numbers.map((n) => (
        <button key={n} style={cell(n === page)} onClick={() => onChange(n)}>
          {n + 1}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && dots}
          <button style={cell(false)} onClick={() => onChange(totalPages - 1)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        style={arrow(page >= totalPages - 1)}
        onClick={() => page < totalPages - 1 && onChange(page + 1)}
        aria-label="다음"
      >
        ›
      </button>
    </div>
  );
}
