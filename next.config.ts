/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 정적 배포를 위한 설정
  images: {
    unoptimized: true, // GitHub Pages에서 이미지를 최적화할 수 없으므로 필수
  },
};

export default nextConfig;
