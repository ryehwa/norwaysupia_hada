import { theme } from '@/lib/theme';

/** 서브 페이지 공통 제목 — 영문 라벨 + 국문 제목 */
export default function PageHeading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 52 }}>
      <div
        style={{
          fontFamily: theme.font.mono,
          fontSize: 12,
          letterSpacing: '.3em',
          textTransform: 'uppercase',
          color: theme.color.label,
          marginBottom: 14,
        }}
      >
        {label}
      </div>
      <h1
        style={{
          fontFamily: theme.font.display,
          fontWeight: 500,
          fontSize: 'clamp(30px,5.5vw,44px)',
          color: theme.color.ink,
          margin: description ? '0 0 14px' : 0,
        }}
      >
        {title}
      </h1>
      {description && (
        <p
          style={{
            fontFamily: theme.font.sansKr,
            fontWeight: 300,
            fontSize: 15,
            color: theme.color.body,
            margin: 0,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
