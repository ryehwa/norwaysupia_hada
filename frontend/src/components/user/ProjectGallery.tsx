'use client';

import { useState } from 'react';
import type { PhotoView } from '@/lib/api/public';
import { theme } from '@/lib/theme';

/**
 * 상단에 큰 사진 한 장, 그 아래 나머지 사진을 한 행 5장으로 놓는다.
 * 처음에는 목록에서 클릭한 사진(대표 썸네일)이 위에 오고,
 * 아래 사진을 누르면 그 사진이 위로 올라온다.
 */
export default function ProjectGallery({
  photos,
  title,
}: {
  photos: PhotoView[];
  title: string;
}) {
  const initial = photos.find((p) => p.thumbnail) ?? photos[0];
  const [selected, setSelected] = useState<PhotoView>(initial);

  if (photos.length === 0) return null;

  const rest = photos.filter((p) => p.id !== selected.id);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={selected.url} alt={title} className="works-photo-lead" />

      {rest.length > 0 && (
        <div className="works-photo-grid" style={{ marginTop: 24 }}>
          {rest.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.id}
              src={photo.url}
              alt={title}
              onClick={() => setSelected(photo)}
              className="works-photo-thumb"
              style={{
                width: '100%',
                aspectRatio: '4 / 3',
                objectFit: 'cover',
                display: 'block',
                background: theme.color.placeholder,
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
