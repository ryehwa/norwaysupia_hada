'use client';

import { useCallback, useEffect, useState } from 'react';
import { publicApi, type PageResponse, type ProjectSummary } from '@/lib/api/public';
import { theme } from '@/lib/theme';
import PageHeading from '@/components/user/PageHeading';
import ProjectCard from '@/components/user/ProjectCard';
import Pagination from '@/components/shared/Pagination';

const CATEGORIES = ['전체', '주거', '상업'] as const;
const PAGE_SIZE = 9; // 3 × 3

export default function WorksPage() {
  const [category, setCategory] = useState<string>('전체');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<ProjectSummary> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await publicApi.projects({
        category: category === '전체' ? undefined : category,
        q: query || undefined,
        page,
        size: PAGE_SIZE,
      });
      setData(res);
    } catch {
      setData({ items: [], page: 0, size: PAGE_SIZE, total: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [category, query, page]);

  useEffect(() => {
    const timer = setTimeout(load, query ? 220 : 0); // 검색어는 살짝 디바운스
    return () => clearTimeout(timer);
  }, [load, query]);

  const chip = (active: boolean): React.CSSProperties => ({
    fontFamily: theme.font.sansKr,
    fontSize: 13,
    padding: '9px 22px',
    cursor: 'pointer',
    background: active ? theme.color.ink : 'transparent',
    color: active ? '#fff' : theme.color.inkSoft,
    border: `1px solid ${active ? theme.color.ink : '#cbc5b9'}`,
  });

  return (
    <div
      style={{
        maxWidth: theme.maxWidth,
        margin: '0 auto',
        padding: 'clamp(56px,9vw,88px) 24px clamp(72px,10vw,120px)',
      }}
    >
      <PageHeading label="Portfolio" title="시공 사례" />

      {/* 검색 — 초성(자음)만 입력해도 찾아진다 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="사례 검색 (초성도 가능)"
          style={{
            width: '100%',
            maxWidth: 360,
            border: `1px solid ${theme.color.lineStrong}`,
            background: '#fff',
            padding: '13px 16px',
            fontSize: 14,
            color: theme.color.ink,
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 12,
          marginBottom: 48,
          flexWrap: 'wrap',
        }}
      >
        {CATEGORIES.map((c) => (
          <span
            key={c}
            onClick={() => {
              setCategory(c);
              setPage(0);
            }}
            style={chip(category === c)}
          >
            {c}
          </span>
        ))}
      </div>

      {loading && !data ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 0',
            fontFamily: theme.font.sansKr,
            fontSize: 14,
            color: theme.color.label,
          }}
        >
          불러오는 중…
        </div>
      ) : data && data.items.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 0',
            fontFamily: theme.font.sansKr,
            fontSize: 14,
            color: theme.color.label,
          }}
        >
          조건에 맞는 사례가 없습니다.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,300px),1fr))',
            gap: 24,
          }}
        >
          {data?.items.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </div>
  );
}
