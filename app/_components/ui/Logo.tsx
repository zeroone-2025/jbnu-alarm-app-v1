import React from 'react';

export default function Logo({ className = "h-6 w-auto" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 125 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="ZeroTime Logo"
        >
            {/* Wordmark: ZEROTIME */}
            <text
                x="6"
                y="22.5"
                fill="currentColor"
                fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                fontSize="20"
                fontWeight="750"
                letterSpacing="0.05em"
                transform="skewX(-6)"
            >
                ZEROTIME
            </text>

            {/* Design Detail: Brand Accent Dot (Square) */}
            {/* Baseline alignment: Text y=22.5, Rect height=5.5 -> y=17 */}
            <rect x="119" y="17" width="5.5" height="5.5" fill="#3B82F6" transform="skewX(-6)" />
        </svg>
    );
}
