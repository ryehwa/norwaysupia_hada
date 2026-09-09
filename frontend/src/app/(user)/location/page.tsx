'use client';

import { useEffect, useRef } from 'react';
import { theme } from '@/lib/theme';
import PageHeading from '@/components/user/PageHeading';

const ADDRESS = '서울특별시 동작구 사당로16가길 106';
const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
const NAVER_MAP_URL = 'https://map.naver.com/p/search/' + encodeURIComponent(ADDRESS);
const FALLBACK_LATLNG = { lat: 37.4842, lng: 126.9776 };

const INFO = [
  { label: 'Address', lines: ['서울시 동작구', '사당로 16가길 106, 1층'] },
  { label: 'Tel', lines: ['02-6052-0479'] },
  { label: 'Email', lines: ['hada2nc@gmail.com'] },
  { label: 'Hours', lines: ['매일 09:00–19:00', '일요일·공휴일 휴무', '상담은 시간 외에도 가능'] },
];

const TRANSIT = [
  { title: '지하철', body: ['7호선 남성역 2번 출구에서 도보 5분'] },
  {
    title: '버스',
    body: ['마을버스 동작 06·동작 14 — 삼거리 정류장 하차', '간선 040·742·752 — 사당중학교 정류장 하차'],
  },
  { title: '자가용', body: ['건물 앞 주차 가능 (주차 전 문의 부탁드립니다)'] },
];

export default function LocationPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!NAVER_CLIENT_ID || initialized.current) return;

    const build = () => {
      const naver = (window as any).naver;
      if (!naver?.maps || !mapRef.current) return;
      initialized.current = true;

      const draw = (lat: number, lng: number) => {
        const pos = new naver.maps.LatLng(lat, lng);
        const map = new naver.maps.Map(mapRef.current, { center: pos, zoom: 16 });
        new naver.maps.Marker({ position: pos, map });
      };

      const service = naver.maps.Service;
      if (service?.geocode) {
        service.geocode({ query: ADDRESS }, (_status: unknown, res: any) => {
          try {
            const a = res.v2.addresses[0];
            draw(parseFloat(a.y), parseFloat(a.x));
          } catch {
            draw(FALLBACK_LATLNG.lat, FALLBACK_LATLNG.lng);
          }
        });
      } else {
        draw(FALLBACK_LATLNG.lat, FALLBACK_LATLNG.lng);
      }
    };

    const existing = document.querySelector<HTMLScriptElement>('script[data-naver-map]');
    if (existing) {
      existing.addEventListener('load', build);
      build();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_CLIENT_ID}&submodules=geocoder`;
    script.async = true;
    script.dataset.naverMap = 'true';
    script.onload = build;
    document.head.appendChild(script);
  }, []);

  return (
    <div
      style={{
        maxWidth: theme.maxWidth,
        margin: '0 auto',
        padding: 'clamp(56px,9vw,88px) 24px clamp(72px,10vw,120px)',
      }}
    >
      <PageHeading label="Location" title="오시는 길" />

      <div style={{ marginBottom: 22 }}>
        {NAVER_CLIENT_ID ? (
          <div
            ref={mapRef}
            style={{ width: '100%', height: 'clamp(280px,50vh,440px)', background: '#E7E3DB' }}
          />
        ) : (
          // 네이버 지도 키가 없으면 정적 안내 박스로 대체
          <div
            style={{
              width: '100%',
              height: 'clamp(280px,50vh,440px)',
              background: '#E7E3DB',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              textAlign: 'center',
              padding: 24,
            }}
          >
            <div
              style={{
                fontFamily: theme.font.mono,
                fontSize: 11,
                letterSpacing: '.28em',
                color: '#8f8a80',
              }}
            >
              NAVER MAP
            </div>
            <div style={{ fontFamily: theme.font.sansKr, fontSize: 14, color: theme.color.muted }}>
              지도를 표시하려면 NEXT_PUBLIC_NAVER_MAP_CLIENT_ID를 설정하세요.
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <a
          href={NAVER_MAP_URL}
          target="_blank"
          rel="noopener"
          style={{
            display: 'inline-block',
            fontFamily: theme.font.sansKr,
            fontSize: 14,
            color: theme.color.inkSoft,
            border: `1px solid ${theme.color.inkSoft}`,
            padding: '11px 26px',
          }}
        >
          네이버 지도에서 길찾기 →
        </a>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
          gap: 2,
          background: theme.color.line,
          border: `1px solid ${theme.color.line}`,
        }}
      >
        {INFO.map((item) => (
          <div key={item.label} style={{ background: '#fff', padding: '34px 30px' }}>
            <div
              style={{
                fontFamily: theme.font.mono,
                fontSize: 11,
                letterSpacing: '.2em',
                color: theme.color.label,
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontFamily: theme.font.sansKr,
                fontWeight: 300,
                fontSize: 15,
                lineHeight: 1.7,
                color: theme.color.inkSoft,
              }}
            >
              {item.lines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
          gap: 'clamp(24px,4vw,40px)',
          marginTop: 56,
        }}
      >
        {TRANSIT.map((item) => (
          <div key={item.title}>
            <div
              style={{
                fontFamily: theme.font.serifKr,
                fontSize: 17,
                color: theme.color.ink,
                marginBottom: 10,
              }}
            >
              {item.title}
            </div>
            <p
              style={{
                fontFamily: theme.font.sansKr,
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.9,
                color: theme.color.body,
                margin: 0,
                textWrap: 'pretty',
              }}
            >
              {item.body.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < item.body.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
