'use client';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'white' | 'gray';
    className?: string;
}

export default function LoadingSpinner({
    size = 'md',
    color = 'primary',
    className = '',
}: LoadingSpinnerProps) {
    const sizeStyles = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-2',
        lg: 'w-12 h-12 border-3',
    };

    const colorStyles = {
        primary: 'border-gray-900 border-t-transparent',
        white: 'border-white border-t-transparent',
        gray: 'border-gray-300 border-t-transparent',
    };

    return (
        <div
            className={`animate-spin rounded-full ${sizeStyles[size]} ${colorStyles[color]} ${className}`}
            aria-label="로딩 중"
        />
    );
}
