import { ImageResponse } from 'next/og';

// Static export를 위한 설정
export const dynamic = 'force-static';

// Image metadata
export const alt = '제로타임 - 전북대 공지사항 통합 알림';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
    // Font loading
    // Using standard fetch without import.meta.url for better compatibility
    const interBold = await fetch(
        'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-800-normal.woff'
    ).then((res) => {
        if (!res.ok) {
            throw new Error('Failed to fetch font');
        }
        return res.arrayBuffer();
    });

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'center',
                    }}
                >
                    {/* Wordmark: ZEROTIME */}
                    <div
                        style={{
                            fontFamily: 'Inter',
                            fontSize: '128px',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            color: '#111827',
                            transform: 'skewX(-6deg)',
                        }}
                    >
                        ZEROTIME
                    </div>

                    {/* Design Detail: Brand Accent Dot (Square) */}
                    <div
                        style={{
                            width: '35px',
                            height: '35px',
                            backgroundColor: '#3B82F6',
                            marginLeft: '24px',
                            transform: 'skewX(-6deg)',
                        }}
                    />
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [
                {
                    name: 'Inter',
                    data: interBold,
                    style: 'normal',
                    weight: 800,
                },
            ],
        }
    );
}
