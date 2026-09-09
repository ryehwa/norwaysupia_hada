'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, type ProjectSummary } from '@/lib/api/admin';
import { theme } from '@/lib/theme';
import Modal from './Modal';
import { admin, chip, cover, noImage } from './adminTheme';

const CATEGORIES = ['전체', '주거', '상업'] as const;

/** HOME 3칸에 넣을 사례를 고르는 팝업. 이미 노출 중인 사례는 고를 수 없다. */
export default function FeaturedPicker({
  taken,
  onPick,
  onClose,
}: {
  taken: number[];
  onPick: (project: ProjectSummary) => void;
  onClose: () => void;
}) {
  const [category, setCategory] = useState<string>('전체');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<ProjectSummary[]>([]);

  const load = useCallback(async () => {
    const res = await adminApi.projects({
      category: category === '전체' ? undefined : category,
      q: query || undefined,
      page: 0,
      size: 200,
    });
    setItems(res.items);
  }, [category, query]);

  useEffect(() => {
    const timer = setTimeout(() => load().catch(() => setItems([])), query ? 220 : 0);
    return () => clearTimeout(timer);
  }, [load, query]);

  return (
    <Modal
      title="HOME 노출 사례 선택"
      subtitle="등록된 사례 중 하나를 선택하세요"
      maxWidth={720}
      onClose={onClose}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {CATEGORIES.map((c) => (
          <span key={c} onClick={() => setCategory(c)} style={chip(category === c)}>
            {c}
          </span>
        ))}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="사례 검색 (초성 검색 가능 · 예: ㄷㄷㅈㅌ)"
        style={{
          width: '100%',
          border: `1px solid ${theme.color.lineStrong}`,
          background: '#fff',
          padding: '11px 14px',
          fontSize: 14,
          fontFamily: theme.font.sansKr,
          marginBottom: 20,
        }}
      />

      {items.length === 0 ? (
        <div
          style={{
            fontFamily: theme.font.sansKr,
            fontSize: 14,
            color: theme.color.label,
            textAlign: 'center',
            padding: '40px 0',
          }}
        >
          검색 결과가 없습니다.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
            gap: 16,
          }}
        >
          {items.map((p) => {
            const already = taken.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => !already && onPick(p)}
                style={{
                  background: '#fff',
                  border: `1px solid ${admin.cardLine}`,
                  cursor: already ? 'default' : 'pointer',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    height: 130,
                    background: theme.color.placeholder,
                    overflow: 'hidden',
                  }}
                >
                  {p.thumbnailUrl ? (
                    <div style={cover(p.thumbnailUrl)} />
                  ) : (
                    <span style={noImage}>NO IMAGE</span>
                  )}
                  {already && (
                    <span
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255,255,255,.72)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: theme.font.sansKr,
                        fontSize: 12,
                        color: theme.color.muted,
                      }}
                    >
                      이미 노출 중
                    </span>
                  )}
                </div>
                <div
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontFamily: theme.font.serifKr, fontSize: 14, color: theme.color.ink }}>
                    {p.title}
                  </span>
                  <span
                    style={{
                      fontFamily: theme.font.mono,
                      fontSize: 10,
                      letterSpacing: '.12em',
                      color: theme.color.faint,
                      border: '1px solid #ddd8ce',
                      padding: '2px 8px',
                    }}
                  >
                    {p.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
