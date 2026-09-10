'use client';

import { usePathname } from 'next/navigation';

const KAKAO_URL = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || 'http://pf.kakao.com/';
const PHONE = process.env.NEXT_PUBLIC_PHONE || '02-6052-0479';

/** 어느 페이지에서든 오른쪽 하단에 고정되는 카카오톡 · 전화 버튼 */
export default function FloatingContact() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  const circle: React.CSSProperties = {
    width: 56,
    height: 56,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 20px rgba(0,0,0,.18)',
    transition: 'transform .18s ease, box-shadow .18s ease',
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: 'clamp(16px,3vw,28px)',
        bottom: 'clamp(16px,3vw,28px)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/*
        noreferrer 로 유입 경로를 보내지 않는다.
        카카오 채널 채팅이 인사말에 "이전 페이지"로 이 값을 노출하는데,
        브라우저가 출처까지만 보내 도메인만 찍히는 탓에 정보량이 없었다.
      */}
      <a
        href={KAKAO_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="카카오톡 상담"
        style={{ ...circle, background: '#FEE500' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3C6.9 3 2.75 6.27 2.75 10.3c0 2.57 1.72 4.83 4.32 6.12-.19.68-.68 2.46-.78 2.84-.12.48.18.47.37.34.15-.1 2.4-1.63 3.37-2.29.65.09 1.31.14 1.97.14 5.1 0 9.25-3.27 9.25-7.15C21.25 6.27 17.1 3 12 3Z"
            fill="#1a1a18"
          />
        </svg>
      </a>

      <a href={`tel:${PHONE}`} title="전화 연결" style={{ ...circle, background: '#1a1a18' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2.2 2.3Z"
            fill="#fff"
          />
        </svg>
      </a>
    </div>
  );
}
