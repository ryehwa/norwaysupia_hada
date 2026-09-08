/** 화면 표시용 포맷 유틸 */

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** "2026-09-10" → "9/10" */
export function shortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function weekday(iso: string): string {
  return WEEKDAYS[new Date(iso + 'T00:00:00').getDay()];
}

/** "14:00" → "오후 2:00" */
export function ampm(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const label = h < 12 ? '오전' : '오후';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${label} ${hour}:${String(m).padStart(2, '0')}`;
}

/** 상담 희망일시 한 줄 표기 — "9/10 오후 2:00 ~ 3:00" */
export function consultLabel(date: string | null, start: string | null, end: string | null): string {
  if (!date || !start) return '-';
  const head = `${shortDate(date)} ${ampm(start)}`;
  if (!end) return head;
  const [h, m] = end.split(':').map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${head} ~ ${hour}:${String(m).padStart(2, '0')}`;
}

/** ISO instant → "2026-09-08 14:22" */
export function stamp(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 010-1234-5678 형태로 */
export function phoneLabel(digits: string): string {
  const d = digits.replace(/[^0-9]/g, '');
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
  return d;
}

/** 오늘부터 n일치 날짜 (ISO) */
export function upcomingDates(days: number): string[] {
  const out: string[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < days; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const p = (n: number) => String(n).padStart(2, '0');
    out.push(`${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`);
  }
  return out;
}
