/** 관리자 콘솔 시안(관리자.dc.html)에서 확정된 값. 유저 사이트 토큰 위에 콘솔 전용 값만 얹는다. */
import { theme } from '@/lib/theme';

export const admin = {
  sidebarWidth: 248,
  contentMaxWidth: 1100,
  sidebarBg: theme.color.ink,
  sidebarActiveBg: '#26241e',
  sidebarFg: '#a9a396',
  sidebarMuted: '#7f7a6e',
  sidebarLine: '#2e2c25',
  cardLine: '#e6e2d9',
  rowLine: '#f0ede6',
  disabled: '#cbc5b9',
  dropzoneBg: '#faf8f4',
  dropzoneLine: '#c8c2b6',
} as const;

export const ACCEPT_IMAGES =
  '.jpg,.jpeg,.png,.webp,.gif,.heic,.heif,image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif';

export const IMAGE_HINT = '지원 형식: JPG · PNG · WEBP · GIF · HEIC (장당 최대 10MB)';

/** 페이지 제목 — 콘솔 각 화면 상단 공통 */
export const h1: React.CSSProperties = {
  fontFamily: theme.font.display,
  fontWeight: 600,
  fontSize: 34,
  margin: '0 0 4px',
};

export const lead: React.CSSProperties = {
  fontFamily: theme.font.sansKr,
  fontWeight: 300,
  fontSize: 14,
  color: theme.color.muted,
  margin: '0 0 36px',
};

export const h2: React.CSSProperties = {
  fontFamily: theme.font.sansKr,
  fontWeight: 500,
  fontSize: 16,
  margin: 0,
};

export const card: React.CSSProperties = {
  background: theme.color.surface,
  border: `1px solid ${admin.cardLine}`,
};

export const input: React.CSSProperties = {
  border: `1px solid ${theme.color.lineStrong}`,
  background: '#fff',
  padding: '13px 15px',
  fontSize: 14,
  color: theme.color.ink,
  fontFamily: theme.font.sansKr,
};

export const label: React.CSSProperties = {
  display: 'block',
  fontFamily: theme.font.mono,
  fontSize: 11,
  letterSpacing: '.16em',
  textTransform: 'uppercase',
  color: theme.color.label,
  marginBottom: 8,
};

/** 채워진 검정 버튼. 비활성이면 회색으로 죽인다. */
export const solidButton = (enabled = true): React.CSSProperties => ({
  display: 'inline-block',
  fontFamily: theme.font.sansKr,
  fontSize: 14,
  color: '#fff',
  background: enabled ? theme.color.ink : admin.disabled,
  padding: '13px 34px',
  border: 'none',
  cursor: enabled ? 'pointer' : 'default',
});

/** 카테고리·필터 칩 */
export const chip = (active: boolean): React.CSSProperties => ({
  padding: '9px 20px',
  cursor: 'pointer',
  fontFamily: theme.font.sansKr,
  fontSize: 13,
  background: active ? theme.color.ink : '#fff',
  color: active ? '#fff' : theme.color.inkSoft,
  border: `1px solid ${active ? theme.color.ink : theme.color.lineStrong}`,
});

/** 대기/완료 배지. wide 는 상세 화면용(좌우 패딩 40px). */
export const statusBadge = (status: string, wide = false): React.CSSProperties => ({
  cursor: 'pointer',
  fontFamily: theme.font.sansKr,
  fontSize: wide ? 13 : 12,
  textAlign: 'center',
  padding: wide ? '7px 40px' : '4px 0',
  background: status === '완료' ? theme.color.doneBg : theme.color.pendingBg,
  color: status === '완료' ? theme.color.doneFg : theme.color.pendingFg,
  border: `1px solid ${status === '완료' ? theme.color.doneLine : theme.color.pendingLine}`,
});

/** 사진 없는 카드 자리표시 */
export const noImage: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: theme.font.mono,
  fontSize: 11,
  letterSpacing: '.2em',
  color: '#b6b2a8',
};

/** 배경 이미지 채우기 — 썸네일 자리 공통 */
export const cover = (url: string | null): React.CSSProperties => ({
  position: 'absolute',
  inset: 0,
  background: url
    ? `${theme.color.placeholder} url("${url}") center/cover no-repeat`
    : theme.color.placeholder,
});

export const emptyBox: React.CSSProperties = {
  ...card,
  fontFamily: theme.font.sansKr,
  fontSize: 14,
  color: theme.color.label,
  textAlign: 'center',
  padding: '36px 0',
};
