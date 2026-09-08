'use client';

import { useEffect, useRef } from 'react';
import { theme } from '@/lib/theme';

/** 다음(카카오) 우편번호 서비스 — 주소 검색 팝업 */
export default function AddressSearch({
  onSelect,
  onClose,
}: {
  onSelect: (address: string) => void;
  onClose: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const embedded = useRef(false);

  useEffect(() => {
    const embed = () => {
      const daum = (window as any).daum;
      if (!daum?.Postcode || !boxRef.current || embedded.current) return;
      embedded.current = true;

      new daum.Postcode({
        oncomplete: (data: any) => {
          const base = data.roadAddress || data.jibunAddress || data.address;
          const extra = data.bname || data.buildingName ? ` (${[data.bname, data.buildingName].filter(Boolean).join(', ')})` : '';
          onSelect(base + extra);
          onClose();
        },
        onresize: (size: { height: number }) => {
          if (boxRef.current) boxRef.current.style.height = size.height + 'px';
        },
        width: '100%',
        height: '100%',
      }).embed(boxRef.current);
    };

    const existing = document.querySelector<HTMLScriptElement>('script[data-daum-postcode]');
    if (existing) {
      existing.addEventListener('load', embed);
      embed();
      return;
    }

    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.dataset.daumPostcode = 'true';
    script.onload = embed;
    document.head.appendChild(script);
  }, [onSelect, onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,18,14,.5)',
        zIndex: 210,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          width: '100%',
          maxWidth: 480,
          maxHeight: '88vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${theme.color.line}`,
          }}
        >
          <span
            style={{
              fontFamily: theme.font.sansKr,
              fontWeight: 500,
              fontSize: 15,
              color: theme.color.ink,
            }}
          >
            주소 검색
          </span>
          <span
            onClick={onClose}
            style={{ cursor: 'pointer', fontSize: 22, lineHeight: 1, color: theme.color.faint }}
          >
            ×
          </span>
        </div>
        <div ref={boxRef} style={{ width: '100%', height: 460 }} />
      </div>
    </div>
  );
}
