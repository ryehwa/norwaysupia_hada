'use client';

import { useEffect } from 'react';
import { theme } from '@/lib/theme';

/** 콘솔 공용 팝업. 배경을 누르거나 ESC 로 닫힌다. */
export default function Modal({
  title,
  subtitle,
  maxWidth,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  maxWidth: number;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(20,18,14,.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', width: '100%', maxWidth, maxHeight: '86vh', overflowY: 'auto' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 28px',
            borderBottom: '1px solid #eee7dc',
            position: 'sticky',
            top: 0,
            background: '#fff',
            zIndex: 1,
          }}
        >
          <div>
            <div style={{ fontFamily: theme.font.display, fontWeight: 600, fontSize: 24 }}>
              {title}
            </div>
            {subtitle && (
              <div
                style={{
                  fontFamily: theme.font.mono,
                  fontSize: 11,
                  letterSpacing: '.14em',
                  color: theme.color.label,
                  marginTop: 4,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
          <span
            onClick={onClose}
            style={{ cursor: 'pointer', fontSize: 22, color: theme.color.muted, lineHeight: 1 }}
          >
            ×
          </span>
        </div>
        <div style={{ padding: '24px 28px' }}>{children}</div>
      </div>
    </div>
  );
}
