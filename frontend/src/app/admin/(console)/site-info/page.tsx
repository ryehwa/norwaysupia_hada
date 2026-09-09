'use client';

import { useEffect, useState } from 'react';
import { adminApi, type SiteInfoView } from '@/lib/api/admin';
import { theme } from '@/lib/theme';
import { card, h1, input, label, lead, solidButton } from '@/components/admin/adminTheme';

const FIELDS: { key: keyof SiteInfoView; label: string }[] = [
  { key: 'address', label: '주소' },
  { key: 'phone', label: '전화번호' },
  { key: 'email', label: '이메일' },
  { key: 'businessHours', label: '운영시간' },
];

export default function SiteInfoPage() {
  const [form, setForm] = useState<SiteInfoView | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    adminApi.siteInfo().then(setForm).catch(() => setMessage('불러오지 못했습니다.'));
  }, []);

  const save = async () => {
    if (!form || saving) return;
    setSaving(true);
    setMessage('');
    try {
      setForm(await adminApi.updateSiteInfo(form));
      setMessage('저장되었습니다.');
    } catch {
      setMessage('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 style={h1}>사이트 정보</h1>
      <p style={lead}>푸터·오시는 길에 표시되는 정보입니다.</p>

      <div
        style={{
          ...card,
          padding: 30,
          maxWidth: 560,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label style={label}>{f.label}</label>
            <input
              type="text"
              value={form?.[f.key] ?? ''}
              disabled={!form}
              onChange={(e) => form && setForm({ ...form, [f.key]: e.target.value })}
              style={{ ...input, width: '100%' }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14 }}>
          {message && (
            <span style={{ fontFamily: theme.font.sansKr, fontSize: 13, color: theme.color.muted }}>
              {message}
            </span>
          )}
          <button onClick={save} disabled={!form || saving} style={solidButton(!!form && !saving)}>
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
