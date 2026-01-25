import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
    width: 512,
    height: 512,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white',
                    borderRadius: 0, // PWA icons are generally square, OS handles rounded corners
                }}
            >
                {/* Container for centering the skew transform */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: 'skewX(-6deg)',
                    }}
                >
                    {/* "Z" Shape constructed with divs for guaranteed rendering without font loading */}
                    {/* Using a rough geometric approximation of a heavy sans-serif "Z" */}
                    <svg width="320" height="320" viewBox="0 0 100 100" fill="currentColor" color="#111827">
                        <path d="M10 20 H90 V35 L35 75 H90 V90 H10 V75 L65 35 H10 V20 Z" />
                    </svg>

                    {/* Accent Dot */}
                    <div
                        style={{
                            position: 'absolute',
                            right: '-40px',
                            bottom: '80px', // Adjusted to align with the baseline of Z
                            width: '30px',
                            height: '30px',
                            background: '#3B82F6',
                        }}
                    />
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
