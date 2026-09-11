// 쿠버네티스 프로브용. /api/* 는 rewrites 로 백엔드에 넘어가므로
// 프론트 자체의 생존 확인은 /api 바깥 경로를 쓴다.
export const dynamic = 'force-dynamic';

export function GET() {
  return new Response('ok', {
    status: 200,
    headers: { 'content-type': 'text/plain' },
  });
}
