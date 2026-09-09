'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  adminApi,
  type PageResponse,
  type ProjectSummary,
  type ProjectView,
} from '@/lib/api/admin';
import { theme } from '@/lib/theme';
import Pagination from '@/components/shared/Pagination';
import ProjectPhotoModal from '@/components/admin/ProjectPhotoModal';
import FeaturedPicker from '@/components/admin/FeaturedPicker';
import {
  ACCEPT_IMAGES,
  IMAGE_HINT,
  admin,
  card,
  chip,
  cover,
  h1,
  h2,
  input,
  lead,
  noImage,
  solidButton,
} from '@/components/admin/adminTheme';

const CATEGORIES = ['전체', '주거', '상업'] as const;
const PAGE_SIZE = 12; // 4 × 3
const SLOTS = 3;

export default function AdminWorksPage() {
  // 목록
  const [category, setCategory] = useState<string>('전체');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<ProjectSummary> | null>(null);

  // 새 사례 등록
  const [title, setTitle] = useState('');
  const [draftCategory, setDraftCategory] = useState('주거');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [creating, setCreating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // HOME 3칸 — 저장 버튼을 눌러야 반영된다
  const [saved, setSaved] = useState<(ProjectSummary | null)[]>(Array(SLOTS).fill(null));
  const [draft, setDraft] = useState<(ProjectSummary | null)[]>(Array(SLOTS).fill(null));
  const [savingHome, setSavingHome] = useState(false);
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);

  // 팝업
  const [opened, setOpened] = useState<ProjectView | null>(null);

  const loadList = useCallback(async () => {
    const res = await adminApi.projects({
      category: category === '전체' ? undefined : category,
      q: query || undefined,
      page,
      size: PAGE_SIZE,
    });
    setData(res);
  }, [category, query, page]);

  const loadFeatured = useCallback(async () => {
    const res = await adminApi.featured();
    const slots: (ProjectSummary | null)[] = Array(SLOTS).fill(null);
    res.forEach((s) => {
      if (s.slotIndex >= 0 && s.slotIndex < SLOTS) slots[s.slotIndex] = s.project;
    });
    setSaved(slots);
    setDraft(slots);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadList().catch(() => setData(null)), query ? 220 : 0);
    return () => clearTimeout(timer);
  }, [loadList, query]);

  useEffect(() => {
    loadFeatured().catch(() => undefined);
  }, [loadFeatured]);

  const homeDirty =
    JSON.stringify(draft.map((p) => p?.id ?? null)) !==
    JSON.stringify(saved.map((p) => p?.id ?? null));

  const saveHome = async () => {
    if (!homeDirty || savingHome) return;
    setSavingHome(true);
    try {
      await adminApi.saveFeatured(draft.map((p) => p?.id ?? null));
      await loadFeatured();
    } finally {
      setSavingHome(false);
    }
  };

  const createProject = async () => {
    if (!title.trim() || creating) return;
    setCreating(true);
    try {
      await adminApi.createProject(
        { title: title.trim(), category: draftCategory, description: description || undefined },
        files
      );
      setTitle('');
      setDraftCategory('주거');
      setDescription('');
      setFiles([]);
      if (fileRef.current) fileRef.current.value = '';
      setPage(0);
      await loadList();
    } finally {
      setCreating(false);
    }
  };

  const removeProject = async (p: ProjectSummary) => {
    if (!confirm(`‘${p.title}’ 사례를 삭제할까요? 등록된 사진도 함께 삭제됩니다.`)) return;
    await adminApi.deleteProject(p.id);
    await Promise.all([loadList(), loadFeatured()]);
  };

  const openProject = async (id: number) => setOpened(await adminApi.project(id));

  const afterPhotoChange = async (p: ProjectView) => {
    setOpened(p);
    await Promise.all([loadList(), loadFeatured()]);
  };

  const badge: React.CSSProperties = {
    fontFamily: theme.font.mono,
    fontSize: 10,
    letterSpacing: '.12em',
    color: theme.color.faint,
    border: '1px solid #ddd8ce',
    padding: '2px 8px',
  };

  return (
    <div>
      <h1 style={h1}>시공 사례 관리</h1>
      <p style={lead}>사이트에 노출될 시공/인테리어 사례를 등록합니다.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 40 }}>
        {/* 새 사례 등록 */}
        <div style={{ ...card, padding: 30 }}>
          <h2 style={{ ...h2, marginBottom: 22 }}>새 사례 등록</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="사례 제목"
                style={{ ...input, flex: 1, minWidth: 220 }}
              />
              <select
                value={draftCategory}
                onChange={(e) => setDraftCategory(e.target.value)}
                style={{ ...input, width: 160 }}
              >
                <option>주거</option>
                <option>상업</option>
              </select>
            </div>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설명 (선택)"
              style={{ ...input, width: '100%', resize: 'vertical' }}
            />

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                border: `1px dashed ${admin.dropzoneLine}`,
                background: admin.dropzoneBg,
                padding: 26,
                cursor: 'pointer',
                fontFamily: theme.font.sansKr,
                fontSize: 14,
                color: theme.color.muted,
              }}
            >
              <span>
                <span style={{ fontSize: 18 }}>＋</span> 사진 업로드 (여러 장 선택 가능)
              </span>
              <span style={{ fontSize: 12, color: theme.color.label }}>{IMAGE_HINT}</span>
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPT_IMAGES}
                multiple
                onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
                style={{ display: 'none' }}
              />
            </label>

            {files.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))',
                  gap: 10,
                }}
              >
                {files.map((f, i) => (
                  <div
                    key={`${f.name}-${i}`}
                    style={{
                      position: 'relative',
                      height: 100,
                      background: theme.color.placeholder,
                      overflow: 'hidden',
                    }}
                  >
                    {/* 업로드 전 미리보기 — 브라우저 메모리의 blob URL */}
                    <div style={cover(URL.createObjectURL(f))} />
                    <span
                      onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                      style={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'rgba(20,18,14,.7)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={createProject}
                disabled={!title.trim() || creating}
                style={solidButton(!!title.trim() && !creating)}
              >
                {creating ? '등록 중…' : '사례 등록'}
              </button>
            </div>
          </div>
        </div>

        {/* HOME 노출 사례 */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
              marginBottom: 8,
            }}
          >
            <h2 style={h2}>
              HOME 노출 사례{' '}
              <span style={{ color: theme.color.label }}>
                (3칸 고정 · {draft.filter(Boolean).length}/3)
              </span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {homeDirty && (
                <span
                  style={{ fontFamily: theme.font.sansKr, fontSize: 12, color: theme.color.danger }}
                >
                  저장되지 않은 변경사항
                </span>
              )}
              <button
                onClick={saveHome}
                disabled={!homeDirty || savingHome}
                style={{ ...solidButton(homeDirty && !savingHome), padding: '12px 32px' }}
              >
                {savingHome ? '저장 중…' : '저장'}
              </button>
            </div>
          </div>
          <p
            style={{
              fontFamily: theme.font.sansKr,
              fontWeight: 300,
              fontSize: 13,
              color: theme.color.faint,
              margin: '0 0 16px',
            }}
          >
            HOME 첫 화면에 노출되는 3개의 사례입니다. 사례에 마우스를 올려 삭제하거나, 빈 칸의 ＋ 로 사례를
            지정한 뒤 <b>저장</b>을 눌러야 반영됩니다.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 18,
              marginBottom: 44,
            }}
          >
            {draft.map((p, i) =>
              p ? (
                <div
                  key={`slot-${i}`}
                  className="admin-home-card"
                  style={{ position: 'relative', background: '#fff', border: `1px solid ${admin.cardLine}` }}
                >
                  <div
                    style={{
                      position: 'relative',
                      height: 170,
                      background: theme.color.placeholder,
                      overflow: 'hidden',
                    }}
                  >
                    {p.thumbnailUrl ? (
                      <div style={cover(p.thumbnailUrl)} />
                    ) : (
                      <span style={noImage}>NO IMAGE</span>
                    )}
                  </div>
                  <div
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{ fontFamily: theme.font.serifKr, fontSize: 15, color: theme.color.ink }}
                    >
                      {p.title}
                    </span>
                    <span style={badge}>{p.category}</span>
                  </div>
                  <div
                    className="admin-home-overlay"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(20,18,14,.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity .15s',
                    }}
                  >
                    <span
                      onClick={() =>
                        setDraft((prev) => prev.map((x, j) => (j === i ? null : x)))
                      }
                      style={{
                        cursor: 'pointer',
                        fontFamily: theme.font.sansKr,
                        fontSize: 14,
                        color: theme.color.ink,
                        background: '#fff',
                        padding: '11px 26px',
                      }}
                    >
                      삭제
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  key={`slot-${i}`}
                  onClick={() => setPickerSlot(i)}
                  style={{
                    height: 219,
                    border: `2px dashed ${admin.dropzoneLine}`,
                    background: admin.dropzoneBg,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    color: theme.color.label,
                  }}
                >
                  <span style={{ fontSize: 34, fontWeight: 300, lineHeight: 1 }}>＋</span>
                  <span style={{ fontFamily: theme.font.sansKr, fontSize: 13 }}>사례 지정</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* 등록된 사례 */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
              marginBottom: 16,
            }}
          >
            <h2 style={h2}>
              등록된 사례 <span style={{ color: theme.color.label }}>({data?.total ?? 0})</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 8 }}>
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
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder="사례 검색 (초성 검색 가능 · 예: ㄷㄷㅈㅌ)"
                style={{ ...input, width: 'min(320px,60vw)', padding: '11px 14px' }}
              />
            </div>
          </div>

          {data && data.items.length === 0 ? (
            <div
              style={{
                ...card,
                fontFamily: theme.font.sansKr,
                fontSize: 14,
                color: theme.color.label,
                textAlign: 'center',
                padding: '48px 0',
              }}
            >
              검색 결과가 없습니다.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,220px),1fr))',
                gap: 18,
              }}
            >
              {data?.items.map((p) => (
                <div key={p.id} style={card}>
                  <div
                    onClick={() => openProject(p.id)}
                    style={{
                      position: 'relative',
                      height: 150,
                      background: theme.color.placeholder,
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                  >
                    {p.thumbnailUrl ? (
                      <div style={cover(p.thumbnailUrl)} />
                    ) : (
                      <span style={noImage}>NO IMAGE</span>
                    )}
                  </div>
                  <div onClick={() => openProject(p.id)} style={{ padding: '14px 16px', cursor: 'pointer' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{ fontFamily: theme.font.serifKr, fontSize: 15, color: theme.color.ink }}
                      >
                        {p.title}
                      </span>
                      <span style={badge}>{p.category}</span>
                    </div>
                    <div
                      style={{
                        fontFamily: theme.font.mono,
                        fontSize: 11,
                        color: theme.color.label,
                        marginTop: 8,
                      }}
                    >
                      사진 {p.photoCount}장
                    </div>
                  </div>
                  <div
                    style={{
                      borderTop: `1px solid ${admin.rowLine}`,
                      padding: '10px 16px',
                      textAlign: 'right',
                    }}
                  >
                    <span
                      onClick={() => removeProject(p)}
                      style={{
                        cursor: 'pointer',
                        fontFamily: theme.font.sansKr,
                        fontSize: 12,
                        color: theme.color.danger,
                      }}
                    >
                      삭제
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
        </div>
      </div>

      {opened && (
        <ProjectPhotoModal
          project={opened}
          onChange={afterPhotoChange}
          onClose={() => setOpened(null)}
        />
      )}

      {pickerSlot !== null && (
        <FeaturedPicker
          taken={draft.filter(Boolean).map((p) => (p as ProjectSummary).id)}
          onPick={(p) => {
            setDraft((prev) => prev.map((x, j) => (j === pickerSlot ? p : x)));
            setPickerSlot(null);
          }}
          onClose={() => setPickerSlot(null)}
        />
      )}
    </div>
  );
}
