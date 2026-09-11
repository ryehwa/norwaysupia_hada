import Link from 'next/link';
import { theme } from '@/lib/theme';
import type { ProjectSummary } from '@/lib/api/public';

/** 시공사례 카드 — 썸네일이 없으면 IMAGE 플레이스홀더 */
export default function ProjectCard({
  project,
  height = 290,
  showCategory = true,
}: {
  project: ProjectSummary;
  height?: number;
  showCategory?: boolean;
}) {
  return (
    <Link href={`/works/${project.id}`} style={{ display: 'block' }}>
      <div
        className="project-card-media"
        style={{ position: 'relative', height, background: theme.color.placeholder, overflow: 'hidden' }}
      >
        {project.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: theme.font.mono,
              fontSize: 'clamp(9px,2.8vw,11px)',
              letterSpacing: '.28em',
              color: '#b6b2a8',
            }}
          >
            IMAGE
          </span>
        )}
      </div>

      <div
        className="project-card-caption"
        style={{
          display: 'flex',
          alignItems: 'center',
          // 카테고리 배지가 없으면 제목 하나뿐이므로 사진 기준 가운데로
          justifyContent: showCategory ? 'space-between' : 'center',
          marginTop: 16,
          gap: 12,
        }}
      >
        <div
          className="project-card-title"
          style={{
            fontFamily: theme.font.serifKr,
            fontSize: 'clamp(14px,4vw,17px)',
            color: theme.color.ink,
            textAlign: showCategory ? 'left' : 'center',
          }}
        >
          {project.title}
        </div>
        {showCategory && (
          <div
            style={{
              fontFamily: theme.font.mono,
              fontSize: 'clamp(9px,2.6vw,10px)',
              letterSpacing: '.14em',
              color: theme.color.faint,
              border: '1px solid #ddd8ce',
              padding: '3px 9px',
              flex: 'none',
            }}
          >
            {project.category}
          </div>
        )}
      </div>
    </Link>
  );
}
