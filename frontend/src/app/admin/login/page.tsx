'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/admin';
import { theme } from '@/lib/theme';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await authApi.login(username, password);
      router.replace('/admin');
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      setBusy(false);
    }
  };

  const field: React.CSSProperties = {
    width: '100%',
    border: '1px solid #3a382f',
    background: '#26241e',
    color: '#fff',
    padding: '15px 16px',
    fontSize: 15,
    fontFamily: theme.font.sansKr,
    marginBottom: 12,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.color.ink,
        padding: 24,
      }}
    >
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <div
          style={{
            fontFamily: theme.font.display,
            fontWeight: 600,
            fontSize: 30,
            color: '#fff',
            letterSpacing: '.04em',
            marginBottom: 6,
          }}
        >
          HADA × SUPIA
        </div>
        <div
          style={{
            fontFamily: theme.font.mono,
            fontSize: 11,
            letterSpacing: '.34em',
            textTransform: 'uppercase',
            color: '#8f897c',
            marginBottom: 40,
          }}
        >
          Admin Console
        </div>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="아이디"
          autoComplete="username"
          style={field}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoComplete="current-password"
          style={field}
        />
        <button
          type="submit"
          disabled={busy}
          style={{
            display: 'block',
            width: '100%',
            cursor: busy ? 'default' : 'pointer',
            fontFamily: theme.font.sansKr,
            fontSize: 15,
            color: theme.color.ink,
            background: busy ? '#ded9cf' : '#fff',
            padding: 15,
            border: 'none',
          }}
        >
          {busy ? '확인 중…' : '로그인'}
        </button>

        {error && <div style={{ color: '#e08b7d', fontSize: 13, marginTop: 12 }}>{error}</div>}
      </form>
    </div>
  );
}
