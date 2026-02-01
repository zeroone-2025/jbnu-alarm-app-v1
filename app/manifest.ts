import type { MetadataRoute } from 'next';

// Static export를 위한 설정
export const dynamic = 'force-static';


export default function manifest(): MetadataRoute.Manifest {
    return {
        name: '제로타임 - 전북대 공지사항 통합 알리미',
        short_name: '제로타임',
        description: '전북대 공지사항 통합 알림 서비스',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3b82f6',
        orientation: 'portrait',
        icons: [
            {
                src: '/icon',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icon',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    };
}
