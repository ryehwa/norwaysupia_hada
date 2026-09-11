/** @type {import('next').NextConfig} */
const backend = process.env.BACKEND_ORIGIN ?? 'http://localhost:8080';

const nextConfig = {
  reactStrictMode: true,
  // 컨테이너 이미지에 런타임 최소 파일만 담기 위한 출력 모드.
  // 이 값이 없으면 .next/standalone 이 생성되지 않아 Dockerfile 이 깨진다.
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8080', pathname: '/uploads/**' },
    ],
  },
  async rewrites() {
    // 프론트와 백엔드를 같은 도메인처럼 쓰기 위한 프록시.
    // /api/* 와 /uploads/* 요청은 스프링 부트로 넘긴다.
    return [
      { source: '/api/:path*', destination: `${backend}/api/:path*` },
      { source: '/uploads/:path*', destination: `${backend}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
