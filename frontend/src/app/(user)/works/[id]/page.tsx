import Link from 'next/link';
import { notFound } from 'next/navigation';
import { publicApi } from '@/lib/api/public';
import { theme } from '@/lib/theme';

export const revalidate = 60;

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  let project;
  try {
    project = await publicApi.project(id);
  } catch {
    notFound();
  }

  return (
    <div
      style={{
        maxWidth: theme.maxWidth,
        margin: '0 auto',
        padding: 'clamp(56px,9vw,88px) 24px clamp(72px,10vw,120px)',
      }}
    >
      <Link
        href="/works"
        style={{
          display: 'inline-block',
          fontFamily: theme.font.sansKr,
          fontSize: 13,
          color: theme.color.muted,
          marginBottom: 28,
        }}
      >
        ← 시공 사례
      </Link>

      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div
          style={{
            fontFamily: theme.font.mono,
            fontSize: 11,
            letterSpacing: '.2em',
            color: theme.color.label,
            marginBottom: 14,
          }}
        >
          {project.category}
        </div>
        <h1
          style={{
            fontFamily: theme.font.serifKr,
            fontWeight: 400,
            fontSize: 'clamp(26px,4.5vw,38px)',
            color: theme.color.ink,
            margin: 0,
          }}
        >
          {project.title}
        </h1>
        {project.description && (
          <p
            style={{
              fontFamily: theme.font.sansKr,
              fontWeight: 300,
              fontSize: 15,
              lineHeight: 1.9,
              color: theme.color.body,
              maxWidth: 640,
              margin: '20px auto 0',
              textWrap: 'pretty',
            }}
          >
            {project.description}
          </p>
        )}
      </div>

      {project.photos.length === 0 ? (
        <div
          style={{
            height: 320,
            background: theme.color.placeholder,
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
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {project.photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.id}
              src={photo.url}
              alt={project.title}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 72 }}>
        <Link
          href="/contact"
          style={{
            display: 'inline-block',
            fontFamily: theme.font.sansKr,
            fontSize: 15,
            color: '#fff',
            background: theme.color.ink,
            padding: '15px 40px',
          }}
        >
          비슷한 공간 문의하기
        </Link>
      </div>
    </div>
  );
}
