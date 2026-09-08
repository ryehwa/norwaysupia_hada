# 프론트엔드 (Next.js)

```bash
cd frontend
cp .env.local.example .env.local   # 값 채우기
npm install
npm run dev                        # http://localhost:3000
```

백엔드(8080)가 함께 켜져 있어야 합니다. `next.config.mjs`의 rewrites가
`/api/*`와 `/uploads/*`를 스프링 부트로 프록시하므로, 브라우저에서는
프론트와 백엔드가 같은 도메인처럼 동작합니다 (CORS·쿠키 문제 없음).

## ⚠ 내려받은 뒤 폴더 하나만 이름을 바꿔주세요

동적 라우트 폴더명(대괄호)이 전달 과정에서 치환되어 있습니다. 한 번만 바꾸면 됩니다.

```bash
mv src/app/works/-id- src/app/works/\[id\]
```

## 구조

```
src/
  app/
    layout.tsx              공통 레이아웃 (헤더 · 푸터 · 플로팅 버튼)
    page.tsx                HOME — 히어로, 노출 사례 3칸, CTA
    works/page.tsx          시공사례 — 카테고리 필터 · 초성 검색 · 페이지네이션(3×3)
    works/[id]/page.tsx     사례 상세 — 사진 순서대로 노출
    location/page.tsx       오시는 길 — 네이버 지도 · 교통편
    contact/page.tsx        문의 — 주소검색 API · 상담 예약 · 개인정보 동의
    admin/                  관리자 콘솔
  components/
    SiteHeader / SiteFooter / FloatingContact
    PageHeading / ProjectCard / Pagination
    AddressSearch           다음(카카오) 우편번호 팝업
    DateTimePicker          날짜 · 상담 시간 선택 (열린 시간만 서버에서 받아 표시)
  lib/
    api.ts                  백엔드 호출 래퍼 + 타입
    theme.ts                디자인 토큰 (색 · 타이포)
    format.ts               날짜 · 시간 · 전화번호 표기
    hangul.ts               초성 검색 (클라이언트 보조)
```

## 환경변수

| 키 | 설명 |
|---|---|
| `BACKEND_ORIGIN` | 스프링 부트 주소 (기본 http://localhost:8080) |
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | 네이버 지도 키. 없으면 안내 박스로 대체된다 |
| `NEXT_PUBLIC_KAKAO_CHANNEL_URL` | 플로팅 카카오톡 버튼이 열 채널 주소 |
| `NEXT_PUBLIC_PHONE` | 플로팅 전화 버튼 번호 (기본 02-6052-0479) |

주소 검색은 다음(카카오) 우편번호 서비스를 쓰며 키가 필요하지 않습니다.
