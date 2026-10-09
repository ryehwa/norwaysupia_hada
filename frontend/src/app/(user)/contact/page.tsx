'use client';

import { useState } from 'react';
import { ApiError, publicApi } from '@/lib/api/public';
import { theme } from '@/lib/theme';
import PageHeading from '@/components/user/PageHeading';
import AddressSearch from '@/components/user/AddressSearch';
import DateTimePicker from '@/components/user/DateTimePicker';
import { ampm, shortDate } from '@/lib/format';

const SPACE_TYPES = ['주거', '상업'] as const;

const field: React.CSSProperties = {
  width: '100%',
  border: `1px solid ${theme.color.lineStrong}`,
  background: '#fff',
  padding: '15px 16px',
  fontSize: 15,
  color: theme.color.ink,
};

/**
 * 아직 입력·선택하지 않은 칸의 글씨 색.
 * 브라우저 기본 placeholder(크롬 #757575)는 차가운 회색이라 팔레트와 어긋난다.
 * 폼 전체를 이 값으로 맞춘다 — globals.css 의 .contact-form ::placeholder 와 같은 값.
 */
const hint = '#a9a396';

/**
 * select 는 끄지 않으면 OS 기본 위젯으로 그려진다 (사파리는 둥근 모서리·굵은 글씨·
 * 위아래 화살표). 모양을 눌러 끄고 나머지 입력칸과 같은 테두리·여백·글꼴로 맞춘다.
 * 화살표는 직접 그려 넣는다 — 끄고 나면 아무 표시도 남지 않기 때문이다.
 */
const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%238a857a' stroke-width='1.2'/%3E%3C/svg%3E\")";

const selectField: React.CSSProperties = {
  ...field,
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  borderRadius: 0,
  fontFamily: theme.font.sansKr,
  fontWeight: 400,
  backgroundColor: '#fff',
  backgroundImage: chevron,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 16px center',
  paddingRight: 38,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: theme.font.mono,
  fontSize: 11,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: theme.color.faint,
  marginBottom: 8,
};

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [spaceType, setSpaceType] = useState('');
  const [size, setSize] = useState('');
  const [sizeUnit, setSizeUnit] = useState<'평' | 'm²'>('평');
  const [workDate, setWorkDate] = useState<string | null>(null);
  const [consultDate, setConsultDate] = useState<string | null>(null);
  const [consultTime, setConsultTime] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [addrOpen, setAddrOpen] = useState(false);
  const [picker, setPicker] = useState<'work' | 'consult' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const ready =
    name.trim() !== '' &&
    phone.trim() !== '' &&
    address.trim() !== '' &&
    spaceType !== '' &&
    consultDate !== null &&
    consultTime !== null &&
    agreed;

  const reset = () => {
    setName('');
    setPhone('');
    setAddress('');
    setAddressDetail('');
    setSpaceType('');
    setSize('');
    setSizeUnit('평');
    setWorkDate(null);
    setConsultDate(null);
    setConsultTime(null);
    setNote('');
    setAgreed(false);
    setError(null);
    setSent(false);
  };

  const submit = async () => {
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await publicApi.submitInquiry({
        name,
        phone,
        address,
        addressDetail,
        spaceType,
        size,
        sizeUnit,
        workDate,
        consultDate,
        consultTime,
        note,
        privacyAgreed: agreed,
      });
      setSent(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : '문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const unitChip = (unit: '평' | 'm²'): React.CSSProperties => ({
    padding: '15px 18px',
    cursor: 'pointer',
    fontFamily: theme.font.sansKr,
    fontSize: 14,
    border: `1px solid ${sizeUnit === unit ? theme.color.ink : theme.color.lineStrong}`,
    background: sizeUnit === unit ? theme.color.ink : '#fff',
    color: sizeUnit === unit ? '#fff' : hint,
  });

  const pickerBox = (filled: boolean): React.CSSProperties => ({
    ...field,
    cursor: 'pointer',
    color: filled ? theme.color.ink : hint,
  });

  return (
    <div
      className="contact-form"
      style={{
        maxWidth: 1080,
        margin: '0 auto',
        padding: 'clamp(56px,9vw,88px) 24px clamp(72px,10vw,120px)',
      }}
    >
      <PageHeading
        label="Contact"
        title="프로젝트 문의"
        description="문의를 남겨주시면 담당자가 빠르게 연락드립니다."
      />

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {sent ? (
          <div
            style={{
              border: `1px solid ${theme.color.line}`,
              padding: 'clamp(56px,9vw,88px) 40px',
              textAlign: 'center',
            }}
          >
            <h3
              style={{
                fontFamily: theme.font.serifKr,
                fontWeight: 400,
                fontSize: 26,
                color: theme.color.ink,
                margin: '0 0 14px',
              }}
            >
              견적 문의가 접수되었습니다
            </h3>
            <p
              style={{
                fontFamily: theme.font.sansKr,
                fontWeight: 300,
                fontSize: 14,
                color: theme.color.body,
                margin: '0 0 28px',
              }}
            >
              확인 후 영업일 기준 1–2일 내에 연락드리겠습니다.
            </p>
            <span
              onClick={reset}
              style={{
                cursor: 'pointer',
                fontFamily: theme.font.sansKr,
                fontSize: 14,
                color: theme.color.ink,
                borderBottom: `1px solid ${theme.color.ink}`,
                paddingBottom: 3,
              }}
            >
              새 문의 작성
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름 *"
              style={field}
            />

            {/* 전화번호는 숫자만 입력 */}
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="전화번호 * (숫자만)"
              style={field}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={address}
                readOnly
                onClick={() => setAddrOpen(true)}
                placeholder="시공 장소 주소 *"
                style={{ ...field, flex: 1, cursor: 'pointer' }}
              />
              <span
                onClick={() => setAddrOpen(true)}
                style={{
                  flex: 'none',
                  padding: '15px 20px',
                  cursor: 'pointer',
                  fontFamily: theme.font.sansKr,
                  fontSize: 14,
                  background: theme.color.ink,
                  color: '#fff',
                  border: `1px solid ${theme.color.ink}`,
                  whiteSpace: 'nowrap',
                }}
              >
                주소 검색
              </span>
            </div>

            <input
              type="text"
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
              placeholder="상세 주소 (동·호수 등)"
              style={field}
            />

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <select
                value={spaceType}
                onChange={(e) => setSpaceType(e.target.value)}
                style={{
                  ...selectField,
                  flex: 1,
                  minWidth: 180,
                  color: spaceType === '' ? hint : theme.color.ink,
                }}
              >
                <option value="" style={{ color: hint }}>
                  공간 유형 *
                </option>
                {SPACE_TYPES.map((t) => (
                  <option key={t} value={t} style={{ color: theme.color.ink }}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="공간 크기"
                style={{ ...field, width: 150, flex: 'none' }}
              />
              <span onClick={() => setSizeUnit('m²')} style={unitChip('m²')}>
                m²
              </span>
              <span onClick={() => setSizeUnit('평')} style={unitChip('평')}>
                평
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 }}>
              <div>
                <label style={labelStyle}>공사 희망일자</label>
                <div onClick={() => setPicker('work')} style={pickerBox(!!workDate)}>
                  {workDate ? shortDate(workDate) : '날짜 선택'}
                </div>
              </div>
              <div>
                <label style={labelStyle}>상담 희망일시 *</label>
                <div onClick={() => setPicker('consult')} style={pickerBox(!!consultDate)}>
                  {consultDate && consultTime
                    ? `${shortDate(consultDate)} ${ampm(consultTime)}`
                    : '날짜·시간 선택'}
                </div>
              </div>
            </div>

            <textarea
              rows={5}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="비고"
              style={{ ...field, padding: '14px 16px', resize: 'vertical' }}
            />

            <label
              onClick={() => setAgreed((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                fontFamily: theme.font.sansKr,
                fontWeight: 300,
                fontSize: 14,
                color: theme.color.body,
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  flex: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  border: `1px solid ${agreed ? theme.color.ink : theme.color.lineStrong}`,
                  background: agreed ? theme.color.ink : '#fff',
                  color: agreed ? '#fff' : 'transparent',
                }}
              >
                ✓
              </span>
              개인 정보 수집에 동의합니다. 마케팅에 활용하지 않습니다. *
            </label>

            {error && (
              <div
                style={{
                  fontFamily: theme.font.sansKr,
                  fontSize: 13,
                  color: theme.color.danger,
                  background: '#faf1ef',
                  border: '1px solid #e8d3cd',
                  padding: '12px 14px',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              <span
                onClick={submit}
                style={{
                  display: 'inline-block',
                  padding: '15px 46px',
                  fontFamily: theme.font.sansKr,
                  fontSize: 15,
                  cursor: ready && !submitting ? 'pointer' : 'default',
                  background: ready && !submitting ? theme.color.ink : '#cbc5b9',
                  color: '#fff',
                  border: `1px solid ${ready && !submitting ? theme.color.ink : '#cbc5b9'}`,
                }}
              >
                {submitting ? '접수 중…' : '신청하기'}
              </span>
            </div>
          </div>
        )}
      </div>

      {addrOpen && <AddressSearch onSelect={setAddress} onClose={() => setAddrOpen(false)} />}

      {picker === 'work' && (
        <DateTimePicker
          title="공사 희망일자"
          withTime={false}
          onSelect={(date) => setWorkDate(date)}
          onClose={() => setPicker(null)}
        />
      )}

      {picker === 'consult' && (
        <DateTimePicker
          title="상담 희망일시"
          withTime
          onSelect={(date, time) => {
            setConsultDate(date);
            setConsultTime(time ?? null);
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}
