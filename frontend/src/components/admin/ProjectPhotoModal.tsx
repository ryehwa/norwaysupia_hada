'use client';

import { useRef, useState } from 'react';
import { adminApi, type ProjectView } from '@/lib/api/admin';
import { theme } from '@/lib/theme';
import Modal from './Modal';
import { ACCEPT_IMAGES, IMAGE_HINT, admin, cover } from './adminTheme';

/**
 * 사진 팝업 — ★ 대표 지정 · × 개별 삭제 · 드래그로 순서 변경 · 카테고리 수정 · 사진 추가.
 * 드래그 중에는 놓일 자리에 세로 삽입선을 띄운다.
 */
export default function ProjectPhotoModal({
  project,
  onChange,
  onClose,
}: {
  project: ProjectView;
  onChange: (p: ProjectView) => void;
  onClose: () => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropPos, setDropPos] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const photos = project.photos;

  const run = async (fn: () => Promise<ProjectView>) => {
    if (busy) return;
    setBusy(true);
    try {
      onChange(await fn());
    } finally {
      setBusy(false);
    }
  };

  const drop = async () => {
    const from = dragIndex;
    let to = dropPos;
    setDragIndex(null);
    setDropPos(null);
    if (from == null || to == null) return;
    if (to === from || to === from + 1) return;

    const ids = photos.map((p) => p.id);
    const [moved] = ids.splice(from, 1);
    if (from < to) to -= 1;
    ids.splice(to, 0, moved);
    await run(() => adminApi.reorderPhotos(project.id, ids));
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    await run(() => adminApi.addPhotos(project.id, Array.from(files)));
    if (fileRef.current) fileRef.current.value = '';
  };

  // 드래그 중이고, 제자리에 놓는 경우가 아닐 때만 삽입선을 보인다.
  const dragging = dragIndex !== null;
  const noop = dropPos === dragIndex || dropPos === (dragIndex ?? -1) + 1;
  const lineStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    background: theme.color.ink,
    borderRadius: 2,
    zIndex: 5,
  };

  return (
    <Modal
      title={project.title}
      subtitle={`사진 ${photos.length}장 · ★ 대표 썸네일 지정 · 드래그하여 순서 변경`}
      maxWidth={760}
      onClose={onClose}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
          marginBottom: 22,
        }}
      >
        <label
          style={{
            fontFamily: theme.font.mono,
            fontSize: 11,
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            color: theme.color.label,
          }}
        >
          카테고리
        </label>
        <select
          value={project.category}
          onChange={(e) => run(() => adminApi.setCategory(project.id, e.target.value))}
          style={{
            border: `1px solid ${theme.color.lineStrong}`,
            background: '#fff',
            padding: '9px 13px',
            fontSize: 14,
            fontFamily: theme.font.sansKr,
          }}
        >
          <option>주거</option>
          <option>상업</option>
        </select>

        <label
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            border: `1px solid ${theme.color.ink}`,
            padding: '9px 16px',
            cursor: 'pointer',
            fontFamily: theme.font.sansKr,
            fontSize: 13,
            color: theme.color.ink,
          }}
        >
          <span style={{ fontSize: 15 }}>＋</span> 사진 추가
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT_IMAGES}
            multiple
            onChange={(e) => addPhotos(e.target.files)}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div
        style={{
          fontFamily: theme.font.sansKr,
          fontSize: 12,
          color: theme.color.label,
          marginBottom: 20,
        }}
      >
        {IMAGE_HINT}
      </div>

      {photos.length === 0 ? (
        <div
          style={{
            fontFamily: theme.font.sansKr,
            fontSize: 14,
            color: theme.color.label,
            textAlign: 'center',
            padding: '40px 0',
          }}
        >
          등록된 사진이 없습니다. 상단의 ‘사진 추가’로 등록하세요.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
            gap: 14,
          }}
        >
          {photos.map((ph, i) => (
            <div key={ph.id} style={{ position: 'relative' }}>
              {dragging && !noop && dropPos === i && <div style={{ ...lineStyle, left: -8.5 }} />}
              {dragging && !noop && i === photos.length - 1 && dropPos === photos.length && (
                <div style={{ ...lineStyle, right: -8.5 }} />
              )}
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  setDragIndex(i);
                  setDropPos(i);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  const r = e.currentTarget.getBoundingClientRect();
                  const pos = e.clientX - r.left < r.width / 2 ? i : i + 1;
                  if (pos !== dropPos) setDropPos(pos);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  drop();
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setDropPos(null);
                }}
                style={{
                  position: 'relative',
                  height: 150,
                  overflow: 'hidden',
                  cursor: 'grab',
                  border: `2px solid ${ph.thumbnail ? theme.color.ink : admin.cardLine}`,
                  opacity: dragIndex === i ? 0.4 : 1,
                }}
              >
                <div style={{ ...cover(ph.url), pointerEvents: 'none' }} />
                <span
                  onClick={() => !ph.thumbnail && run(() => adminApi.setThumbnail(project.id, ph.id))}
                  title="대표 썸네일로 지정"
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 15,
                    cursor: 'pointer',
                    background: ph.thumbnail ? theme.color.ink : 'rgba(255,255,255,.85)',
                    color: ph.thumbnail ? '#fff' : theme.color.faint,
                  }}
                >
                  {ph.thumbnail ? '★' : '☆'}
                </span>
                <span
                  onClick={() => run(() => adminApi.deletePhoto(ph.id))}
                  title="사진 삭제"
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'rgba(20,18,14,.72)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  ×
                </span>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    background: 'rgba(20,18,14,.72)',
                    color: '#fff',
                    fontFamily: theme.font.mono,
                    fontSize: 11,
                    padding: '2px 8px',
                  }}
                >
                  {i + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
