import { ImageResponse } from 'next/og';

// Static export를 위한 설정
export const dynamic = 'force-static';

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
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white',
                }}
            >
                {/* 
            Single SVG handling everything to ensure perfect alignment and transform.
            viewBox="0 0 100 100" maps to the 512x512 canvas.
        */}
                <svg
                    width="400"
                    height="400"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Centered Group with Skew */}
                    {/* 
              Origin is roughly center (50 50) to apply skew evenly.
              However, native SVG transform uses top-left.
              We'll translate to center, skew, then translate back.
          */}
                    <g transform="translate(50, 50) skewX(-6) translate(-50, -50)">
                        {/* Z Symbol - "ZeroTime" Heavy Z */}
                        {/* Re-drawing path to be vertically balanced and not too wide */}
                        {/* 
                Top Bar: 20,20 to 80,20 (Width 60)
                Bottom Bar: 20,80 to 80,80 (Width 60)
                Diagonal: Connecting
            */}
                        <path
                            d="M20 20 H80 V32 L40 68 H80 V80 H20 V68 L60 32 H20 V20 Z"
                            fill="#111827"
                        />

                        {/* Accent Dot - Blue Square */}
                        {/* Positioned at bottom right of the Z */}
                        {/* Z bottom is 80. Square height is 10. So y must be 70 to align bottoms. */}
                        <rect
                            x="84"
                            y="70"
                            width="10"
                            height="10"
                            fill="#3B82F6"
                        />
                    </g>
                </svg>
            </div>
        ),
        {
            ...size,
        }
    );
}
