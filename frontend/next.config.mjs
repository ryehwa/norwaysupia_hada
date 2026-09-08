/** @type {import('next').NextConfig} */
const backend = process.env.BACKEND_ORIGIN ?? 'http://localhost:8080';

const nextConfig = {
  reactStrictMode: true,
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
