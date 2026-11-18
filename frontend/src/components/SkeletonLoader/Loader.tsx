import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'shimmer' | 'bg';
  className?: string;
}

function toCssSize(value: string | number | undefined, fallback: string): string {
  if (value === undefined) return fallback;
  return typeof value === 'number' ? `${value}px` : value;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  variant = 'shimmer',
  className = '',
}) => (
  <div
    aria-hidden="true"
    className={`rounded-xl ${variant === 'shimmer' ? 'animate-shimmer' : 'bg-slate-200'} ${className}`}
    style={{
      width: toCssSize(width, '100%'),
      height: toCssSize(height, '20px'),
    }}
  />
);

export const SkeletonTitle: React.FC<{ className?: string; width?: string | number }> = ({
  className = '',
  width = '60%',
}) => (
  <SkeletonLoader height={28} width={width} className={`mb-3 ${className}`} />
);

export const SkeletonParagraph: React.FC<{ lines?: number; className?: string }> = ({
  lines = 2,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonLoader
        key={index}
        height={12}
        width={index === lines - 1 ? '75%' : '100%'}
      />
    ))}
  </div>
);
