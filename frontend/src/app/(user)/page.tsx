import Link from 'next/link';
import { publicApi, type FeaturedSlotView } from '@/lib/api/public';
import { theme } from '@/lib/theme';
import ProjectCard from '@/components/user/ProjectCard';

export const revalidate = 60;

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80';

async function loadFeatured(): Promise<FeaturedSlotView[]> {
  try {
    return await publicApi.featured();
  } catch {
    // 백엔드가 아직 안 켜져 있어도 페이지는 뜨게 한다
    return [0, 1, 2].map((slotIndex) => ({ slotIndex, project: null }));
  }
}

export default async function HomePage() {
  const featured = await loadFeatured();

  return (
    <>
      {/* ---------- 히어로 ---------- */}
      <section
        className="home-hero"
        style={{
          position: 'relative',
          background: `${theme.color.placeholder} url('${HERO_IMAGE}') center/cover no-repeat`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg,rgba(16,38,22,.2),rgba(16,38,22,.52))',
          }}
        />
        <div
          className="home-hero-inner"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            textAlign: 'center',
            color: '#fff',
          }}
        >
          <div
            className="home-hero-logos"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translateX(0.5cm)',
            }}
          >
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/supia_vec_white.png"
                alt="노르웨이수피아 인테리어"
                className="home-hero-logo"
                style={{ width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div
              className="home-hero-divider"
              style={{ width: 1, background: 'rgba(255,255,255,.5)', flex: 'none' }}
            />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/hada_white.png"
                alt="하다건설"
                className="home-hero-logo"
                style={{ width: 'auto', objectFit: 'contain' }}
              />
            </div>
          </div>

          <div
            className="home-hero-label"
            style={{
              fontFamily: theme.font.mono,
              textTransform: 'uppercase',
              opacity: 0.9,
            }}
          >
            Build &amp; Interior · One-stop
          </div>
          <h1
            className="home-hero-title"
            style={{ fontFamily: theme.font.serifKr, fontWeight: 400, lineHeight: 1.3 }}
          >
            공간을 짓고, 삶을 담다
          </h1>
          <p
            className="home-hero-desc"
            style={{ fontFamily: theme.font.sansKr, fontWeight: 300, opacity: 0.9, margin: 0 }}
          >
            설계·시공부터 인테리어까지, 하나의 팀이 완성합니다
          </p>
        </div>
      </section>

      {/* ---------- HOME 노출 사례 3칸 ---------- */}
      <section
        style={{
          maxWidth: theme.maxWidth,
          margin: '0 auto',
          padding: 'clamp(56px,10vw,104px) 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20,
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 44,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: theme.font.mono,
                fontSize: 'clamp(10px,3vw,12px)',
                letterSpacing: 'clamp(.2em,.8vw,.3em)',
                textTransform: 'uppercase',
                color: theme.color.label,
                marginBottom: 'clamp(8px,2.5vw,12px)',
              }}
            >
              Selected Works
            </div>
            <h2
              style={{
                fontFamily: theme.font.display,
                fontWeight: 500,
                fontSize: 'clamp(19px,5vw,34px)',
                color: theme.color.ink,
                margin: 0,
              }}
            >
              시공 &amp; 인테리어 사례
            </h2>
          </div>
          <Link
            href="/works"
            style={{
              fontFamily: theme.font.sansKr,
              fontSize: 'clamp(12px,3.4vw,14px)',
              color: theme.color.ink,
              borderBottom: `1px solid ${theme.color.ink}`,
              paddingBottom: 3,
            }}
          >
            전체 보기
          </Link>
        </div>

        <div className="home-featured-grid" style={{ display: 'grid' }}>
          {featured.map((slot) =>
            slot.project ? (
              <ProjectCard
                key={slot.slotIndex}
                project={slot.project}
                height={300}
                showCategory={false}
              />
            ) : (
              <div key={slot.slotIndex}>
                <div
                  className="home-featured-media"
                  style={{ position: 'relative', background: theme.color.placeholder }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: theme.font.mono,
                      fontSize: 'clamp(9px,2.8vw,11px)',
                      letterSpacing: 'clamp(.18em,.7vw,.28em)',
                      color: '#b6b2a8',
                    }}
                  >
                    IMAGE
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section
        style={{
          background: theme.color.ink,
          color: '#fff',
          textAlign: 'center',
          padding: 'clamp(56px,10vw,96px) 24px',
        }}
      >
        <h2
          style={{
            fontFamily: theme.font.serifKr,
            fontWeight: 300,
            fontSize: 'clamp(26px,4.5vw,36px)',
            lineHeight: 1.4,
            margin: '0 0 30px',
          }}
        >
          공간을 계획하고 계신가요?
        </h2>
        <Link
          href="/contact"
          style={{
            display: 'inline-block',
            fontFamily: theme.font.sansKr,
            fontSize: 15,
            color: theme.color.ink,
            background: '#fff',
            padding: '15px 40px',
            border: '1px solid #fff',
          }}
        >
          프로젝트 문의하기
        </Link>
      </section>
    </>
  );
}
