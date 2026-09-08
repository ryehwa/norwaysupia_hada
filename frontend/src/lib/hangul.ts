const CHOSUNG = [
  'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ',
  'ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ',
];

/** 문자열의 초성만 뽑는다. */
export function chosung(text: string): string {
  let out = '';
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      out += CHOSUNG[Math.floor((code - 0xac00) / 588)];
    } else {
      out += ch;
    }
  }
  return out;
}

/** 일반 부분일치 + 초성(자음) 검색. 예) "ㅇㅍㅌ" → "아파트 리모델링" */
export function matches(text: string, query: string): boolean {
  if (!query.trim()) return true;
  const t = text.replace(/\s/g, '').toLowerCase();
  const q = query.replace(/\s/g, '').toLowerCase();
  if (t.includes(q)) return true;
  return chosung(t).includes(chosung(q));
}
