import Link from 'next/link';
import { theme } from '@/lib/theme';
import type { ProjectSummary } from '@/lib/api';

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
      <div style={{ position: 'relative', height, background: theme.color.placeholder, overflow: 'hidden' }}>
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
              fontSize: 11,
              letterSpacing: '.28em',
              color: '#b6b2a8',
            }}
          >
            IMAGE
          </span>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 16,
          gap: 12,
        }}
      >
        <div style={{ fontFamily: theme.font.serifKr, fontSize: 17, color: theme.color.ink }}>
          {project.title}
        </div>
        {showCategory && (
          <div
            style={{
              fontFamily: theme.font.mono,
              fontSize: 10,
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
