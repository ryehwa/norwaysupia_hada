/** 디자인 시안에서 확정된 토큰. 색과 타이포는 여기서만 바꾼다. */
export const theme = {
  color: {
    ink: '#1a1a18',
    inkSoft: '#2a2823',
    body: '#5c584f',
    muted: '#6b665c',
    faint: '#8a857a',
    label: '#a09a8d',
    line: '#ece9e3',
    lineStrong: '#d8d3c9',
    placeholder: '#EDEAE4',
    surface: '#ffffff',
    surfaceAlt: '#f6f4f0',
    canvas: '#f2efe9',
    danger: '#b06a5c',
    // 상태 배지
    pendingBg: '#faf3e8',
    pendingFg: '#9a7a33',
    pendingLine: '#ecdcc0',
    doneBg: '#e7ede7',
    doneFg: '#3a6b45',
    doneLine: '#cfe0cf',
    reservedBg: '#efe7db',
    reservedFg: '#7a6a3f',
    reservedLine: '#e0d3b0',
  },
  font: {
    display: "'Cormorant Garamond', serif",
    serifKr: "'Noto Serif KR', serif",
    sansKr: "'Noto Sans KR', sans-serif",
    mono: "'Archivo', sans-serif",
  },
  maxWidth: 1200,
} as const;

export const fontLink =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Archivo:wght@400;500;600&family=Noto+Serif+KR:wght@300;400;500&family=Noto+Sans+KR:wght@300;400;500&display=swap';
