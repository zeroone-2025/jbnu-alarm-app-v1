'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled = false,
  ...props
}: ButtonProps) {
  // Variant 스타일
  const variantStyles = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:bg-gray-100',
    outline: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-white',
  };

  // Size 스타일
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
